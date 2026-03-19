import { db } from "@/lib/db";
import { users, oauthAccounts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createSession, setSessionCookie } from "./session";

// ---------------------------------------------------------------------------
// Provider configuration
// ---------------------------------------------------------------------------

type OAuthProvider = "google" | "microsoft";

interface OAuthConfig {
  authUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  clientId: string;
  clientSecret: string;
  scopes: string[];
}

function getProviderConfig(provider: OAuthProvider): OAuthConfig {
  if (provider === "google") {
    return {
      authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      userInfoUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      scopes: ["openid", "email", "profile"],
    };
  }

  return {
    authUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    userInfoUrl: "https://graph.microsoft.com/v1.0/me",
    clientId: process.env.MICROSOFT_CLIENT_ID ?? "",
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET ?? "",
    scopes: ["openid", "email", "profile", "User.Read"],
  };
}

// ---------------------------------------------------------------------------
// Build authorization URL
// ---------------------------------------------------------------------------

export function getAuthorizationUrl(
  provider: OAuthProvider,
  state: string,
  redirectUri: string
): string {
  const config = getProviderConfig(provider);
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: config.scopes.join(" "),
    state,
    prompt: "select_account",
  });

  return `${config.authUrl}?${params.toString()}`;
}

// ---------------------------------------------------------------------------
// Exchange code for tokens → fetch user info
// ---------------------------------------------------------------------------

interface OAuthUserInfo {
  providerAccountId: string;
  email: string;
  name: string;
}

export async function exchangeCodeForUser(
  provider: OAuthProvider,
  code: string,
  redirectUri: string
): Promise<OAuthUserInfo> {
  const config = getProviderConfig(provider);

  // Exchange code for access token
  const tokenRes = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    throw new Error(`Token exchange failed: ${text}`);
  }

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token as string;

  // Fetch user info
  const userRes = await fetch(config.userInfoUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!userRes.ok) {
    throw new Error("Failed to fetch user info");
  }

  const profile = await userRes.json();

  if (provider === "google") {
    return {
      providerAccountId: profile.id,
      email: profile.email,
      name: profile.name,
    };
  }

  // Microsoft
  return {
    providerAccountId: profile.id,
    email: profile.mail || profile.userPrincipalName,
    name: profile.displayName,
  };
}

// ---------------------------------------------------------------------------
// Find-or-create user from OAuth profile, then set session
// ---------------------------------------------------------------------------

export async function handleOAuthLogin(
  provider: OAuthProvider,
  profile: OAuthUserInfo
): Promise<void> {
  const normalizedEmail = profile.email.toLowerCase();

  // Check if this OAuth account is already linked
  const [existing] = await db
    .select({ userId: oauthAccounts.userId })
    .from(oauthAccounts)
    .where(
      and(
        eq(oauthAccounts.provider, provider),
        eq(oauthAccounts.providerAccountId, profile.providerAccountId)
      )
    )
    .limit(1);

  let userId: number;

  if (existing) {
    userId = existing.userId;
  } else {
    // Check if a user with this email already exists (link account)
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create new user (no password — OAuth only)
      const [newUser] = await db
        .insert(users)
        .values({
          email: normalizedEmail,
          name: profile.name,
          passwordHash: null,
          role: "editor",
          emailVerifiedAt: new Date(),
        })
        .returning({ id: users.id });
      userId = newUser.id;
    }

    // Link OAuth account
    await db.insert(oauthAccounts).values({
      userId,
      provider,
      providerAccountId: profile.providerAccountId,
    });

    // Mark email as verified (provider already verified it)
    await db
      .update(users)
      .set({ emailVerifiedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(users.id, userId), eq(users.emailVerifiedAt, null as unknown as Date)));
  }

  // Fetch user for session
  const [user] = await db
    .select({ id: users.id, email: users.email, name: users.name, role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const token = await createSession({
    sub: String(user.id),
    email: user.email,
    name: user.name,
    role: user.role as "admin" | "editor",
  });

  await setSessionCookie(token);
}

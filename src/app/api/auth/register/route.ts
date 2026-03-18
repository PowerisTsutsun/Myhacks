import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users, emailVerificationTokens } from "@/lib/db/schema";
import { signupSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/utils";
import { generateToken, hashToken, expiresInMinutes } from "@/lib/auth/tokens";
import { sendVerificationEmail } from "@/lib/email/resend";
import { createSession } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

const EMAIL_TTL = Number(process.env.EMAIL_VERIFICATION_TOKEN_TTL_MINUTES ?? 1440); // 24 h
const SESSION_DURATION = 60 * 60 * 24;

function setSession(response: NextResponse, token: string) {
  response.cookies.set("lh-session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  });
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";

  if (!checkRateLimit(`register:${ip}`, 3, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const [existing] = await db
    .select({ id: users.id, name: users.name, emailVerifiedAt: users.emailVerifiedAt, role: users.role })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (existing) {
    if (!existing.emailVerifiedAt) {
      await db
        .update(emailVerificationTokens)
        .set({ usedAt: new Date() })
        .where(eq(emailVerificationTokens.userId, existing.id));

      const rawToken = generateToken();
      await db.insert(emailVerificationTokens).values({
        userId: existing.id,
        tokenHash: hashToken(rawToken),
        expiresAt: expiresInMinutes(EMAIL_TTL),
      });
      await sendVerificationEmail({ to: normalizedEmail, name: existing.name, token: rawToken });

      // Auto-login the existing unverified user
      const sessionToken = await createSession({
        sub: String(existing.id),
        email: normalizedEmail,
        name: existing.name,
        role: existing.role as "admin" | "editor",
      });
      const response = NextResponse.json({ ok: true, loggedIn: true });
      setSession(response, sessionToken);
      return response;
    }
    // Already verified — generic response
    return NextResponse.json({ ok: true, requiresVerification: false });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const [user] = await db
      .insert(users)
      .values({ name, email: normalizedEmail, passwordHash, role: "editor" })
      .returning();

    const rawToken = generateToken();
    await db.insert(emailVerificationTokens).values({
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt: expiresInMinutes(EMAIL_TTL),
    });

    await sendVerificationEmail({ to: user.email, name: user.name, token: rawToken });

    // Auto-login the new user
    const sessionToken = await createSession({
      sub: String(user.id),
      email: user.email,
      name: user.name,
      role: "editor",
    });
    const response = NextResponse.json({ ok: true, loggedIn: true });
    setSession(response, sessionToken);
    return response;
  } catch {
    return NextResponse.json({ error: "Failed to create account." }, { status: 500 });
  }
}

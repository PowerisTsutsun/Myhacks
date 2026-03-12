import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { db } from "@/lib/db";
import { users, twoFactorCodes } from "@/lib/db/schema";
import { loginSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/utils";
import { generate2FACode, hashToken, expiresInMinutes } from "@/lib/auth/tokens";
import { send2FACode } from "@/lib/email/resend";
import { createSession } from "@/lib/auth/session";
import { eq, and, gt, isNull } from "drizzle-orm";

const TFA_TTL = Number(process.env.TWO_FACTOR_CODE_TTL_MINUTES ?? 10);
const SESSION_DURATION = 60 * 60 * 24; // 24 hours

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";

  if (!checkRateLimit(`login:${ip}`, 5, 5 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or password format" }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (!user) {
    await bcrypt.hash("dummy", 12); // timing-safe
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  // Require email verification before allowing login
  if (!user.emailVerifiedAt) {
    return NextResponse.json(
      { error: "verify_email", message: "Please verify your email before logging in." },
      { status: 403 }
    );
  }

  // ── 2FA disabled: issue session directly ────────────────────────────────
  if (!user.twoFactorEnabled) {
    const token = await createSession({
      sub: String(user.id),
      email: user.email,
      name: user.name,
      role: user.role as "admin" | "editor",
    });
    const response = NextResponse.json({ ok: true, requires2FA: false });
    response.cookies.set("lh-session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION,
      path: "/",
    });
    return response;
  }

  // ── 2FA enabled: send email verification code ────────────────────────────
  if (!checkRateLimit(`2fa-send:${user.id}`, 3, 5 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many code requests. Please wait a few minutes." },
      { status: 429 }
    );
  }

  // Invalidate any previous unused codes for this user
  await db
    .update(twoFactorCodes)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(twoFactorCodes.userId, user.id),
        isNull(twoFactorCodes.usedAt),
        gt(twoFactorCodes.expiresAt, new Date())
      )
    );

  const rawCode = generate2FACode();
  await db.insert(twoFactorCodes).values({
    userId: user.id,
    codeHash: hashToken(rawCode),
    expiresAt: expiresInMinutes(TFA_TTL),
  });

  const emailResult = await send2FACode({ to: user.email, name: user.name, code: rawCode });
  if (!emailResult.ok) {
    console.error("[login] 2FA email failed for user", user.id);
    return NextResponse.json(
      { error: "Failed to send verification code. Please try again." },
      { status: 500 }
    );
  }

  // Issue a short-lived "2FA pending" token so the /login/2fa step knows who we are
  const pendingToken = await new SignJWT({ sub: String(user.id), step: "2fa" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TFA_TTL}m`)
    .sign(getJwtSecret());

  const response = NextResponse.json({ ok: true, requires2FA: true });
  response.cookies.set("lh-2fa-pending", pendingToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: TFA_TTL * 60,
    path: "/",
  });
  return response;
}

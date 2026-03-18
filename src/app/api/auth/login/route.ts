import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, twoFactorCodes } from "@/lib/db/schema";
import { loginSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/utils";
import { generate2FACode, hashToken, expiresInMinutes } from "@/lib/auth/tokens";
import { send2FACode } from "@/lib/email/resend";
import { createSession } from "@/lib/auth/session";

const TFA_TTL = Number(process.env.TWO_FACTOR_CODE_TTL_MINUTES ?? 10);
const SESSION_DURATION = 60 * 60 * 24;

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

function resolvePreferredMethod(user: typeof users.$inferSelect): "email" | "totp" {
  const emailAvailable = user.role !== "admin" && user.twoFactorEnabled;
  if (user.twoFactorMethod === "totp" && user.totpEnabled) return "totp";
  if (user.twoFactorMethod === "email" && emailAvailable) return "email";
  if (emailAvailable) return "email";
  if (user.totpEnabled) return "totp";
  return "email";
}

async function issuePendingToken(userId: number, method: "email" | "totp") {
  return new SignJWT({ sub: String(userId), step: "2fa", method })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TFA_TTL}m`)
    .sign(getJwtSecret());
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

  const [user] = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);

  if (!user) {
    await bcrypt.hash("dummy", 12);
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const emailTwoFactorAvailable = user.role !== "admin" && user.twoFactorEnabled;
  if (!emailTwoFactorAvailable && !user.totpEnabled) {
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

  const availableMethods = {
    email: emailTwoFactorAvailable,
    totp: user.totpEnabled,
  };
  const method = resolvePreferredMethod(user);

  if (method === "totp") {
    const pendingToken = await issuePendingToken(user.id, "totp");
    const response = NextResponse.json({
      ok: true,
      requires2FA: true,
      method: "totp",
      availableMethods,
    });
    response.cookies.set("lh-2fa-pending", pendingToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: TFA_TTL * 60,
      path: "/",
    });
    return response;
  }

  if (!checkRateLimit(`2fa-send:${user.id}`, 3, 5 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many code requests. Please wait a few minutes." },
      { status: 429 }
    );
  }

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

  const pendingToken = await issuePendingToken(user.id, "email");
  const response = NextResponse.json({
    ok: true,
    requires2FA: true,
    method: "email",
    availableMethods,
  });
  response.cookies.set("lh-2fa-pending", pendingToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: TFA_TTL * 60,
    path: "/",
  });
  return response;
}

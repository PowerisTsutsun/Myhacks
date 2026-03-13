import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, SignJWT } from "jose";
import { z } from "zod";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, twoFactorCodes } from "@/lib/db/schema";
import { createSession } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/utils";
import { hashToken, generate2FACode, expiresInMinutes } from "@/lib/auth/tokens";
import { verifyTotpCode } from "@/lib/auth/totp";
import { send2FACode } from "@/lib/email/resend";

const TFA_TTL = Number(process.env.TWO_FACTOR_CODE_TTL_MINUTES ?? 10);

const requestSchema = z.object({
  action: z.enum(["verify", "switch", "resend"]).default("verify"),
  code: z.string().length(6).optional(),
  method: z.enum(["email", "totp"]).optional(),
});

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

async function issuePendingToken(userId: number, method: "email" | "totp") {
  return new SignJWT({ sub: String(userId), step: "2fa", method })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TFA_TTL}m`)
    .sign(getJwtSecret());
}

async function sendEmailChallenge(userId: number, email: string, name: string) {
  if (!checkRateLimit(`2fa-send:${userId}`, 3, 5 * 60 * 1000)) {
    return { ok: false as const, status: 429, error: "Too many code requests. Please wait a few minutes." };
  }

  await db
    .update(twoFactorCodes)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(twoFactorCodes.userId, userId),
        isNull(twoFactorCodes.usedAt),
        gt(twoFactorCodes.expiresAt, new Date())
      )
    );

  const rawCode = generate2FACode();
  await db.insert(twoFactorCodes).values({
    userId,
    codeHash: hashToken(rawCode),
    expiresAt: expiresInMinutes(TFA_TTL),
  });

  const result = await send2FACode({ to: email, name, code: rawCode });
  if (!result.ok) {
    return { ok: false as const, status: 500, error: "Failed to send verification code. Please try again." };
  }

  return { ok: true as const };
}

export async function POST(request: NextRequest) {
  const pendingToken = request.cookies.get("lh-2fa-pending")?.value;
  if (!pendingToken) {
    return NextResponse.json({ error: "No active login session. Please log in again." }, { status: 401 });
  }

  let userId: number;
  let currentMethod: "email" | "totp";
  try {
    const { payload } = await jwtVerify(pendingToken, getJwtSecret());
    if (payload.step !== "2fa" || !payload.sub) throw new Error("invalid step");
    userId = Number(payload.sub);
    currentMethod = (payload.method as "email" | "totp") ?? "email";
  } catch {
    const res = NextResponse.json({ error: "Session expired. Please log in again." }, { status: 401 });
    res.cookies.delete("lh-2fa-pending");
    return res;
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { action, code, method } = parsed.data;

  if (action === "switch") {
    if (!method) return NextResponse.json({ error: "Method is required." }, { status: 400 });
    if (user.role === "admin" && method === "email") {
      return NextResponse.json({ error: "Admins must use an authenticator app for 2FA." }, { status: 403 });
    }
    if (method === "email" && !user.twoFactorEnabled) {
      return NextResponse.json({ error: "Email 2FA is not enabled for this account." }, { status: 400 });
    }
    if (method === "totp" && !user.totpEnabled) {
      return NextResponse.json({ error: "Authenticator app is not enabled for this account." }, { status: 400 });
    }

    if (method === "email") {
      const challenge = await sendEmailChallenge(user.id, user.email, user.name);
      if (!challenge.ok) {
        return NextResponse.json({ error: challenge.error }, { status: challenge.status });
      }
    }

    const nextPendingToken = await issuePendingToken(user.id, method);
    const response = NextResponse.json({
      ok: true,
      method,
      message: method === "email" ? "A new verification code was sent to your email." : null,
    });
    response.cookies.set("lh-2fa-pending", nextPendingToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: TFA_TTL * 60,
      path: "/",
    });
    return response;
  }

  if (action === "resend") {
    if (user.role === "admin") {
      return NextResponse.json({ error: "Admins must use an authenticator app for 2FA." }, { status: 403 });
    }
    if (currentMethod !== "email") {
      return NextResponse.json({ error: "Resend is only available for email 2FA." }, { status: 400 });
    }
    if (!user.twoFactorEnabled) {
      return NextResponse.json({ error: "Email 2FA is not enabled for this account." }, { status: 400 });
    }

    const challenge = await sendEmailChallenge(user.id, user.email, user.name);
    if (!challenge.ok) {
      return NextResponse.json({ error: challenge.error }, { status: challenge.status });
    }

    return NextResponse.json({ ok: true, message: "A new verification code was sent to your email." });
  }

  if (!checkRateLimit(`2fa-verify:${userId}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a few minutes." },
      { status: 429 }
    );
  }

  if (!code) {
    return NextResponse.json({ error: "Invalid code format" }, { status: 400 });
  }

  const now = new Date();

  if (currentMethod === "totp") {
    if (!user.totpSecret || !user.totpEnabled) {
      return NextResponse.json({ error: "Authenticator app not configured. Please log in again." }, { status: 401 });
    }

    const valid = await verifyTotpCode(code, user.totpSecret);
    if (!valid) {
      return NextResponse.json({ error: "Incorrect code. Check your authenticator app and try again." }, { status: 401 });
    }
  } else {
    if (user.role === "admin") {
      return NextResponse.json({ error: "Admins must use an authenticator app for 2FA." }, { status: 403 });
    }
    const codeHash = hashToken(code);
    const [record] = await db
      .select()
      .from(twoFactorCodes)
      .where(
        and(
          eq(twoFactorCodes.userId, userId),
          isNull(twoFactorCodes.usedAt),
          gt(twoFactorCodes.expiresAt, now)
        )
      )
      .orderBy(twoFactorCodes.createdAt)
      .limit(1);

    if (!record) {
      return NextResponse.json({ error: "Code expired or not found. Please request a new code." }, { status: 401 });
    }

    const newAttemptCount = record.attemptCount + 1;
    if (newAttemptCount > 5) {
      await db.update(twoFactorCodes).set({ usedAt: now }).where(eq(twoFactorCodes.id, record.id));
      return NextResponse.json({ error: "Too many failed attempts. Please request a new code." }, { status: 401 });
    }

    await db.update(twoFactorCodes).set({ attemptCount: newAttemptCount }).where(eq(twoFactorCodes.id, record.id));

    if (record.codeHash !== codeHash) {
      return NextResponse.json({ error: "Incorrect code. Please try again." }, { status: 401 });
    }

    await db.update(twoFactorCodes).set({ usedAt: now }).where(eq(twoFactorCodes.id, record.id));
  }

  const sessionToken = await createSession({
    sub: String(user.id),
    email: user.email,
    name: user.name,
    role: user.role as "admin" | "editor",
  });

  const response = NextResponse.json({
    ok: true,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
  response.cookies.set("lh-session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });
  response.cookies.delete("lh-2fa-pending");
  return response;
}

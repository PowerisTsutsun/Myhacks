import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, twoFactorCodes } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { generate2FACode, hashToken, expiresInMinutes } from "@/lib/auth/tokens";
import { send2FACode } from "@/lib/email/resend";

const bodySchema = z.object({
  action: z.enum(["initiate", "enable", "disable", "set-method"]),
  code: z.string().trim().length(6).optional(),
  method: z.enum(["email", "totp"]).optional(),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { action, code, method } = parsed.data;

  const [user] = await db.select().from(users).where(eq(users.id, Number(session.sub))).limit(1);
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  if (action === "initiate") {
    if (user.role === "admin") {
      return NextResponse.json({ error: "Admins must use an authenticator app for 2FA." }, { status: 403 });
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
      expiresAt: expiresInMinutes(10),
    });

    const result = await send2FACode({ to: user.email, name: user.name, code: rawCode });
    if (!result.ok) {
      return NextResponse.json({ error: "Failed to send verification code. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, sent: true });
  }

  if (action === "enable") {
    if (user.role === "admin") {
      return NextResponse.json({ error: "Admins must use an authenticator app for 2FA." }, { status: 403 });
    }

    if (!code) return NextResponse.json({ error: "Verification code is required." }, { status: 400 });

    const codeHash = hashToken(code);
    const [match] = await db
      .select()
      .from(twoFactorCodes)
      .where(
        and(
          eq(twoFactorCodes.userId, user.id),
          eq(twoFactorCodes.codeHash, codeHash),
          isNull(twoFactorCodes.usedAt),
          gt(twoFactorCodes.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!match) {
      return NextResponse.json({ error: "Invalid or expired code. Please try again." }, { status: 400 });
    }

    await db.update(twoFactorCodes).set({ usedAt: new Date() }).where(eq(twoFactorCodes.id, match.id));

    const nextMethod = user.totpEnabled ? user.twoFactorMethod : "email";
    await db
      .update(users)
      .set({
        twoFactorEnabled: true,
        twoFactorMethod: nextMethod,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({
      ok: true,
      twoFactorEnabled: true,
      totpEnabled: user.totpEnabled,
      twoFactorMethod: nextMethod,
    });
  }

  if (action === "disable") {
    const nextTwoFactorEnabled = user.totpEnabled;
    const nextMethod = user.totpEnabled ? "totp" : "email";

    await db
      .update(users)
      .set({
        twoFactorEnabled: nextTwoFactorEnabled,
        twoFactorMethod: nextMethod,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({
      ok: true,
      twoFactorEnabled: nextTwoFactorEnabled,
      totpEnabled: user.totpEnabled,
      twoFactorMethod: nextMethod,
    });
  }

  if (!method) {
    return NextResponse.json({ error: "Preferred method is required." }, { status: 400 });
  }

  if (user.role === "admin" && method === "email") {
    return NextResponse.json({ error: "Admins must use an authenticator app for 2FA." }, { status: 403 });
  }

  if (method === "email" && !user.twoFactorEnabled) {
    return NextResponse.json({ error: "Email 2FA is not enabled." }, { status: 400 });
  }
  if (method === "totp" && !user.totpEnabled) {
    return NextResponse.json({ error: "Authenticator app is not enabled." }, { status: 400 });
  }

  await db.update(users).set({ twoFactorMethod: method, updatedAt: new Date() }).where(eq(users.id, user.id));
  return NextResponse.json({ ok: true, twoFactorMethod: method });
}

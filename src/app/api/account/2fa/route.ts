import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, twoFactorCodes } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { eq, and, isNull, gt } from "drizzle-orm";
import { generate2FACode, hashToken, expiresInMinutes } from "@/lib/auth/tokens";
import { send2FACode } from "@/lib/email/resend";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { action, code } = body as { action?: string; code?: string };

  const [user] = await db.select().from(users).where(eq(users.id, Number(session.sub))).limit(1);
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  // ── Initiate setup: send a verification code ─────────────────────────────
  if (action === "initiate") {
    // Invalidate any previous unused codes
    await db.update(twoFactorCodes)
      .set({ usedAt: new Date() })
      .where(and(eq(twoFactorCodes.userId, user.id), isNull(twoFactorCodes.usedAt), gt(twoFactorCodes.expiresAt, new Date())));

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

  // ── Enable: verify the code and enable 2FA ────────────────────────────────
  if (action === "enable") {
    if (!code) return NextResponse.json({ error: "Verification code is required." }, { status: 400 });

    const codeHash = hashToken(code.trim());
    const [match] = await db.select().from(twoFactorCodes).where(
      and(
        eq(twoFactorCodes.userId, user.id),
        eq(twoFactorCodes.codeHash, codeHash),
        isNull(twoFactorCodes.usedAt),
        gt(twoFactorCodes.expiresAt, new Date())
      )
    ).limit(1);

    if (!match) {
      return NextResponse.json({ error: "Invalid or expired code. Please try again." }, { status: 400 });
    }

    // Mark code used and enable 2FA
    await db.update(twoFactorCodes).set({ usedAt: new Date() }).where(eq(twoFactorCodes.id, match.id));
    await db.update(users).set({ twoFactorEnabled: true, updatedAt: new Date() }).where(eq(users.id, user.id));

    return NextResponse.json({ ok: true, twoFactorEnabled: true });
  }

  // ── Disable: turn off 2FA ─────────────────────────────────────────────────
  if (action === "disable") {
    await db.update(users).set({ twoFactorEnabled: false, updatedAt: new Date() }).where(eq(users.id, user.id));
    return NextResponse.json({ ok: true, twoFactorEnabled: false });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}

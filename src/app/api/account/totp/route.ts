import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/utils";
import {
  generateTotpSecret,
  generateTotpUri,
  generateTotpQrDataUrl,
  verifyTotpCode,
} from "@/lib/auth/totp";
import { eq } from "drizzle-orm";
import { z } from "zod";

const actionSchema = z.object({
  action: z.enum(["setup", "enable", "disable", "regenerate"]),
  code: z.string().length(6).optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [user] = await db
    .select({ totpEnabled: users.totpEnabled, twoFactorEnabled: users.twoFactorEnabled, twoFactorMethod: users.twoFactorMethod })
    .from(users)
    .where(eq(users.id, Number(session.sub)))
    .limit(1);

  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  return NextResponse.json({
    totpEnabled: user.totpEnabled,
    twoFactorEnabled: user.twoFactorEnabled,
    twoFactorMethod: user.twoFactorMethod,
  });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit TOTP management: 10 per hour per user
  if (!checkRateLimit(`totp-manage:${session.sub}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { action, code } = parsed.data;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, Number(session.sub)))
    .limit(1);
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  // ── Setup: generate new secret and return QR code ─────────────────────────
  if (action === "setup" || action === "regenerate") {
    const secret = generateTotpSecret();
    const uri = generateTotpUri(user.email, secret);
    const qrDataUrl = await generateTotpQrDataUrl(uri);

    // Store the secret (not yet enabled — requires verification)
    await db
      .update(users)
      .set({ totpSecret: secret, totpEnabled: false, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    return NextResponse.json({ ok: true, secret, qrDataUrl });
  }

  // ── Enable: verify first TOTP code, then activate ─────────────────────────
  if (action === "enable") {
    if (!code) return NextResponse.json({ error: "Verification code is required." }, { status: 400 });

    if (!user.totpSecret) {
      return NextResponse.json({ error: "No authenticator setup in progress. Please start setup first." }, { status: 400 });
    }

    // Rate limit enable attempts: 5 per 10 minutes (brute-force protection)
    if (!checkRateLimit(`totp-enable:${user.id}`, 5, 10 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many attempts. Please wait a few minutes." }, { status: 429 });
    }

    const valid = await verifyTotpCode(code, user.totpSecret);
    if (!valid) {
      return NextResponse.json({ error: "Incorrect code. Make sure your device's clock is synced and try again." }, { status: 400 });
    }

    // Code verified — activate TOTP and update 2FA method
    await db
      .update(users)
      .set({
        totpEnabled: true,
        twoFactorEnabled: true,
        twoFactorMethod: "totp",
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({ ok: true, totpEnabled: true, twoFactorMethod: "totp" });
  }

  // ── Disable: remove TOTP, revert to email 2FA (or disable 2FA entirely) ───
  if (action === "disable") {
    // If email 2FA was previously active, keep twoFactorEnabled and revert method
    // Otherwise turn off 2FA entirely
    const revertToEmail = user.twoFactorEnabled && user.twoFactorMethod === "totp";

    await db
      .update(users)
      .set({
        totpSecret: null,
        totpEnabled: false,
        twoFactorMethod: "email",
        // Only keep twoFactorEnabled=true if it was active via another method
        twoFactorEnabled: revertToEmail ? user.twoFactorEnabled : false,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({ ok: true, totpEnabled: false });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}

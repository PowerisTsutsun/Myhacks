import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, emailVerificationTokens } from "@/lib/db/schema";
import { checkRateLimit } from "@/lib/utils";
import { generateToken, hashToken, expiresInMinutes } from "@/lib/auth/tokens";
import { sendVerificationEmail } from "@/lib/email/resend";
import { eq, isNull } from "drizzle-orm";
import { z } from "zod";

const EMAIL_TTL = Number(process.env.EMAIL_VERIFICATION_TOKEN_TTL_MINUTES ?? 1440);
const schema = z.object({ email: z.string().email() });

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";

  if (!checkRateLimit(`resend-verification:${ip}`, 2, 5 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Please wait a few minutes before requesting another email." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, parsed.data.email.toLowerCase()))
    .limit(1);

  // Always return ok to avoid email enumeration
  if (!user || user.emailVerifiedAt) {
    return NextResponse.json({ ok: true });
  }

  // Invalidate existing tokens
  await db
    .update(emailVerificationTokens)
    .set({ usedAt: new Date() })
    .where(
      eq(emailVerificationTokens.userId, user.id)
    );

  const rawToken = generateToken();
  await db.insert(emailVerificationTokens).values({
    userId: user.id,
    tokenHash: hashToken(rawToken),
    expiresAt: expiresInMinutes(EMAIL_TTL),
  });

  sendVerificationEmail({ to: user.email, name: user.name, token: rawToken }).catch(
    (err) => console.error("[resend-verification] email failed:", err)
  );

  return NextResponse.json({ ok: true });
}

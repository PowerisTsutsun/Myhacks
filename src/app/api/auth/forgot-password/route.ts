import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/lib/db/schema";
import { checkRateLimit } from "@/lib/utils";
import { generateToken, hashToken, expiresInMinutes } from "@/lib/auth/tokens";
import { sendPasswordResetEmail } from "@/lib/email/resend";
import { eq } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";

  if (!checkRateLimit(`forgot-password:${ip}`, 3, 10 * 60 * 1000)) {
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

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, parsed.data.email.toLowerCase()))
    .limit(1);

  // Always succeed to avoid email enumeration
  if (!user) return NextResponse.json({ ok: true });

  // Invalidate existing reset tokens
  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokens.userId, user.id));

  const rawToken = generateToken();
  await db.insert(passwordResetTokens).values({
    userId: user.id,
    tokenHash: hashToken(rawToken),
    expiresAt: expiresInMinutes(60), // 1 hour
  });

  sendPasswordResetEmail({ to: user.email, name: user.name, token: rawToken }).catch(
    (err) => console.error("[forgot-password] email failed:", err)
  );

  return NextResponse.json({ ok: true });
}

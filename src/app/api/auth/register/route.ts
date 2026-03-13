import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users, emailVerificationTokens } from "@/lib/db/schema";
import { signupSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/utils";
import { generateToken, hashToken, expiresInMinutes } from "@/lib/auth/tokens";
import { sendVerificationEmail } from "@/lib/email/resend";
import { eq } from "drizzle-orm";

const EMAIL_TTL = Number(process.env.EMAIL_VERIFICATION_TOKEN_TTL_MINUTES ?? 1440); // 24 h

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
    .select({ id: users.id, name: users.name, emailVerifiedAt: users.emailVerifiedAt })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (existing) {
    // If unverified, resend verification email so they can complete signup
    if (!existing.emailVerifiedAt) {
      const rawToken = generateToken();
      await db.insert(emailVerificationTokens).values({
        userId: existing.id,
        tokenHash: hashToken(rawToken),
        expiresAt: expiresInMinutes(EMAIL_TTL),
      });
      sendVerificationEmail({ to: normalizedEmail, name: existing.name, token: rawToken }).catch(
        (err) => console.error("[signup] re-verification email failed:", err)
      );
    }
    // Generic response to avoid user enumeration
    return NextResponse.json({ ok: true, requiresVerification: true });
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

    // Fire-and-forget — signup succeeds even if email fails
    sendVerificationEmail({ to: user.email, name: user.name, token: rawToken }).catch(
      (err) => console.error("[signup] verification email failed:", err)
    );

    return NextResponse.json({ ok: true, requiresVerification: true });
  } catch {
    return NextResponse.json({ error: "Failed to create account." }, { status: 500 });
  }
}

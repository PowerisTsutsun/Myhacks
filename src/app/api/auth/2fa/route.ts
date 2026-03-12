import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { db } from "@/lib/db";
import { users, twoFactorCodes } from "@/lib/db/schema";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/utils";
import { hashToken } from "@/lib/auth/tokens";
import { z } from "zod";
import { eq, and, gt, isNull } from "drizzle-orm";

const verifySchema = z.object({ code: z.string().length(6) });

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function POST(request: NextRequest) {
  // Validate the pending 2FA token from cookie
  const pendingToken = request.cookies.get("lh-2fa-pending")?.value;
  if (!pendingToken) {
    return NextResponse.json({ error: "No active login session. Please log in again." }, { status: 401 });
  }

  let userId: number;
  try {
    const { payload } = await jwtVerify(pendingToken, getJwtSecret());
    if (payload.step !== "2fa" || !payload.sub) throw new Error("invalid step");
    userId = Number(payload.sub);
  } catch {
    const res = NextResponse.json({ error: "Session expired. Please log in again." }, { status: 401 });
    res.cookies.delete("lh-2fa-pending");
    return res;
  }

  // Rate limit verification attempts per user
  if (!checkRateLimit(`2fa-verify:${userId}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many attempts. Please request a new code." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid code format" }, { status: 400 });
  }

  const { code } = parsed.data;
  const codeHash = hashToken(code);
  const now = new Date();

  // Find the most recent unused, unexpired code for this user
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

  // Increment attempt count and check for brute force
  const newAttemptCount = record.attemptCount + 1;
  if (newAttemptCount > 5) {
    await db.update(twoFactorCodes).set({ usedAt: now }).where(eq(twoFactorCodes.id, record.id));
    return NextResponse.json({ error: "Too many failed attempts. Please request a new code." }, { status: 401 });
  }

  await db.update(twoFactorCodes).set({ attemptCount: newAttemptCount }).where(eq(twoFactorCodes.id, record.id));

  if (record.codeHash !== codeHash) {
    return NextResponse.json({ error: "Incorrect code. Please try again." }, { status: 401 });
  }

  // Mark code as used
  await db.update(twoFactorCodes).set({ usedAt: now }).where(eq(twoFactorCodes.id, record.id));

  // Fetch user for session payload
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const sessionToken = await createSession({
    sub: String(user.id),
    email: user.email,
    name: user.name,
    role: user.role as "admin" | "editor",
  });

  await setSessionCookie(sessionToken);

  const response = NextResponse.json({
    ok: true,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
  response.cookies.delete("lh-2fa-pending");
  return response;
}

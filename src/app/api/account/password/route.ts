import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { currentPassword, newPassword } = body as { currentPassword?: string; newPassword?: string };

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
  }

  const [user] = await db.select().from(users).where(eq(users.id, Number(session.sub))).limit(1);
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  if (!user.passwordHash) {
    return NextResponse.json(
      { error: "This account uses social login and has no password to change. Set a new password from the forgot password page." },
      { status: 400 }
    );
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
  }

  const newHash = await bcrypt.hash(newPassword, 12);
  await db.update(users).set({ passwordHash: newHash, updatedAt: new Date() }).where(eq(users.id, user.id));

  return NextResponse.json({ ok: true });
}

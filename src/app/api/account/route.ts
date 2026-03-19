import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/guard";
import { clearSessionCookie } from "@/lib/auth/session";
import { SYSTEM_ADMIN_EMAIL } from "@/lib/auth/constants";
import { badRequest, parsePositiveInt } from "@/lib/api";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function DELETE() {
  const guard = await requireAuth();
  if (guard.response) return guard.response;

  const userId = parsePositiveInt(guard.session.sub);
  if (userId === null) return badRequest("Invalid session.");

  try {
    const [target] = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!target) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    if (target.email.toLowerCase() === SYSTEM_ADMIN_EMAIL) {
      return NextResponse.json(
        { error: "The system admin account cannot be deleted." },
        { status: 403 }
      );
    }

    await db.delete(users).where(eq(users.id, userId));
    await clearSessionCookie();

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete account." }, { status: 500 });
  }
}

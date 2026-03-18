import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/guard";
import { clearSessionCookie } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

const SYSTEM_ADMIN_EMAIL = "admin@example.com";

export async function DELETE() {
  const guard = await requireAuth();
  if (guard.response) return guard.response;

  const userId = Number(guard.session.sub);
  if (Number.isNaN(userId)) {
    return NextResponse.json({ error: "Invalid session." }, { status: 400 });
  }

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

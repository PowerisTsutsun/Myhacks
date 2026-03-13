import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

const SYSTEM_ADMIN_EMAIL = "admin@laserhack.org";

export async function GET() {
  const guard = await requireAdmin();
  if (guard.response) return guard.response;

  try {
    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        twoFactorEnabled: users.twoFactorEnabled,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    rows.sort((a, b) => {
      const aIsSystemAdmin = a.email.toLowerCase() === SYSTEM_ADMIN_EMAIL;
      const bIsSystemAdmin = b.email.toLowerCase() === SYSTEM_ADMIN_EMAIL;

      if (aIsSystemAdmin !== bIsSystemAdmin) {
        return aIsSystemAdmin ? 1 : -1;
      }

      if (a.role !== b.role) {
        return a.role === "admin" ? 1 : -1;
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "Failed to load users." }, { status: 500 });
  }
}

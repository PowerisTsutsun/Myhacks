import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

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
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(asc(users.createdAt));

    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "Failed to load users." }, { status: 500 });
  }
}

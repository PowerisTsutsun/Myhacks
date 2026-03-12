import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { registrations } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const guard = await requireAuth();
  if (guard.response) return guard.response;

  try {
    const rows = await db.select().from(registrations).orderBy(desc(registrations.createdAt));
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "Failed to load registrations." }, { status: 500 });
  }
}

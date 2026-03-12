import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireAuth } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { scheduleDays, scheduleItems } from "@/lib/db/schema";
import { scheduleDaySchema, scheduleItemSchema } from "@/lib/validations";
import { asc } from "drizzle-orm";

export async function GET() {
  const guard = await requireAuth();
  if (guard.response) return guard.response;

  try {
    const days = await db.select().from(scheduleDays).orderBy(asc(scheduleDays.sortOrder));
    const items = await db.select().from(scheduleItems).orderBy(asc(scheduleItems.sortOrder));
    return NextResponse.json({ days, items });
  } catch {
    return NextResponse.json({ error: "Failed to load schedule." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (guard.response) return guard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;

  try {
    if (raw.type === "day") {
      const parsed = scheduleDaySchema.safeParse(raw);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }
      const [row] = await db.insert(scheduleDays).values(parsed.data).returning();
      return NextResponse.json(row, { status: 201 });
    }

    const parsed = scheduleItemSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const [row] = await db
      .insert(scheduleItems)
      .values({
        dayId: parsed.data.dayId,
        time: parsed.data.time,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        track: parsed.data.track ?? null,
        location: parsed.data.location ?? null,
        isImportant: parsed.data.isImportant,
        sortOrder: parsed.data.sortOrder,
      })
      .returning();
    return NextResponse.json(row, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create schedule entry." }, { status: 500 });
  }
}

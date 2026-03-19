import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { badRequest, parsePositiveInt } from "@/lib/api";
import { db } from "@/lib/db";
import { scheduleDays, scheduleItems } from "@/lib/db/schema";
import { scheduleItemSchema, scheduleDaySchema } from "@/lib/validations";
import { eq } from "drizzle-orm";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin(request);
  if (guard.response) return guard.response;

  const id = parsePositiveInt(params.id);
  if (id === null) return badRequest("Invalid ID");

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
      const [row] = await db
        .update(scheduleDays)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(eq(scheduleDays.id, id))
        .returning();
      if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(row);
    }

    const parsed = scheduleItemSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const [row] = await db
      .update(scheduleItems)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(scheduleItems.id, id))
      .returning();
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(row);
  } catch {
    return NextResponse.json({ error: "Failed to update schedule entry." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin(request);
  if (guard.response) return guard.response;

  const id = parsePositiveInt(params.id);
  if (id === null) return badRequest("Invalid ID");

  const url = new URL(request.url);
  const type = url.searchParams.get("type");

  try {
    if (type === "day") {
      await db.delete(scheduleDays).where(eq(scheduleDays.id, id));
    } else {
      await db.delete(scheduleItems).where(eq(scheduleItems.id, id));
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete schedule entry." }, { status: 500 });
  }
}

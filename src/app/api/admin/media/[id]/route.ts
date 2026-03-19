import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { badRequest, parsePositiveInt } from "@/lib/api";
import { db } from "@/lib/db";
import { mediaItems } from "@/lib/db/schema";
import { mediaItemSchema } from "@/lib/validations";
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

  const parsed = mediaItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const [row] = await db
      .update(mediaItems)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(mediaItems.id, id))
      .returning();

    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(row);
  } catch {
    return NextResponse.json({ error: "Failed to update media item." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin(request);
  if (guard.response) return guard.response;

  const id = parsePositiveInt(params.id);
  if (id === null) return badRequest("Invalid ID");

  try {
    await db.delete(mediaItems).where(eq(mediaItems.id, id));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete media item." }, { status: 500 });
  }
}

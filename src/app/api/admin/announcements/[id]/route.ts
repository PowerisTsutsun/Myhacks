import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireAuth } from "@/lib/auth/guard";
import { badRequest, parsePositiveInt } from "@/lib/api";
import { db } from "@/lib/db";
import { announcements } from "@/lib/db/schema";
import { announcementSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAuth();
  if (guard.response) return guard.response;

  const id = parsePositiveInt(params.id);
  if (id === null) return badRequest("Invalid ID");

  try {
    const [row] = await db.select().from(announcements).where(eq(announcements.id, id)).limit(1);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(row);
  } catch {
    return NextResponse.json({ error: "Failed to load announcement." }, { status: 500 });
  }
}

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

  const parsed = announcementSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;

  try {
    const [row] = await db
      .update(announcements)
      .set({
        title: data.title,
        slug: data.slug,
        body: data.body,
        isPublished: data.isPublished,
        publishedAt: data.isPublished
          ? data.publishedAt
            ? new Date(data.publishedAt)
            : new Date()
          : null,
        updatedAt: new Date(),
      })
      .where(eq(announcements.id, id))
      .returning();

    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(row);
  } catch {
    return NextResponse.json({ error: "Failed to update announcement." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin(request);
  if (guard.response) return guard.response;

  const id = parsePositiveInt(params.id);
  if (id === null) return badRequest("Invalid ID");

  try {
    await db.delete(announcements).where(eq(announcements.id, id));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete announcement." }, { status: 500 });
  }
}

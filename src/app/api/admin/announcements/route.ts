import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireAuth } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { announcements } from "@/lib/db/schema";
import { announcementSchema } from "@/lib/validations";
import { desc } from "drizzle-orm";
import { slugify } from "@/lib/utils";

export async function GET() {
  const guard = await requireAuth();
  if (guard.response) return guard.response;

  try {
    const rows = await db.select().from(announcements).orderBy(desc(announcements.createdAt));
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "Failed to load announcements." }, { status: 500 });
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

  const parsed = announcementSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const slug = data.slug || slugify(data.title);

  try {
    const [row] = await db
      .insert(announcements)
      .values({
        title: data.title,
        slug,
        body: data.body,
        isPublished: data.isPublished,
        publishedAt: data.isPublished
          ? data.publishedAt
            ? new Date(data.publishedAt)
            : new Date()
          : null,
      })
      .returning();
    return NextResponse.json(row, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create announcement." }, { status: 500 });
  }
}

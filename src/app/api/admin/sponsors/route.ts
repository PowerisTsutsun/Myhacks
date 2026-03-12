import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireAuth } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { sponsors } from "@/lib/db/schema";
import { sponsorSchema } from "@/lib/validations";
import { asc } from "drizzle-orm";

export async function GET() {
  const guard = await requireAuth();
  if (guard.response) return guard.response;

  try {
    const rows = await db.select().from(sponsors).orderBy(asc(sponsors.sortOrder));
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "Failed to load sponsors." }, { status: 500 });
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

  const parsed = sponsorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;

  try {
    const [row] = await db
      .insert(sponsors)
      .values({
        name: data.name,
        tier: data.tier,
        logoUrl: data.logoUrl || null,
        websiteUrl: data.websiteUrl || null,
        description: data.description || null,
        sortOrder: data.sortOrder,
        isPublished: data.isPublished,
      })
      .returning();
    return NextResponse.json(row, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create sponsor." }, { status: 500 });
  }
}

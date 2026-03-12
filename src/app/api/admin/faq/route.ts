import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireAuth } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { faqItems } from "@/lib/db/schema";
import { faqItemSchema } from "@/lib/validations";
import { asc } from "drizzle-orm";

export async function GET() {
  const guard = await requireAuth();
  if (guard.response) return guard.response;

  try {
    const rows = await db.select().from(faqItems).orderBy(asc(faqItems.sortOrder));
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "Failed to load FAQ items." }, { status: 500 });
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

  const parsed = faqItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const [row] = await db.insert(faqItems).values(parsed.data).returning();
    return NextResponse.json(row, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create FAQ item." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { contactSubmissions } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({ ids: z.array(z.number()).min(1) });

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  await db.delete(contactSubmissions).where(inArray(contactSubmissions.id, parsed.data.ids));
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/dashboard/contact");
  return NextResponse.json({ ok: true });
}

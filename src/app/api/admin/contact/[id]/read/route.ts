import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { badRequest, parsePositiveInt } from "@/lib/api";
import { db } from "@/lib/db";
import { contactSubmissions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parsePositiveInt(params.id);
  if (id === null) return badRequest("Invalid id");

  await db
    .update(contactSubmissions)
    .set({ isRead: true })
    .where(eq(contactSubmissions.id, id));

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/dashboard/contact");
  return NextResponse.json({ ok: true });
}

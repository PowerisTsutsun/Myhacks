import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { registrations } from "@/lib/db/schema";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const guard = await requireAdmin(request);
  if (guard.response) return guard.response;

  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid registration ID." }, { status: 400 });
  }

  try {
    const [deleted] = await db
      .delete(registrations)
      .where(eq(registrations.id, id))
      .returning({ id: registrations.id });

    if (!deleted) {
      return NextResponse.json({ error: "Registration not found." }, { status: 404 });
    }

    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/dashboard/registrations");
    revalidatePath("/admin/dashboard/teams");

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete registration." }, { status: 500 });
  }
}

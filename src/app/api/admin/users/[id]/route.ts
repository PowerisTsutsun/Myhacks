import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const SYSTEM_ADMIN_EMAIL = "admin@example.com";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin(request);
  if (guard.response) return guard.response;

  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { role, twoFactorEnabled } = body as { role?: string; twoFactorEnabled?: boolean };

  // Role change
  if (role !== undefined) {
    if (String(id) === guard.session.sub) {
      return NextResponse.json({ error: "You cannot change your own role." }, { status: 400 });
    }
    if (!["admin", "editor"].includes(role)) {
      return NextResponse.json({ error: "Role must be 'admin' or 'editor'." }, { status: 400 });
    }

    try {
      const [row] = await db
        .update(users)
        .set({ role: role as "admin" | "editor", updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          twoFactorEnabled: users.twoFactorEnabled,
        });
      if (!row) return NextResponse.json({ error: "User not found." }, { status: 404 });
      return NextResponse.json(row);
    } catch {
      return NextResponse.json({ error: "Failed to update user." }, { status: 500 });
    }
  }

  // 2FA toggle (allowed for self too)
  if (twoFactorEnabled !== undefined) {
    try {
      const [row] = await db
        .update(users)
        .set({ twoFactorEnabled, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          twoFactorEnabled: users.twoFactorEnabled,
        });
      if (!row) return NextResponse.json({ error: "User not found." }, { status: 404 });
      return NextResponse.json(row);
    } catch {
      return NextResponse.json({ error: "Failed to update 2FA setting." }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin(request);
  if (guard.response) return guard.response;

  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  if (String(id) === guard.session.sub) {
    return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
  }

  try {
    const [target] = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.id, id));

    if (!target) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (target.email.toLowerCase() === SYSTEM_ADMIN_EMAIL) {
      return NextResponse.json(
        { error: "The system admin account cannot be deleted." },
        { status: 403 }
      );
    }

    await db.delete(users).where(eq(users.id, id));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete user." }, { status: 500 });
  }
}

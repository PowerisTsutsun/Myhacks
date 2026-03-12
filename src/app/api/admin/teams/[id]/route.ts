import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { teams, teamMembers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: Params) {
  const guard = await requireAdmin(request);
  if (guard.response) return guard.response;

  const { id } = await params;
  const teamId = parseInt(id, 10);
  if (isNaN(teamId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { name, status, notes } = body as {
    name?: string;
    status?: "forming" | "complete" | "locked";
    notes?: string;
  };

  try {
    const [updated] = await db
      .update(teams)
      .set({
        ...(name !== undefined && { name }),
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes }),
        updatedAt: new Date(),
      })
      .where(eq(teams.id, teamId))
      .returning();

    if (!updated) return NextResponse.json({ error: "Team not found" }, { status: 404 });
    return NextResponse.json({ team: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update team." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const guard = await requireAdmin(request);
  if (guard.response) return guard.response;

  const { id } = await params;
  const teamId = parseInt(id, 10);
  if (isNaN(teamId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    await db.delete(teams).where(eq(teams.id, teamId));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete team." }, { status: 500 });
  }
}

// POST to /api/admin/teams/[id] — add or remove a member
export async function POST(request: NextRequest, { params }: Params) {
  const guard = await requireAdmin(request);
  if (guard.response) return guard.response;

  const { id } = await params;
  const teamId = parseInt(id, 10);
  if (isNaN(teamId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { action, registrationId, role } = body as {
    action: "add" | "remove" | "set_role";
    registrationId: number;
    role?: "lead" | "member";
  };

  try {
    if (action === "add") {
      await db
        .insert(teamMembers)
        .values({ teamId, registrationId, role: role ?? "member" })
        .onConflictDoNothing();
      await db.update(teams).set({ updatedAt: new Date() }).where(eq(teams.id, teamId));
      return NextResponse.json({ ok: true });
    }

    if (action === "remove") {
      await db
        .delete(teamMembers)
        .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.registrationId, registrationId)));
      await db.update(teams).set({ updatedAt: new Date() }).where(eq(teams.id, teamId));
      return NextResponse.json({ ok: true });
    }

    if (action === "set_role" && role) {
      await db
        .update(teamMembers)
        .set({ role })
        .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.registrationId, registrationId)));
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed to update team member." }, { status: 500 });
  }
}

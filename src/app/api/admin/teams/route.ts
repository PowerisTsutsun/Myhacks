import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireAuth } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { teams, teamMembers, registrations, teammateEntries } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const guard = await requireAuth();
  if (guard.response) return guard.response;

  try {
    const allTeams = await db.select().from(teams).orderBy(teams.createdAt);

    const allMembers = await db
      .select({
        memberId: teamMembers.id,
        teamId: teamMembers.teamId,
        role: teamMembers.role,
        joinedAt: teamMembers.joinedAt,
        registrationId: registrations.id,
        fullName: registrations.fullName,
        email: registrations.email,
        experienceLevel: registrations.experienceLevel,
        teamStatus: registrations.teamStatus,
      })
      .from(teamMembers)
      .innerJoin(registrations, eq(teamMembers.registrationId, registrations.id));

    const teamsWithMembers = allTeams.map((team) => ({
      ...team,
      members: allMembers.filter((m) => m.teamId === team.id),
    }));

    const memberedIds = allMembers.map((m) => m.registrationId);

    const allNeedsTeam = await db
      .select({
        id: registrations.id,
        fullName: registrations.fullName,
        email: registrations.email,
        experienceLevel: registrations.experienceLevel,
        major: registrations.major,
        createdAt: registrations.createdAt,
      })
      .from(registrations)
      .where(eq(registrations.teamStatus, "needs_team"));

    const unmatchedPool =
      memberedIds.length > 0
        ? allNeedsTeam.filter((r) => !memberedIds.includes(r.id))
        : allNeedsTeam;

    const pending = await db
      .select({
        id: teammateEntries.id,
        registrantId: teammateEntries.registrantId,
        teammateFirstName: teammateEntries.teammateFirstName,
        teammateLastName: teammateEntries.teammateLastName,
        teammateEmail: teammateEntries.teammateEmail,
        createdAt: teammateEntries.createdAt,
      })
      .from(teammateEntries)
      .where(eq(teammateEntries.status, "pending"));

    return NextResponse.json({ teams: teamsWithMembers, unmatchedPool, pendingEntries: pending });
  } catch {
    return NextResponse.json({ error: "Failed to load teams." }, { status: 500 });
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

  const { name, notes, memberIds } = body as {
    name?: string;
    notes?: string;
    memberIds?: number[];
  };

  try {
    const [newTeam] = await db
      .insert(teams)
      .values({
        name: name || null,
        formationType: "organizer_created",
        status: "forming",
        maxSize: 4,
        notes: notes || null,
      })
      .returning();

    if (memberIds && memberIds.length > 0) {
      await db.insert(teamMembers).values(
        memberIds.map((regId, i) => ({
          teamId: newTeam.id,
          registrationId: regId,
          role: (i === 0 ? "lead" : "member") as "lead" | "member",
        }))
      );
    }

    return NextResponse.json({ team: newTeam });
  } catch {
    return NextResponse.json({ error: "Failed to create team." }, { status: 500 });
  }
}

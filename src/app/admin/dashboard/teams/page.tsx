import { db } from "@/lib/db";
import { teams, teamMembers, registrations, teammateEntries } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { TeamsManager } from "@/components/admin/TeamsManager";

export default async function TeamsPage() {
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

  const memberedIds = new Set(allMembers.map((m) => m.registrationId));

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

  const unmatchedPool = allNeedsTeam.filter((r) => !memberedIds.has(r.id));

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

  return (
    <TeamsManager
      initialTeams={teamsWithMembers}
      initialUnmatched={unmatchedPool}
      initialPending={pending}
    />
  );
}

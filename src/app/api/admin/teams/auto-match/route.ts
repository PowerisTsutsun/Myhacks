import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { teams, teamMembers, registrations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const TEAM_SIZE = 4;

export async function POST(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (guard.response) return guard.response;

  try {
    const allMembers = await db.select({ registrationId: teamMembers.registrationId }).from(teamMembers);
    const memberedIds = new Set(allMembers.map((m) => m.registrationId));

    const unmatched = await db
      .select({
        id: registrations.id,
        experienceLevel: registrations.experienceLevel,
      })
      .from(registrations)
      .where(eq(registrations.teamStatus, "needs_team"));

    const pool = unmatched.filter((r) => !memberedIds.has(r.id));

    if (pool.length < 2) {
      return NextResponse.json(
        { error: "Not enough unmatched participants to form teams." },
        { status: 400 }
      );
    }

    // Interleave by experience level for mixed teams
    const beginners = pool.filter((r) => r.experienceLevel === "beginner");
    const intermediate = pool.filter((r) => r.experienceLevel === "intermediate");
    const advanced = pool.filter((r) => r.experienceLevel === "advanced");

    const interleaved: typeof pool = [];
    const maxLen = Math.max(beginners.length, intermediate.length, advanced.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < beginners.length) interleaved.push(beginners[i]);
      if (i < intermediate.length) interleaved.push(intermediate[i]);
      if (i < advanced.length) interleaved.push(advanced[i]);
    }

    // Chunk into teams of TEAM_SIZE
    const chunks: (typeof pool)[] = [];
    for (let i = 0; i < interleaved.length; i += TEAM_SIZE) {
      chunks.push(interleaved.slice(i, i + TEAM_SIZE));
    }

    // Merge a lone remainder into the previous team rather than leaving a solo
    if (chunks.length >= 2) {
      const last = chunks[chunks.length - 1];
      const secondLast = chunks[chunks.length - 2];
      if (last.length === 1 && secondLast.length < TEAM_SIZE) {
        chunks[chunks.length - 2].push(...last);
        chunks.pop();
      }
    }

    const created: number[] = [];
    for (const chunk of chunks) {
      const [newTeam] = await db
        .insert(teams)
        .values({ formationType: "auto_matched", status: "forming", maxSize: TEAM_SIZE })
        .returning({ id: teams.id });

      await db.insert(teamMembers).values(
        chunk.map((r, i) => ({
          teamId: newTeam.id,
          registrationId: r.id,
          role: (i === 0 ? "lead" : "member") as "lead" | "member",
        }))
      );

      created.push(newTeam.id);
    }

    return NextResponse.json({ created: created.length, teamIds: created });
  } catch {
    return NextResponse.json({ error: "Auto-match failed. Please try again." }, { status: 500 });
  }
}

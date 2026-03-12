import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendRegistrationConfirmation } from "@/lib/email/resend";
import {
  registrations,
  siteSettings,
  teams,
  teamMembers,
  teammateEntries,
} from "@/lib/db/schema";
import { registrationSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/utils";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";

  // Rate limit: 3 registrations per 10 minutes per IP
  if (!checkRateLimit(`register:${ip}`, 3, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 }
    );
  }

  // Check registration mode
  const [modeSetting] = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, "registration_mode"))
    .limit(1);

  if (modeSetting?.value === "external") {
    return NextResponse.json(
      { error: "Internal registration is not currently active." },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Honeypot check
  const raw = body as Record<string, unknown>;
  if (raw.website && String(raw.website).length > 0) {
    return NextResponse.json({ ok: true });
  }

  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { website: _website, consent: _consent, teammates, ...fields } = parsed.data;
  const normalizedEmail = fields.email.toLowerCase();

  // Check for duplicate registration
  const [existing] = await db
    .select({ id: registrations.id })
    .from(registrations)
    .where(eq(registrations.email, normalizedEmail))
    .limit(1);

  if (existing) {
    return NextResponse.json(
      { error: "This email is already registered. Contact us if you need help." },
      { status: 409 }
    );
  }

  // Insert the registration
  const [newReg] = await db
    .insert(registrations)
    .values({
      fullName: fields.fullName,
      email: normalizedEmail,
      studentId: fields.studentId || null,
      major: fields.major,
      experienceLevel: fields.experienceLevel,
      teamStatus: fields.teamStatus,
      dietaryRestrictions: fields.dietaryRestrictions || null,
      notes: fields.notes || null,
      consent: true,
    })
    .returning({ id: registrations.id });

  const registrationId = newReg.id;

  // --- Auto-link: check if this email was listed as a teammate by someone else ---
  const pendingEntries = await db
    .select()
    .from(teammateEntries)
    .where(
      and(
        eq(teammateEntries.teammateEmail, normalizedEmail),
        eq(teammateEntries.status, "pending")
      )
    );

  for (const entry of pendingEntries) {
    // Find which team the registrant who listed this person is on
    const [membership] = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.registrationId, entry.registrantId))
      .limit(1);

    if (membership) {
      // Add this person to that team
      await db
        .insert(teamMembers)
        .values({ teamId: membership.teamId, registrationId, role: "member" })
        .onConflictDoNothing();
    }

    // Mark entry as linked
    await db
      .update(teammateEntries)
      .set({ status: "linked", linkedRegistrationId: registrationId })
      .where(eq(teammateEntries.id, entry.id));
  }

  // --- Team formation for registrants who listed teammates ---
  if (
    (fields.teamStatus === "has_partial_team" || fields.teamStatus === "has_full_team") &&
    teammates &&
    teammates.length > 0
  ) {
    // Create a premade team
    const [newTeam] = await db
      .insert(teams)
      .values({
        formationType: "premade",
        status: "forming",
        maxSize: 4,
      })
      .returning({ id: teams.id });

    const teamId = newTeam.id;

    // Add registrant as lead
    await db.insert(teamMembers).values({ teamId, registrationId, role: "lead" });

    // Process each listed teammate
    for (const tm of teammates) {
      const tmEmail = tm.email?.trim() ? tm.email.toLowerCase() : null;

      let tmReg: { id: number } | undefined;
      if (tmEmail) {
        // Check if teammate already registered by email
        [tmReg] = await db
          .select({ id: registrations.id })
          .from(registrations)
          .where(eq(registrations.email, tmEmail))
          .limit(1);

        if (tmReg) {
          await db
            .insert(teamMembers)
            .values({ teamId, registrationId: tmReg.id, role: "member" })
            .onConflictDoNothing();
        }
      }

      // Record for tracking & future linking
      await db.insert(teammateEntries).values({
        registrantId: registrationId,
        teammateFirstName: tm.firstName?.trim() || null,
        teammateLastName: tm.lastName?.trim() || null,
        teammateEmail: tmEmail,
        teammateStudentId: tm.studentId?.trim() || null,
        linkedRegistrationId: tmReg?.id ?? null,
        status: tmReg ? "linked" : "pending",
      });
    }
  }

  // Send confirmation email (fire-and-forget, prevent duplicate if somehow re-submitted)
  const firstName = fields.fullName.split(" ")[0];
  const [modeSetting2] = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, "event_name"))
    .limit(1);
  const eventName = modeSetting2?.value ?? "LaserHacks 2026";

  await db
    .update(registrations)
    .set({ confirmationEmailSentAt: new Date() })
    .where(eq(registrations.id, registrationId));

  sendRegistrationConfirmation({ to: normalizedEmail, firstName, eventName }).catch(
    (err) => console.error("[registration] confirmation email failed:", err)
  );

  return NextResponse.json({ ok: true });
}

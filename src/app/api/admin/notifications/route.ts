import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { registrations, teammateEntries } from "@/lib/db/schema";
import { sendCustomNotificationEmail } from "@/lib/email/resend";
import { z } from "zod";

const schema = z.object({
  subject: z.string().min(1).max(200),
  body: z.string().min(1).max(10000),
});

export async function POST(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (guard.response) return guard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { subject, body: messageBody } = parsed.data;

  const registrationRows = await db
    .select({ email: registrations.email, name: registrations.fullName })
    .from(registrations);

  const teammateRows = await db
    .select({
      email: teammateEntries.teammateEmail,
      firstName: teammateEntries.teammateFirstName,
      lastName: teammateEntries.teammateLastName,
    })
    .from(teammateEntries);

  const recipients = new Map<string, { email: string; name: string }>();

  for (const row of registrationRows) {
    const email = row.email.trim().toLowerCase();
    if (!email) continue;
    recipients.set(email, { email, name: row.name });
  }

  for (const row of teammateRows) {
    const email = row.email?.trim().toLowerCase();
    if (!email || recipients.has(email)) continue;

    const name = [row.firstName?.trim(), row.lastName?.trim()].filter(Boolean).join(" ");
    recipients.set(email, { email, name: name || "LaserHacks participant" });
  }

  const rows = Array.from(recipients.values());

  if (rows.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  const results = await Promise.allSettled(
    rows.map((r) =>
      sendCustomNotificationEmail({ to: r.email, name: r.name, subject, body: messageBody })
    )
  );

  const sent = results.filter((r) => r.status === "fulfilled" && r.value.ok).length;
  const failed = results.length - sent;

  return NextResponse.json({ ok: true, sent, failed, total: rows.length });
}

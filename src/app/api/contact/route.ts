import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactSubmissions } from "@/lib/db/schema";
import { contactSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";

  if (!checkRateLimit(`contact:${ip}`, 3, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many submissions. Please wait before trying again." },
      { status: 429 }
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

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { website: _website, ...fields } = parsed.data;

  await db.insert(contactSubmissions).values({
    name: fields.name,
    email: fields.email.toLowerCase(),
    subject: fields.subject,
    message: fields.message,
  });

  return NextResponse.json({ ok: true });
}

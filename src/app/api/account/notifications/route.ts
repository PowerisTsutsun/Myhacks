import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { enabled } = body as { enabled?: boolean };
  if (typeof enabled !== "boolean") {
    return NextResponse.json({ error: "Invalid value." }, { status: 400 });
  }

  await db
    .update(users)
    .set({ emailNotifications: enabled, updatedAt: new Date() })
    .where(eq(users.id, Number(session.sub)));

  return NextResponse.json({ ok: true, emailNotifications: enabled });
}

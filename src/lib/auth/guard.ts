import { getSession, SessionPayload } from "./session";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/utils";

type GuardResult =
  | { session: SessionPayload; response: null }
  | { session: null; response: NextResponse };

/**
 * Verify the request is from an authenticated admin.
 * Also rate-limits admin write endpoints: 30 writes/min per IP.
 */
export async function requireAdmin(request?: NextRequest): Promise<GuardResult> {
  const session = await getSession();

  if (!session) {
    return { session: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (session.role !== "admin") {
    return { session: null, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  if (request) {
    const ip = request.headers.get("x-forwarded-for") ?? session.sub;
    if (!checkRateLimit(`admin-write:${ip}`, 30, 60 * 1000)) {
      return {
        session: null,
        response: NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 }),
      };
    }
  }

  return { session, response: null };
}

/**
 * Verify the request is from any authenticated user (admin or editor).
 */
export async function requireAuth(): Promise<GuardResult> {
  const session = await getSession();
  if (!session) {
    return { session: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, response: null };
}

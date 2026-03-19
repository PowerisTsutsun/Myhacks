import { NextResponse } from "next/server";

export function parsePositiveInt(value: string): number | null {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return null;
  return parsed;
}

export function badRequest(error: string): NextResponse {
  return NextResponse.json({ error }, { status: 400 });
}

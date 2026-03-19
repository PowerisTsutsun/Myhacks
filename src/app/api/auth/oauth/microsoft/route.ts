import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { getAuthorizationUrl } from "@/lib/auth/oauth";

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function GET(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next") ?? "/register";
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/microsoft/callback`;

  const state = await new SignJWT({ next })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(getJwtSecret());

  const url = getAuthorizationUrl("microsoft", state, redirectUri);
  return NextResponse.redirect(url);
}

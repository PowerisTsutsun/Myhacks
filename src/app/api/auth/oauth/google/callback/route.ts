import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { exchangeCodeForUser, handleOAuthLogin } from "@/lib/auth/oauth";

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");

  if (error || !code || !state) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?error=oauth_cancelled`
    );
  }

  let next = "/register";
  try {
    const { payload } = await jwtVerify(state, getJwtSecret());
    next = (payload.next as string) ?? "/register";
  } catch {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?error=oauth_invalid_state`
    );
  }

  try {
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/google/callback`;
    const profile = await exchangeCodeForUser("google", code, redirectUri);
    await handleOAuthLogin("google", profile);

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}${next}`);
  } catch (err) {
    console.error("[oauth/google] callback error:", err);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?error=oauth_failed`
    );
  }
}

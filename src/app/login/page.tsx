import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getSiteConfig } from "@/lib/settings";
import { LoginForm } from "@/components/forms/LoginForm";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your MyHacks account.",
};

const oauthErrors: Record<string, string> = {
  oauth_cancelled: "Sign-in was cancelled. Please try again.",
  oauth_invalid_state: "Session expired. Please try again.",
  oauth_failed: "Something went wrong with the sign-in. Please try again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reset?: string; error?: string }>;
}) {
  const config = await getSiteConfig();
  const { next, reset, error } = await searchParams;
  const redirectTo = next && next.startsWith("/") ? next : "/register";
  const oauthError = error ? oauthErrors[error] : null;

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div
            className="rounded-3xl p-8 sm:p-10"
            style={{
              background: "rgba(8,20,37,0.9)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 0 0 1px rgba(77,166,255,0.2), 0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            {reset === "1" && (
              <div className="mb-6 p-3 rounded-lg text-sm text-emerald-300 border border-emerald-500/30 text-center"
                style={{ background: "rgba(16,185,129,0.1)" }}>
                Password reset successfully. You can now log in.
              </div>
            )}

            {oauthError && (
              <div className="mb-6 p-3 rounded-lg text-sm text-red-300 border border-red-500/30 text-center"
                style={{ background: "rgba(239,68,68,0.1)" }}>
                {oauthError}
              </div>
            )}

            <div className="mb-8 text-center">
              <p className="text-laser-400 font-semibold text-sm uppercase tracking-widest mb-2">
                Welcome back
              </p>
              <h1 className="text-3xl font-bold text-white">Log In</h1>
            </div>

            <OAuthButtons redirectTo={redirectTo} />

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 text-white/30" style={{ background: "rgba(8,20,37,0.9)" }}>
                  or sign in with email
                </span>
              </div>
            </div>

            <LoginForm redirectTo={redirectTo} />

            <p className="mt-6 text-center text-sm text-white/55">
              No account?{" "}
              <Link
                href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`}
                className="text-laser-400 hover:text-laser-300 font-medium transition-colors"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer config={config} />
    </>
  );
}

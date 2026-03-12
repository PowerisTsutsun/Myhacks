import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getSiteConfig } from "@/lib/settings";
import { LoginForm } from "@/components/forms/LoginForm";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your LaserHacks account.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reset?: string }>;
}) {
  const config = await getSiteConfig();
  const { next, reset } = await searchParams;
  const redirectTo = next && next.startsWith("/") ? next : "/register";

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
              boxShadow: "0 0 0 1px rgba(75,159,229,0.15), 0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            {reset === "1" && (
              <div className="mb-6 p-3 rounded-lg text-sm text-emerald-300 border border-emerald-500/30 text-center"
                style={{ background: "rgba(16,185,129,0.1)" }}>
                Password reset successfully. You can now log in.
              </div>
            )}

            <div className="mb-8 text-center">
              <p className="text-laser-400 font-semibold text-sm uppercase tracking-widest mb-2">
                Welcome back
              </p>
              <h1 className="text-3xl font-bold text-white">Log In</h1>
            </div>

            <LoginForm redirectTo={redirectTo} />

            <p className="mt-6 text-center text-sm text-white/40">
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

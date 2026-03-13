import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getSiteConfig } from "@/lib/settings";
import { SignupForm } from "@/components/forms/SignupForm";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a LaserHacks account to register for the event.",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const config = await getSiteConfig();
  const { next } = await searchParams;
  const redirectTo = next && next.startsWith("/") ? next : "/register";

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div
            className="rounded-3xl p-8 sm:p-10"
            style={{
              background: "rgba(13,27,42,0.85)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 0 0 1px rgba(56,189,248,0.12), 0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            <div className="mb-8 text-center">
              <p className="text-laser-400 font-semibold text-sm uppercase tracking-widest mb-2">
                Get started
              </p>
              <h1 className="text-3xl font-bold text-white">Create Account</h1>
            </div>

            <SignupForm redirectTo={redirectTo} />

            <p className="mt-6 text-center text-sm text-white/55">
              Already have an account?{" "}
              <Link
                href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}
                className="text-laser-400 hover:text-laser-300 font-medium transition-colors"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer config={config} />
    </>
  );
}

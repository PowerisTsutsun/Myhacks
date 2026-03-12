import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/forms/LoginForm";

export const metadata: Metadata = {
  title: "Sign In | LaserHacks",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "radial-gradient(ellipse 80% 60% at 50% 20%, #1a3a6e 0%, #0d1b2a 60%, #050d1a 100%)" }}
    >
      {/* Cyber grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(rgba(56,189,248,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">
            Laser<span className="text-laser-400" style={{ textShadow: "0 0 20px rgba(56,189,248,0.5)" }}>Hacks</span>
          </h1>
          <p className="text-white/40 text-sm">Admin Dashboard</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "rgba(13,27,42,0.85)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 0 0 1px rgba(56,189,248,0.15), 0 20px 60px rgba(0,0,0,0.6)",
          }}
        >
          <h2 className="text-xl font-bold text-white mb-1">Sign In</h2>
          <p className="text-white/40 text-sm mb-6">For organizers and staff only.</p>
          <LoginForm />

          <p className="text-center text-white/30 text-sm mt-6">
            No account?{" "}
            <Link href="/admin/signup" className="text-laser-400 hover:text-laser-300 transition-colors">
              Create one
            </Link>
          </p>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          LaserHacks &mdash; Irvine Valley College
        </p>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Check Your Email" };

export default function VerifyEmailPendingPage({
  searchParams,
}: {
  searchParams: { email?: string };
}) {
  const email = searchParams.email;

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16">
      <div
        className="w-full max-w-md rounded-3xl p-10 text-center"
        style={{
          background: "rgba(8,20,37,0.9)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 0 0 1px rgba(75,159,229,0.15), 0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div className="text-5xl mb-5">📧</div>
        <h1 className="text-2xl font-bold text-white mb-3">Check your email</h1>
        <p className="text-white/60 leading-relaxed mb-2">
          We sent a verification link to{" "}
          {email ? (
            <span className="text-laser-400 font-medium">{email}</span>
          ) : (
            "your email address"
          )}
          .
        </p>
        <p className="text-white/55 text-sm mb-8">
          Click the link in the email to activate your account. The link expires in 24 hours.
        </p>
        <p className="text-white/30 text-sm">
          Didn&apos;t get it?{" "}
          <Link
            href="/verify-email/resend"
            className="text-laser-400 hover:text-laser-300 transition-colors"
          >
            Resend verification email
          </Link>
        </p>
        <p className="text-white/20 text-xs mt-4">
          Already verified?{" "}
          <Link href="/login" className="text-white/55 hover:text-white/60 transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}

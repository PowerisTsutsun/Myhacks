"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyEmailPageInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setState("error");
      setMessage("No verification token found. Please check your email link.");
      return;
    }

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setState("success");
        } else {
          setState("error");
          setMessage(data.error ?? "Verification failed.");
        }
      })
      .catch(() => {
        setState("error");
        setMessage("Network error. Please try again.");
      });
  }, [token]);

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
        {state === "loading" && (
          <>
            <div className="w-12 h-12 border-4 border-laser-400/30 border-t-laser-400 rounded-full animate-spin mx-auto mb-6" />
            <p className="text-white/60">Verifying your email...</p>
          </>
        )}

        {state === "success" && (
          <>
            <div className="text-5xl mb-5">✅</div>
            <h1 className="text-2xl font-bold text-white mb-3">Email verified!</h1>
            <p className="text-white/60 mb-8">
              Your account is now active. You can log in and complete the 2-step verification.
            </p>
            <Link
              href="/login"
              className="inline-block bg-laser-500 hover:bg-laser-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Log in now
            </Link>
          </>
        )}

        {state === "error" && (
          <>
            <div className="text-5xl mb-5">❌</div>
            <h1 className="text-2xl font-bold text-white mb-3">Verification failed</h1>
            <p className="text-white/60 mb-8">{message}</p>
            <Link
              href="/verify-email/resend"
              className="inline-block bg-laser-500 hover:bg-laser-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Resend verification email
            </Link>
          </>
        )}
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailPageInner />
    </Suspense>
  );
}

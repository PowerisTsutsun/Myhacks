"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

function TwoFactorPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("next") ?? "/register";
  const isTotp = searchParams.get("method") === "totp";

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    if (digit && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (digits.length === 6) {
      setCode(digits.split(""));
      inputs.current[5]?.focus();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length < 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: fullCode }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Verification failed.");
        setCode(["", "", "", "", "", ""]);
        inputs.current[0]?.focus();
        return;
      }
      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResendLoading(true);
    setResendMessage(null);
    // Re-submit credentials isn't available — tell user to log in again
    setResendMessage("Please go back and log in again to receive a new code.");
    setResendLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16">
      <div
        className="w-full max-w-md rounded-3xl p-8 sm:p-10"
        style={{
          background: "rgba(8,20,37,0.9)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 0 0 1px rgba(75,159,229,0.15), 0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div className="mb-8 text-center">
          <p className="text-laser-400 font-semibold text-sm uppercase tracking-widest mb-2">
            Two-Step Verification
          </p>
          <h1 className="text-2xl font-bold text-white mb-2">Enter your code</h1>
          <p className="text-white/55 text-sm">
            {isTotp
              ? "Enter the 6-digit code from your authenticator app."
              : "We sent a 6-digit code to your email. It expires in 10 minutes."}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg text-sm text-red-300 border border-red-500/30 text-center"
            style={{ background: "rgba(239,68,68,0.1)" }}>
            {error}
          </div>
        )}

        {resendMessage && (
          <div className="mb-5 p-3 rounded-lg text-sm text-blue-300 border border-blue-500/30 text-center"
            style={{ background: "rgba(59,130,246,0.1)" }}>
            {resendMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 6-digit code input */}
          <div className="flex gap-2 justify-center" onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-xl font-bold rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-laser-400"
                style={{
                  background: "rgba(13,30,56,0.8)",
                  borderColor: digit ? "rgba(75,159,229,0.6)" : "rgba(255,255,255,0.1)",
                  color: "white",
                }}
                aria-label={`Digit ${i + 1}`}
              />
            ))}
          </div>

          <Button type="submit" loading={loading} className="w-full justify-center">
            Verify
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          {isTotp ? (
            <p className="text-sm text-white/40">
              Open Google Authenticator, Authy, or a similar app to get your code.
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading}
              className="text-sm text-white/40 hover:text-white/60 transition-colors"
            >
              Didn&apos;t get a code?
            </button>
          )}
          <br />
          <Link href="/login" className="text-sm text-laser-400 hover:text-laser-300 transition-colors">
            ← Back to log in
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function TwoFactorPage() {
  return (
    <Suspense>
      <TwoFactorPageInner />
    </Suspense>
  );
}

"use client";

import { Suspense, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";

function TwoFactorPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("next") ?? "/register";
  const emailAvailable = searchParams.get("email2fa") === "1";
  const totpAvailable = searchParams.get("totp") === "1";
  const [method, setMethod] = useState<"email" | "totp">(
    searchParams.get("method") === "totp" ? "totp" : "email"
  );

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [switchLoading, setSwitchLoading] = useState<"email" | "totp" | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  function resetCodeInputs() {
    setCode(["", "", "", "", "", ""]);
    inputs.current[0]?.focus();
  }

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
        body: JSON.stringify({ action: "verify", code: fullCode }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Verification failed.");
        resetCodeInputs();
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

  async function handleSwitch(nextMethod: "email" | "totp") {
    if (nextMethod === method) return;

    setSwitchLoading(nextMethod);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "switch", method: nextMethod }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to switch verification method.");
        return;
      }

      setMethod(nextMethod);
      resetCodeInputs();
      if (json.message) setMessage(json.message);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSwitchLoading(null);
    }
  }

  async function handleResend() {
    setResendLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resend" }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to send a new code.");
        return;
      }
      setMessage(json.message ?? "A new verification code was sent to your email.");
      resetCodeInputs();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setResendLoading(false);
    }
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
            {method === "totp"
              ? "Enter the 6-digit code from your authenticator app."
              : "We sent a 6-digit code to your email. It expires in 10 minutes."}
          </p>
        </div>

        {(emailAvailable && totpAvailable) && (
          <div className="mb-6">
            <p className="mb-2 text-xs uppercase tracking-[0.18em] text-white/35">Choose method</p>
            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/5 p-1.5">
              <button
                type="button"
                onClick={() => handleSwitch("email")}
                disabled={switchLoading !== null}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  method === "email" ? "text-white" : "text-white/45 hover:text-white/70"
                }`}
                style={method === "email" ? { background: "rgba(75,159,229,0.18)" } : undefined}
              >
                {switchLoading === "email" ? "Switching..." : "Email code"}
              </button>
              <button
                type="button"
                onClick={() => handleSwitch("totp")}
                disabled={switchLoading !== null}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  method === "totp" ? "text-white" : "text-white/45 hover:text-white/70"
                }`}
                style={method === "totp" ? { background: "rgba(75,159,229,0.18)" } : undefined}
              >
                {switchLoading === "totp" ? "Switching..." : "Authenticator"}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div
            className="mb-5 p-3 rounded-lg text-sm text-red-300 border border-red-500/30 text-center"
            style={{ background: "rgba(239,68,68,0.1)" }}
          >
            {error}
          </div>
        )}

        {message && (
          <div
            className="mb-5 p-3 rounded-lg text-sm text-blue-300 border border-blue-500/30 text-center"
            style={{ background: "rgba(59,130,246,0.1)" }}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
          {method === "totp" ? (
            <p className="text-sm text-white/40">
              Open Google Authenticator, Authy, or a similar app to get your code.
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading}
              className="text-sm text-white/40 hover:text-white/60 transition-colors disabled:opacity-50"
            >
              {resendLoading ? "Sending..." : "Didn&apos;t get a code?"}
            </button>
          )}
          <br />
          <Link href="/login" className="text-sm text-laser-400 hover:text-laser-300 transition-colors">
            Back to log in
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

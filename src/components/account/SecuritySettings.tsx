"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";

interface SecuritySettingsProps {
  emailTwoFactorEnabled: boolean;
  totpEnabled: boolean;
  twoFactorMethod: string;
}

type SetupState = "idle" | "setting-up" | "verifying" | "done";

export function SecuritySettings({
  emailTwoFactorEnabled: initialEmailEnabled,
  totpEnabled: initialTotpEnabled,
  twoFactorMethod: initialMethod,
}: SecuritySettingsProps) {
  const [emailEnabled, setEmailEnabled] = useState(initialEmailEnabled);
  const [totpEnabled, setTotpEnabled] = useState(initialTotpEnabled);
  const [method, setMethod] = useState(initialMethod);

  // Email 2FA state
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // TOTP setup state
  const [setupState, setSetupState] = useState<SetupState>("idle");
  const [setupSecret, setSetupSecret] = useState<string | null>(null);
  const [setupQr, setSetupQr] = useState<string | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [setupLoading, setSetupLoading] = useState(false);
  const [secretCopied, setSecretCopied] = useState(false);

  // TOTP verification
  const [totpCode, setTotpCode] = useState(["", "", "", "", "", ""]);
  const totpInputs = useRef<(HTMLInputElement | null)[]>([]);

  // TOTP disable state
  const [disableLoading, setDisableLoading] = useState(false);
  const [disableError, setDisableError] = useState<string | null>(null);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);

  // ── Email 2FA enable/disable ─────────────────────────────────────────────

  async function handleEmailToggle() {
    setEmailLoading(true);
    setEmailError(null);
    try {
      const action = emailEnabled ? "disable" : "initiate";
      const res = await fetch("/api/account/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (!res.ok) {
        setEmailError(json.error ?? "Failed to update 2FA setting.");
        return;
      }
      if (action === "disable") {
        setEmailEnabled(false);
        if (method === "email") setMethod("email");
      } else {
        // For enable, we need to verify a code — redirect to full flow
        // (This scenario only applies if TOTP is primary and user wants email as backup)
        setEmailError("To enable email 2FA, use the setup flow below.");
      }
    } catch {
      setEmailError("Network error. Please try again.");
    } finally {
      setEmailLoading(false);
    }
  }

  // ── TOTP setup ───────────────────────────────────────────────────────────

  async function handleStartSetup(isRegenerate = false) {
    setSetupLoading(true);
    setSetupError(null);
    setSetupState("setting-up");
    setTotpCode(["", "", "", "", "", ""]);
    try {
      const res = await fetch("/api/account/totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: isRegenerate ? "regenerate" : "setup" }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSetupError(json.error ?? "Failed to start setup.");
        setSetupState("idle");
        return;
      }
      setSetupSecret(json.secret);
      setSetupQr(json.qrDataUrl);
      setSetupState("verifying");
    } catch {
      setSetupError("Network error. Please try again.");
      setSetupState("idle");
    } finally {
      setSetupLoading(false);
    }
  }

  function handleTotpInput(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...totpCode];
    next[index] = digit;
    setTotpCode(next);
    if (digit && index < 5) totpInputs.current[index + 1]?.focus();
  }

  function handleTotpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !totpCode[index] && index > 0) {
      totpInputs.current[index - 1]?.focus();
    }
  }

  function handleTotpPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (digits.length === 6) {
      setTotpCode(digits.split(""));
      totpInputs.current[5]?.focus();
    }
  }

  async function handleVerifyAndEnable() {
    const code = totpCode.join("");
    if (code.length < 6) {
      setSetupError("Enter the full 6-digit code from your authenticator app.");
      return;
    }
    setSetupLoading(true);
    setSetupError(null);
    try {
      const res = await fetch("/api/account/totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "enable", code }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSetupError(json.error ?? "Verification failed.");
        setTotpCode(["", "", "", "", "", ""]);
        totpInputs.current[0]?.focus();
        return;
      }
      setTotpEnabled(true);
      setMethod("totp");
      setEmailEnabled(true); // twoFactorEnabled is set to true server-side
      setSetupState("done");
      setSetupSecret(null);
      setSetupQr(null);
    } catch {
      setSetupError("Network error. Please try again.");
    } finally {
      setSetupLoading(false);
    }
  }

  function handleCancelSetup() {
    setSetupState("idle");
    setSetupSecret(null);
    setSetupQr(null);
    setSetupError(null);
    setTotpCode(["", "", "", "", "", ""]);
  }

  async function copySecret() {
    if (!setupSecret) return;
    await navigator.clipboard.writeText(setupSecret);
    setSecretCopied(true);
    setTimeout(() => setSecretCopied(false), 2000);
  }

  // ── TOTP disable ─────────────────────────────────────────────────────────

  async function handleDisableTotp() {
    setDisableLoading(true);
    setDisableError(null);
    try {
      const res = await fetch("/api/account/totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disable" }),
      });
      const json = await res.json();
      if (!res.ok) {
        setDisableError(json.error ?? "Failed to disable authenticator app.");
        return;
      }
      setTotpEnabled(false);
      setMethod("email");
      setShowDisableConfirm(false);
      setSetupState("idle");
    } catch {
      setDisableError("Network error. Please try again.");
    } finally {
      setDisableLoading(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Email 2FA card */}
      <SecurityCard title="Email Verification">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-white/70 leading-relaxed">
              Receive a one-time code by email each time you sign in.
            </p>
            <StatusBadge enabled={emailEnabled && method === "email"} />
          </div>
          <div className="shrink-0">
            {emailEnabled && method === "email" ? (
              <button
                onClick={handleEmailToggle}
                disabled={emailLoading || totpEnabled}
                className="text-sm text-white/50 hover:text-red-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title={totpEnabled ? "Authenticator app is your active 2FA method" : undefined}
              >
                {emailLoading ? "…" : "Disable"}
              </button>
            ) : !totpEnabled ? (
              <EmailEnableFlow emailEnabled={emailEnabled} onEnabled={() => { setEmailEnabled(true); setMethod("email"); }} />
            ) : (
              <span className="text-xs text-white/30 italic">Authenticator is active</span>
            )}
          </div>
        </div>
        {emailError && <ErrorMsg msg={emailError} />}
      </SecurityCard>

      {/* Authenticator App card */}
      <SecurityCard title="Authenticator App">
        {setupState === "idle" || setupState === "done" ? (
          <>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm text-white/70 leading-relaxed">
                  Use Google Authenticator, Authy, Microsoft Authenticator, or any TOTP app for more secure sign-ins.
                </p>
                <StatusBadge enabled={totpEnabled} label={totpEnabled ? "Active — used at login" : undefined} />
              </div>
              <div className="shrink-0">
                {totpEnabled ? (
                  <button
                    onClick={() => setShowDisableConfirm(true)}
                    className="text-sm text-white/50 hover:text-red-400 transition-colors"
                  >
                    Disable
                  </button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    loading={setupLoading}
                    onClick={() => handleStartSetup(false)}
                  >
                    Set up
                  </Button>
                )}
              </div>
            </div>

            {totpEnabled && (
              <button
                onClick={() => handleStartSetup(true)}
                className="mt-3 text-xs text-white/35 hover:text-white/55 transition-colors"
              >
                Regenerate secret key
              </button>
            )}

            {/* Disable confirm */}
            {showDisableConfirm && (
              <div
                className="mt-4 rounded-xl p-4 space-y-3"
                style={{ background: "rgba(251,113,133,0.08)", border: "1px solid rgba(251,113,133,0.25)" }}
              >
                <p className="text-sm text-red-200">
                  This will remove your authenticator app. Your account will fall back to email 2FA if it was previously enabled.
                </p>
                {disableError && <ErrorMsg msg={disableError} />}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    loading={disableLoading}
                    onClick={handleDisableTotp}
                    className="bg-red-500/80 hover:bg-red-500"
                  >
                    Yes, remove it
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setShowDisableConfirm(false); setDisableError(null); }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : setupState === "verifying" ? (
          <SetupFlow
            qrDataUrl={setupQr}
            secret={setupSecret}
            code={totpCode}
            secretCopied={secretCopied}
            loading={setupLoading}
            error={setupError}
            inputs={totpInputs}
            onInput={handleTotpInput}
            onKeyDown={handleTotpKeyDown}
            onPaste={handleTotpPaste}
            onCopySecret={copySecret}
            onVerify={handleVerifyAndEnable}
            onCancel={handleCancelSetup}
          />
        ) : null}
      </SecurityCard>
    </div>
  );
}

// ── Inline sub-components ────────────────────────────────────────────────────

function SecurityCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "rgba(10,24,48,0.85)", border: "1px solid rgba(36,61,104,0.9)" }}
    >
      <h2 className="text-xs font-semibold uppercase tracking-widest text-laser-400/80 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function StatusBadge({ enabled, label }: { enabled: boolean; label?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 mt-2 text-xs font-medium px-2.5 py-1 rounded-full"
      style={
        enabled
          ? { background: "rgba(52,211,153,0.12)", color: "#6ee7b7", border: "1px solid rgba(52,211,153,0.25)" }
          : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.08)" }
      }
    >
      <span className={`w-1.5 h-1.5 rounded-full ${enabled ? "bg-emerald-400" : "bg-white/20"}`} />
      {label ?? (enabled ? "Enabled" : "Disabled")}
    </span>
  );
}

function ErrorMsg({ msg }: { msg: string }) {
  return (
    <p className="mt-2 text-sm text-red-300" role="alert">{msg}</p>
  );
}

/** Inline enable flow for email 2FA — sends a code then verifies it */
function EmailEnableFlow({ emailEnabled, onEnabled }: { emailEnabled: boolean; onEnabled: () => void }) {
  const [step, setStep] = useState<"idle" | "verify">("idle");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  async function startEnable() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/account/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "initiate" }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Failed to send code."); return; }
      setStep("verify");
    } catch { setError("Network error."); }
    finally { setLoading(false); }
  }

  async function verify() {
    const fullCode = code.join("");
    if (fullCode.length < 6) { setError("Enter the full 6-digit code."); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/account/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "enable", code: fullCode }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Verification failed."); setCode(["", "", "", "", "", ""]); return; }
      onEnabled();
      setStep("idle");
    } catch { setError("Network error."); }
    finally { setLoading(false); }
  }

  if (step === "idle") {
    return (
      <Button size="sm" variant="outline" loading={loading} onClick={startEnable}>
        Enable
      </Button>
    );
  }

  return (
    <div className="mt-3 space-y-3">
      <p className="text-xs text-white/55">Enter the code we sent to your email.</p>
      <div className="flex gap-1.5">
        {code.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => {
              const d = e.target.value.replace(/\D/g, "").slice(-1);
              const next = [...code]; next[i] = d; setCode(next);
              if (d && i < 5) inputs.current[i + 1]?.focus();
            }}
            onKeyDown={(e) => { if (e.key === "Backspace" && !code[i] && i > 0) inputs.current[i - 1]?.focus(); }}
            className="w-9 h-10 text-center text-base font-bold rounded-lg border focus:outline-none focus:ring-1 focus:ring-laser-400"
            style={{ background: "rgba(13,30,56,0.8)", borderColor: digit ? "rgba(77,166,255,0.6)" : "rgba(255,255,255,0.12)", color: "white" }}
          />
        ))}
      </div>
      {error && <ErrorMsg msg={error} />}
      <div className="flex gap-2">
        <Button size="sm" loading={loading} onClick={verify}>Verify</Button>
        <button onClick={() => { setStep("idle"); setCode(["", "", "", "", "", ""]); setError(null); }} className="text-xs text-white/35 hover:text-white/55 transition-colors">Cancel</button>
      </div>
    </div>
  );
}

/** QR code + verification step for TOTP setup */
function SetupFlow({
  qrDataUrl, secret, code, secretCopied, loading, error, inputs,
  onInput, onKeyDown, onPaste, onCopySecret, onVerify, onCancel,
}: {
  qrDataUrl: string | null;
  secret: string | null;
  code: string[];
  secretCopied: boolean;
  loading: boolean;
  error: string | null;
  inputs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  onInput: (i: number, v: string) => void;
  onKeyDown: (i: number, e: React.KeyboardEvent) => void;
  onPaste: (e: React.ClipboardEvent) => void;
  onCopySecret: () => void;
  onVerify: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-white/70">
        Scan the QR code with your authenticator app, then enter the 6-digit code it generates to confirm setup.
      </p>

      {/* QR Code */}
      {qrDataUrl && (
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-xl p-3 bg-white inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="Authenticator QR code" width={200} height={200} className="block" />
          </div>
        </div>
      )}

      {/* Manual key fallback */}
      {secret && (
        <div>
          <p className="text-xs text-white/45 mb-1.5">Can&apos;t scan? Enter this key manually:</p>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ background: "rgba(16,33,63,0.8)", border: "1px solid rgba(36,61,104,0.8)" }}
          >
            <code className="flex-1 text-xs font-mono text-laser-300 tracking-wider break-all select-all">
              {secret.match(/.{1,4}/g)?.join(" ") ?? secret}
            </code>
            <button
              onClick={onCopySecret}
              className="shrink-0 text-xs text-white/40 hover:text-laser-400 transition-colors"
            >
              {secretCopied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}

      {/* Verification code input */}
      <div>
        <p className="text-xs text-white/55 mb-2">Enter the 6-digit code from your app to confirm:</p>
        <div className="flex gap-2" onPaste={onPaste}>
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => onInput(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              className="w-11 h-13 text-center text-lg font-bold rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-laser-400"
              style={{
                background: "rgba(13,30,56,0.8)",
                borderColor: digit ? "rgba(77,166,255,0.6)" : "rgba(255,255,255,0.12)",
                color: "white",
                height: "3rem",
              }}
              aria-label={`Digit ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {error && <ErrorMsg msg={error} />}

      <div className="flex gap-3">
        <Button loading={loading} onClick={onVerify}>
          Verify &amp; Enable
        </Button>
        <button
          onClick={onCancel}
          className="text-sm text-white/35 hover:text-white/55 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

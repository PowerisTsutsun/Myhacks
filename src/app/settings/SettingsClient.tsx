"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface UserData {
  id: number;
  name: string;
  email: string;
  twoFactorEnabled: boolean;
  totpEnabled: boolean;
  twoFactorMethod: string;
  emailNotifications: boolean;
}

export function SettingsClient({ user }: { user: UserData }) {
  return (
    <div className="space-y-6">
      {/* Profile (read-only) */}
      <Card>
        <CardHeader icon={<UserIcon />} title="Profile" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
          <InfoField label="Name" value={user.name} />
          <InfoField label="Email" value={user.email} />
        </div>
      </Card>

      {/* Password */}
      <PasswordSection />

      {/* Two-Factor Authentication */}
      <TwoFactorSection
        emailEnabled={user.twoFactorEnabled}
        totpEnabled={user.totpEnabled}
        method={user.twoFactorMethod}
      />

      {/* Notifications */}
      <NotificationsSection enabled={user.emailNotifications} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Password change                                                              */
/* -------------------------------------------------------------------------- */
function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus({ ok: false, msg: "New passwords do not match." });
      return;
    }
    if (newPassword.length < 8) {
      setStatus({ ok: false, msg: "New password must be at least 8 characters." });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      if (res.ok) {
        setStatus({ ok: true, msg: "Password updated successfully." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setStatus({ ok: false, msg: json.error || "Failed to update password." });
      }
    } catch {
      setStatus({ ok: false, msg: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader icon={<LockIcon />} title="Change Password" />
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {status && <StatusBanner ok={status.ok} msg={status.msg} />}
        <Input dark label="Current Password" type="password" required autoComplete="current-password"
          value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        <Input dark label="New Password" type="password" required autoComplete="new-password"
          value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <Input dark label="Confirm New Password" type="password" required autoComplete="new-password"
          value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        <div className="pt-1">
          <Button type="submit" loading={loading} variant="primary">Update Password</Button>
        </div>
      </form>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/* Two-Factor Authentication — email + authenticator app                       */
/* -------------------------------------------------------------------------- */
type EmailStep = "idle" | "sent" | "disabling";
type TotpStep = "idle" | "setting-up" | "disabling";

function TwoFactorSection({
  emailEnabled: initialEmailEnabled,
  totpEnabled: initialTotpEnabled,
  method: initialMethod,
}: {
  emailEnabled: boolean;
  totpEnabled: boolean;
  method: string;
}) {
  const [emailEnabled, setEmailEnabled] = useState(initialEmailEnabled);
  const [totpEnabled, setTotpEnabled] = useState(initialTotpEnabled);
  const [method, setMethod] = useState(initialMethod);

  const [emailStep, setEmailStep] = useState<EmailStep>("idle");
  const [emailCode, setEmailCode] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);

  const [totpStep, setTotpStep] = useState<TotpStep>("idle");
  const [totpQr, setTotpQr] = useState<string | null>(null);
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState(["", "", "", "", "", ""]);
  const [totpLoading, setTotpLoading] = useState(false);
  const [totpError, setTotpError] = useState<string | null>(null);
  const [totpSuccess, setTotpSuccess] = useState<string | null>(null);
  const [secretCopied, setSecretCopied] = useState(false);
  const totpInputs = useRef<(HTMLInputElement | null)[]>([]);

  // ── Email 2FA ─────────────────────────────────────────────────────────────

  async function sendEmailCode() {
    setEmailLoading(true);
    setEmailError(null);
    setEmailSuccess(null);
    try {
      const res = await fetch("/api/account/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "initiate" }),
      });
      const json = await res.json();
      if (res.ok) setEmailStep("sent");
      else setEmailError(json.error || "Failed to send code.");
    } catch { setEmailError("Network error. Please try again."); }
    finally { setEmailLoading(false); }
  }

  async function verifyEmailAndEnable() {
    if (!emailCode.trim()) { setEmailError("Please enter the verification code."); return; }
    setEmailLoading(true);
    setEmailError(null);
    try {
      const res = await fetch("/api/account/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "enable", code: emailCode }),
      });
      const json = await res.json();
      if (res.ok) {
        setEmailEnabled(true);
        if (!totpEnabled) setMethod("email");
        setEmailStep("idle");
        setEmailCode("");
        setEmailSuccess("Email two-factor authentication is now active.");
      } else setEmailError(json.error || "Invalid code.");
    } catch { setEmailError("Network error. Please try again."); }
    finally { setEmailLoading(false); }
  }

  async function disableEmail() {
    setEmailLoading(true);
    setEmailError(null);
    setEmailSuccess(null);
    try {
      const res = await fetch("/api/account/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disable" }),
      });
      const json = await res.json();
      if (res.ok) {
        setEmailEnabled(false);
        setEmailStep("idle");
        setEmailSuccess("Email two-factor authentication has been disabled.");
      } else setEmailError(json.error || "Failed to disable.");
    } catch { setEmailError("Network error. Please try again."); }
    finally { setEmailLoading(false); }
  }

  // ── Authenticator App (TOTP) ──────────────────────────────────────────────

  async function startTotpSetup(isRegenerate = false) {
    setTotpLoading(true);
    setTotpError(null);
    setTotpSuccess(null);
    setTotpCode(["", "", "", "", "", ""]);
    try {
      const res = await fetch("/api/account/totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: isRegenerate ? "regenerate" : "setup" }),
      });
      const json = await res.json();
      if (res.ok) {
        setTotpQr(json.qrDataUrl);
        setTotpSecret(json.secret);
        setTotpStep("setting-up");
      } else setTotpError(json.error || "Failed to start setup.");
    } catch { setTotpError("Network error. Please try again."); }
    finally { setTotpLoading(false); }
  }

  function handleTotpDigit(i: number, value: string) {
    const d = value.replace(/\D/g, "").slice(-1);
    const next = [...totpCode]; next[i] = d; setTotpCode(next);
    if (d && i < 5) totpInputs.current[i + 1]?.focus();
  }

  function handleTotpKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !totpCode[i] && i > 0) totpInputs.current[i - 1]?.focus();
  }

  function handleTotpPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (digits.length === 6) { setTotpCode(digits.split("")); totpInputs.current[5]?.focus(); }
  }

  async function verifyAndEnableTotp() {
    const code = totpCode.join("");
    if (code.length < 6) { setTotpError("Enter the full 6-digit code from your app."); return; }
    setTotpLoading(true);
    setTotpError(null);
    try {
      const res = await fetch("/api/account/totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "enable", code }),
      });
      const json = await res.json();
      if (res.ok) {
        setTotpEnabled(true);
        setEmailEnabled(true);
        setMethod("totp");
        setTotpStep("idle");
        setTotpQr(null);
        setTotpSecret(null);
        setTotpSuccess("Authenticator app is now active. It will be used at your next login.");
      } else {
        setTotpError(json.error || "Verification failed.");
        setTotpCode(["", "", "", "", "", ""]);
        totpInputs.current[0]?.focus();
      }
    } catch { setTotpError("Network error. Please try again."); }
    finally { setTotpLoading(false); }
  }

  async function disableTotp() {
    setTotpLoading(true);
    setTotpError(null);
    setTotpSuccess(null);
    try {
      const res = await fetch("/api/account/totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disable" }),
      });
      const json = await res.json();
      if (res.ok) {
        setTotpEnabled(false);
        setMethod("email");
        setTotpStep("idle");
        setTotpSuccess("Authenticator app removed. Email 2FA will be used if enabled.");
      } else setTotpError(json.error || "Failed to disable.");
    } catch { setTotpError("Network error. Please try again."); }
    finally { setTotpLoading(false); }
  }

  async function copySecret() {
    if (!totpSecret) return;
    await navigator.clipboard.writeText(totpSecret);
    setSecretCopied(true);
    setTimeout(() => setSecretCopied(false), 2000);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Card>
      <div className="flex items-center gap-2.5 mb-5">
        <span className="text-laser-400"><ShieldIcon /></span>
        <h2 className="font-semibold text-white text-base">Two-Factor Authentication</h2>
      </div>

      {/* ── Email 2FA ── */}
      <div className="space-y-1 mb-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-white">Email verification code</p>
            <p className="text-xs text-white/45 mt-0.5">A code is sent to your email each time you sign in.</p>
          </div>
          <MethodBadge active={emailEnabled && method === "email"} />
        </div>

        {emailSuccess && <StatusBanner ok={true} msg={emailSuccess} className="mt-2" />}
        {emailError && <StatusBanner ok={false} msg={emailError} className="mt-2" />}

        {!emailEnabled && emailStep === "idle" && (
          <div className="pt-2">
            <Button variant="outline" onClick={sendEmailCode} loading={emailLoading}
              className="border-laser-400/40 text-laser-400 hover:bg-laser-400/10 hover:border-laser-400/60">
              Enable email 2FA
            </Button>
          </div>
        )}

        {!emailEnabled && emailStep === "sent" && (
          <div className="pt-2 space-y-3">
            <p className="text-xs text-white/50">A 6-digit code was sent to your email.</p>
            <div className="flex max-w-xl flex-col gap-3 sm:flex-row sm:items-end">
              <div className="w-full sm:max-w-[240px]">
                <Input dark label="Verification Code" placeholder="000000" maxLength={6}
                  value={emailCode} onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ""))}
                  className="tracking-widest text-center text-lg font-mono" />
              </div>
              <Button variant="primary" onClick={verifyEmailAndEnable} loading={emailLoading} className="sm:self-end">
                Enable 2FA
              </Button>
            </div>
            <button onClick={() => { setEmailStep("idle"); setEmailCode(""); setEmailError(null); }}
              className="text-xs text-white/30 hover:text-white/60 transition-colors">
              Cancel
            </button>
          </div>
        )}

        {emailEnabled && emailStep === "idle" && (
          <div className="pt-2">
            <button onClick={() => { setEmailStep("disabling"); setEmailError(null); setEmailSuccess(null); }}
              className="text-xs text-white/35 hover:text-red-400 transition-colors">
              Disable email 2FA
            </button>
          </div>
        )}

        {emailEnabled && emailStep === "disabling" && (
          <div className="pt-2 space-y-2">
            <p className="text-xs text-red-300/80">Disabling email 2FA will remove this protection method.</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={disableEmail} loading={emailLoading}
                className="border-red-500/40 text-red-400 hover:bg-red-500/10 text-sm py-1.5">
                Yes, disable
              </Button>
              <button onClick={() => { setEmailStep("idle"); setEmailError(null); }}
                className="text-xs text-white/30 hover:text-white/60 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px mb-5" style={{ background: "rgba(75,159,229,0.12)" }} />

      {/* ── Authenticator App (TOTP) ── */}
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-white">Authenticator app</p>
            <p className="text-xs text-white/45 mt-0.5">
              Use Google Authenticator, Authy, or any TOTP app — no email needed.
            </p>
          </div>
          <MethodBadge active={totpEnabled} label={totpEnabled ? (method === "totp" ? "Active" : "Enabled") : undefined} />
        </div>

        {totpSuccess && <StatusBanner ok={true} msg={totpSuccess} className="mt-2" />}
        {totpError && <StatusBanner ok={false} msg={totpError} className="mt-2" />}

        {/* Idle: not set up */}
        {!totpEnabled && totpStep === "idle" && (
          <div className="pt-2">
            <Button variant="outline" onClick={() => startTotpSetup(false)} loading={totpLoading}
              className="border-laser-400/40 text-laser-400 hover:bg-laser-400/10 hover:border-laser-400/60">
              Set up authenticator app
            </Button>
          </div>
        )}

        {/* Setup flow: QR + verification */}
        {totpStep === "setting-up" && (
          <div className="pt-3 space-y-4">
            <p className="text-sm text-white/60">
              Scan the QR code with your authenticator app, then enter the 6-digit code to confirm.
            </p>

            {/* QR code */}
            {totpQr && (
              <div className="inline-block rounded-xl p-3 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={totpQr} alt="Authenticator QR code" width={192} height={192} className="block" />
              </div>
            )}

            {/* Manual key */}
            {totpSecret && (
              <div>
                <p className="text-xs text-white/40 mb-1.5">Can&apos;t scan? Enter this key manually in your app:</p>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg max-w-sm"
                  style={{ background: "rgba(13,30,56,0.8)", border: "1px solid rgba(75,159,229,0.18)" }}>
                  <code className="flex-1 text-xs font-mono text-laser-300 tracking-wider break-all select-all">
                    {totpSecret.match(/.{1,4}/g)?.join(" ") ?? totpSecret}
                  </code>
                  <button onClick={copySecret}
                    className="shrink-0 text-xs text-white/35 hover:text-laser-400 transition-colors">
                    {secretCopied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            )}

            {/* Code entry */}
            <div>
              <p className="text-xs text-white/50 mb-2">Enter the 6-digit code from your app to confirm setup:</p>
              <div className="flex gap-2" onPaste={handleTotpPaste}>
                {totpCode.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { totpInputs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleTotpDigit(i, e.target.value)}
                    onKeyDown={(e) => handleTotpKeyDown(i, e)}
                    className="w-11 h-12 text-center text-lg font-bold rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-laser-400"
                    style={{
                      background: "rgba(13,30,56,0.8)",
                      borderColor: digit ? "rgba(75,159,229,0.6)" : "rgba(255,255,255,0.12)",
                      color: "white",
                    }}
                    aria-label={`Digit ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3 items-center">
              <Button onClick={verifyAndEnableTotp} loading={totpLoading}>
                Verify &amp; Enable
              </Button>
              <button
                onClick={() => { setTotpStep("idle"); setTotpQr(null); setTotpSecret(null); setTotpError(null); setTotpCode(["", "", "", "", "", ""]); }}
                className="text-sm text-white/30 hover:text-white/60 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Enabled state */}
        {totpEnabled && totpStep === "idle" && (
          <div className="pt-2 flex items-center gap-4">
            <button
              onClick={() => startTotpSetup(true)}
              className="text-xs text-white/35 hover:text-laser-400 transition-colors">
              Regenerate key
            </button>
            <button
              onClick={() => { setTotpStep("disabling"); setTotpError(null); setTotpSuccess(null); }}
              className="text-xs text-white/35 hover:text-red-400 transition-colors">
              Remove authenticator app
            </button>
          </div>
        )}

        {totpEnabled && totpStep === "disabling" && (
          <div className="pt-2 space-y-2">
            <p className="text-xs text-red-300/80">
              This will remove your authenticator app. {emailEnabled ? "Email 2FA will become your active method." : "Your account will have no 2FA protection."}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={disableTotp} loading={totpLoading}
                className="border-red-500/40 text-red-400 hover:bg-red-500/10 text-sm py-1.5">
                Yes, remove
              </Button>
              <button onClick={() => { setTotpStep("idle"); setTotpError(null); }}
                className="text-xs text-white/30 hover:text-white/60 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/* Notification toggle                                                          */
/* -------------------------------------------------------------------------- */
function NotificationsSection({ enabled: initial }: { enabled: boolean }) {
  const [enabled, setEnabled] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  async function toggle() {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/account/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !enabled }),
      });
      const json = await res.json();
      if (res.ok) {
        setEnabled(!enabled);
        setStatus({ ok: true, msg: !enabled ? "Email notifications enabled." : "Email notifications disabled." });
      } else {
        setStatus({ ok: false, msg: json.error || "Failed to update." });
      }
    } catch {
      setStatus({ ok: false, msg: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-laser-400 shrink-0"><BellIcon /></div>
          <div>
            <h3 className="font-semibold text-white text-base">Email Notifications</h3>
            <p className="text-white/50 text-sm mt-1">
              {enabled
                ? "You will receive email updates about LaserHacks announcements and your registration."
                : "You won't receive email notifications. You can re-enable this at any time."}
            </p>
            {status && <StatusBanner ok={status.ok} msg={status.msg} className="mt-3" />}
          </div>
        </div>
        <Toggle enabled={enabled} loading={loading} onChange={toggle} />
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/* Shared UI primitives                                                         */
/* -------------------------------------------------------------------------- */
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-6"
      style={{ background: "rgba(8,20,37,0.7)", border: "1px solid rgba(75,159,229,0.15)", backdropFilter: "blur(10px)" }}>
      {children}
    </div>
  );
}

function CardHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-laser-400">{icon}</span>
      <h2 className="font-semibold text-white text-base">{title}</h2>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-white/40 mb-1">{label}</p>
      <p className="text-white/80 text-sm font-medium">{value}</p>
    </div>
  );
}

function MethodBadge({ active, label }: { active: boolean; label?: string }) {
  if (!active) return null;
  return (
    <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#6ee7b7" }}>
      {label ?? "Active"}
    </span>
  );
}

function StatusBanner({ ok, msg, className = "" }: { ok: boolean; msg: string; className?: string }) {
  return (
    <div className={`px-3 py-2 rounded-lg text-sm ${className}`}
      style={{
        background: ok ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
        border: `1px solid ${ok ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
        color: ok ? "#6ee7b7" : "#fca5a5",
      }}>
      {msg}
    </div>
  );
}

function Toggle({ enabled, loading, onChange }: { enabled: boolean; loading: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange} disabled={loading} aria-pressed={enabled}
      className="relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-laser-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 disabled:opacity-50"
      style={{
        background: enabled ? "rgba(75,159,229,0.9)" : "rgba(255,255,255,0.12)",
        boxShadow: enabled ? "0 0 10px rgba(75,159,229,0.4)" : "none",
      }}>
      <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200"
        style={{ transform: enabled ? "translateX(20px)" : "translateX(0)" }} />
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Icons                                                                       */
/* -------------------------------------------------------------------------- */
function UserIcon() {
  return <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" /></svg>;
}
function LockIcon() {
  return <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden><rect x="3" y="11" width="18" height="11" rx="2"/><path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0110 0v4" /></svg>;
}
function ShieldIcon() {
  return <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
}
function BellIcon() {
  return <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface UserData {
  id: number;
  name: string;
  email: string;
  twoFactorEnabled: boolean;
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
      <TwoFactorSection enabled={user.twoFactorEnabled} />

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
        {status && (
          <StatusBanner ok={status.ok} msg={status.msg} />
        )}
        <Input
          dark
          label="Current Password"
          type="password"
          required
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <Input
          dark
          label="New Password"
          type="password"
          required
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Input
          dark
          label="Confirm New Password"
          type="password"
          required
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <div className="pt-1">
          <Button type="submit" loading={loading} variant="primary">
            Update Password
          </Button>
        </div>
      </form>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/* 2FA setup flow                                                              */
/* -------------------------------------------------------------------------- */
type TwoFactorStep = "idle" | "sent" | "disabling";

function TwoFactorSection({ enabled: initial }: { enabled: boolean }) {
  const [enabled, setEnabled] = useState(initial);
  const [step, setStep] = useState<TwoFactorStep>("idle");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function sendCode() {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/account/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "initiate" }),
      });
      const json = await res.json();
      if (res.ok) {
        setStep("sent");
      } else {
        setError(json.error || "Failed to send code.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyAndEnable() {
    if (!code.trim()) { setError("Please enter the verification code."); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/account/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "enable", code }),
      });
      const json = await res.json();
      if (res.ok) {
        setEnabled(true);
        setStep("idle");
        setCode("");
        setSuccess("Two-factor authentication is now active.");
      } else {
        setError(json.error || "Invalid code.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function disable() {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/account/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disable" }),
      });
      const json = await res.json();
      if (res.ok) {
        setEnabled(false);
        setStep("idle");
        setSuccess("Two-factor authentication has been disabled.");
      } else {
        setError(json.error || "Failed to disable.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-laser-400 shrink-0"><ShieldIcon /></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold text-white text-base">Two-Factor Authentication</h3>
            {enabled && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#6ee7b7" }}>
                Active
              </span>
            )}
          </div>

          {success && <StatusBanner ok={true} msg={success} className="mt-3" />}
          {error && <StatusBanner ok={false} msg={error} className="mt-3" />}

          {!enabled && step === "idle" && (
            <>
              <p className="text-white/50 text-sm mt-2 mb-4">
                Add an extra layer of security to your account. When enabled, you&apos;ll need to enter a code sent to your email on every login.
              </p>
              <Button variant="outline" onClick={sendCode} loading={loading}
                className="border-laser-400/40 text-laser-400 hover:bg-laser-400/10 hover:border-laser-400/60">
                Set Up Two-Factor Authentication
              </Button>
            </>
          )}

          {!enabled && step === "sent" && (
            <>
              <p className="text-white/50 text-sm mt-2 mb-4">
                A 6-digit verification code was sent to your email. Enter it below to activate 2FA.
              </p>
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <Input
                    dark
                    label="Verification Code"
                    placeholder="000000"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    className="tracking-widest text-center text-lg font-mono"
                  />
                </div>
                <Button variant="primary" onClick={verifyAndEnable} loading={loading}>
                  Enable 2FA
                </Button>
              </div>
              <button
                type="button"
                onClick={() => { setStep("idle"); setCode(""); setError(null); }}
                className="mt-3 text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                Cancel
              </button>
            </>
          )}

          {enabled && step === "idle" && (
            <>
              <p className="text-white/50 text-sm mt-2 mb-4">
                Your account is protected. A verification code is sent to your email each time you log in.
              </p>
              <Button
                variant="outline"
                onClick={() => { setStep("disabling"); setError(null); setSuccess(null); }}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
              >
                Disable Two-Factor Authentication
              </Button>
            </>
          )}

          {enabled && step === "disabling" && (
            <>
              <p className="text-sm mt-2 mb-4" style={{ color: "#fca5a5" }}>
                Are you sure? Disabling 2FA will make your account less secure.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={disable} loading={loading}
                  className="border-red-500/40 text-red-400 hover:bg-red-500/10">
                  Yes, Disable
                </Button>
                <Button variant="outline" onClick={() => { setStep("idle"); setError(null); }}
                  className="border-white/15 text-white/60 hover:bg-white/5">
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
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
    <div
      className="rounded-2xl p-6"
      style={{ background: "rgba(8,20,37,0.7)", border: "1px solid rgba(75,159,229,0.15)", backdropFilter: "blur(10px)" }}
    >
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

function StatusBanner({ ok, msg, className = "" }: { ok: boolean; msg: string; className?: string }) {
  return (
    <div
      className={`px-3 py-2 rounded-lg text-sm ${className}`}
      style={{
        background: ok ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
        border: `1px solid ${ok ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
        color: ok ? "#6ee7b7" : "#fca5a5",
      }}
    >
      {msg}
    </div>
  );
}

function Toggle({
  enabled,
  loading,
  onChange,
}: {
  enabled: boolean;
  loading: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={loading}
      aria-pressed={enabled}
      className="relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-laser-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 disabled:opacity-50"
      style={{
        background: enabled ? "rgba(75,159,229,0.9)" : "rgba(255,255,255,0.12)",
        boxShadow: enabled ? "0 0 10px rgba(75,159,229,0.4)" : "none",
      }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200"
        style={{ transform: enabled ? "translateX(20px)" : "translateX(0)" }}
      />
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

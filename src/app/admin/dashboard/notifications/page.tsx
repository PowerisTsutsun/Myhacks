"use client";

import { useState } from "react";

export default function NotificationsPage() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function sendNotifications() {
    setSending(true);
    setConfirmOpen(false);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to send.");
        return;
      }
      setResult(json);
      setSubject("");
      setBody("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (sending || !subject.trim() || !body.trim()) return;
    setConfirmOpen(true);
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        <p className="mt-1 text-sm text-semantic-text-muted">
          Send a custom email notification to all registered participants and any teammate emails entered during registration.
        </p>
      </div>

      {result && (
        <div
          className="mb-6 rounded-2xl border px-4 py-3 text-sm text-emerald-100"
          style={{ background: "rgba(52, 211, 153, 0.16)", borderColor: "rgba(52, 211, 153, 0.38)" }}
        >
          <strong>Sent!</strong> {result.sent} of {result.total} emails delivered
          {result.failed > 0 && ` (${result.failed} failed)`}.
        </div>
      )}

      {error && (
        <div
          className="mb-6 rounded-2xl border px-4 py-3 text-sm text-red-100"
          style={{ background: "rgba(239, 68, 68, 0.14)", borderColor: "rgba(248, 113, 113, 0.35)" }}
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSend}
        className="space-y-5 rounded-2xl border p-6"
        style={{ background: "linear-gradient(180deg, rgba(7,20,36,0.98) 0%, rgba(10,24,48,0.96) 100%)", borderColor: "rgba(52,211,153,0.22)", boxShadow: "0 18px 42px rgba(1, 6, 16, 0.42)" }}
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium text-emerald-100">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            maxLength={200}
            placeholder="e.g. Important update about MyHacks 2026"
            className="w-full rounded-xl border px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-laser-400"
            style={{ background: "rgba(9, 27, 45, 0.96)", borderColor: "rgba(52,211,153,0.2)" }}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-emerald-100">Message</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            maxLength={10000}
            rows={10}
            placeholder="Write your message here..."
            className="w-full resize-y rounded-xl border px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-laser-400"
            style={{ background: "rgba(9, 27, 45, 0.96)", borderColor: "rgba(52,211,153,0.2)" }}
          />
          <p className="mt-1 text-xs text-semantic-text-muted">{body.length} / 10,000 characters</p>
        </div>

        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-semantic-text-muted">
            This will be sent to every registered participant plus any teammate email addresses that were added on registration forms.
          </p>
          <button
            type="submit"
            disabled={sending || !subject.trim() || !body.trim()}
            className="rounded-xl bg-emerald-500 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-400 disabled:opacity-40"
          >
            {sending ? "Sending..." : "Send to All"}
          </button>
        </div>
      </form>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div
            className="w-full max-w-md rounded-2xl border p-6"
            style={{
              background: "linear-gradient(180deg, rgba(8,10,10,0.98) 0%, rgba(12,16,14,0.96) 100%)",
              borderColor: "rgba(52,211,153,0.22)",
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.55)",
            }}
          >
            <h2 className="text-lg font-semibold text-white">Send notification?</h2>
            <p className="mt-2 text-sm text-semantic-text-secondary">
              This email will be sent to all registered participants and any added teammate emails. This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-semantic-text-secondary transition-colors hover:bg-white/[0.04] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={sendNotifications}
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-400"
              >
                Confirm Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

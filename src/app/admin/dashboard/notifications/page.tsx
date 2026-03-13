"use client";

import { useState } from "react";

export default function NotificationsPage() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm(`Send this email to all registered participants? This cannot be undone.`)) return;

    setSending(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Failed to send."); return; }
      setResult(json);
      setSubject("");
      setBody("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        <p className="text-slate-400 text-sm mt-1">
          Send a custom email notification to all registered participants.
        </p>
      </div>

      {result && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
          <strong>Sent!</strong> {result.sent} of {result.total} emails delivered
          {result.failed > 0 && ` (${result.failed} failed)`}.
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSend} className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            maxLength={200}
            placeholder="e.g. Important update about LaserHacks 2026"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-laser-400 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            maxLength={10000}
            rows={10}
            placeholder="Write your message here..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-laser-400 focus:border-transparent resize-y"
          />
          <p className="text-xs text-slate-400 mt-1">{body.length} / 10,000 characters</p>
        </div>

        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-slate-400">
            This will be sent to every participant who has registered.
          </p>
          <button
            type="submit"
            disabled={sending || !subject.trim() || !body.trim()}
            className="px-5 py-2 bg-laser-500 hover:bg-laser-600 text-white text-sm font-medium rounded-lg disabled:opacity-40 transition-colors"
          >
            {sending ? "Sending…" : "Send to All"}
          </button>
        </div>
      </form>
    </div>
  );
}

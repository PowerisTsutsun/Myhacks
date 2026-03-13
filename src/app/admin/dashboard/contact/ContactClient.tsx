"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Message = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
};

type ConfirmModal =
  | { type: "single"; id: number; name: string }
  | { type: "batch"; ids: number[] }
  | null;

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ContactClient({ initialMessages }: { initialMessages: Message[] }) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ConfirmModal>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMessages(initialMessages);
    setSelected(new Set());
  }, [initialMessages]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
    );
  }, [messages, search]);

  const allFilteredSelected = filtered.length > 0 && filtered.every((m) => selected.has(m.id));

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (allFilteredSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((m) => next.delete(m.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((m) => next.add(m.id));
        return next;
      });
    }
  }

  async function markRead(id: number) {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isRead: true } : m)));
    const res = await fetch(`/api/admin/contact/${id}/read`, { method: "POST" });
    if (!res.ok) {
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isRead: false } : m)));
      return;
    }
    router.refresh();
  }

  async function confirmDelete() {
    if (!modal) return;
    setLoading(true);
    try {
      let success = false;
      if (modal.type === "single") {
        const res = await fetch(`/api/admin/contact/${modal.id}`, { method: "DELETE" });
        if (res.ok) {
          setMessages((prev) => prev.filter((m) => m.id !== modal.id));
          setSelected((prev) => { const n = new Set(prev); n.delete(modal.id); return n; });
          success = true;
        }
      } else {
        const res = await fetch("/api/admin/contact/batch-delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: modal.ids }),
        });
        if (res.ok) {
          const deleted = new Set(modal.ids);
          setMessages((prev) => prev.filter((m) => !deleted.has(m.id)));
          setSelected(new Set());
          success = true;
        }
      }
      if (success) router.refresh();
    } finally {
      setLoading(false);
      setModal(null);
    }
  }

  const selectedInFiltered = filtered.filter((m) => selected.has(m.id)).map((m) => m.id);
  const unread = messages.filter((m) => !m.isRead).length;

  return (
    <>
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Contact Messages</h1>
          <p className="mt-0.5 text-sm text-semantic-text-muted">
            {messages.length} total
            {unread > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
                {unread} unread
              </span>
            )}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, subject…"
            className="w-full rounded-xl border pl-9 pr-3 py-2 text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
            style={{ background: "rgba(8,14,10,0.9)", borderColor: "rgba(52,211,153,0.2)" }}
          />
        </div>
      </div>

      {/* Batch action bar */}
      {selectedInFiltered.length > 0 && (
        <div
          className="mb-4 flex items-center gap-3 rounded-xl border px-4 py-2.5"
          style={{ background: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.25)" }}
        >
          <span className="text-sm text-white/70">{selectedInFiltered.length} selected</span>
          <button
            onClick={() => setModal({ type: "batch", ids: selectedInFiltered })}
            className="ml-auto flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
            style={{ borderColor: "rgba(239,68,68,0.3)" }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete {selectedInFiltered.length}
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border p-10 text-center" style={{ borderColor: "rgba(52,211,153,0.18)", background: "rgba(8,14,10,0.9)" }}>
          <p className="text-semantic-text-muted">{search ? "No messages match your search." : "No messages yet."}</p>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "rgba(52,211,153,0.18)", background: "rgba(8,12,10,0.98)" }}>
          {/* Select-all header */}
          <div
            className="flex items-center gap-3 px-4 py-2.5 border-b"
            style={{ borderColor: "rgba(52,211,153,0.1)", background: "rgba(10,18,12,0.98)" }}
          >
            <Checkbox checked={allFilteredSelected} onChange={toggleSelectAll} />
            <span className="text-xs text-white/30">Select all ({filtered.length})</span>
          </div>

          <div className="divide-y" style={{ borderColor: "rgba(52,211,153,0.08)" }}>
            {filtered.map((msg) => (
              <div
                key={msg.id}
                className="flex items-start gap-3 px-4 py-4 transition-colors hover:bg-emerald-500/[0.03]"
                style={!msg.isRead ? { borderLeft: "2px solid rgba(52,211,153,0.5)" } : {}}
              >
                <div className="pt-0.5 shrink-0">
                  <Checkbox checked={selected.has(msg.id)} onChange={() => toggleSelect(msg.id)} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white text-sm">{msg.name}</span>
                    {!msg.isRead && (
                      <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">New</span>
                    )}
                    <span className="text-white/20 text-xs">·</span>
                    <a href={`mailto:${msg.email}`} className="text-xs text-emerald-400/70 hover:text-emerald-400 transition-colors">{msg.email}</a>
                    <span className="text-white/20 text-xs">·</span>
                    <span className="text-xs text-white/25">{formatDate(msg.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-white/75">{msg.subject}</p>
                  <p className="mt-1.5 text-sm text-white/45 whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                </div>

                <div className="shrink-0 flex items-center gap-3 pt-0.5">
                  {!msg.isRead && (
                    <button onClick={() => markRead(msg.id)} className="text-xs text-white/30 hover:text-emerald-400 transition-colors">
                      Mark read
                    </button>
                  )}
                  <button
                    onClick={() => setModal({ type: "single", id: msg.id, name: msg.name })}
                    className="text-white/20 hover:text-red-400 transition-colors"
                    aria-label="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div
            className="w-full max-w-sm rounded-2xl border p-6 shadow-2xl"
            style={{ background: "linear-gradient(160deg, rgba(12,20,14,0.99) 0%, rgba(8,14,10,0.99) 100%)", borderColor: "rgba(239,68,68,0.3)" }}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30">
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-white">
                  {modal.type === "single" ? "Delete message?" : `Delete ${modal.ids.length} messages?`}
                </p>
                <p className="text-xs text-white/40 mt-0.5">This cannot be undone.</p>
              </div>
            </div>

            {modal.type === "single" && (
              <p className="mb-5 text-sm text-white/50 rounded-lg px-3 py-2 border" style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)" }}>
                From: <span className="text-white/70">{modal.name}</span>
              </p>
            )}

            {modal.type === "batch" && (
              <p className="mb-5 text-sm text-white/50 rounded-lg px-3 py-2 border" style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)" }}>
                {modal.ids.length} selected message{modal.ids.length !== 1 ? "s" : ""} will be permanently deleted.
              </p>
            )}

            <div className="flex gap-2">
              <button
                onClick={confirmDelete}
                disabled={loading}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60"
                style={{ background: "rgba(239,68,68,0.8)" }}
              >
                {loading ? "Deleting…" : "Yes, delete"}
              </button>
              <button
                onClick={() => setModal(null)}
                disabled={loading}
                className="flex-1 rounded-xl border py-2.5 text-sm font-medium text-white/60 transition-colors hover:text-white disabled:opacity-60"
                style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="w-4.5 h-4.5 rounded flex items-center justify-center shrink-0 transition-colors"
      style={{
        width: 18, height: 18,
        background: checked ? "rgba(52,211,153,0.8)" : "rgba(255,255,255,0.05)",
        border: `1px solid ${checked ? "rgba(52,211,153,0.9)" : "rgba(255,255,255,0.15)"}`,
      }}
    >
      {checked && (
        <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  );
}

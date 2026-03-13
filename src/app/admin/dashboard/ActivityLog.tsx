"use client";

import { useState, useMemo } from "react";

type ActivityEvent =
  | { type: "registration"; name: string; email: string; at: Date }
  | { type: "account"; name: string; email: string; at: Date };

export function ActivityLog({ events }: { events: ActivityEvent[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return events;
    return events.filter(
      (e) => e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q)
    );
  }, [events, search]);

  return (
    <div
      className="lg:col-span-2 rounded-2xl border p-5"
      style={{
        background: "linear-gradient(160deg, rgba(10,18,12,0.98) 0%, rgba(8,14,10,0.96) 100%)",
        borderColor: "rgba(52,211,153,0.18)",
      }}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-emerald-300/70">Recent Activity</h2>
        <div className="relative w-48">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by name or email…"
            className="w-full rounded-lg border pl-8 pr-2.5 py-1.5 text-xs text-white/70 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-400/30"
            style={{ background: "rgba(8,14,10,0.9)", borderColor: "rgba(52,211,153,0.15)" }}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-semantic-text-muted py-4 text-center">
          {search ? "No results." : "No activity yet."}
        </p>
      ) : (
        <div className="divide-y" style={{ borderColor: "rgba(52,211,153,0.08)" }}>
          {filtered.map((event, i) => (
            <div key={i} className="flex items-center gap-3 py-2.5">
              <div
                className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background: event.type === "registration" ? "rgba(52,211,153,0.12)" : "rgba(75,159,229,0.12)",
                  border: `1px solid ${event.type === "registration" ? "rgba(52,211,153,0.25)" : "rgba(75,159,229,0.25)"}`,
                }}
              >
                {event.type === "registration" ? (
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-sm text-white/80 font-medium">{event.name}</span>
                <span className="mx-1.5 text-white/20 text-xs">·</span>
                <span className="text-xs text-white/35 truncate">{event.email}</span>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <span
                  className="text-xs font-medium px-1.5 py-0.5 rounded"
                  style={{
                    background: event.type === "registration" ? "rgba(52,211,153,0.12)" : "rgba(75,159,229,0.12)",
                    color: event.type === "registration" ? "#6ee7b7" : "#93c5fd",
                  }}
                >
                  {event.type === "registration" ? "Registered" : "Account"}
                </span>
                <span className="text-xs text-white/25 tabular-nums">
                  {new Date(event.at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

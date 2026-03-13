import { db } from "@/lib/db";
import { contactSubmissions } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { formatDate } from "@/lib/utils";
import { MarkReadButton } from "./MarkReadButton";

export default async function ContactPage() {
  const rows = await db
    .select()
    .from(contactSubmissions)
    .orderBy(desc(contactSubmissions.createdAt));

  const unread = rows.filter((r) => !r.isRead).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Contact Messages</h1>
        <p className="mt-1 text-sm text-semantic-text-muted">
          {rows.length} total message{rows.length !== 1 ? "s" : ""}
          {unread > 0 && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
              {unread} unread
            </span>
          )}
        </p>
      </div>

      {rows.length === 0 ? (
        <div
          className="rounded-2xl border p-10 text-center admin-surface"
          style={{ borderColor: "rgba(52,211,153,0.18)" }}
        >
          <p className="text-semantic-text-muted">No messages yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div
              key={row.id}
              className="rounded-2xl border p-5 admin-surface transition-colors"
              style={{
                borderColor: row.isRead ? "rgba(52,211,153,0.12)" : "rgba(52,211,153,0.35)",
                background: row.isRead
                  ? "linear-gradient(160deg, rgba(8,12,10,0.98) 0%, rgba(6,10,8,0.96) 100%)"
                  : "linear-gradient(160deg, rgba(12,22,16,0.98) 0%, rgba(8,16,12,0.96) 100%)",
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white text-sm">{row.name}</span>
                    {!row.isRead && (
                      <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
                        New
                      </span>
                    )}
                    <span className="text-white/30 text-xs">·</span>
                    <a
                      href={`mailto:${row.email}`}
                      className="text-xs text-emerald-400/70 hover:text-emerald-400 transition-colors truncate"
                    >
                      {row.email}
                    </a>
                    <span className="text-white/30 text-xs">·</span>
                    <span className="text-xs text-white/30">{formatDate(row.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-white/80">{row.subject}</p>
                  <p className="mt-2 text-sm text-white/50 whitespace-pre-wrap leading-relaxed">{row.message}</p>
                </div>
                {!row.isRead && <MarkReadButton id={row.id} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

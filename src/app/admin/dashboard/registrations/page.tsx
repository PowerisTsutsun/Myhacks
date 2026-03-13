import { db } from "@/lib/db";
import { registrations } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export default async function RegistrationsPage() {
  const rows = await db
    .select()
    .from(registrations)
    .orderBy(desc(registrations.createdAt));

  const EXPERIENCE_BADGE: Record<string, "laser" | "gold" | "green"> = {
    beginner: "green",
    intermediate: "laser",
    advanced: "gold",
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Registrations</h1>
          <p className="mt-1 text-sm text-semantic-text-muted">
            {rows.length} total registration{rows.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="admin-surface rounded-2xl border p-10 text-center" style={{ borderColor: "rgba(52,211,153,0.18)" }}>
          <p className="text-semantic-text-muted">No registrations yet.</p>
        </div>
      ) : (
        <div className="admin-surface overflow-hidden rounded-2xl border" style={{ borderColor: "rgba(52,211,153,0.18)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="border-b"
                  style={{ background: "rgba(11,29,47,0.98)", borderColor: "rgba(52,211,153,0.16)" }}
                >
                  <th className="px-4 py-3 text-left font-medium text-semantic-text-muted">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-semantic-text-muted">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-semantic-text-muted">Major</th>
                  <th className="px-4 py-3 text-left font-medium text-semantic-text-muted">Level</th>
                  <th className="px-4 py-3 text-left font-medium text-semantic-text-muted">Team</th>
                  <th className="px-4 py-3 text-left font-medium text-semantic-text-muted">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "rgba(52,211,153,0.08)" }}>
                {rows.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-emerald-500/[0.05]">
                    <td className="px-4 py-3 font-medium text-white">{row.fullName}</td>
                    <td className="px-4 py-3 text-semantic-text-secondary">{row.email}</td>
                    <td className="px-4 py-3 text-semantic-text-muted">{row.major || "-"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={EXPERIENCE_BADGE[row.experienceLevel] || "default"} className="capitalize">
                        {row.experienceLevel}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="default" className="capitalize">
                        {row.teamStatus.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-semantic-text-muted">{formatDate(row.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

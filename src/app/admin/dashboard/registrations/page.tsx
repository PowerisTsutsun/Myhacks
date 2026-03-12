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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Registrations</h1>
          <p className="text-slate-500 text-sm mt-1">{rows.length} total registration{rows.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <p className="text-slate-400">No registrations yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Major</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Level</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Team</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-navy-900">{row.fullName}</td>
                    <td className="px-4 py-3 text-slate-600">{row.email}</td>
                    <td className="px-4 py-3 text-slate-500">{row.major || "—"}</td>
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
                    <td className="px-4 py-3 text-slate-400">{formatDate(row.createdAt)}</td>
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

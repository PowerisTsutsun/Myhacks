import { db } from "@/lib/db";
import { announcements } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { AnnouncementsManager } from "@/components/admin/AnnouncementsManager";

export default async function AnnouncementsPage() {
  const rows = await db
    .select()
    .from(announcements)
    .orderBy(desc(announcements.createdAt));

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900 mb-1">Announcements</h1>
      <p className="text-slate-500 text-sm mb-6">Manage homepage news and updates.</p>
      <AnnouncementsManager initialData={rows} />
    </div>
  );
}

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
      <h1 className="text-2xl font-bold text-white mb-1">Announcements</h1>
      <p className="mb-6 text-sm text-semantic-text-muted">Manage homepage news and updates.</p>
      <AnnouncementsManager initialData={rows} />
    </div>
  );
}

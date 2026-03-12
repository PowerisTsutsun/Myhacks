import { db } from "@/lib/db";
import { mediaItems } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { MediaManager } from "@/components/admin/MediaManager";

export default async function AdminMediaPage() {
  const rows = await db.select().from(mediaItems).orderBy(asc(mediaItems.sortOrder));
  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900 mb-1">Media Items</h1>
      <p className="text-slate-500 text-sm mb-6">Manage photos, videos, and social highlights.</p>
      <MediaManager initialData={rows} />
    </div>
  );
}

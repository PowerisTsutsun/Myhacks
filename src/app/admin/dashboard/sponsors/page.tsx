import { db } from "@/lib/db";
import { sponsors } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { SponsorsManager } from "@/components/admin/SponsorsManager";

export default async function AdminSponsorsPage() {
  const rows = await db.select().from(sponsors).orderBy(asc(sponsors.sortOrder));
  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900 mb-1">Sponsors</h1>
      <p className="text-slate-500 text-sm mb-6">Manage sponsor listings and tiers.</p>
      <SponsorsManager initialData={rows} />
    </div>
  );
}

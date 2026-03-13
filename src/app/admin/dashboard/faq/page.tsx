import { db } from "@/lib/db";
import { faqItems } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { FaqManager } from "@/components/admin/FaqManager";

export default async function AdminFaqPage() {
  const rows = await db.select().from(faqItems).orderBy(asc(faqItems.sortOrder));
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">FAQ Items</h1>
      <p className="text-slate-400 text-sm mb-6">Manage frequently asked questions.</p>
      <FaqManager initialData={rows} />
    </div>
  );
}

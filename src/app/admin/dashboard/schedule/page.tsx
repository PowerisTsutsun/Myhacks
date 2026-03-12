import { db } from "@/lib/db";
import { scheduleDays, scheduleItems } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { ScheduleManager } from "@/components/admin/ScheduleManager";

export default async function AdminSchedulePage() {
  const days = await db.select().from(scheduleDays).orderBy(asc(scheduleDays.sortOrder));
  const items = await db.select().from(scheduleItems).orderBy(asc(scheduleItems.sortOrder));

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-900 mb-1">Schedule</h1>
      <p className="text-slate-500 text-sm mb-6">Manage event schedule days and items.</p>
      <ScheduleManager initialDays={days} initialItems={items} />
    </div>
  );
}

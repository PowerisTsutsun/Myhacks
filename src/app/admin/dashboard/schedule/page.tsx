import { db } from "@/lib/db";
import { scheduleDays, scheduleItems } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { ScheduleManager } from "@/components/admin/ScheduleManager";

export default async function AdminSchedulePage() {
  const days = await db.select().from(scheduleDays).orderBy(asc(scheduleDays.sortOrder));
  const items = await db.select().from(scheduleItems).orderBy(asc(scheduleItems.sortOrder));

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Schedule</h1>
      <p className="mb-6 text-sm text-semantic-text-muted">Manage event schedule days and items.</p>
      <ScheduleManager initialDays={days} initialItems={items} />
    </div>
  );
}

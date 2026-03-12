import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getSiteConfig } from "@/lib/settings";
import { db } from "@/lib/db";
import { scheduleDays, scheduleItems } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Schedule",
  description: "Full schedule for LaserHacks — talks, workshops, hacking, and demos.",
};

export const revalidate = 60;

const TRACK_COLORS: Record<string, "laser" | "gold" | "green" | "default"> = {
  workshop: "laser",
  judging: "gold",
  hacking: "green",
  keynote: "default",
};

export default async function SchedulePage() {
  const config = await getSiteConfig();

  const days = await db
    .select()
    .from(scheduleDays)
    .orderBy(asc(scheduleDays.sortOrder));

  const items = await db
    .select()
    .from(scheduleItems)
    .orderBy(asc(scheduleItems.sortOrder));

  const itemsByDay = days.map((day) => ({
    ...day,
    items: items.filter((item) => item.dayId === day.id),
  }));

  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* Header */}
        <div className="bg-navy-900 py-16 sm:py-20 relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(37,99,235,0.2) 0%, transparent 70%)",
            }}
          />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-laser-400 font-semibold text-sm uppercase tracking-widest mb-3">Schedule</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Event Schedule</h1>
            <p className="text-white/60 text-lg">
              Full agenda for {config.event_name}.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          {itemsByDay.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-12">
              {itemsByDay.map((day) => (
                <section key={day.id}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-px flex-1 bg-white/10" />
                    <div className="text-center">
                      <p className="font-bold text-white text-lg">{day.label}</p>
                      <p className="text-white/40 text-sm">{day.date}</p>
                    </div>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>

                  {day.items.length === 0 ? (
                    <p className="text-white/40 text-sm text-center py-6">
                      Schedule coming soon.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {day.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-4 p-4 rounded-xl transition-colors duration-200"
                          style={{
                            background: item.isImportant
                              ? "rgba(21,88,160,0.2)"
                              : "rgba(8,20,37,0.6)",
                            border: item.isImportant
                              ? "1px solid rgba(75,159,229,0.3)"
                              : "1px solid rgba(75,159,229,0.1)",
                          }}
                        >
                          <div className="shrink-0 w-24 pt-0.5">
                            <p className="font-mono text-sm text-white/50">{item.time}</p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2 flex-wrap">
                              <p className="font-medium text-white">
                                {item.title}
                              </p>
                              {item.isImportant && (
                                <Badge variant="laser" className="shrink-0">Key Event</Badge>
                              )}
                              {item.track && (
                                <Badge
                                  variant={TRACK_COLORS[item.track.toLowerCase()] || "default"}
                                  className="shrink-0 capitalize"
                                >
                                  {item.track}
                                </Badge>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-white/50 text-sm mt-1">{item.description}</p>
                            )}
                            {item.location && (
                              <p className="text-white/35 text-xs mt-1 flex items-center gap-1">
                                <LocationIcon />
                                {item.location}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer config={config} />
    </>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-laser-400"
        style={{ background: "rgba(75,159,229,0.1)", border: "1px solid rgba(75,159,229,0.2)" }}
      >
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">Schedule coming soon</h2>
      <p className="text-white/50">Check back closer to the event date.</p>
    </div>
  );
}

function LocationIcon() {
  return (
    <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

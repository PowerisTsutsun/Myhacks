import Link from "next/link";
import { db } from "@/lib/db";
import {
  announcements,
  faqItems,
  registrations,
  sponsors,
  mediaItems,
  contactSubmissions,
  users,
} from "@/lib/db/schema";
import { eq, count, desc, ne } from "drizzle-orm";

export default async function DashboardOverviewPage() {
  const [
    [{ total: announcementCount }],
    [{ total: faqCount }],
    [{ total: registrationCount }],
    [{ total: sponsorCount }],
    [{ total: mediaCount }],
    [{ total: contactCount }],
    recentRegistrations,
    recentAccounts,
  ] = await Promise.all([
    db.select({ total: count() }).from(announcements),
    db.select({ total: count() }).from(faqItems),
    db.select({ total: count() }).from(registrations),
    db.select({ total: count() }).from(sponsors),
    db.select({ total: count() }).from(mediaItems),
    db.select({ total: count() }).from(contactSubmissions).where(eq(contactSubmissions.isRead, false)),
    db.select({ fullName: registrations.fullName, email: registrations.email, createdAt: registrations.createdAt })
      .from(registrations).orderBy(desc(registrations.createdAt)).limit(20),
    db.select({ name: users.name, email: users.email, createdAt: users.createdAt, role: users.role })
      .from(users).where(ne(users.role, "admin")).orderBy(desc(users.createdAt)).limit(20),
  ]);

  // Merge and sort activity feed
  type ActivityEvent =
    | { type: "registration"; name: string; email: string; at: Date }
    | { type: "account"; name: string; email: string; at: Date };

  const activity: ActivityEvent[] = [
    ...recentRegistrations.map((r) => ({ type: "registration" as const, name: r.fullName, email: r.email, at: r.createdAt })),
    ...recentAccounts.map((u) => ({ type: "account" as const, name: u.name, email: u.email, at: u.createdAt })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, 25);

  const stats = [
    {
      label: "Registrations",
      value: registrationCount,
      href: "/admin/dashboard/registrations",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    },
    {
      label: "Announcements",
      value: announcementCount,
      href: "/admin/dashboard/announcements",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>,
    },
    {
      label: "FAQ Items",
      value: faqCount,
      href: "/admin/dashboard/faq",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      label: "Sponsors",
      value: sponsorCount,
      href: "/admin/dashboard/sponsors",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    },
    {
      label: "Media Items",
      value: mediaCount,
      href: "/admin/dashboard/media",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    },
    {
      label: "Unread Messages",
      value: contactCount,
      href: "/admin/dashboard/contact",
      badge: contactCount > 0,
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-semantic-text-muted">LaserHacks admin overview</p>
      </div>

      {/* Compact stat grid */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group relative rounded-xl border px-3 py-3 transition-all hover:border-emerald-400/40 hover:bg-emerald-500/[0.05]"
            style={{
              background: "linear-gradient(160deg, rgba(10,18,12,0.98) 0%, rgba(8,14,10,0.96) 100%)",
              borderColor: "rgba(52,211,153,0.18)",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 shrink-0">
                {stat.icon}
              </div>
              {"badge" in stat && stat.badge && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              )}
            </div>
            <p className="text-2xl font-bold leading-none text-white tracking-tight">{stat.value}</p>
            <p className="mt-1 text-xs text-semantic-text-muted group-hover:text-white/60 transition-colors leading-tight">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions + Activity log side by side */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* Quick Actions */}
        <div
          className="rounded-2xl border p-5"
          style={{
            background: "linear-gradient(160deg, rgba(10,18,12,0.98) 0%, rgba(8,14,10,0.96) 100%)",
            borderColor: "rgba(52,211,153,0.18)",
          }}
        >
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-emerald-300/70">Quick Actions</h2>
          <div className="flex flex-col gap-1.5">
            {[
              ["+ Announcement", "/admin/dashboard/announcements"],
              ["+ FAQ Item", "/admin/dashboard/faq"],
              ["+ Schedule Event", "/admin/dashboard/schedule"],
              ["+ Sponsor", "/admin/dashboard/sponsors"],
              ["+ Media Item", "/admin/dashboard/media"],
              ["Site Settings", "/admin/dashboard/settings"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="rounded-lg border px-3 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-emerald-500/10 hover:text-white hover:border-emerald-400/40"
                style={{ borderColor: "rgba(52,211,153,0.12)", background: "rgba(255,255,255,0.02)" }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Activity Log */}
        <div
          className="lg:col-span-2 rounded-2xl border p-5"
          style={{
            background: "linear-gradient(160deg, rgba(10,18,12,0.98) 0%, rgba(8,14,10,0.96) 100%)",
            borderColor: "rgba(52,211,153,0.18)",
          }}
        >
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-emerald-300/70">Recent Activity</h2>

          {activity.length === 0 ? (
            <p className="text-sm text-semantic-text-muted py-4 text-center">No activity yet.</p>
          ) : (
            <div className="space-y-0 divide-y" style={{ borderColor: "rgba(52,211,153,0.08)" }}>
              {activity.map((event, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5">
                  {/* Icon dot */}
                  <div
                    className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{
                      background: event.type === "registration" ? "rgba(52,211,153,0.12)" : "rgba(75,159,229,0.12)",
                      border: `1px solid ${event.type === "registration" ? "rgba(52,211,153,0.25)" : "rgba(75,159,229,0.25)"}`,
                    }}
                  >
                    {event.type === "registration" ? (
                      <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-white/80 font-medium truncate">{event.name}</span>
                    <span className="mx-1.5 text-white/20 text-xs">·</span>
                    <span className="text-xs text-white/35 truncate">{event.email}</span>
                  </div>

                  {/* Badge + time */}
                  <div className="shrink-0 flex items-center gap-2">
                    <span
                      className="text-xs font-medium px-1.5 py-0.5 rounded"
                      style={{
                        background: event.type === "registration" ? "rgba(52,211,153,0.12)" : "rgba(75,159,229,0.12)",
                        color: event.type === "registration" ? "#6ee7b7" : "#93c5fd",
                      }}
                    >
                      {event.type === "registration" ? "Registered" : "Account"}
                    </span>
                    <span className="text-xs text-white/25 tabular-nums">
                      {event.at.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

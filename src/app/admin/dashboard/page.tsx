import Link from "next/link";
import { db } from "@/lib/db";
import {
  announcements,
  faqItems,
  registrations,
  sponsors,
  mediaItems,
  contactSubmissions,
} from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";

export default async function DashboardOverviewPage() {
  const [
    [{ total: announcementCount }],
    [{ total: faqCount }],
    [{ total: registrationCount }],
    [{ total: sponsorCount }],
    [{ total: mediaCount }],
    [{ total: contactCount }],
  ] = await Promise.all([
    db.select({ total: count() }).from(announcements),
    db.select({ total: count() }).from(faqItems),
    db.select({ total: count() }).from(registrations),
    db.select({ total: count() }).from(sponsors),
    db.select({ total: count() }).from(mediaItems),
    db.select({ total: count() }).from(contactSubmissions).where(eq(contactSubmissions.isRead, false)),
  ]);

  const stats = [
    {
      label: "Registrations",
      value: registrationCount,
      href: "/admin/dashboard/registrations",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: "Announcements",
      value: announcementCount,
      href: "/admin/dashboard/announcements",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
    },
    {
      label: "FAQ Items",
      value: faqCount,
      href: "/admin/dashboard/faq",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Sponsors",
      value: sponsorCount,
      href: "/admin/dashboard/sponsors",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      label: "Media Items",
      value: mediaCount,
      href: "/admin/dashboard/media",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: "Unread Messages",
      value: contactCount,
      href: "/admin/dashboard/contact",
      badge: contactCount > 0,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-semantic-text-muted">LaserHacks admin overview</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group relative rounded-2xl border p-6 transition-all hover:border-emerald-400/40 hover:bg-emerald-500/[0.04]"
            style={{
              background: "linear-gradient(160deg, rgba(10,18,12,0.98) 0%, rgba(8,14,10,0.96) 100%)",
              borderColor: "rgba(52,211,153,0.18)",
              boxShadow: "0 4px 24px rgba(0, 0, 0, 0.3)",
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 shrink-0">
                {stat.icon}
              </div>
              {"badge" in stat && stat.badge && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
                  New
                </span>
              )}
            </div>
            <div className="mt-4">
              <p className="text-4xl font-bold text-white tracking-tight">{stat.value}</p>
              <p className="mt-1 text-sm text-semantic-text-muted group-hover:text-white/60 transition-colors">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div
        className="rounded-2xl border p-6"
        style={{
          background: "linear-gradient(160deg, rgba(10,18,12,0.98) 0%, rgba(8,14,10,0.96) 100%)",
          borderColor: "rgba(52,211,153,0.18)",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.3)",
        }}
      >
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-emerald-300/70">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
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
              className="rounded-lg border px-4 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-emerald-500/10 hover:text-white hover:border-emerald-400/40"
              style={{ borderColor: "rgba(52,211,153,0.15)", background: "rgba(255,255,255,0.02)" }}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

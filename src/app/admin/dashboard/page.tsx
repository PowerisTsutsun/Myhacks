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
    { label: "Registrations", value: registrationCount, icon: "📝", href: "/admin/dashboard/registrations", accent: "rgba(75,159,229,0.15)", border: "rgba(75,159,229,0.25)", text: "#90c0f7" },
    { label: "Announcements", value: announcementCount, icon: "📢", href: "/admin/dashboard/announcements", accent: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.25)", text: "#93c5fd" },
    { label: "FAQ Items", value: faqCount, icon: "❓", href: "/admin/dashboard/faq", accent: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.25)", text: "#c4b5fd" },
    { label: "Sponsors", value: sponsorCount, icon: "🤝", href: "/admin/dashboard/sponsors", accent: "rgba(234,179,8,0.1)", border: "rgba(234,179,8,0.2)", text: "#fde68a" },
    { label: "Media Items", value: mediaCount, icon: "🎬", href: "/admin/dashboard/media", accent: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.2)", text: "#6ee7b7" },
    { label: "Unread Messages", value: contactCount, icon: "✉️", href: "/admin/dashboard/registrations", accent: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.2)", text: "#fca5a5" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">LaserHacks admin overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <a
            key={stat.label}
            href={stat.href}
            className="flex items-center gap-4 p-5 rounded-xl transition-opacity hover:opacity-80"
            style={{ background: stat.accent, border: `1px solid ${stat.border}` }}
          >
            <span className="text-3xl" role="img" aria-label={stat.label}>{stat.icon}</span>
            <div>
              <p className="text-2xl font-bold" style={{ color: stat.text }}>{stat.value}</p>
              <p className="text-sm text-white/50">{stat.label}</p>
            </div>
          </a>
        ))}
      </div>

      {/* Quick links */}
      <div className="rounded-xl p-5" style={{ background: "rgba(8,20,37,0.6)", border: "1px solid rgba(75,159,229,0.12)" }}>
        <h2 className="font-semibold text-white mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          {[
            ["+ Announcement", "/admin/dashboard/announcements"],
            ["+ FAQ Item", "/admin/dashboard/faq"],
            ["+ Schedule Event", "/admin/dashboard/schedule"],
            ["+ Sponsor", "/admin/dashboard/sponsors"],
            ["+ Media Item", "/admin/dashboard/media"],
            ["Site Settings", "/admin/dashboard/settings"],
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="px-3 py-1.5 text-sm rounded-lg text-white/60 hover:text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

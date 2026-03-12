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
    { label: "Registrations", value: registrationCount, icon: "📝", href: "/admin/dashboard/registrations", color: "bg-laser-50 text-laser-700 border-laser-100" },
    { label: "Announcements", value: announcementCount, icon: "📢", href: "/admin/dashboard/announcements", color: "bg-blue-50 text-blue-700 border-blue-100" },
    { label: "FAQ Items", value: faqCount, icon: "❓", href: "/admin/dashboard/faq", color: "bg-purple-50 text-purple-700 border-purple-100" },
    { label: "Sponsors", value: sponsorCount, icon: "🤝", href: "/admin/dashboard/sponsors", color: "bg-gold-50 text-gold-700 border-gold-100" },
    { label: "Media Items", value: mediaCount, icon: "🎬", href: "/admin/dashboard/media", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    { label: "Unread Messages", value: contactCount, icon: "✉️", href: "/admin/dashboard/registrations", color: "bg-red-50 text-red-700 border-red-100" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">LaserHacks admin overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <a
            key={stat.label}
            href={stat.href}
            className={`flex items-center gap-4 p-5 rounded-xl border ${stat.color} hover:opacity-90 transition-opacity`}
          >
            <span className="text-3xl" role="img" aria-label={stat.label}>{stat.icon}</span>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm opacity-80">{stat.label}</p>
            </div>
          </a>
        ))}
      </div>

      {/* Quick links */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-semibold text-navy-900 mb-3">Quick Actions</h2>
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
              className="px-3 py-1.5 text-sm rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

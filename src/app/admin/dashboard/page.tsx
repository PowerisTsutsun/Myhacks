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
    { label: "Registrations", value: registrationCount, icon: "R", href: "/admin/dashboard/registrations" },
    { label: "Announcements", value: announcementCount, icon: "A", href: "/admin/dashboard/announcements" },
    { label: "FAQ Items", value: faqCount, icon: "F", href: "/admin/dashboard/faq" },
    { label: "Sponsors", value: sponsorCount, icon: "S", href: "/admin/dashboard/sponsors" },
    { label: "Media Items", value: mediaCount, icon: "M", href: "/admin/dashboard/media" },
    { label: "Unread Messages", value: contactCount, icon: "C", href: "/admin/dashboard/registrations" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-semantic-text-muted">LaserHacks admin overview</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <a
            key={stat.label}
            href={stat.href}
            className="rounded-2xl border p-5 transition-colors hover:bg-emerald-500/[0.05]"
            style={{
              background: "linear-gradient(180deg, rgba(8,10,10,0.98) 0%, rgba(12,16,14,0.96) 100%)",
              borderColor: "rgba(52,211,153,0.18)",
              boxShadow: "0 18px 42px rgba(0, 0, 0, 0.42)",
            }}
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-500/10 text-sm font-semibold text-emerald-200">
              {stat.icon}
            </div>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
            <p className="mt-1 text-sm text-semantic-text-secondary">{stat.label}</p>
          </a>
        ))}
      </div>

      <div
        className="rounded-2xl border p-5"
        style={{
          background: "linear-gradient(180deg, rgba(8,10,10,0.98) 0%, rgba(12,16,14,0.96) 100%)",
          borderColor: "rgba(52,211,153,0.18)",
          boxShadow: "0 18px 42px rgba(0, 0, 0, 0.42)",
        }}
      >
        <h2 className="mb-3 font-semibold text-white">Quick Actions</h2>
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
              className="rounded-lg border px-3 py-1.5 text-sm text-semantic-text-secondary transition-colors hover:bg-emerald-500/10 hover:text-white"
              style={{ borderColor: "rgba(52,211,153,0.18)", background: "rgba(255,255,255,0.02)" }}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

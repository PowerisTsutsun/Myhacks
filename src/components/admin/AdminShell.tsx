"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface AdminShellProps {
  children: React.ReactNode;
  user: { name: string; email: string; role: string };
}

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Overview", icon: <OverviewIcon /> },
  { href: "/admin/dashboard/settings", label: "Site Settings", icon: <SettingsIcon /> },
  { href: "/admin/dashboard/announcements", label: "Announcements", icon: <AnnouncementsIcon /> },
  { href: "/admin/dashboard/faq", label: "FAQ", icon: <FaqIcon /> },
  { href: "/admin/dashboard/schedule", label: "Schedule", icon: <ScheduleIcon /> },
  { href: "/admin/dashboard/sponsors", label: "Sponsors", icon: <SponsorsIcon /> },
  { href: "/admin/dashboard/media", label: "Media", icon: <MediaIcon /> },
  { href: "/admin/dashboard/registrations", label: "Registrations", icon: <RegistrationsIcon /> },
  { href: "/admin/dashboard/teams", label: "Teams", icon: <TeamsIcon /> },
  { href: "/admin/dashboard/notifications", label: "Notifications", icon: <NotificationsIcon /> },
  { href: "/admin/dashboard/users", label: "Users", icon: <UsersIcon /> },
];

export function AdminShell({ children, user }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <div className="admin-theme min-h-screen flex bg-admin-bg text-semantic-text-primary">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-60 flex flex-col transition-transform duration-200 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          background: "#050707",
          borderRight: "1px solid rgba(52,211,153,0.14)",
        }}
      >
        {/* Brand */}
        <div
          className="px-5 py-4"
          style={{ borderBottom: "1px solid rgba(52,211,153,0.14)" }}
        >
          <Link href="/admin/dashboard" className="font-bold text-lg text-white">
            My<span className="text-emerald-400">Hacks</span>
          </Link>
          <p className="mt-0.5 text-xs font-medium uppercase tracking-widest text-semantic-text-muted">
            Admin Panel
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2" aria-label="Admin navigation">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/admin/dashboard"
                ? pathname === item.href
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors mb-0.5",
                  isActive
                    ? "bg-emerald-500/12 text-emerald-200 font-medium"
                    : "text-semantic-text-muted hover:bg-white/[0.04] hover:text-semantic-text-primary"
                )}
                style={
                  isActive
                    ? { border: "1px solid rgba(52,211,153,0.26)" }
                    : { border: "1px solid transparent" }
                }
              >
                <span className="w-4 h-4 flex-shrink-0">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div
          className="px-4 py-3"
          style={{ borderTop: "1px solid rgba(52,211,153,0.12)" }}
        >
          <p className="text-sm font-medium truncate text-semantic-text-primary">{user.name}</p>
          <p className="mb-3 truncate text-xs text-semantic-text-muted">{user.email}</p>
          <div className="flex items-center gap-1">
            <Link
              href="/"
              className="flex-1 rounded-md py-1.5 text-center text-xs text-semantic-text-muted transition-colors hover:bg-white/[0.04] hover:text-emerald-300"
              target="_blank"
            >
              View site ↗
            </Link>
            <button
              onClick={handleLogout}
              className="flex-1 rounded-md py-1.5 text-center text-xs text-semantic-text-muted transition-colors hover:bg-white/[0.04] hover:text-semantic-danger"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Topbar */}
        <header
          className="sticky top-0 z-20 px-4 sm:px-6 h-14 flex items-center gap-3"
          style={{
            background: "rgba(5,7,7,0.96)",
            borderBottom: "1px solid rgba(52,211,153,0.12)",
            backdropFilter: "blur(8px)",
          }}
        >
          <button
            className="lg:hidden rounded-md p-1.5 text-semantic-text-muted transition-colors hover:bg-white/[0.04] hover:text-semantic-text-primary"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1" />
          <span className="hidden text-xs text-semantic-text-muted sm:block">
            Logged in as <strong className="font-semibold text-semantic-text-primary">{user.name}</strong>
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

/* ── SVG Icons ── */

function OverviewIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

function AnnouncementsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

function FaqIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
      <circle cx="12" cy="17" r=".5" fill="currentColor" />
    </svg>
  );
}

function ScheduleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function SponsorsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function MediaIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" />
    </svg>
  );
}

function RegistrationsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function TeamsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <circle cx="9" cy="7" r="4" />
      <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
      <circle cx="19" cy="8" r="3" />
      <path d="M22 21v-1.5a3 3 0 00-2-2.83" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function NotificationsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const NAV_LINKS = [
  { href: "/#about", label: "About" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#media", label: "Media" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/contact", label: "Contact" },
];

interface NavUser {
  name: string;
  email: string;
  role: string;
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<NavUser | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Fetch session on mount and on pathname change (catches login/logout)
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setUser(data.user ?? null))
      .catch(() => setUser(null));
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled || !isHome || menuOpen
          ? "bg-navy-900/95 backdrop-blur-md shadow-md"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Image src="/logo.png" alt="LaserHacks" width={48} height={48} className="object-contain" />
            <span className="font-bold text-lg text-white">
              Laser<span className="text-laser-400">Hacks</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 text-lg font-semibold rounded-lg transition-colors",
                  !link.href.startsWith("/#") && pathname === link.href
                    ? "text-laser-400 bg-white/5"
                    : "text-white hover:text-laser-300 hover:bg-white/5"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-white/70 font-medium">
                  {user.role === "admin" ? "Admin" : user.name.split(" ")[0]}
                </span>
                {user.role === "admin" ? (
                  <Link
                    href="/admin/dashboard"
                    className="text-sm text-laser-400 hover:text-laser-300 font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/settings"
                    className="text-sm text-laser-400 hover:text-laser-300 font-medium transition-colors"
                  >
                    Settings
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-sm text-white/50 hover:text-white transition-colors font-medium"
                >
                  Log out
                </button>
              </>
            ) : (
              <Button asChild size="sm" variant="primary">
                <Link href="/login">Log in</Link>
              </Button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label="Toggle navigation menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden border-t border-white/10 overflow-hidden transition-all duration-300",
          menuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="px-4 pb-4 pt-2 flex flex-col gap-1" aria-label="Mobile navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-2.5 text-sm rounded-lg transition-colors",
                !link.href.startsWith("/#") && pathname === link.href
                  ? "text-laser-400 bg-white/5"
                  : "text-white/80 hover:text-white hover:bg-white/5"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            {user ? (
              <>
                <p className="px-3 text-sm text-white/50">{user.role === "admin" ? "Admin" : user.name}</p>
                {user.role === "admin" ? (
                  <Link href="/admin/dashboard" className="px-3 py-2 text-sm text-laser-400 font-medium">
                    Dashboard
                  </Link>
                ) : (
                  <Link href="/settings" className="px-3 py-2 text-sm text-laser-400 font-medium">
                    Settings
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-left px-3 py-2 text-sm text-white/50 hover:text-white transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              <Button asChild size="sm" variant="primary" className="w-full justify-center">
                <Link href="/login">Log in</Link>
              </Button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

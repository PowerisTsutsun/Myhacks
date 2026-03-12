import Link from "next/link";
import Image from "next/image";
import type { SiteConfig } from "@/lib/settings";

interface FooterProps {
  config: SiteConfig;
}

const NAV_LINKS = [
  { href: "/#about", label: "About" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#media", label: "Media" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/register", label: "Register" },
  { href: "/contact", label: "Contact" },
];

export function Footer({ config }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        background: "rgba(4,8,15,0.98)",
        borderTop: "1px solid rgba(75,159,229,0.12)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        {/* Top row */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-10">
          {/* Brand */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2.5 mb-3">
              <Image src="/logo.png" alt="LaserHacks" width={32} height={32} className="object-contain" />
              <span className="font-bold text-xl text-white">
                Laser<span className="text-laser-400">Hacks</span>
              </span>
            </Link>
            <p className="text-white/35 text-sm max-w-xs leading-relaxed">
              IVC&apos;s beginner-friendly hackathon. Build something great in 24 hours.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3 mt-4">
              {config.instagram_url && (
                <SocialLink href={config.instagram_url} label="Instagram">
                  <InstagramIcon />
                </SocialLink>
              )}
              {config.twitter_url && (
                <SocialLink href={config.twitter_url} label="Twitter / X">
                  <TwitterIcon />
                </SocialLink>
              )}
              {config.linkedin_url && (
                <SocialLink href={config.linkedin_url} label="LinkedIn">
                  <LinkedInIcon />
                </SocialLink>
              )}
            </div>
          </div>

          {/* Nav links */}
          <div className="flex flex-col gap-2">
            <p className="text-white/25 text-xs uppercase tracking-widest font-semibold mb-1">Pages</p>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white/50 hover:text-laser-400 text-sm transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* IVC info */}
          <div className="flex flex-col gap-2">
            <p className="text-white/25 text-xs uppercase tracking-widest font-semibold mb-1">Hosted by</p>
            <a
              href="https://www.ivc.edu"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 hover:text-laser-400 text-sm transition-colors"
            >
              Irvine Valley College
            </a>
            <a
              href="https://www.ivc.edu/student-services/asivc/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 hover:text-laser-400 text-sm transition-colors"
            >
              ASIVC
            </a>
            <Link
              href="/contact"
              className="text-white/50 hover:text-laser-400 text-sm transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div
          className="w-full h-px mb-6"
          style={{ background: "rgba(75,159,229,0.1)" }}
          aria-hidden
        />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/25">
          <p>
            &copy; {year} LaserHacks &mdash; Organized by ASIVC at Irvine Valley College
          </p>
          <p>Made with care for IVC students</p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="text-white/30 hover:text-laser-400 transition-colors"
    >
      {children}
    </a>
  );
}

function InstagramIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

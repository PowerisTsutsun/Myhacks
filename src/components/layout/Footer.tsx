import type { SiteConfig } from "@/lib/settings";

interface FooterProps {
  config: SiteConfig;
}

export function Footer({ config: _ }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        background: "rgba(4,8,15,0.98)",
        borderTop: "1px solid rgba(75,159,229,0.12)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/60">
          <p>
            &copy; {year} MyHacks
          </p>
          <p>Made with care for students</p>
        </div>
      </div>
    </footer>
  );
}

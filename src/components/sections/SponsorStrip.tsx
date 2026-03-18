"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface Sponsor {
  id: number;
  name: string;
  tier: string;
  logoUrl: string | null;
  websiteUrl: string | null;
}

interface SponsorStripProps {
  sponsors: Sponsor[];
}

export function SponsorStrip({ sponsors }: SponsorStripProps) {
  if (sponsors.length === 0) {
    return (
      <section className="section-padding bg-navy-900/80 border-y border-laser-500/10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-white/40 text-sm mb-1">Interested in supporting MyHacks?</p>
          <h2 className="text-2xl font-bold text-white mb-4">Become a Sponsor</h2>
          <Button asChild variant="outline">
            <Link href="/sponsors">View Sponsor Info</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-navy-900/80 border-y border-laser-500/10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <p className="text-xs uppercase tracking-widest text-laser-400/85 mb-1">Powered by</p>
          <h2 className="text-2xl font-bold text-white">Our Sponsors</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-6 sm:gap-10"
        >
          {sponsors.map((sponsor) => (
            <SponsorLogo key={sponsor.id} sponsor={sponsor} />
          ))}
        </motion.div>

        <div className="text-center mt-8">
          <Link
            href="/sponsors"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200"
            style={{
              background: "rgba(75,159,229,0.12)",
              border: "1px solid rgba(75,159,229,0.35)",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(75,159,229,0.25)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(75,159,229,0.7)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(75,159,229,0.12)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(75,159,229,0.35)";
            }}
          >
            View all sponsors
          </Link>
        </div>
      </div>
    </section>
  );
}

function SponsorLogo({ sponsor }: { sponsor: Sponsor }) {
  const content = sponsor.logoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={sponsor.logoUrl}
      alt={sponsor.name}
      className="max-h-10 max-w-[140px] object-contain opacity-50 hover:opacity-90 transition-opacity filter brightness-0 invert"
    />
  ) : (
    <span className="text-xl font-bold text-white/75 hover:text-white transition-colors px-4 py-2">
      {sponsor.name}
    </span>
  );

  if (sponsor.websiteUrl) {
    return (
      <a href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer" title={sponsor.name}>
        {content}
      </a>
    );
  }
  return <div title={sponsor.name}>{content}</div>;
}

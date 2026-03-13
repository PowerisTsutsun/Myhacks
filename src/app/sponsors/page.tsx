import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { getSiteConfig } from "@/lib/settings";
import { db } from "@/lib/db";
import { sponsors } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Sponsors",
  description: "Thank you to our sponsors who make LaserHacks possible.",
};

export const revalidate = 60;

const TIER_ORDER = ["platinum", "gold", "silver", "bronze", "community"];

const TIER_STYLES: Record<string, { label: string; size: string }> = {
  platinum: { label: "Platinum", size: "max-h-16 max-w-[220px]" },
  gold: { label: "Gold", size: "max-h-12 max-w-[180px]" },
  silver: { label: "Silver", size: "max-h-10 max-w-[160px]" },
  bronze: { label: "Bronze", size: "max-h-9 max-w-[140px]" },
  community: { label: "Community", size: "max-h-8 max-w-[120px]" },
};

export default async function SponsorsPage() {
  const config = await getSiteConfig();

  const allSponsors = await db
    .select()
    .from(sponsors)
    .where(eq(sponsors.isPublished, true))
    .orderBy(asc(sponsors.sortOrder));

  // Group by tier in order
  const byTier = TIER_ORDER.map((tier) => ({
    tier,
    items: allSponsors.filter((s) => s.tier === tier),
  })).filter((g) => g.items.length > 0);

  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* Header */}
        <div className="bg-navy-900 py-16 sm:py-20 relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(22,98,172,0.38) 0%, transparent 70%)" }}
          />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-laser-400 font-semibold text-sm uppercase tracking-widest mb-3">Sponsors</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Our Sponsors</h1>
            <p className="text-white/70 text-lg">
              LaserHacks is made possible by the generous support of our sponsors.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          {allSponsors.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-white/65 mb-6">Sponsor listings coming soon.</p>
            </div>
          ) : (
            <div className="space-y-12 mb-16">
              {byTier.map(({ tier, items }) => {
                const style = TIER_STYLES[tier];
                return (
                  <section key={tier}>
                    <div className="flex items-center gap-3 mb-6">
                      <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                        tier === "platinum"
                          ? "text-laser-300 border-laser-400/40 bg-laser-400/10"
                          : tier === "gold"
                          ? "text-gold-300 border-gold-400/40 bg-gold-400/10"
                          : "text-white/50 border-white/15 bg-white/5"
                      }`}>
                        {style.label}
                      </span>
                      <div className="h-px flex-1 bg-white/10" />
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
                      {items.map((sponsor) => (
                        <div key={sponsor.id} className="flex flex-col items-center gap-2">
                          {sponsor.websiteUrl ? (
                            <a
                              href={sponsor.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={sponsor.name}
                              className="opacity-70 hover:opacity-100 transition-opacity"
                            >
                              <SponsorLogo sponsor={sponsor} sizeClass={style.size} />
                            </a>
                          ) : (
                            <SponsorLogo sponsor={sponsor} sizeClass={style.size} />
                          )}
                          {sponsor.description && (
                            <p className="text-white/70 text-sm text-center max-w-[180px] leading-snug">
                              {sponsor.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}

          {/* Sponsor CTA */}
          <div
            className="rounded-2xl p-8 sm:p-10 text-center"
            style={{
              background: "rgba(8,20,37,0.7)",
              border: "1px solid rgba(75,159,229,0.2)",
              backdropFilter: "blur(8px)",
            }}
          >
            <h2 className="text-2xl font-bold text-white mb-3">Become a Sponsor</h2>
            <p className="text-white/70 mb-6 max-w-xl mx-auto">
              Support the next generation of student innovators at IVC. Sponsoring LaserHacks gets
              your brand in front of hundreds of motivated students.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {config.sponsor_packet_url ? (
                <Button asChild variant="primary">
                  <a href={config.sponsor_packet_url} target="_blank" rel="noopener noreferrer">
                    Download Sponsor Packet
                  </a>
                </Button>
              ) : null}
              <Button asChild variant={config.sponsor_packet_url ? "outline" : "primary"}>
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer config={config} />
    </>
  );
}

function SponsorLogo({
  sponsor,
  sizeClass,
}: {
  sponsor: { name: string; logoUrl: string | null };
  sizeClass: string;
}) {
  if (sponsor.logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={sponsor.logoUrl}
        alt={sponsor.name}
        className={`${sizeClass} object-contain`}
      />
    );
  }
  return (
    <span className="text-xl font-bold text-white/90">{sponsor.name}</span>
  );
}

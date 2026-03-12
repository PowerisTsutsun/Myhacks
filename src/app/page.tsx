import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { WhatIsLaserHacks } from "@/components/sections/WhatIsLaserHacks";
import { Countdown } from "@/components/sections/Countdown";
import { SponsorStrip } from "@/components/sections/SponsorStrip";
import { FeaturedMedia } from "@/components/sections/FeaturedMedia";
import { FaqPreview } from "@/components/sections/FaqPreview";
import { getSiteConfig } from "@/lib/settings";
import { db } from "@/lib/db";
import {
  faqItems,
  mediaItems,
  sponsors,
} from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";

export const revalidate = 60;

export default async function HomePage() {
  const config = await getSiteConfig();

  const [pubFaq, featuredMedia, pubSponsors] =
    await Promise.all([
      db
        .select()
        .from(faqItems)
        .where(eq(faqItems.isPublished, true))
        .orderBy(asc(faqItems.sortOrder))
        .limit(6),

      db
        .select()
        .from(mediaItems)
        .where(and(eq(mediaItems.isPublished, true), eq(mediaItems.isFeatured, true)))
        .orderBy(asc(mediaItems.sortOrder))
        .limit(6),

      db
        .select()
        .from(sponsors)
        .where(eq(sponsors.isPublished, true))
        .orderBy(asc(sponsors.sortOrder)),
    ]);

  const showCountdown =
    config.event_start && new Date(config.event_start) > new Date();

  return (
    <>
      <Navbar />
      <main>
        <Hero config={config} />
        <div id="about"><WhatIsLaserHacks /></div>
        {showCountdown && (
          <Countdown
            targetDate={config.event_start!}
            eventName={config.event_name}
          />
        )}
        <SponsorStrip sponsors={pubSponsors} />
        <div id="media"><FeaturedMedia items={featuredMedia} /></div>
        <div id="faq"><FaqPreview items={pubFaq} /></div>
      </main>
      <Footer config={config} />
    </>
  );
}

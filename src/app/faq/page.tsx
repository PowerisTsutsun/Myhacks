import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Accordion } from "@/components/ui/Accordion";
import { getSiteConfig } from "@/lib/settings";
import { db } from "@/lib/db";
import { faqItems } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about LaserHacks.",
};

export const revalidate = 60;

export default async function FaqPage() {
  const config = await getSiteConfig();

  const items = await db
    .select()
    .from(faqItems)
    .where(eq(faqItems.isPublished, true))
    .orderBy(asc(faqItems.sortOrder));

  // Group by category
  const categories = Array.from(new Set(items.map((i) => i.category)));

  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* Header */}
        <div className="bg-navy-900 py-16 sm:py-20 relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(22,98,172,0.38) 0%, transparent 70%)",
            }}
          />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-laser-400 font-semibold text-sm uppercase tracking-widest mb-3">FAQ</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-white/60 text-lg">
              Everything you need to know about LaserHacks.
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🤔</div>
              <p className="text-white/65">FAQ coming soon. Check back later!</p>
            </div>
          ) : categories.length > 1 ? (
            <div className="space-y-10">
              {categories.map((cat) => (
                <section key={cat}>
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-white/55 mb-4 capitalize">
                    {cat}
                  </h2>
                  <Accordion items={items.filter((i) => i.category === cat)} />
                </section>
              ))}
            </div>
          ) : (
            <Accordion items={items} />
          )}

          {/* Still have questions */}
          <div
            className="mt-12 p-6 rounded-2xl text-center"
            style={{ background: "rgba(8,20,37,0.6)", border: "1px solid rgba(75,159,229,0.15)" }}
          >
            <p className="font-medium text-white mb-1">Still have questions?</p>
            <p className="text-white/65 text-sm mb-3">
              We&apos;re happy to help.{" "}
              {config.contact_email ? (
                <>
                  Email us at{" "}
                  <a href={`mailto:${config.contact_email}`} className="text-laser-400 underline hover:text-laser-300">
                    {config.contact_email}
                  </a>
                </>
              ) : (
                "Reach out via our contact page."
              )}
            </p>
          </div>
        </div>
      </main>
      <Footer config={config} />
    </>
  );
}

import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getSiteConfig } from "@/lib/settings";
import { db } from "@/lib/db";
import { mediaItems } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { getYouTubeEmbedUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Media",
  description: "Photos, videos, and highlights from LaserHacks events.",
};

export const revalidate = 60;

export default async function MediaPage() {
  const config = await getSiteConfig();

  const items = await db
    .select()
    .from(mediaItems)
    .where(eq(mediaItems.isPublished, true))
    .orderBy(asc(mediaItems.sortOrder));

  return (
    <>
      <Navbar />
      <main className="pt-20">
        {/* Header */}
        <div className="bg-navy-900 py-16 sm:py-20 relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(37,99,235,0.2) 0%, transparent 70%)" }}
          />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-laser-400 font-semibold text-sm uppercase tracking-widest mb-3">Media</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Highlights & Media</h1>
            <p className="text-white/60 text-lg">
              Photos, videos, and moments from past LaserHacks events.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <h2 className="text-xl font-semibold text-white mb-2">Media coming soon</h2>
              <p className="text-white/50">Check back after the event for photos and highlights!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((item) => (
                <MediaCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer config={config} />
    </>
  );
}

function MediaCard({ item }: { item: (typeof mediaItems.$inferSelect) }) {
  const ytEmbed = item.type === "youtube" && item.embedUrl
    ? getYouTubeEmbedUrl(item.embedUrl)
    : null;

  return (
    <article
      className="rounded-2xl overflow-hidden transition-all duration-200 hover:translate-y-[-2px]"
      style={{ background: "rgba(8,20,37,0.7)", border: "1px solid rgba(75,159,229,0.12)" }}
    >
      <div className="relative aspect-video" style={{ background: "rgba(4,10,22,0.8)" }}>
        {ytEmbed ? (
          <iframe
            src={ytEmbed}
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            loading="lazy"
          />
        ) : item.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnailUrl}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <TypeIcon type={item.type} />
          </div>
        )}
        {item.isFeatured && (
          <div className="absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(75,159,229,0.9)", color: "white" }}>
            Featured
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-white text-sm">{item.title}</h3>
          {item.externalUrl && (
            <a
              href={item.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-laser-400 hover:text-laser-300 transition-colors"
              aria-label={`View ${item.title}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
        {item.caption && (
          <p className="text-white/40 text-xs mt-1 line-clamp-2">{item.caption}</p>
        )}
      </div>
    </article>
  );
}

function TypeIcon({ type }: { type: string }) {
  const svgs: Record<string, React.ReactNode> = {
    instagram: (
      <svg className="w-8 h-8 text-laser-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    ),
    youtube: (
      <svg className="w-8 h-8 text-laser-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
      </svg>
    ),
    image: (
      <svg className="w-8 h-8 text-laser-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
      </svg>
    ),
  };
  return (
    <span className="text-laser-400">
      {svgs[type] || (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      )}
    </span>
  );
}

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { getYouTubeEmbedUrl } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface MediaItem {
  id: number;
  type: string;
  title: string;
  caption: string | null;
  embedUrl: string | null;
  thumbnailUrl: string | null;
  externalUrl: string | null;
}

interface FeaturedMediaProps {
  items: MediaItem[];
}

export function FeaturedMedia({ items }: FeaturedMediaProps) {
  if (items.length === 0) return null;

  return (
    <section className="section-padding bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p className="text-laser-500 font-semibold text-sm uppercase tracking-widest mb-2">
            Media
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-3">
            See it in action
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Photos, videos, and highlights from LaserHacks events.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.slice(0, 6).map((item, i) => (
            <MediaCard key={item.id} item={item} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8"
        >
          <Button asChild variant="outline">
            <Link href="/media">View All Media</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

function MediaCard({ item, index }: { item: MediaItem; index: number }) {
  const ytEmbed = item.type === "youtube" && item.embedUrl
    ? getYouTubeEmbedUrl(item.embedUrl)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow border border-slate-100"
    >
      {/* Media embed or thumbnail */}
      <div className="relative aspect-video bg-slate-100">
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
          <MediaPlaceholder type={item.type} />
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-navy-900 text-sm line-clamp-2">{item.title}</h3>
          {item.externalUrl && (
            <a
              href={item.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-laser-500 hover:text-laser-600 transition-colors"
              aria-label={`View ${item.title} externally`}
            >
              <ExternalIcon />
            </a>
          )}
        </div>
        {item.caption && (
          <p className="text-slate-400 text-xs mt-1 line-clamp-2">{item.caption}</p>
        )}
      </div>
    </motion.div>
  );
}

function MediaPlaceholder({ type }: { type: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
      <span className="text-slate-300">
        {type === "youtube" || type === "video" ? (
          <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
            <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>
          </svg>
        ) : type === "image" || type === "instagram" ? (
          <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
          </svg>
        ) : (
          <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
            <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
          </svg>
        )}
      </span>
    </div>
  );
}

function ExternalIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

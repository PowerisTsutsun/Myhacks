"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { formatDateShort } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface Announcement {
  id: number;
  title: string;
  slug: string;
  body: string;
  publishedAt: Date | string | null;
}

interface LatestUpdatesProps {
  announcements: Announcement[];
}

export function LatestUpdates({ announcements }: LatestUpdatesProps) {
  if (announcements.length === 0) return null;

  return (
    <section className="section-padding bg-navy-900/80">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p className="text-laser-400 font-semibold text-sm uppercase tracking-widest mb-2">
            Updates
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Latest News</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.slice(0, 3).map((ann, i) => (
            <motion.article
              key={ann.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col items-center text-center rounded-3xl p-8 transition-all"
              style={{
                background: "rgba(26, 39, 68, 0.75)",
                backdropFilter: "blur(8px)",
                boxShadow: "0 0 0 1px rgba(56,189,248,0.08), 0 8px 32px rgba(0,0,0,0.4)",
              }}
            >
              {ann.publishedAt && (
                <p className="text-xs text-laser-400/60 mb-3 uppercase tracking-widest">
                  {formatDateShort(ann.publishedAt)}
                </p>
              )}
              <h3 className="font-bold text-white text-lg mb-3 line-clamp-2">{ann.title}</h3>
              <p className="text-white/55 text-sm leading-relaxed line-clamp-4 flex-1">{ann.body}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

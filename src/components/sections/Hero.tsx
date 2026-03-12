"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HeroBackground } from "@/components/decorative/HeroBackground";
import { Button } from "@/components/ui/Button";
import type { SiteConfig } from "@/lib/settings";

interface HeroProps {
  config: SiteConfig;
}

export function Hero({ config }: HeroProps) {
  const hasDate = config.event_start;

  const eventDate = hasDate
    ? new Date(config.event_start!).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "radial-gradient(ellipse 100% 70% at 50% 10%, #112d5e 0%, #081425 50%, #04080f 100%)" }}
    >
      <HeroBackground />

      <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto pt-24 pb-28">

        {/* Eyebrow badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
          className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full mb-10 cursor-default"
          style={{
            background: "rgba(21,88,160,0.25)",
            border: "1px solid rgba(75,159,229,0.45)",
            boxShadow: "0 0 20px rgba(21,88,160,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <span className="relative flex w-2.5 h-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-laser-400 opacity-50" />
            <span className="relative inline-flex rounded-full w-2.5 h-2.5 bg-laser-400" />
          </span>
          <span className="text-laser-300 text-sm font-semibold tracking-wide">
            {hasDate ? "Registration Open" : "Coming Soon"}
          </span>
        </motion.div>

        {/* Main title */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08 }}
        >
          <h1
            className="text-[clamp(4rem,14vw,9.5rem)] font-black text-white leading-none tracking-tight mb-5 select-none relative inline-block"
          >
            <span className="relative">
              Laser
              {/* Sweep shimmer overlay on "Laser" */}
              <span
                className="absolute inset-0 title-sweep pointer-events-none"
                aria-hidden
              />
            </span>
            <span
              className="relative text-laser-400"
              style={{
                textShadow: "0 0 30px rgba(75,159,229,0.65), 0 0 70px rgba(75,159,229,0.25)",
              }}
            >
              Hacks
            </span>
          </h1>
        </motion.div>

        {/* Date / Location row */}
        {(eventDate || config.venue_name) && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.26 }}
            className="flex items-center justify-center gap-4 text-sm text-white mb-11 flex-wrap"
          >
            {eventDate && (
              <span className="flex items-center gap-1.5">
                <CalendarIcon />
                {eventDate}
                {config.event_end && config.event_end !== config.event_start && (
                  <> –{" "}
                    {new Date(config.event_end).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                  </>
                )}
              </span>
            )}
            {eventDate && config.venue_name && (
              <span className="w-px h-3 bg-white/15 hidden sm:block" />
            )}
            {config.venue_name && (
              <span className="flex items-center gap-1.5">
                <LocationIcon />
                {config.venue_name}
              </span>
            )}
          </motion.div>
        )}

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.33 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button asChild size="lg" variant="primary">
            <Link href="/register">Register for Free</Link>
          </Button>
          <Button
            asChild size="lg" variant="outline"
            className="border-white/20 text-white/80 hover:bg-white/8 hover:border-white/35 hover:text-white"
          >
            <Link href="/about">Learn More</Link>
          </Button>
        </motion.div>

      </div>
    </section>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

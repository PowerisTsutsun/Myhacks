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
      style={{ background: "radial-gradient(ellipse 100% 72% at 50% 8%, #14366f 0%, #09172c 48%, #04080f 100%)" }}
    >
      <HeroBackground />

      <div className="relative z-10 w-full px-4 pt-24 pb-28 sm:px-6">
        <div className="hero-stage mx-auto max-w-6xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
            className="hero-badge mb-8 inline-flex cursor-default items-center gap-2.5 rounded-full px-5 py-2"
            style={{
              background: "rgba(10, 27, 50, 0.56)",
              border: "1px solid rgba(101, 230, 255, 0.18)",
              boxShadow: "0 0 28px rgba(18, 68, 140, 0.2), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-laser-400 opacity-50" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-laser-400" />
            </span>
            <span className="text-sm font-semibold tracking-wide text-laser-300">
              {hasDate ? "Registration Open" : "Coming Soon"}
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08 }}
          >
            <h1 className="hero-title relative mb-5 inline-block select-none text-[clamp(4rem,14vw,9.5rem)] font-black leading-none tracking-tight text-white">
              <span className="relative">
                Laser
                <span
                  className="title-sweep pointer-events-none absolute inset-0"
                  aria-hidden
                />
              </span>
              <span
                className="hero-title-accent relative text-laser-400"
                style={{
                  textShadow: "0 0 32px rgba(75,159,229,0.62), 0 0 82px rgba(75,159,229,0.22)",
                }}
              >
                Hacks
              </span>
            </h1>
          </motion.div>

          {(eventDate || config.venue_name) && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.26 }}
              className="hero-meta mb-11 inline-flex flex-wrap items-center justify-center gap-4 text-sm text-white"
            >
              {eventDate && (
                <span className="flex items-center gap-1.5">
                  <CalendarIcon />
                  {eventDate}
                  {config.event_end && config.event_end !== config.event_start && (
                    <>
                      {" - "}
                      {new Date(config.event_end).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                      })}
                    </>
                  )}
                </span>
              )}
              {eventDate && config.venue_name && (
                <span className="hidden h-3 w-px bg-white/15 sm:block" />
              )}
              {config.venue_name && (
                <span className="flex items-center gap-1.5">
                  <LocationIcon />
                  {config.venue_name}
                </span>
              )}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.33 }}
            className="flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button asChild size="lg" variant="primary" className="hero-primary-cta">
              <Link href="/register">Register for Free</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="hero-secondary-cta border-white/20 text-white/80 hover:border-white/35 hover:bg-white/8 hover:text-white"
            >
              <Link href="/about">Learn More</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function CalendarIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

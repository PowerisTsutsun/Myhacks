"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const HIGHLIGHTS = [
  {
    icon: <RocketIcon />,
    title: "Beginner Friendly",
    desc: "No experience required. Whether you've never coded before or you're a seasoned developer, LaserHacks welcomes everyone.",
  },
  {
    icon: <MentorIcon />,
    title: "Workshops & Mentors",
    desc: "Hands-on workshops and industry mentors available throughout the event to help you learn new skills and get unstuck.",
  },
  {
    icon: <TrophyIcon />,
    title: "Prizes & Recognition",
    desc: "Compete for prizes across multiple tracks. Every participant leaves with new skills, connections, and something to be proud of.",
  },
  {
    icon: <LightbulbIcon />,
    title: "Build Real Things",
    desc: "24–36 hours to design, prototype, and present a project from scratch. You'll be surprised what you can build in a weekend.",
  },
];

export function WhatIsLaserHacks() {
  return (
    <section
      className="section-padding relative overflow-hidden"
      style={{ background: "rgba(8,20,37,0.62)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderTop: "1px solid rgba(75,159,229,0.1)", borderBottom: "1px solid rgba(75,159,229,0.1)" }}
    >
      {/* Subtle background glow orbs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle, rgba(21,88,160,0.18) 0%, transparent 70%)", transform: "translate(-50%, -50%)" }} />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full" style={{ background: "radial-gradient(circle, rgba(75,159,229,0.1) 0%, transparent 70%)", transform: "translate(50%, 50%)" }} />
      </div>
      <div className="relative max-w-7xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-laser-400 font-semibold text-sm uppercase tracking-widest mb-2">
            What is LaserHacks?
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            A hackathon built for{" "}
            <span className="text-laser-400">every student</span>
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto text-balance">
            LaserHacks is Irvine Valley College&apos;s annual student hackathon — a 24-hour event
            where students of all backgrounds come together to build projects, learn new skills,
            and have a great time.
          </p>
        </motion.div>

        {/* Highlight cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {HIGHLIGHTS.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group laser-border-card rounded-2xl"
              style={{
                background: "linear-gradient(180deg, rgba(9,24,46,0.92), rgba(6,16,30,0.92))",
                border: "1px solid rgba(95,170,255,0.16)",
                boxShadow: "0 18px 48px rgba(2,8,23,0.28), inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              <div
                className="laser-border-card-inner p-6 relative"
                style={{
                  background: "linear-gradient(180deg, rgba(10,24,48,0.96), rgba(7,18,34,0.94))",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.03)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-laser-300 transition-colors duration-200"
                  style={{
                    background: "linear-gradient(180deg, rgba(75,159,229,0.16), rgba(75,159,229,0.08))",
                    border: "1px solid rgba(95,170,255,0.28)",
                    boxShadow: "0 0 24px rgba(77,163,255,0.12)",
                  }}
                >
                  {item.icon}
                </div>
                <h3 className="font-semibold text-white mb-2 drop-shadow-[0_0_12px_rgba(77,163,255,0.08)]">{item.title}</h3>
                <p className="text-white/78 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
          {/* Map card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="sm:col-span-2 lg:col-span-2 rounded-2xl overflow-hidden flex flex-col"
            style={{
              background: "linear-gradient(180deg, rgba(9,24,46,0.94), rgba(6,16,30,0.94))",
              border: "1px solid rgba(95,170,255,0.18)",
              boxShadow: "0 18px 48px rgba(2,8,23,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=-117.791%2C33.667%2C-117.767%2C33.682&layer=mapnik&marker=33.67457%2C-117.77906"
              width="100%"
              height="100%"
              style={{ border: 0, display: "block", minHeight: "220px", filter: "invert(90%) hue-rotate(180deg) saturate(0.8) contrast(0.92) brightness(0.88)", flex: 1 }}
              loading="lazy"
              title="Irvine Valley College location"
            />
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 px-4 py-3" style={{ background: "linear-gradient(180deg, rgba(8,20,37,0.98), rgba(6,16,30,0.98))", borderTop: "1px solid rgba(95,170,255,0.16)" }}>
              <a
                href="https://www.google.com/maps/search/?api=1&query=5500+Irvine+Center+Dr%2C+Irvine%2C+CA+92618"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white transition-colors"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }}
              >
                <PinIcon />
                Google Maps
              </a>
              <a
                href="https://maps.apple.com/?q=5500+Irvine+Center+Dr%2C+Irvine%2C+CA+92618"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white transition-colors"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }}
              >
                <PinIcon />
                Apple Maps
              </a>
            </div>
          </motion.div>
        </div>

        {/* CTA row */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button asChild size="lg" variant="primary">
            <Link href="/register">Register</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white/20 text-white/80 hover:bg-white/8 hover:border-white/35 hover:text-white">
            <Link href="/#about">Learn More</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

function PinIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
  );
}

function RocketIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
    </svg>
  );
}

function MentorIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 010-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
      <path d="M4 22h16M9 22v-4M15 22v-4M12 17c-3.87 0-7-3.13-7-7V4h14v6c0 3.87-3.13 7-7 7z" />
    </svg>
  );
}

function LightbulbIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6M10 22h4M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 01-1 1H9a1 1 0 01-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" />
    </svg>
  );
}


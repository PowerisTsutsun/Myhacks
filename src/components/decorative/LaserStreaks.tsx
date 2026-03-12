"use client";

import { cn } from "@/lib/utils";

// IVC blue palette — no off-brand gold
const BLUE  = "75,159,229";   // mid blue — main beam
const LIGHT = "144,192,247";  // pale blue — soft trail
const WHITE = "220,235,255";  // near-white — sharp scan beam

const BEAMS = [
  // Sharp scan beams
  { top: "16%", rgb: BLUE,  angle: "-11deg", dur: "7s",   delay: "0s",   width: "60%", blur: "0.4px", opacity: 0.9 },
  { top: "42%", rgb: WHITE, angle:  "7deg",  dur: "9s",   delay: "2.5s", width: "50%", blur: "0.3px", opacity: 0.7 },
  // Soft glow trails
  { top: "28%", rgb: LIGHT, angle: "-5deg",  dur: "11s",  delay: "1s",   width: "70%", blur: "2px",   opacity: 0.5 },
  { top: "68%", rgb: BLUE,  angle:  "9deg",  dur: "8.5s", delay: "4s",   width: "55%", blur: "1px",   opacity: 0.6 },
  // Slower deep trail
  { top: "82%", rgb: LIGHT, angle: "-13deg", dur: "13s",  delay: "6s",   width: "65%", blur: "3px",   opacity: 0.35 },
];

export function LaserStreaks({ className }: { className?: string }) {
  return (
    <div
      className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}
      aria-hidden
    >
      {BEAMS.map((beam, i) => (
        <div
          key={i}
          className="cyber-beam"
          style={{
            top: beam.top,
            width: beam.width,
            filter: `blur(${beam.blur})`,
            opacity: beam.opacity,
            "--beam-rgb": beam.rgb,
            "--beam-angle": beam.angle,
            "--beam-dur": beam.dur,
            "--beam-delay": beam.delay,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

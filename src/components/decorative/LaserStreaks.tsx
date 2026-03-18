"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

const BLUE = "77,163,255";
const CYAN = "101,230,255";
const WHITE = "226,241,255";

type Beam = {
  top: string;
  left: string;
  width: string;
  angle: string;
  rgb: string;
  opacity: number;
  blur: string;
  duration: string;
  delay: string;
  travel?: string;
  core?: string;
};

type Node = {
  top: string;
  left: string;
  size: string;
  glow: string;
  opacity: number;
};

type Hotspot = {
  top: string;
  left: string;
  size: string;
  delay: string;
};

const PRIMARY_BEAMS: Beam[] = [
  { top: "14%", left: "-12%", width: "72%", angle: "-12deg", rgb: WHITE, opacity: 0.95, blur: "0px", duration: "10s", delay: "0s", travel: "152%", core: "2px" },
  { top: "30%", left: "42%", width: "52%", angle: "118deg", rgb: BLUE, opacity: 0.88, blur: "0.35px", duration: "12s", delay: "1.2s", travel: "132%", core: "2px" },
  { top: "58%", left: "-6%", width: "68%", angle: "7deg", rgb: CYAN, opacity: 0.8, blur: "0.3px", duration: "13s", delay: "3.2s", travel: "138%", core: "1.5px" },
  { top: "76%", left: "48%", width: "44%", angle: "-118deg", rgb: WHITE, opacity: 0.68, blur: "0.2px", duration: "14s", delay: "5.4s", travel: "122%", core: "1.5px" },
];

const ATMOSPHERIC_BEAMS: Beam[] = [
  { top: "10%", left: "-8%", width: "88%", angle: "-8deg", rgb: BLUE, opacity: 0.3, blur: "10px", duration: "20s", delay: "0.5s", travel: "120%", core: "7px" },
  { top: "36%", left: "18%", width: "76%", angle: "16deg", rgb: CYAN, opacity: 0.24, blur: "14px", duration: "22s", delay: "2.6s", travel: "116%", core: "10px" },
  { top: "64%", left: "36%", width: "72%", angle: "-21deg", rgb: WHITE, opacity: 0.2, blur: "16px", duration: "24s", delay: "4.1s", travel: "112%", core: "12px" },
];

const MICRO_STREAKS: Beam[] = [
  { top: "20%", left: "8%", width: "12%", angle: "-10deg", rgb: WHITE, opacity: 0.42, blur: "0px", duration: "8s", delay: "0.6s", travel: "160%", core: "1px" },
  { top: "27%", left: "60%", width: "10%", angle: "12deg", rgb: CYAN, opacity: 0.36, blur: "0px", duration: "9s", delay: "1.4s", travel: "140%", core: "1px" },
  { top: "46%", left: "18%", width: "9%", angle: "4deg", rgb: BLUE, opacity: 0.32, blur: "0px", duration: "10s", delay: "2.2s", travel: "145%", core: "1px" },
  { top: "62%", left: "72%", width: "12%", angle: "-7deg", rgb: WHITE, opacity: 0.38, blur: "0px", duration: "11s", delay: "3s", travel: "150%", core: "1px" },
  { top: "78%", left: "22%", width: "8%", angle: "-13deg", rgb: CYAN, opacity: 0.28, blur: "0px", duration: "9.5s", delay: "4.1s", travel: "142%", core: "1px" },
];

const EMITTERS: Node[] = [
  { top: "12%", left: "-2%", size: "8rem", glow: "rgba(77, 163, 255, 0.34)", opacity: 0.95 },
  { top: "28%", left: "95%", size: "7rem", glow: "rgba(226, 241, 255, 0.2)", opacity: 0.7 },
  { top: "56%", left: "-1%", size: "6rem", glow: "rgba(101, 230, 255, 0.24)", opacity: 0.7 },
  { top: "74%", left: "90%", size: "7.5rem", glow: "rgba(77, 163, 255, 0.26)", opacity: 0.8 },
];

const HOTSPOTS: Hotspot[] = [
  { top: "30%", left: "54%", size: "6rem", delay: "0.8s" },
  { top: "57%", left: "39%", size: "5rem", delay: "2.4s" },
  { top: "73%", left: "67%", size: "4rem", delay: "4.2s" },
];

export function LaserStreaks({ className }: { className?: string }) {
  return (
    <div
      className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}
      aria-hidden
    >
      <div className="absolute inset-0 laser-depth-back">
        {ATMOSPHERIC_BEAMS.map((beam, index) => (
          <div
            key={`atmospheric-${index}`}
            className="laser-beam laser-beam-atmospheric"
            style={beamStyle(beam)}
          />
        ))}
      </div>

      <div className="absolute inset-0 laser-depth-mid">
        {PRIMARY_BEAMS.map((beam, index) => (
          <div
            key={`primary-${index}`}
            className="laser-beam laser-beam-primary"
            style={beamStyle(beam)}
          />
        ))}
      </div>

      <div className="absolute inset-0 laser-depth-front">
        {MICRO_STREAKS.map((beam, index) => (
          <div
            key={`micro-${index}`}
            className="laser-beam laser-beam-micro"
            style={beamStyle(beam)}
          />
        ))}
      </div>

      {EMITTERS.map((node, index) => (
        <div
          key={`emitter-${index}`}
          className="laser-emitter"
          style={
            {
              top: node.top,
              left: node.left,
              width: node.size,
              height: node.size,
              opacity: node.opacity,
              "--emitter-glow": node.glow,
            } as CSSProperties
          }
        />
      ))}

      {HOTSPOTS.map((hotspot, index) => (
        <div
          key={`hotspot-${index}`}
          className="laser-hotspot"
          style={
            {
              top: hotspot.top,
              left: hotspot.left,
              width: hotspot.size,
              height: hotspot.size,
              animationDelay: hotspot.delay,
            } as CSSProperties
          }
        />
      ))}

      <div className="laser-dust-field" />
    </div>
  );
}

function beamStyle(beam: Beam): CSSProperties {
  return {
    top: beam.top,
    left: beam.left,
    width: beam.width,
    filter: `blur(${beam.blur})`,
    opacity: beam.opacity,
    "--beam-rgb": beam.rgb,
    "--beam-angle": beam.angle,
    "--beam-duration": beam.duration,
    "--beam-delay": beam.delay,
    "--beam-travel": beam.travel ?? "140%",
    "--beam-core": beam.core ?? "1.5px",
  } as CSSProperties;
}

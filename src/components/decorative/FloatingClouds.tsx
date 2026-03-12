"use client";

import { cn } from "@/lib/utils";

const CLOUDS = [
  { w: 220, h: 70, top: "12%", left: "-5%", opacity: 0.07, delay: "0s", duration: "28s" },
  { w: 160, h: 50, top: "28%", left: "70%", opacity: 0.05, delay: "4s", duration: "22s" },
  { w: 280, h: 80, top: "55%", left: "10%", opacity: 0.06, delay: "8s", duration: "32s" },
  { w: 140, h: 44, top: "72%", left: "60%", opacity: 0.04, delay: "2s", duration: "20s" },
  { w: 200, h: 60, top: "40%", left: "85%", opacity: 0.05, delay: "12s", duration: "26s" },
];

export function FloatingClouds({ className }: { className?: string }) {
  return (
    <div
      className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}
      aria-hidden
    >
      {CLOUDS.map((c, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: c.top,
            left: c.left,
            width: c.w,
            height: c.h,
            opacity: c.opacity,
            animation: `drift ${c.duration} ease-in-out infinite`,
            animationDelay: c.delay,
          }}
        >
          <CloudSvg />
        </div>
      ))}
    </div>
  );
}

function CloudSvg() {
  return (
    <svg viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="100" cy="40" rx="95" ry="18" fill="white" />
      <ellipse cx="70" cy="32" rx="42" ry="22" fill="white" />
      <ellipse cx="130" cy="28" rx="38" ry="20" fill="white" />
      <ellipse cx="100" cy="22" rx="28" ry="16" fill="white" />
    </svg>
  );
}

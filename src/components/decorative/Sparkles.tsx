"use client";

import { cn } from "@/lib/utils";

const SPARKLES = [
  { size: 3, top: "8%",  left: "12%", delay: "0s",    opacity: 0.9 },
  { size: 2, top: "22%", left: "80%", delay: "0.8s",  opacity: 0.7 },
  { size: 4, top: "42%", left: "5%",  delay: "1.6s",  opacity: 0.8 },
  { size: 2, top: "58%", left: "91%", delay: "0.4s",  opacity: 0.65 },
  { size: 3, top: "76%", left: "33%", delay: "2.1s",  opacity: 0.85 },
  { size: 2, top: "16%", left: "52%", delay: "1.2s",  opacity: 0.6 },
  { size: 4, top: "86%", left: "73%", delay: "0.7s",  opacity: 0.9 },
  { size: 2, top: "33%", left: "28%", delay: "1.9s",  opacity: 0.7 },
  { size: 3, top: "63%", left: "16%", delay: "2.8s",  opacity: 0.8 },
  { size: 2, top: "48%", left: "68%", delay: "1.4s",  opacity: 0.6 },
  { size: 4, top: "6%",  left: "86%", delay: "0.2s",  opacity: 0.75 },
  { size: 2, top: "90%", left: "46%", delay: "3.1s",  opacity: 0.65 },
  { size: 3, top: "30%", left: "62%", delay: "2.4s",  opacity: 0.7 },
  { size: 2, top: "70%", left: "55%", delay: "0.6s",  opacity: 0.55 },
  { size: 3, top: "55%", left: "40%", delay: "3.5s",  opacity: 0.8 },
  { size: 2, top: "12%", left: "40%", delay: "1.8s",  opacity: 0.6 },
];

export function Sparkles({ className }: { className?: string }) {
  return (
    <div
      className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}
      aria-hidden
    >
      {SPARKLES.map((s, i) => (
        <div
          key={i}
          className="sparkle absolute"
          style={{
            width: s.size,
            height: s.size,
            top: s.top,
            left: s.left,
            opacity: s.opacity,
            animation: `twinkle 3s ease-in-out infinite`,
            animationDelay: s.delay,
          }}
        />
      ))}
    </div>
  );
}

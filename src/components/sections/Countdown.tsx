"use client";

import React, { useEffect, useState } from "react";

interface CountdownProps {
  targetDate: string;
  eventName?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(target: Date): TimeLeft | null {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function Countdown({ targetDate, eventName = "MyHacks" }: CountdownProps) {
  const target = new Date(targetDate);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft(target));
    const interval = setInterval(() => {
      const t = calculateTimeLeft(target);
      setTimeLeft(t);
      if (!t) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDate]);

  if (!timeLeft) {
    return (
      <section className="py-16 text-center" style={{ background: "rgba(4,8,15,0.9)" }}>
        <p className="text-laser-400 font-semibold text-xl">
          {eventName} is happening now!
        </p>
      </section>
    );
  }

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <section
      className="py-16 sm:py-20 relative overflow-hidden"
      style={{ background: "rgba(4,8,15,0.95)" }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(75,159,229,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <p className="text-laser-400 font-semibold text-xs uppercase tracking-[0.2em] mb-2">
          Counting down to
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-10">
          {eventName}
        </h2>

        <div className="flex items-center justify-center gap-2 sm:gap-4">
          {units.map(({ label, value }, i) => (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center gap-2">
                <div
                  className="relative w-16 sm:w-24 h-16 sm:h-24 rounded-xl sm:rounded-2xl flex items-center justify-center"
                  style={{
                    background: "rgba(8,20,37,0.8)",
                    border: "1px solid rgba(75,159,229,0.2)",
                    boxShadow: "0 0 20px rgba(75,159,229,0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
                  }}
                >
                  {/* Top highlight */}
                  <div
                    className="absolute top-0 left-4 right-4 h-px rounded-full"
                    style={{ background: "rgba(75,159,229,0.3)" }}
                    aria-hidden
                  />
                  <span className="text-2xl sm:text-4xl font-bold text-white tabular-nums tracking-tight">
                    {pad(value)}
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs text-white/30 uppercase tracking-[0.15em] font-medium">
                  {label}
                </span>
              </div>
              {/* Separator colon (not after last item) */}
              {i < units.length - 1 && (
                <div
                  className="flex flex-col gap-1.5 pb-6 sm:pb-7"
                  aria-hidden
                >
                  <span
                    className="block w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full"
                    style={{ background: "rgba(75,159,229,0.4)" }}
                  />
                  <span
                    className="block w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full"
                    style={{ background: "rgba(75,159,229,0.4)" }}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

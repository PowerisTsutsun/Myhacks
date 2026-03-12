"use client";

// RGB values for CSS custom property (used in rgba())
const BLUE = "75,159,229";
const BLUE_LIGHT = "144,192,247";

const BEAMS = [
  { top: "8%",  rgb: BLUE,       angle: "-12deg", dur: "9s",  delay: "0s"  },
  { top: "28%", rgb: BLUE_LIGHT, angle:  "6deg",  dur: "13s", delay: "3s"  },
  { top: "48%", rgb: BLUE,       angle: "-7deg",  dur: "11s", delay: "7s"  },
  { top: "68%", rgb: BLUE,       angle:  "10deg", dur: "8s",  delay: "1.5s"},
  { top: "85%", rgb: BLUE_LIGHT, angle: "-14deg", dur: "14s", delay: "5s"  },
];

export function CyberBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      aria-hidden
      style={{ zIndex: 0 }}
    >
      {/* Cyber grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(75,159,229,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(75,159,229,0.055) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Ambient glow — top-left cyan */}
      <div
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(21,88,160,0.2) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Ambient glow — bottom-right blue */}
      <div
        className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(75,159,229,0.1) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Ambient glow — center navy */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(37,99,235,0.08) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      {/* Sweeping laser beams */}
      {BEAMS.map((beam, i) => (
        <div
          key={i}
          className="cyber-beam"
          style={{
            top: beam.top,
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

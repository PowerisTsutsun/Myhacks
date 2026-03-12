import { LaserStreaks } from "./LaserStreaks";
import { Sparkles } from "./Sparkles";

export function HeroBackground() {
  return (
    <>
      {/* Radial glow — upper centre, IVC blue */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% 20%, rgba(21,88,160,0.45) 0%, rgba(8,20,37,0.6) 55%, transparent 100%)",
        }}
      />

      {/* Grid overlay — subtle */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(rgba(75,159,229,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(75,159,229,0.9) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Primary glow orb — upper centre */}
      <div
        className="absolute pointer-events-none"
        aria-hidden
        style={{
          top: "-15%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "800px",
          height: "500px",
          background: "radial-gradient(ellipse, rgba(21,88,160,0.28) 0%, rgba(75,159,229,0.08) 50%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Secondary glow — lower left */}
      <div
        className="absolute bottom-0 left-0 pointer-events-none"
        aria-hidden
        style={{
          width: "500px",
          height: "350px",
          background: "radial-gradient(ellipse at bottom left, rgba(21,88,160,0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Tertiary glow — mid right */}
      <div
        className="absolute pointer-events-none"
        aria-hidden
        style={{
          top: "30%",
          right: "-5%",
          width: "400px",
          height: "400px",
          background: "radial-gradient(ellipse, rgba(75,159,229,0.1) 0%, transparent 70%)",
          filter: "blur(70px)",
        }}
      />

      <LaserStreaks />
      <Sparkles />
    </>
  );
}

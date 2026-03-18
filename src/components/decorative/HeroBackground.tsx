import { LaserStreaks } from "./LaserStreaks";
import { Sparkles } from "./Sparkles";

export function HeroBackground() {
  return (
    <>
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 70% 58% at 50% 18%, rgba(26, 82, 166, 0.52) 0%, rgba(10, 27, 50, 0.72) 42%, rgba(4, 8, 15, 0) 100%)",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none laser-grid"
        aria-hidden
      />

      <div
        className="absolute inset-0 pointer-events-none laser-center-haze"
        aria-hidden
      />

      <div
        className="absolute inset-0 pointer-events-none laser-vignette"
        aria-hidden
      />

      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background:
            "radial-gradient(circle at 18% 72%, rgba(77, 163, 255, 0.12) 0%, transparent 28%), radial-gradient(circle at 84% 34%, rgba(101, 230, 255, 0.12) 0%, transparent 22%), radial-gradient(circle at 66% 78%, rgba(77, 163, 255, 0.08) 0%, transparent 18%)",
        }}
      />

      <LaserStreaks />
      <Sparkles className="opacity-70 mix-blend-screen" />
    </>
  );
}

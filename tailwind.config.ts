import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#04080f",
          900: "#081425",
          800: "#0d1e38",
          700: "#12294c",
          600: "#1a3660",
          500: "#224475",
        },
        laser: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#90c0f7",
          400: "#4b9fe5",
          500: "#1b7fd4",
          600: "#1558a0",
        },
        gold: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      animation: {
        "drift-slow": "drift 25s ease-in-out infinite",
        "drift-medium": "drift 18s ease-in-out infinite reverse",
        "drift-fast": "drift 12s ease-in-out infinite",
        "twinkle": "twinkle 3s ease-in-out infinite",
        "laser-glow": "laserGlow 4s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        "pulse-slow": "pulse 4s ease-in-out infinite",
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translateX(0px) translateY(0px)" },
          "33%": { transform: "translateX(15px) translateY(-8px)" },
          "66%": { transform: "translateX(-10px) translateY(5px)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.3", transform: "scale(0.7)" },
        },
        laserGlow: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.9" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(ellipse 80% 60% at 50% 20%, #1558a0 0%, #081425 60%, #04080f 100%)",
        "section-gradient":
          "linear-gradient(180deg, #f8faff 0%, #ffffff 100%)",
        "card-gradient":
          "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,249,255,0.9) 100%)",
      },
      boxShadow: {
        "glow-sm": "0 0 8px rgba(75, 159, 229, 0.3)",
        "glow-md": "0 0 20px rgba(75, 159, 229, 0.4)",
        "glow-lg": "0 0 40px rgba(75, 159, 229, 0.3)",
        "card": "0 4px 24px rgba(13, 27, 42, 0.08)",
        "card-hover": "0 8px 40px rgba(13, 27, 42, 0.14)",
      },
    },
  },
  plugins: [],
};

export default config;

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
        semantic: {
          background: "#06111F",
          "background-secondary": "#0A1830",
          surface: "#10213F",
          "surface-elevated": "#16305A",
          "surface-hover": "#1B3B6F",
          border: "#243D68",
          "border-strong": "#315487",
          "text-primary": "#F5F9FF",
          "text-secondary": "#B8C7E6",
          "text-muted": "#8EA3C7",
          "accent-primary": "#4DA3FF",
          "accent-primary-hover": "#79BBFF",
          "accent-secondary": "#65E6FF",
          success: "#34D399",
          warning: "#FBBF24",
          danger: "#FB7185",
        },
        navy: {
          950: "#06111F",
          900: "#0A1830",
          800: "#10213F",
          700: "#16305A",
          600: "#1B3B6F",
          500: "#315487",
        },
        admin: {
          bg:               "#04101D",
          sidebar:          "#071424",
          surface:          "#0A1830",
          "surface-hi":     "#10213F",
          "surface-hover":  "#16305A",
        },
        laser: {
          50:  "#E9F4FF",
          100: "#D7EAFF",
          200: "#B8DAFF",
          300: "#94C6FF",
          400: "#79BBFF",
          500: "#4DA3FF",
          600: "#2E81D8",
        },
        cyan: {
          300: "#B1F5FF",
          400: "#65E6FF",
          500: "#31CBE7",
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
          "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(77,163,255,0.32) 0%, #0A1830 55%, #06111F 100%)",
        "section-gradient":
          "linear-gradient(180deg, #0A1830 0%, #06111F 100%)",
        "card-gradient":
          "linear-gradient(135deg, rgba(22,48,90,0.98) 0%, rgba(16,33,63,0.98) 100%)",
      },
      boxShadow: {
        "glow-sm": "0 0 12px rgba(77, 163, 255, 0.28)",
        "glow-md": "0 0 24px rgba(77, 163, 255, 0.35)",
        "glow-lg": "0 0 44px rgba(101, 230, 255, 0.2)",
        "card": "0 14px 40px rgba(2, 8, 23, 0.34)",
        "card-hover": "0 22px 56px rgba(2, 8, 23, 0.42)",
      },
    },
  },
  plugins: [],
};

export default config;

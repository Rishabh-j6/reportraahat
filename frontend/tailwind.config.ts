// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Noto Sans Devanagari", "system-ui", "sans-serif"],
        devanagari: ["Noto Sans Devanagari", "system-ui", "sans-serif"],
      },
      colors: {
        bg: "#0d0d1a",
        accent: "#FF9933",
        ok: "#22C55E",
        warn: "#EF4444",
        caution: "#F59E0B",
      },
      boxShadow: {
        "glow-accent": "0 0 20px rgba(255,153,51,0.35)",
        "glow-ok":     "0 0 20px rgba(34,197,94,0.25)",
        "glow-warn":   "0 0 20px rgba(239,68,68,0.25)",
        "glow-card":   "0 8px 32px rgba(0,0,0,0.4)",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        pulseRing: {
          "0%":   { transform: "scale(1)",    opacity: "0.6" },
          "100%": { transform: "scale(1.75)", opacity: "0" },
        },
        floatY: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-6px)" },
        },
        gradientShift: {
          "0%":   { backgroundPosition: "0% 50%" },
          "50%":  { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      animation: {
        "fade-up":       "fadeUp 0.3s ease both",
        "shimmer":       "shimmer 2s linear infinite",
        "pulse-ring":    "pulseRing 1.8s ease-out infinite",
        "float-y":       "floatY 3s ease-in-out infinite",
        "gradient-shift":"gradientShift 6s ease infinite",
      },
      backgroundSize: {
        "200": "200% 200%",
      },
    },
  },
  plugins: [],
};

export default config;
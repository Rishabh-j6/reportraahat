// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Be Vietnam Pro", "Noto Sans Devanagari", "system-ui", "sans-serif"],
        headline: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        body: ["Be Vietnam Pro", "system-ui", "sans-serif"],
        label: ["Be Vietnam Pro", "system-ui", "sans-serif"],
        devanagari: ["Noto Sans Devanagari", "system-ui", "sans-serif"],
        hindi: ["Noto Sans Devanagari", "system-ui", "sans-serif"],
      },
      colors: {
        // Core backgrounds
        bg: "#12121f",
        "surface-dim": "#12121f",
        surface: "#12121f",
        "surface-container": "#1e1e2c",
        "surface-container-high": "#292937",
        "surface-container-low": "#1a1a28",
        "surface-container-lowest": "#0d0d1a",
        "surface-bright": "#383847",
        "surface-variant": "#343342",

        // Brand primaries
        accent: "#FF9933",
        primary: "#ffc08d",
        "primary-container": "#ff9933",
        "primary-fixed": "#ffdcc2",
        "primary-fixed-dim": "#ffb77a",
        "on-primary": "#4c2700",
        "on-primary-container": "#693800",

        // Secondary
        secondary: "#c0c1ff",
        "secondary-container": "#3131c0",
        "on-secondary-container": "#b0b2ff",

        // Tertiary — green
        tertiary: "#52e87c",
        "tertiary-container": "#2ccb63",
        "on-tertiary-container": "#005020",

        // Error / danger
        error: "#ffb4ab",
        "error-container": "#93000a",
        "on-error-container": "#ffdad6",

        // Text on surfaces
        "on-surface": "#e3e0f4",
        "on-surface-variant": "#dbc2b0",
        "on-background": "#e3e0f4",

        // Outlines
        outline: "#a38d7c",
        "outline-variant": "#554336",

        // Semantic (legacy compat)
        ok: "#22C55E",
        warn: "#EF4444",
        caution: "#F59E0B",
      },
      borderRadius: {
        DEFAULT: "1rem",
        lg: "2rem",
        xl: "3rem",
        full: "9999px",
      },
      boxShadow: {
        "glow-accent": "0 0 20px rgba(255,153,51,0.35)",
        "glow-ok": "0 0 20px rgba(34,197,94,0.25)",
        "glow-warn": "0 0 20px rgba(239,68,68,0.25)",
        "glow-card": "0 8px 32px rgba(0,0,0,0.4)",
        "clay": "inset 0 2px 4px rgba(255, 255, 255, 0.1), 0 10px 30px -10px rgba(0, 0, 0, 0.5)",
        "pixel-orange": "4px 4px 0px 0px #6d3a00",
        "nav-glow": "0 0 15px rgba(255,152,0,0.5)",
        "topbar": "inset 0 1px 0 0 rgba(255,255,255,0.1)",
        "bottombar": "0 -10px 40px rgba(0,0,0,0.4)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        pulseRing: {
          "0%": { transform: "scale(1)", opacity: "0.6" },
          "100%": { transform: "scale(1.75)", opacity: "0" },
        },
        floatY: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        gradientShift: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        enginePulse: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(255,180,171,0.4)" },
          "50%": { boxShadow: "0 0 25px rgba(255,180,171,0.8)" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.3s ease both",
        shimmer: "shimmer 2s linear infinite",
        "pulse-ring": "pulseRing 1.8s ease-out infinite",
        "float-y": "floatY 3s ease-in-out infinite",
        "gradient-shift": "gradientShift 6s ease infinite",
        "engine-pulse": "enginePulse 2s ease-in-out infinite",
      },
      backgroundSize: {
        "200": "200% 200%",
      },
    },
  },
  plugins: [],
};

export default config;
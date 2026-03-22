// lib/tokens.ts
// ─────────────────────────────────────────────
// Extracted from NutritionPage — single source of truth.
// Every page imports from here. Change once, updates everywhere.
// ─────────────────────────────────────────────

export const colors = {
    // Core backgrounds
    bg: "#0d0d1a",
    bgCard: "rgba(255,255,255,0.025)",
    bgCardHover: "rgba(255,255,255,0.05)",
    bgSubtle: "rgba(255,255,255,0.04)",

    // Borders
    border: "rgba(255,255,255,0.07)",
    borderStrong: "rgba(255,255,255,0.12)",

    // Text hierarchy (matches your existing opacity ladder)
    textPrimary: "#FFFFFF",
    textSecondary: "rgba(255,255,255,0.60)",
    textMuted: "rgba(255,255,255,0.40)",
    textFaint: "rgba(255,255,255,0.25)",
    textTiny: "rgba(255,255,255,0.15)",

    // Brand accent — saffron
    accent: "#FF9933",
    accentBg: "rgba(255,153,51,0.10)",
    accentBorder: "rgba(255,153,51,0.20)",

    // Semantic
    ok: "#22C55E",
    okBg: "rgba(34,197,94,0.10)",
    warn: "#EF4444",
    warnBg: "rgba(239,68,68,0.10)",
    caution: "#F59E0B",
    cautionBg: "rgba(245,158,11,0.10)",
} as const;

// Severity config — used for badges, card accents, borders
export const severity = {
    normal: { label: "Normal", color: "#22C55E", bg: "rgba(34,197,94,0.10)" },
    monitor: { label: "Monitor", color: "#F59E0B", bg: "rgba(245,158,11,0.10)" },
    urgent: { label: "See doctor", color: "#EF4444", bg: "rgba(239,68,68,0.10)" },
} as const;

export type SeverityLevel = keyof typeof severity;

// Standard Framer Motion presets — spread these on motion.div
export const motionPresets = {
    fadeUp: {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
    },
    fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.3 },
    },
    scaleIn: {
        initial: { opacity: 0, scale: 0.97 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.3 },
    },
} as const;

// Section label style — reused across every page
export const sectionLabelClass =
    "text-white/40 text-xs font-medium uppercase tracking-widest mb-3";
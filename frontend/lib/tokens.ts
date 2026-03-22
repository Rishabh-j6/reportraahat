// lib/tokens.ts
// ─────────────────────────────────────────────
// VANGARD Design Tokens — Hill Climb Racing Theme
// Single source of truth for colors, shadows, and motion.
// ─────────────────────────────────────────────

export const colors = {
    // Core backgrounds (dark mode — inner pages)
    bg: "#12121f",
    bgCard: "#1e1e2c",
    bgCardHover: "#292937",
    bgSubtle: "#1a1a28",
    bgDeep: "#0d0d1a",

    // Light mode (landing page)
    bgSky: "#87CEEB",
    hillGreen: "#4CAF50",
    hillGreenDark: "#388E3C",

    // Surface system (Material-inspired)
    surface: "#12121f",
    surfaceContainer: "#1e1e2c",
    surfaceContainerHigh: "#292937",
    surfaceContainerLow: "#1a1a28",
    surfaceContainerLowest: "#0d0d1a",
    surfaceBright: "#383847",
    surfaceVariant: "#343342",

    // Borders
    border: "rgba(255,255,255,0.07)",
    borderStrong: "rgba(255,255,255,0.12)",
    outlineVariant: "#554336",

    // Text hierarchy
    textPrimary: "#e3e0f4",
    textSecondary: "rgba(255,255,255,0.60)",
    textMuted: "#dbc2b0",
    textFaint: "rgba(255,255,255,0.25)",
    textTiny: "rgba(255,255,255,0.15)",

    // Brand accent — saffron / orange (primary)
    accent: "#FF9933",
    accentLight: "#ffc08d",
    accentLighter: "#ffdcc2",
    accentBg: "rgba(255,153,51,0.10)",
    accentBorder: "rgba(255,153,51,0.20)",
    primaryContainer: "#ff9933",
    onPrimaryContainer: "#693800",

    // Secondary — indigo
    secondary: "#c0c1ff",
    secondaryContainer: "#3131c0",

    // Tertiary — green/emerald
    tertiary: "#52e87c",
    tertiaryContainer: "#2ccb63",
    onTertiaryContainer: "#005020",

    // Semantic
    ok: "#22C55E",
    okBg: "rgba(34,197,94,0.10)",
    warn: "#EF4444",
    warnBg: "rgba(239,68,68,0.10)",
    caution: "#F59E0B",
    cautionBg: "rgba(245,158,11,0.10)",
    error: "#ffb4ab",
    errorContainer: "#93000a",

    // Racing specific
    teal: "#06B6D4",
    cyan: "#06B6D4",
} as const;

// Clay card shadow — inset highlight + ambient depth
export const clayShadow = "inset 0 2px 4px rgba(255, 255, 255, 0.1), 0 10px 30px -10px rgba(0, 0, 0, 0.5)";
export const clayInset = "inset 2px 2px 8px rgba(0,0,0,0.05), inset -2px -2px 8px rgba(255,255,255,0.8)";
export const pixelShadowOrange = "4px 4px 0px 0px #6d3a00";
export const pixelBorder = "2px 0 0 0 #000, -2px 0 0 0 #000, 0 2px 0 0 #000, 0 -2px 0 0 #000";

// Racing metaphor labels
export const racingLabels = {
    dashboard: "Engine Status",
    exercise: "Race Quests",
    nutrition: "Fuel Station",
    wellness: "Pit Stop",
    avatar: "Driver Profile",
    share: "Add to Crew",
    labValues: "Telemetry Data",
    bodyMap: "Internal Stage",
    confidence: "AI Accuracy",
    checklist: "Race Plan",
    report: "Engine Log",
} as const;

// Severity config — used for badges, card accents, borders
export const severity = {
    normal: { label: "NORM", color: "#52e87c", bg: "rgba(82,232,124,0.15)" },
    monitor: { label: "LOW", color: "#c0c1ff", bg: "rgba(192,193,255,0.15)" },
    urgent: { label: "HIGH", color: "#ffb4ab", bg: "rgba(255,180,171,0.15)" },
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
    "text-on-surface-variant text-xs font-black uppercase tracking-[0.12em] mb-3";
// components/ui/index.tsx
// ─────────────────────────────────────────────
// All primitives match your NutritionPage aesthetic.
// Use these on every page for instant consistency.
// ─────────────────────────────────────────────

"use client";

import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion";
import { colors, severity, SeverityLevel, motionPresets, sectionLabelClass } from "@/lib/tokens";
import { cn } from "@/lib/utils";

export { sectionLabelClass };

// ── PageShell ─────────────────────────────────────────────────────────────────
// Wraps every page. Provides the dark bg + ambient glow + safe padding.
interface PageShellProps {
    children: React.ReactNode;
    className?: string;
    /** Show the saffron/green ambient glow in the background */
    glow?: boolean;
}

export function PageShell({ children, className, glow = true }: PageShellProps) {
    return (
        <div className={cn("min-h-screen text-white", className)}
            style={{ background: colors.bg }}>
            {glow && (
                <div
                    className="fixed inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle at 25% 25%, #FF9933 0%, transparent 50%), radial-gradient(circle at 75% 75%, #22C55E 0%, transparent 50%)",
                    }}
                />
            )}
            <div className={cn("relative max-w-2xl mx-auto px-4 py-6 pb-24", className)}>
                {children}
            </div>
        </div>
    );
}

// ── PageHeader ────────────────────────────────────────────────────────────────
interface PageHeaderProps {
    icon?: string;
    title: string;
    subtitle?: string;
    delay?: number;
}

export function PageHeader({ icon, title, subtitle, delay = 0 }: PageHeaderProps) {
    return (
        <motion.div
            {...motionPresets.fadeUp}
            transition={{ duration: 0.3, delay }}
            className="mb-6"
        >
            <div className="flex items-center gap-3 mb-1">
                {icon && <span className="text-2xl">{icon}</span>}
                <h1 className="text-xl font-bold tracking-tight text-white">{title}</h1>
            </div>
            {subtitle && (
                <p style={{ color: colors.textMuted }} className="text-sm">{subtitle}</p>
            )}
        </motion.div>
    );
}

// ── Card ──────────────────────────────────────────────────────────────────────
interface CardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    /** When true, uses the expanded/hover background */
    active?: boolean;
    /** Coloured left-border accent */
    accentColor?: string;
    delay?: number;
}

export function Card({ children, className, active, accentColor, delay = 0, ...props }: CardProps) {
    return (
        <motion.div
            {...motionPresets.fadeUp}
            transition={{ duration: 0.3, delay }}
            className={cn("rounded-2xl border overflow-hidden", className)}
            style={{
                background: active ? colors.bgCardHover : colors.bgCard,
                borderColor: accentColor ? `${accentColor}40` : colors.border,
                borderLeft: accentColor ? `3px solid ${accentColor}` : undefined,
                ...props.style,
            }}
            whileHover={{ y: -2, boxShadow: "0 8px 28px rgba(0,0,0,0.3)" }}
            {...props}
        >
            {children}
        </motion.div>
    );
}

// ── SectionLabel ──────────────────────────────────────────────────────────────
export function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-white/40 text-[10px] font-semibold uppercase tracking-[0.12em] mb-3 flex items-center gap-1.5">
            {children}
        </p>
    );
}

// ── StatGrid + StatCard ───────────────────────────────────────────────────────
// The 3-column target grid from NutritionPage, generalised.
interface StatCardProps {
    icon: string;
    value: string | number;
    unit?: string;
    label: string;
}

export function StatCard({ icon, value, unit, label }: StatCardProps) {
    return (
        <div
            className="rounded-xl p-3"
            style={{ background: colors.bgSubtle, border: `1px solid ${colors.border}` }}
        >
            <div className="text-lg mb-1">{icon}</div>
            <div className="text-white font-semibold text-sm">
                {value}
                {unit && <span className="text-[10px] ml-0.5" style={{ color: colors.textFaint }}>{unit}</span>}
            </div>
            <div className="text-[10px]" style={{ color: colors.textMuted }}>{label}</div>
        </div>
    );
}

// ── SeverityBadge ─────────────────────────────────────────────────────────────
export function SeverityBadge({ level }: { level: SeverityLevel }) {
    const s = severity[level];
    return (
        <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap"
            style={{ background: s.bg, color: s.color }}
        >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
            {s.label}
        </span>
    );
}

// ── Banner ────────────────────────────────────────────────────────────────────
// The orange deficiency/info banner from NutritionPage.
interface BannerProps {
    children: React.ReactNode;
    color?: string;    // defaults to accent orange
    delay?: number;
}

export function Banner({ children, color = colors.accent, delay = 0.1 }: BannerProps) {
    return (
        <motion.div
            {...motionPresets.fadeUp}
            transition={{ duration: 0.3, delay }}
            className="mb-5 p-3.5 rounded-xl text-xs leading-relaxed flex items-start gap-2.5"
            style={{
                background: `${color}14`,
                border: `1px solid ${color}30`,
                borderLeft: `3px solid ${color}`,
                color,
            }}
        >
            <span className="flex-shrink-0 mt-0.5">⚠️</span>
            <span>{children}</span>
        </motion.div>
    );
}

// ── Button ────────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "ghost" | "success";
    accentColor?: string;
}

export function Button({ variant = "primary", accentColor, className, children, ...props }: ButtonProps) {
    const styles: Record<string, React.CSSProperties> = {
        primary: { background: accentColor ?? colors.accent, color: "#0d0d1a" },
        ghost: { background: colors.bgSubtle, color: colors.textSecondary, border: `1px solid ${colors.border}` },
        success: { background: colors.okBg, color: colors.ok },
    };

    return (
        <motion.button
            whileTap={{ scale: 0.97 }}
            className={cn("w-full py-2 rounded-lg text-xs font-medium transition-all cursor-pointer", className)}
            style={styles[variant]}
            {...(props as any)}
        >
            {children}
        </motion.button>
    );
}

// ── LoadingShell ──────────────────────────────────────────────────────────────
// Drop-in loading skeleton that matches the dark theme.
export function LoadingShell({ rows = 4 }: { rows?: number }) {
    return (
        <PageShell>
            <div className="space-y-4">
                <div className="h-8 w-48 rounded-xl animate-pulse" style={{ background: colors.bgSubtle }} />
                <div className="h-48 rounded-2xl animate-pulse" style={{ background: colors.bgSubtle }} />
                <div className="grid grid-cols-2 gap-3">
                    {[...Array(rows)].map((_, i) => (
                        <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: colors.bgSubtle }} />
                    ))}
                </div>
            </div>
        </PageShell>
    );
}

// ── Chip ──────────────────────────────────────────────────────────────────────
// Small coloured pill — used for food group tags, report types, etc.
interface ChipProps {
    label: string;
    color?: string;
}

export function Chip({ label, color = colors.accent }: ChipProps) {
    return (
        <span
            className="text-[10px] px-1.5 py-0.5 rounded-full inline-block"
            style={{ background: `${color}20`, color }}
        >
            {label}
        </span>
    );
}
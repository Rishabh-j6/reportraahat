// components/ui/index.tsx
// ─────────────────────────────────────────────
// VANGARD UI Primitives — Hill Climb Racing Theme
// Clay cards, pixel accents, racing-styled components.
// ─────────────────────────────────────────────

"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { colors, severity, SeverityLevel, motionPresets, sectionLabelClass } from "@/lib/tokens";
import { cn } from "@/lib/utils";

export { sectionLabelClass };

// ── PageShell ─────────────────────────────────────────────────────────────────
interface PageShellProps {
    children: React.ReactNode;
    className?: string;
    /** "dark" = starfield deep bg (default), "light" = sky-blue landing */
    variant?: "dark" | "light";
}

export function PageShell({ children, className, variant = "dark" }: PageShellProps) {
    if (variant === "light") {
        return (
            <div className={cn("min-h-screen relative overflow-hidden", className)}
                style={{ background: "#87CEEB" }}>
                {/* Hill Climb Racing terrain */}
                <div className="fixed bottom-0 left-0 w-full h-48 bg-[#4CAF50] z-0"
                    style={{ borderRadius: "100% 100% 0 0 / 40% 40% 0 0", transform: "scaleX(1.5)" }} />
                <div className="fixed bottom-0 left-[-10%] w-[120%] h-32 bg-[#388E3C] z-0"
                    style={{ borderRadius: "100% 100% 0 0 / 50% 50% 0 0" }} />
                {/* Starfield overlay */}
                <div className="fixed inset-0 pointer-events-none starfield opacity-20 z-[5]" />
                <div className={cn("relative z-10 max-w-2xl mx-auto px-4 pt-24 pb-32", className)}>
                    {children}
                </div>
            </div>
        );
    }

    return (
        <div className={cn("min-h-screen text-on-surface starfield", className)}
            style={{ background: colors.bg }}>
            {/* Pixel burst decorations */}
            <div className="fixed top-20 left-10 w-4 h-4 opacity-20 pointer-events-none"
                style={{ background: `${colors.tertiary}33` }} />
            <div className="fixed top-40 right-20 w-8 h-8 rounded-full blur-xl opacity-10 pointer-events-none"
                style={{ background: `${colors.accent}33` }} />
            <div className="fixed bottom-32 left-1/4 w-2 h-2 opacity-30 pointer-events-none"
                style={{ background: `${colors.secondary}4D` }} />
            <div className={cn("relative max-w-5xl mx-auto px-4 md:px-6 pt-24 pb-32", className)}>
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
    materialIcon?: string;
}

export function PageHeader({ icon, title, subtitle, delay = 0, materialIcon }: PageHeaderProps) {
    return (
        <motion.div
            {...motionPresets.fadeUp}
            transition={{ duration: 0.3, delay }}
            className="mb-8"
        >
            <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight"
                style={{ color: colors.accentLight }}>
                {materialIcon && (
                    <span className="material-symbols-outlined text-3xl align-middle mr-2"
                        style={{ color: colors.accent }}>{materialIcon}</span>
                )}
                {icon && <span className="mr-2">{icon}</span>}
                {title}
            </h1>
            {subtitle && (
                <p className="text-base mt-1" style={{ color: colors.textMuted }}>{subtitle}</p>
            )}
        </motion.div>
    );
}

// ── Card ──────────────────────────────────────────────────────────────────────
interface CardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    active?: boolean;
    accentColor?: string;
    delay?: number;
}

export function Card({ children, className, active, accentColor, delay = 0, ...props }: CardProps) {
    return (
        <motion.div
            {...motionPresets.fadeUp}
            transition={{ duration: 0.3, delay }}
            className={cn("rounded-xl overflow-hidden clay-card", className)}
            style={{
                background: active ? colors.bgCardHover : colors.surfaceContainer,
                borderColor: accentColor ? `${accentColor}40` : undefined,
                borderLeft: accentColor ? `4px solid ${accentColor}` : undefined,
                ...props.style,
            }}
            whileHover={{ y: -2, boxShadow: "0 12px 40px rgba(0,0,0,0.4)" }}
            {...props}
        >
            {children}
        </motion.div>
    );
}

// ── SectionLabel ──────────────────────────────────────────────────────────────
export function SectionLabel({ children, icon }: { children: React.ReactNode; icon?: string }) {
    return (
        <p className="text-xs font-black uppercase tracking-[0.12em] mb-3 flex items-center gap-2"
            style={{ color: colors.textMuted }}>
            {icon && (
                <span className="material-symbols-outlined text-sm" style={{ color: colors.accent }}>
                    {icon}
                </span>
            )}
            {children}
        </p>
    );
}

// ── StatGrid + StatCard ───────────────────────────────────────────────────────
interface StatCardProps {
    icon: string;
    value: string | number;
    unit?: string;
    label: string;
    color?: string;
}

export function StatCard({ icon, value, unit, label, color }: StatCardProps) {
    return (
        <div className="rounded-xl p-3 clay-card"
            style={{ background: colors.surfaceContainerLowest }}>
            <div className="text-lg mb-1">{icon}</div>
            <div className="font-headline font-bold text-sm" style={{ color: color || colors.textPrimary }}>
                {value}
                {unit && <span className="text-[10px] ml-0.5 font-normal" style={{ color: colors.textFaint }}>{unit}</span>}
            </div>
            <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: colors.textMuted }}>{label}</div>
        </div>
    );
}

// ── SeverityBadge ─────────────────────────────────────────────────────────────
export function SeverityBadge({ level }: { level: SeverityLevel }) {
    const s = severity[level];
    return (
        <span
            className="inline-flex items-center justify-center w-12 h-12 rounded-full text-[10px] font-black"
            style={{ background: s.bg, color: s.color }}
        >
            {s.label}
        </span>
    );
}

// ── Banner ────────────────────────────────────────────────────────────────────
interface BannerProps {
    children: React.ReactNode;
    color?: string;
    delay?: number;
}

export function Banner({ children, color = colors.error, delay = 0.1 }: BannerProps) {
    return (
        <motion.div
            {...motionPresets.fadeUp}
            transition={{ duration: 0.3, delay }}
            className="mb-5 p-4 rounded-xl text-sm leading-relaxed flex items-start gap-2.5 clay-card"
            style={{
                background: colors.surfaceContainerLowest,
                borderLeft: `4px solid ${color}`,
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
    variant?: "primary" | "ghost" | "success" | "pixel";
    accentColor?: string;
}

export function Button({ variant = "primary", accentColor, className, children, ...props }: ButtonProps) {
    const styles: Record<string, React.CSSProperties> = {
        primary: {
            background: accentColor ?? colors.accent,
            color: "#0d0d1a",
            boxShadow: "0 4px 20px rgba(255,153,51,0.4)",
        },
        pixel: {
            background: "#FF9800",
            color: "#FFFFFF",
            boxShadow: "4px 4px 0px 0px #6d3a00",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 900,
        },
        ghost: {
            background: colors.surfaceContainerHigh,
            color: colors.textPrimary,
            border: `1px solid ${colors.border}`,
        },
        success: {
            background: colors.okBg,
            color: colors.ok,
        },
    };

    return (
        <motion.button
            whileTap={{ scale: 0.97 }}
            className={cn(
                "w-full py-3 rounded-xl text-sm font-bold transition-all cursor-pointer",
                variant === "pixel" && "active:translate-y-0.5 active:shadow-none",
                className
            )}
            style={styles[variant]}
            {...(props as any)}
        >
            {children}
        </motion.button>
    );
}

// ── LoadingShell ──────────────────────────────────────────────────────────────
export function LoadingShell({ rows = 4 }: { rows?: number }) {
    return (
        <PageShell>
            <div className="space-y-4">
                <div className="h-8 w-48 rounded-xl animate-pulse" style={{ background: colors.surfaceContainerHigh }} />
                <div className="h-48 rounded-2xl animate-pulse" style={{ background: colors.surfaceContainerHigh }} />
                <div className="grid grid-cols-2 gap-3">
                    {[...Array(rows)].map((_, i) => (
                        <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: colors.surfaceContainerHigh }} />
                    ))}
                </div>
            </div>
        </PageShell>
    );
}

// ── Chip ──────────────────────────────────────────────────────────────────────
interface ChipProps {
    label: string;
    color?: string;
}

export function Chip({ label, color = colors.accent }: ChipProps) {
    return (
        <span
            className="text-[10px] px-2 py-0.5 rounded-full inline-block font-black uppercase tracking-wider"
            style={{ background: `${color}25`, color }}
        >
            {label}
        </span>
    );
}
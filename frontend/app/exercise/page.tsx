"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGUCStore } from "@/lib/store";
import { PageShell } from "@/components/ui";
import { colors, racingLabels } from "@/lib/tokens";

interface ExerciseDay {
  day: string;
  activity: string;
  duration_minutes: number;
  intensity: string;
  notes: string;
}

interface ExerciseResponse {
  tier: string;
  tier_description: string;
  weekly_plan: ExerciseDay[];
  general_advice: string;
  avoid: string[];
}

const TIER_CONFIG: Record<string, { color: string; bg: string; icon: string; badge: string; matIcon: string }> = {
  LIGHT_WALKING_ONLY: { color: "#22C55E", bg: "#22C55E15", icon: "🚶", badge: "Light Recovery", matIcon: "directions_walk" },
  CARDIO_RESTRICTED:  { color: "#06B6D4", bg: "#06B6D415", icon: "🧘", badge: "Low Intensity", matIcon: "self_improvement" },
  NORMAL_ACTIVITY:    { color: "#FF9933", bg: "#FF993315", icon: "🏃", badge: "Active Recovery", matIcon: "directions_run" },
  ACTIVE_ENCOURAGED:  { color: "#EF4444", bg: "#EF444415", icon: "💪", badge: "Full Throttle", matIcon: "fitness_center" },
};

const DAY_ICONS = ["directions_walk", "fitness_center", "self_improvement", "sprint"];

const FALLBACK_PLAN: ExerciseResponse = {
  tier: "NORMAL_ACTIVITY",
  tier_description: "Standard moderate activity plan. 30-minute sessions, 5 days a week.",
  general_advice: "Stay consistent. 5 days of 30 minutes beats 1 day of 2 hours. Drink water before and after.",
  avoid: ["Exercising on an empty stomach", "Skipping warm-up and cool-down", "Pushing through sharp pain"],
  weekly_plan: [
    { day: "Monday", activity: "Brisk walking 30 min", duration_minutes: 30, intensity: "Moderate", notes: "Comfortable pace, slightly breathless." },
    { day: "Tuesday", activity: "Bodyweight squats, push-ups, lunges", duration_minutes: 30, intensity: "Moderate", notes: "3 sets of 12 reps each." },
    { day: "Wednesday", activity: "Yoga + stretching", duration_minutes: 30, intensity: "Low", notes: "Active recovery. Focus on flexibility." },
    { day: "Thursday", activity: "Brisk walk + light jog intervals", duration_minutes: 35, intensity: "Moderate", notes: "3 min walk, 2 min jog. Repeat 5 times." },
    { day: "Friday", activity: "Resistance band strength training", duration_minutes: 30, intensity: "Moderate", notes: "Focus on compound movements." },
    { day: "Saturday", activity: "Recreational activity — badminton or cycling", duration_minutes: 45, intensity: "Moderate", notes: "Make it fun and social!" },
    { day: "Sunday", activity: "Rest day", duration_minutes: 0, intensity: "Rest", notes: "Full rest. Light household activity fine." },
  ],
};

export default function ExercisePage() {
  const exerciseLevel    = useGUCStore((s) => s.exerciseLevel);
  const latestReport     = useGUCStore((s) => s.latestReport);
  const profile          = useGUCStore((s) => s.profile);
  const addXP            = useGUCStore((s) => s.addXP);
  const setAvatarState   = useGUCStore((s) => s.setAvatarState);

  const [data, setData]                   = useState<ExerciseResponse | null>(null);
  const [loading, setLoading]             = useState(true);
  const [selectedDay, setSelectedDay]     = useState<string | null>(null);
  const [completedDays, setCompletedDays] = useState<Set<string>>(new Set());

  const severity = latestReport?.severity_level ?? "MILD_CONCERN";

  useEffect(() => {
    const TIER_MAP: Record<string, string> = { Beginner: "LIGHT_WALKING_ONLY", Intermediate: "NORMAL_ACTIVITY", Advanced: "ACTIVE_ENCOURAGED" };
    const fetchPlan = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/exercise`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
        if (!res.ok) throw new Error();
        const json = await res.json();
        const transformed: ExerciseResponse = {
          tier: TIER_MAP[json.tier] ?? json.tier ?? "NORMAL_ACTIVITY",
          tier_description: json.tier_reason ?? json.tier_description ?? "",
          weekly_plan: json.weekly_plan ?? [],
          general_advice: json.encouragement ?? json.general_advice ?? "",
          avoid: json.restrictions ?? json.avoid ?? [],
        };
        setData(transformed); setSelectedDay("Monday");
      } catch { setData(FALLBACK_PLAN); setSelectedDay("Monday"); }
      finally { setLoading(false); }
    };
    fetchPlan();
  }, [exerciseLevel, severity, profile.language]);

  const handleComplete = (day: string) => {
    if (completedDays.has(day)) return;
    setCompletedDays((prev) => new Set([...prev, day]));
    addXP(10); setAvatarState("HAPPY");
  };

  const tierCfg   = TIER_CONFIG[data?.tier ?? "NORMAL_ACTIVITY"] ?? TIER_CONFIG.NORMAL_ACTIVITY;
  const weekTotal  = (data?.weekly_plan ?? []).reduce((s, d) => s + d.duration_minutes, 0);
  const activeDays = (data?.weekly_plan ?? []).filter((d) => d.duration_minutes > 0).length;

  if (loading) {
    return (
      <PageShell>
        <div className="space-y-4">
          <div className="h-10 w-56 rounded-xl animate-pulse" style={{ background: colors.surfaceContainerHigh }} />
          <div className="h-40 rounded-2xl animate-pulse" style={{ background: colors.surfaceContainerHigh }} />
          <div className="flex gap-2">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex-1 h-16 rounded-xl animate-pulse" style={{ background: colors.surfaceContainerHigh }} />
            ))}
          </div>
          <div className="h-40 rounded-2xl animate-pulse" style={{ background: colors.surfaceContainerHigh }} />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {/* Tier Banner — the hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="mb-8 rounded-2xl p-6 md:p-8 relative overflow-hidden"
        style={{ background: colors.primaryContainer }}
      >
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <h1 className="font-headline text-3xl md:text-4xl font-black uppercase tracking-tighter" style={{ color: colors.onPrimaryContainer }}>
            {tierCfg.badge === "Active Recovery" ? "ACTIVE" : tierCfg.badge.split(" ")[0].toUpperCase()}
          </h1>
          <h2 className="font-headline text-4xl md:text-5xl font-black uppercase tracking-tighter -mt-1" style={{ color: `${colors.onPrimaryContainer}99` }}>
            RECOVERY
          </h2>
          <div className="flex gap-6 mt-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: `${colors.onPrimaryContainer}80` }}>Power Level</p>
              <p className="font-headline text-2xl font-black" style={{ color: colors.onPrimaryContainer }}>LVL 42</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: `${colors.onPrimaryContainer}80` }}>XP Bonus</p>
              <p className="font-headline text-2xl font-black" style={{ color: colors.tertiary }}>+15%</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Map Selector */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-black uppercase tracking-[0.12em]" style={{ color: colors.textMuted }}>Map Selector</p>
          <p className="text-xs font-bold" style={{ color: colors.textFaint }}>STAGE {String((data?.weekly_plan ?? []).findIndex(d => d.day === selectedDay) + 1).padStart(2, "0")}/07</p>
        </div>
        <div className="flex items-center gap-0 relative">
          {/* Track line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2" style={{ background: colors.border }} />
          {(data?.weekly_plan ?? []).map((day, i) => {
            const isRest = day.duration_minutes === 0;
            const isDone = completedDays.has(day.day);
            const isSelected = selectedDay === day.day;
            return (
              <motion.button key={day.day}
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedDay(day.day)}
                className="flex-1 flex flex-col items-center relative z-10"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all mb-1"
                  style={{
                    background: isSelected ? tierCfg.color : isDone ? colors.tertiary : colors.surfaceContainerHigh,
                    border: isSelected ? `3px solid ${tierCfg.color}` : `2px solid ${isDone ? colors.tertiary : colors.border}`,
                    boxShadow: isSelected ? `0 0 16px ${tierCfg.color}50` : "none",
                  }}>
                  {isDone ? (
                    <span className="material-symbols-outlined text-sm" style={{ color: "#fff", fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  ) : isRest ? (
                    <span className="material-symbols-outlined text-sm" style={{ color: isSelected ? "#fff" : colors.textFaint }}>flag</span>
                  ) : (
                    <span className="material-symbols-outlined text-sm" style={{ color: isSelected ? "#fff" : colors.textFaint }}>{DAY_ICONS[i % DAY_ICONS.length]}</span>
                  )}
                </div>
                <span className="text-[10px] font-bold uppercase" style={{ color: isSelected ? tierCfg.color : colors.textFaint }}>
                  Day {String(i + 1).padStart(2, "0")}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Day Detail Card */}
      <AnimatePresence mode="wait">
        {selectedDay && data && (() => {
          const day = data.weekly_plan.find((d) => d.day === selectedDay);
          if (!day) return null;
          const isDone = completedDays.has(day.day);
          return (
            <motion.div key={selectedDay}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mb-6 rounded-2xl overflow-hidden clay-card"
              style={{ background: colors.surfaceContainer }}
            >
              {/* Card header */}
              <div className="px-6 py-4 flex justify-between items-center" style={{ borderBottom: `1px solid ${colors.border}` }}>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider mb-0.5" style={{ color: tierCfg.color }}>
                    {day.intensity === "Rest" ? "Rest Day" : `${day.intensity} Session`}
                  </p>
                  <h3 className="font-headline text-xl font-bold text-white">{day.activity || "Rest Day"}</h3>
                </div>
                {day.duration_minutes > 0 && (
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: colors.surfaceContainerHigh }}>
                    <span className="material-symbols-outlined text-lg" style={{ color: colors.textFaint }}>grid_view</span>
                  </div>
                )}
              </div>
              {/* Card body */}
              <div className="p-6 space-y-4">
                {day.duration_minutes === 0 ? (
                  <div className="text-center py-4">
                    <span className="text-4xl">💤</span>
                    <p className="text-sm mt-2" style={{ color: colors.textMuted }}>Full rest day. Your body repairs and grows stronger while you rest.</p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm leading-relaxed" style={{ color: colors.textSecondary }}>
                      {data.tier_description || `A focused recovery session to reset your suspension. ${day.duration_minutes} minutes of controlled flow to improve range of motion.`}
                    </p>
                    <div className="p-3 rounded-xl" style={{ background: colors.surfaceContainerLow, borderLeft: `3px solid ${colors.accent}` }}>
                      <p className="text-xs" style={{ color: colors.textMuted }}>
                        <span className="material-symbols-outlined text-xs align-middle mr-1" style={{ color: colors.accent }}>lightbulb</span>
                        {day.notes}
                      </p>
                    </div>
                    {/* CTA */}
                    <motion.button whileTap={{ scale: 0.97 }}
                      onClick={() => handleComplete(day.day)} disabled={isDone}
                      className="w-full py-3.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all"
                      style={isDone
                        ? { background: `${colors.tertiary}15`, color: colors.tertiary, border: `1px solid ${colors.tertiary}30` }
                        : { background: colors.tertiary, color: colors.onTertiaryContainer }
                      }>
                      {isDone ? "✓ RACE FINISHED · +10 XP EARNED" : "FINISH RACE · +10 XP"}
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Engine Performance stats */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
        <p className="text-xs font-black uppercase tracking-[0.12em] mb-4 text-center" style={{ color: colors.textMuted }}>Engine Performance</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "EFFICIENCY", value: Math.round((completedDays.size / Math.max(activeDays, 1)) * 100), color: colors.tertiary },
            { label: "GRIP", value: Math.round((weekTotal / 300) * 100), color: colors.accent },
            { label: "AERO", value: 42, color: "#818cf8" },
            { label: "FUELING", value: activeDays > 0 ? "Full" : "Empty", color: "#f87171", isText: true },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl p-4 clay-card" style={{ background: colors.surfaceContainerHigh }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: colors.textMuted }}>{stat.label}</span>
                <span className="text-sm font-bold" style={{ color: colors.textPrimary }}>
                  {typeof stat.value === "number" ? `${Math.min(stat.value, 100)}%` : stat.value}
                </span>
              </div>
              {typeof stat.value === "number" && (
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: `${stat.color}20` }}>
                  <motion.div className="h-full rounded-full"
                    style={{ background: stat.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(stat.value as number, 100)}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  />
                </div>
              )}
              {typeof stat.value === "string" && (
                <div className="w-full h-1.5 rounded-full" style={{ background: stat.color }} />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Avoid list */}
      {(data?.avoid ?? []).length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          className="mt-6 p-4 rounded-2xl clay-card" style={{ background: `${colors.error}08`, border: `1px solid ${colors.error}20` }}>
          <p className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: colors.error }}>⚠️ Avoid</p>
          <ul className="space-y-1.5">
            {(data?.avoid ?? []).map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs" style={{ color: colors.textMuted }}>
                <span className="mt-0.5 flex-shrink-0" style={{ color: `${colors.error}80` }}>✕</span>
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </PageShell>
  );
}

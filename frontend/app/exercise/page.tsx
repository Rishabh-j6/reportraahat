"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGUCStore } from "@/lib/store";
import { PageShell } from "@/components/ui";

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

const TIER_CONFIG: Record<string, { color: string; bg: string; icon: string; badge: string }> = {
  LIGHT_WALKING_ONLY: { color: "#22C55E", bg: "#22C55E15", icon: "🚶", badge: "Light Recovery" },
  CARDIO_RESTRICTED:  { color: "#06B6D4", bg: "#06B6D415", icon: "🧘", badge: "Low Intensity" },
  NORMAL_ACTIVITY:    { color: "#FF9933", bg: "#FF993315", icon: "🏃", badge: "Moderate" },
  ACTIVE_ENCOURAGED:  { color: "#EF4444", bg: "#EF444415", icon: "💪", badge: "Active" },
};

const INTENSITY_COLORS: Record<string, string> = {
  "Very Low": "#64748B", "Low": "#22C55E", "Low-Moderate": "#84CC16",
  "Moderate": "#FF9933", "Moderate-High": "#F97316", "High": "#EF4444",
  "Very High": "#DC2626", "Rest": "#334155",
};

const DAY_ABBR: Record<string, string> = {
  Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu",
  Friday: "Fri", Saturday: "Sat", Sunday: "Sun",
};

const FALLBACK_PLAN: ExerciseResponse = {
  tier: "NORMAL_ACTIVITY",
  tier_description: "Standard moderate activity plan. 30-minute sessions, 5 days a week.",
  general_advice: "Stay consistent. 5 days of 30 minutes beats 1 day of 2 hours. Drink water before and after.",
  avoid: ["Exercising on an empty stomach", "Skipping warm-up and cool-down", "Pushing through sharp pain"],
  weekly_plan: [
    { day: "Monday",    activity: "Brisk walking 30 min",                        duration_minutes: 30, intensity: "Moderate", notes: "Comfortable pace, slightly breathless." },
    { day: "Tuesday",   activity: "Bodyweight squats, push-ups, lunges",          duration_minutes: 30, intensity: "Moderate", notes: "3 sets of 12 reps each." },
    { day: "Wednesday", activity: "Yoga + stretching",                            duration_minutes: 30, intensity: "Low",      notes: "Active recovery. Focus on flexibility." },
    { day: "Thursday",  activity: "Brisk walk + light jog intervals",             duration_minutes: 35, intensity: "Moderate", notes: "3 min walk, 2 min jog. Repeat 5 times." },
    { day: "Friday",    activity: "Resistance band strength training",             duration_minutes: 30, intensity: "Moderate", notes: "Focus on compound movements." },
    { day: "Saturday",  activity: "Recreational activity — badminton or cycling", duration_minutes: 45, intensity: "Moderate", notes: "Make it fun and social!" },
    { day: "Sunday",    activity: "Rest day",                                     duration_minutes: 0,  intensity: "Rest",     notes: "Full rest. Light household activity fine." },
  ],
};

export default function ExercisePage() {
  const exerciseLevel  = useGUCStore((s) => s.exerciseLevel);
  const latestReport   = useGUCStore((s) => s.latestReport);
  const profile        = useGUCStore((s) => s.profile);
  const addXP          = useGUCStore((s) => s.addXP);
  const setAvatarState = useGUCStore((s) => s.setAvatarState);

  const [data, setData]                   = useState<ExerciseResponse | null>(null);
  const [loading, setLoading]             = useState(true);
  const [selectedDay, setSelectedDay]     = useState<string | null>(null);
  const [completedDays, setCompletedDays] = useState<Set<string>>(new Set());

  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  const severity = latestReport?.severity_level ?? "MILD_CONCERN";

  useEffect(() => {
    const TIER_MAP: Record<string, string> = {
      Beginner: "LIGHT_WALKING_ONLY",
      Intermediate: "NORMAL_ACTIVITY",
      Advanced: "ACTIVE_ENCOURAGED",
    };

    const fetchPlan = async () => {
      try {
        setLoading(true);
        // Backend expects POST /exercise/ with empty body (stub)
        const res = await fetch(`${API_BASE}/exercise/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        if (!res.ok) throw new Error();
        const json = await res.json();

        // Transform backend ExerciseResponse → frontend ExerciseResponse
        const transformed: ExerciseResponse = {
          tier: TIER_MAP[json.tier] ?? json.tier ?? "NORMAL_ACTIVITY",
          tier_description: json.tier_reason ?? json.tier_description ?? "",
          weekly_plan: json.weekly_plan ?? [],
          general_advice: json.encouragement ?? json.general_advice ?? "",
          avoid: json.restrictions ?? json.avoid ?? [],
        };
        setData(transformed);
        setSelectedDay("Monday");
      } catch {
        setData(FALLBACK_PLAN);
        setSelectedDay("Monday");
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [exerciseLevel, severity, API_BASE, profile.language]);

  const handleComplete = (day: string) => {
    if (completedDays.has(day)) return;
    setCompletedDays((prev) => new Set([...prev, day]));
    addXP(10);
    setAvatarState("HAPPY");
  };

  const tierCfg  = TIER_CONFIG[data?.tier ?? "NORMAL_ACTIVITY"] ?? TIER_CONFIG.NORMAL_ACTIVITY;
  const weekTotal = (data?.weekly_plan ?? []).reduce((s, d) => s + d.duration_minutes, 0);

  if (loading) {
    return (
      <PageShell>
        <div className="space-y-4">
          <div className="h-8 w-56 bg-white/5 rounded-xl animate-pulse" />
          <div className="h-28 bg-white/5 rounded-2xl animate-pulse" />
          <div className="flex gap-2">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex-1 h-16 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-40 bg-white/5 rounded-2xl animate-pulse" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">{tierCfg.icon}</span>
            <h1 className="text-xl font-bold tracking-tight">Exercise Plan</h1>
          </div>
          <p className="text-white/40 text-sm">Adapted to your health condition</p>
        </motion.div>

        {/* Tier banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mb-5 rounded-2xl p-4 border"
          style={{ background: tierCfg.bg, borderColor: `${tierCfg.color}30` }}
        >
          <div className="flex justify-between items-start gap-3 mb-2">
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: `${tierCfg.color}25`, color: tierCfg.color }}
            >
              {tierCfg.badge} Tier
            </span>
            <span className="text-white/40 text-xs">{weekTotal} min/week</span>
          </div>
          <p className="text-white/70 text-sm leading-relaxed">{data?.tier_description}</p>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="flex gap-2 mb-5"
        >
          {[
            { label: "Days Active",   value: (data?.weekly_plan ?? []).filter((d) => d.duration_minutes > 0).length },
            { label: "Total Minutes", value: weekTotal },
            { label: "Completed",     value: completedDays.size },
          ].map((stat) => (
            <div key={stat.label} className="flex-1 bg-white/[0.04] border border-white/[0.07] rounded-xl py-2.5 px-3 text-center">
              <div className="text-white font-bold text-lg">{stat.value}</div>
              <div className="text-white/30 text-[10px]">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Day selector */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {(data?.weekly_plan ?? []).map((day, i) => {
            const isRest     = day.duration_minutes === 0;
            const isDone     = completedDays.has(day.day);
            const isSelected = selectedDay === day.day;
            return (
              <motion.button
                key={day.day}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedDay(day.day)}
                className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl transition-all min-w-[52px]"
                style={
                  isSelected ? {
                    background: tierCfg.bg,
                    border: `1px solid ${tierCfg.color}60`,
                    boxShadow: `0 0 16px ${tierCfg.color}30`,
                  }
                  : isDone   ? { background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }
                  :            { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }
                }
              >
                <span className="text-[10px] text-white/40">{DAY_ABBR[day.day]}</span>
                <span className="text-base">{isDone ? "✅" : isRest ? "💤" : tierCfg.icon}</span>
                <span className="text-[9px] font-medium" style={{ color: isSelected ? tierCfg.color : "rgba(255,255,255,0.3)" }}>
                  {isRest ? "Rest" : `${day.duration_minutes}m`}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Day detail */}
        <AnimatePresence mode="wait">
          {selectedDay && data && (() => {
            const day = data.weekly_plan.find((d) => d.day === selectedDay);
            if (!day) return null;
            const isDone         = completedDays.has(day.day);
            const intensityColor = INTENSITY_COLORS[day.intensity] ?? "#FF9933";
            return (
              <motion.div
                key={selectedDay}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="mb-5 bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-white/[0.06] flex justify-between items-center">
                  <div>
                    <h3 className="text-white font-semibold text-sm">{day.day}</h3>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full mt-0.5 inline-block"
                      style={{ background: `${intensityColor}20`, color: intensityColor }}
                    >
                      {day.intensity}
                    </span>
                  </div>
                  {day.duration_minutes > 0 && (
                    <div className="text-right">
                      <div className="text-xl font-bold" style={{ color: tierCfg.color }}>{day.duration_minutes}</div>
                      <div className="text-white/30 text-[10px]">minutes</div>
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-3">
                  {day.duration_minutes === 0 ? (
                    <div className="text-center py-4">
                      <span className="text-4xl">💤</span>
                      <p className="text-white/40 text-sm mt-2">Full rest day. Your body repairs and grows stronger while you rest.</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{tierCfg.icon}</span>
                        <p className="text-white font-medium text-sm">{day.activity}</p>
                      </div>
                      <div className="bg-white/[0.03] rounded-xl p-3">
                        <p className="text-white/50 text-xs leading-relaxed">💡 {day.notes}</p>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleComplete(day.day)}
                        disabled={isDone}
                        className="w-full py-2.5 rounded-xl text-sm font-medium transition-all"
                        style={
                          isDone
                            ? { background: "rgba(34,197,94,0.1)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.2)" }
                            : { background: tierCfg.color, color: "#0d0d1a" }
                        }
                      >
                        {isDone ? "✓ Completed · +10 XP earned!" : "Mark Complete · +10 XP"}
                      </motion.button>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* General advice */}
        {data?.general_advice && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="mb-5 p-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl"
          >
            <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2">General Advice</p>
            <p className="text-white/60 text-sm leading-relaxed">{data.general_advice}</p>
          </motion.div>
        )}

        {/* Avoid list */}
        {(data?.avoid ?? []).length > 0 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            className="p-4 bg-red-500/5 border border-red-500/15 rounded-2xl"
          >
            <p className="text-red-400/80 text-[10px] uppercase tracking-widest mb-2">⚠️ Avoid</p>
            <ul className="space-y-1.5">
              {(data?.avoid ?? []).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-white/40 text-xs">
                  <span className="text-red-400/50 mt-0.5 flex-shrink-0">✕</span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
    </PageShell>
  );
}

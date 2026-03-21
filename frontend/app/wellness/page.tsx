"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useGUCStore } from "@/lib/store";
import MoodCheckIn from "@/components/MoodCheckIn";
import BreathingWidget from "@/components/BreathingWidget";

const AFFIRMATIONS = {
  high_stress: [
    "You came to the right place. Take 5 slow breaths right now. 💙",
    "Recovery is not a straight line. Every small step counts.",
    "Dr. Raahat believes in you. One breath at a time.",
  ],
  normal: [
    "You're making progress every single day. 🌱",
    "Consistency beats intensity. You're building healthy habits.",
    "Your body is doing its best. Support it with rest and good food.",
  ],
  great: [
    "You're thriving! Keep this momentum. 🌟",
    "High energy day — channel it into your health goals!",
    "This is what healing looks like. Celebrate the small wins.",
  ],
};

function getAffirmation(stress: number, sleep: number): string {
  const pool =
    stress <= 3 ? AFFIRMATIONS.high_stress
    : stress >= 8 && sleep >= 7 ? AFFIRMATIONS.great
    : AFFIRMATIONS.normal;
  return pool[Math.floor(Math.random() * pool.length)];
}

const MoodTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a2e] border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px]">
      <div style={{ color: "#FF9933" }}>Stress: {payload[0]?.value}</div>
      <div style={{ color: "#22C55E" }}>Sleep: {payload[1]?.value}</div>
    </div>
  );
};

type Tab = "mood" | "breathe" | "history";

export default function WellnessPage() {
  const mentalWellness = useGUCStore((s) => s.mentalWellness);
  const latestReport   = useGUCStore((s) => s.latestReport);

  const [activeTab, setActiveTab] = useState<Tab>("mood");

  const affirmation = getAffirmation(mentalWellness.stressLevel, mentalWellness.sleepQuality);

  const moodChartData = mentalWellness.moodHistory.slice(-10).map((entry) => ({
    date: new Date(entry.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    stress: entry.stress,
    sleep: entry.sleep,
  }));

  const recentHistory = mentalWellness.moodHistory.slice(-7);
  const avgStress = recentHistory.length
    ? Math.round(recentHistory.reduce((s, e) => s + e.stress, 0) / recentHistory.length)
    : mentalWellness.stressLevel;
  const avgSleep = recentHistory.length
    ? (recentHistory.reduce((s, e) => s + e.sleep, 0) / recentHistory.length).toFixed(1)
    : mentalWellness.sleepQuality;

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: "mood",    label: "Check-in", icon: "😊" },
    { key: "breathe", label: "Breathe",  icon: "🫁" },
    { key: "history", label: "History",  icon: "📈" },
  ];

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white">
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 30% 40%, #6366F1 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, #22C55E 0%, transparent 50%)",
        }}
      />

      <div className="relative max-w-2xl mx-auto px-4 py-6 pb-24">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">🧘</span>
            <h1 className="text-xl font-bold tracking-tight">Mental Wellness</h1>
          </div>
          <p className="text-white/40 text-sm">Recovery is physical AND mental</p>
        </motion.div>

        {/* Affirmation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mb-5 p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/15"
        >
          <p className="text-indigo-200/80 text-sm leading-relaxed italic">"{affirmation}"</p>
          <p className="text-indigo-400/40 text-xs mt-2">— Dr. Raahat</p>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="flex gap-2 mb-5"
        >
          {[
            { label: "Avg Stress", value: `${avgStress}/10`, color: avgStress <= 3 ? "#EF4444" : avgStress >= 7 ? "#22C55E" : "#FF9933", icon: "🧠" },
            { label: "Avg Sleep",  value: `${avgSleep}/10`,  color: Number(avgSleep) >= 7 ? "#22C55E" : Number(avgSleep) <= 4 ? "#EF4444" : "#FF9933", icon: "🌙" },
            { label: "Streak",     value: `${mentalWellness.moodHistory.length}d`, color: "#6366F1", icon: "🔥" },
          ].map((stat) => (
            <div key={stat.label} className="flex-1 bg-white/[0.04] border border-white/[0.07] rounded-xl py-2.5 px-3 text-center">
              <div className="text-base mb-0.5">{stat.icon}</div>
              <div className="font-bold text-sm" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-white/30 text-[10px]">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Report mental health note */}
        {latestReport && mentalWellness.stressLevel <= 4 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mb-5 p-3.5 rounded-xl bg-orange-500/8 border border-orange-500/15"
          >
            <p className="text-orange-300/70 text-xs leading-relaxed">
              🩺 Your recent report showed{" "}
              <strong className="text-orange-300/90">
                {latestReport.severity_level.replace("_", " ").toLowerCase()}
              </strong>
              . Medical stress is real. Talking to Dr. Raahat in the chat can help reduce anxiety about your results.
            </p>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-1.5 mb-5 p-1 bg-white/[0.04] rounded-xl border border-white/[0.07]">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all"
              style={
                activeTab === tab.key
                  ? { background: "rgba(255,255,255,0.1)", color: "white" }
                  : { color: "rgba(255,255,255,0.35)" }
              }
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">

          {activeTab === "mood" && (
            <motion.div
              key="mood"
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              <MoodCheckIn />
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4">
                <p className="text-white/40 text-[10px] uppercase tracking-widest mb-3">Why Sleep Matters for Recovery</p>
                <div className="space-y-2.5">
                  {[
                    { icon: "🩸", text: "Iron is absorbed better when you sleep 7+ hours" },
                    { icon: "🦴", text: "Bone repair and Vitamin D activation happen during deep sleep" },
                    { icon: "🛡️", text: "Immune system strengthens during sleep cycles" },
                    { icon: "🧠", text: "Stress hormones drop by 30% after a full night of sleep" },
                  ].map((tip, i) => (
                    <div key={i} className="flex gap-2.5 items-start">
                      <span className="text-sm flex-shrink-0 mt-0.5">{tip.icon}</span>
                      <p className="text-white/45 text-xs leading-relaxed">{tip.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "breathe" && (
            <motion.div
              key="breathe"
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              <BreathingWidget />
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4">
                <p className="text-white/40 text-[10px] uppercase tracking-widest mb-3">Why 4-7-8 Breathing Works</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { phase: "4", label: "Inhale", color: "#FF9933", note: "Activates parasympathetic system" },
                    { phase: "7", label: "Hold",   color: "#6366F1", note: "Oxygen saturates bloodstream" },
                    { phase: "8", label: "Exhale", color: "#22C55E", note: "CO₂ released, stress drops" },
                  ].map((p) => (
                    <div key={p.label} className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
                      <div className="text-2xl font-bold mb-1" style={{ color: p.color }}>{p.phase}s</div>
                      <div className="text-white/60 text-[10px] font-medium mb-1">{p.label}</div>
                      <div className="text-white/25 text-[9px] leading-snug">{p.note}</div>
                    </div>
                  ))}
                </div>
                <p className="text-white/25 text-[10px] text-center mt-3">
                  Practice 2× daily for 4 weeks to significantly reduce chronic stress
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              {moodChartData.length >= 2 ? (
                <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-white/60 text-xs font-medium">Last {moodChartData.length} check-ins</p>
                    <div className="flex gap-3 text-[10px] text-white/30">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-0.5 bg-[#FF9933] inline-block rounded" />Stress
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-0.5 bg-[#22C55E] inline-block rounded" />Sleep
                      </span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={moodChartData}>
                      <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<MoodTooltip />} />
                      <Line type="monotone" dataKey="stress" stroke="#FF9933" strokeWidth={2} dot={{ fill: "#FF9933", r: 3 }} activeDot={{ r: 5 }} />
                      <Line type="monotone" dataKey="sleep"  stroke="#22C55E" strokeWidth={2} dot={{ fill: "#22C55E", r: 3 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-8 text-center">
                  <p className="text-4xl mb-3">📊</p>
                  <p className="text-white/40 text-sm">Complete at least 2 mood check-ins to see your history chart.</p>
                  <p className="text-white/20 text-xs mt-1">Come back daily for best insights</p>
                </div>
              )}

              {mentalWellness.moodHistory.length > 0 && (
                <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/[0.06]">
                    <p className="text-white/40 text-[10px] uppercase tracking-widest">Check-in Log</p>
                  </div>
                  <div className="divide-y divide-white/[0.04]">
                    {[...mentalWellness.moodHistory].reverse().slice(0, 10).map((entry, i) => (
                      <div key={i} className="px-4 py-2.5 flex justify-between items-center">
                        <span className="text-white/30 text-xs">
                          {new Date(entry.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                        </span>
                        <div className="flex gap-4 text-xs">
                          <span style={{ color: entry.stress <= 3 ? "#EF4444" : entry.stress >= 7 ? "#22C55E" : "#FF9933" }}>
                            😰 {entry.stress}/10
                          </span>
                          <span style={{ color: entry.sleep >= 7 ? "#22C55E" : entry.sleep <= 4 ? "#EF4444" : "#FF9933" }}>
                            🌙 {entry.sleep}/10
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

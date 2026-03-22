"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGUCStore } from "@/lib/store";
import { colors, racingLabels } from "@/lib/tokens";

type WellnessTab = "CHECK-IN" | "BREATHE" | "STATS";

const BREATHE_PHASES = [
  { label: "INHALE", seconds: 4, instruction: "Breathe in deeply through your nose" },
  { label: "HOLD", seconds: 7, instruction: "Hold your breath — feel the calm" },
  { label: "EXHALE", seconds: 8, instruction: "Slowly breathe out through your mouth" },
];

const AFFIRMATIONS = [
  "LEVEL UP YOUR PEACE! Take a breath, player. You're doing amazing today!",
  "Your engine runs better when you rest. Pit stops win races!",
  "Champions take care of their mental oil pressure.",
  "Deep breaths = turbo boost for your mind.",
];

export default function WellnessPage() {
  const profile = useGUCStore((s) => s.profile);
  const mentalWellness = useGUCStore((s) => s.mentalWellness);
  const setMentalWellness = useGUCStore((s) => s.mentalWellness);
  const addXP = useGUCStore((s) => s.addXP);

  const [tab, setTab] = useState<WellnessTab>("CHECK-IN");
  const [stress, setStress] = useState(mentalWellness.stressLevel);
  const [sleep, setSleep] = useState(mentalWellness.sleepQuality);
  const [saved, setSaved] = useState(false);

  // Breathing
  const [breathing, setBreathing] = useState(false);
  const [phase, setPhase] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [cycles, setCycles] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Affirmation
  const [affirmation] = useState(() => AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]);

  const stressLabel = stress <= 3 ? "MELLOW" : stress <= 6 ? "MODERATE" : "HIGH RPM";
  const sleepHours = Math.floor(sleep * 1.2);
  const sleepMins = Math.round((sleep * 1.2 - sleepHours) * 60);

  const handleSaveCheckIn = () => {
    setMentalWellness({ stressLevel: stress, sleepQuality: sleep });
    addXP(5);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Breathing timer
  useEffect(() => {
    if (!breathing) return;
    setCountdown(BREATHE_PHASES[phase].seconds);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          setPhase((p) => {
            const next = (p + 1) % BREATHE_PHASES.length;
            if (next === 0) setCycles((cy) => cy + 1);
            return next;
          });
          return BREATHE_PHASES[(phase + 1) % BREATHE_PHASES.length].seconds;
        }
        return c - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [breathing, phase]);

  const toggleBreathing = () => {
    if (breathing) {
      setBreathing(false);
      setPhase(0);
      setCountdown(0);
      if (cycles >= 1) { addXP(10); }
    } else {
      setBreathing(true);
      setCycles(0);
    }
  };

  return (
    <div className="min-h-screen starfield" style={{ background: "#0f4f5c" }}>
      {/* Teal ambient glow */}
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(6,182,212,0.08) 0%, transparent 60%)" }} />

      <div className="relative max-w-2xl mx-auto px-4 pt-24 pb-32">

        {/* Affirmation card — Dr. Raahat */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-5 rounded-xl clay-card flex items-start gap-4"
          style={{ background: "#22C55E", border: "1px solid rgba(255,255,255,0.15)" }}>
          <div className="w-14 h-14 rounded-lg flex-shrink-0 flex items-center justify-center text-2xl"
            style={{ background: "rgba(0,0,0,0.15)" }}>
            🧑‍⚕️
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-snug">&ldquo;{affirmation}&rdquo;</p>
            <p className="text-[10px] font-mono uppercase tracking-widest mt-2" style={{ color: "rgba(255,255,255,0.6)" }}>
              Mindset Coach · Ra-a-hat
            </p>
          </div>
        </motion.div>

        {/* Quick stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="rounded-xl p-3" style={{ background: "#22C55E" }}>
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.7)" }}>Stress</p>
            <p className="text-lg font-headline font-black text-white">{stressLabel}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-xl p-3" style={{ background: "#06B6D4" }}>
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.7)" }}>Sleep</p>
            <p className="text-lg font-headline font-black text-white">{sleepHours}H {sleepMins}M</p>
            <span className="material-symbols-outlined absolute top-2 right-2 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>dark_mode</span>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="rounded-xl p-3" style={{ background: "#FF9933" }}>
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.7)" }}>Streak</p>
            <p className="text-lg font-headline font-black text-white">{mentalWellness.streak || 0} DAYS</p>
          </motion.div>
        </div>

        {/* Tab bar — retro arcade style */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: colors.surfaceContainerHigh }}>
          {(["CHECK-IN", "BREATHE", "STATS"] as WellnessTab[]).map((t) => (
            <motion.button key={t} onClick={() => setTab(t)}
              className="flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
              style={{
                background: tab === t ? (t === "CHECK-IN" ? "#22C55E" : t === "BREATHE" ? "#06B6D4" : colors.surfaceVariant) : "transparent",
                color: tab === t ? "#ffffff" : colors.textFaint,
              }}
              whileTap={{ scale: 0.97 }}
            >
              {t === "CHECK-IN" && "😊"}{t === "BREATHE" && "🫁"}{t === "STATS" && "📊"} {t}
            </motion.button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {tab === "CHECK-IN" && (
            <motion.div key="checkin" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div className="rounded-2xl p-6 clay-card space-y-6" style={{ background: colors.surfaceContainer }}>
                <h3 className="font-headline text-lg font-bold text-white">Daily Check-In</h3>
                {/* Stress */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider" style={{ color: colors.textMuted }}>Stress Level</label>
                    <span className="text-xs font-bold" style={{ color: stress <= 3 ? "#22C55E" : stress <= 6 ? "#F59E0B" : "#EF4444" }}>
                      {stressLabel} ({stress}/10)
                    </span>
                  </div>
                  <input type="range" min={1} max={10} value={stress} onChange={(e) => setStress(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(90deg, #22C55E ${(stress - 1) * 11.1}%, ${colors.surfaceContainerHigh} ${(stress - 1) * 11.1}%)` }}
                  />
                  <div className="flex justify-between text-[10px] mt-1" style={{ color: colors.textFaint }}>
                    <span>😌 Calm</span><span>😰 Stressed</span>
                  </div>
                </div>
                {/* Sleep */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider" style={{ color: colors.textMuted }}>Sleep Quality</label>
                    <span className="text-xs font-bold" style={{ color: "#06B6D4" }}>
                      {sleep <= 3 ? "Poor" : sleep <= 6 ? "Okay" : "Great"} ({sleep}/10)
                    </span>
                  </div>
                  <input type="range" min={1} max={10} value={sleep} onChange={(e) => setSleep(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(90deg, #06B6D4 ${(sleep - 1) * 11.1}%, ${colors.surfaceContainerHigh} ${(sleep - 1) * 11.1}%)` }}
                  />
                  <div className="flex justify-between text-[10px] mt-1" style={{ color: colors.textFaint }}>
                    <span>😫 Terrible</span><span>😴 Amazing</span>
                  </div>
                </div>
                {/* Save */}
                <motion.button onClick={handleSaveCheckIn}
                  className="w-full py-3 rounded-xl text-sm font-black uppercase tracking-wider"
                  style={{
                    background: saved ? `${colors.tertiary}15` : "#22C55E",
                    color: saved ? colors.tertiary : "#ffffff",
                    border: saved ? `1px solid ${colors.tertiary}30` : "none",
                  }}
                  whileTap={{ scale: 0.97 }}>
                  {saved ? "✓ LOGGED · +5 XP" : "LOG CHECK-IN · +5 XP"}
                </motion.button>
              </div>
            </motion.div>
          )}

          {tab === "BREATHE" && (
            <motion.div key="breathe" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div className="text-center mb-6">
                <h2 className="font-headline text-3xl font-black tracking-tight" style={{ color: "#ffffff", fontFamily: "monospace" }}>
                  4-7-8 SYNC
                </h2>
                <p className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: "#22C55E" }}>
                  Calm the engine. Reset the race.
                </p>
              </div>

              {/* Breathing circle */}
              <div className="flex justify-center mb-8">
                <div className="relative w-56 h-56 flex items-center justify-center">
                  {/* Dashed orbit ring */}
                  <motion.div className="absolute inset-0 rounded-full"
                    style={{ border: "3px dashed rgba(6,182,212,0.3)" }}
                    animate={breathing ? { rotate: 360 } : {}}
                    transition={{ duration: 19, repeat: Infinity, ease: "linear" }}
                  />
                  {/* Main circle */}
                  <motion.div
                    className="w-44 h-44 rounded-full flex items-center justify-center"
                    style={{
                      background: breathing ? "#22C55E" : "rgba(34,197,94,0.2)",
                      border: "3px solid rgba(34,197,94,0.5)",
                      boxShadow: breathing ? "0 0 40px rgba(34,197,94,0.4)" : "none",
                    }}
                    animate={breathing ? {
                      scale: phase === 0 ? [1, 1.15] : phase === 1 ? 1.15 : [1.15, 1],
                    } : { scale: 1 }}
                    transition={{
                      duration: BREATHE_PHASES[phase]?.seconds || 4,
                      ease: "easeInOut",
                    }}
                  >
                    <div className="text-center">
                      {breathing ? (
                        <>
                          <p className="font-headline text-2xl font-black text-white uppercase">{BREATHE_PHASES[phase].label}</p>
                          <p className="text-4xl font-black text-white mt-1">{countdown}</p>
                        </>
                      ) : (
                        <p className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.6)" }}>TAP START</p>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Controls */}
              <motion.button onClick={toggleBreathing}
                className="w-full py-3.5 rounded-xl text-sm font-black uppercase tracking-wider"
                style={{
                  background: breathing ? colors.surfaceContainerHigh : "#22C55E",
                  color: breathing ? "#ffffff" : "#ffffff",
                  border: breathing ? `1px solid ${colors.border}` : "none",
                }}
                whileTap={{ scale: 0.97 }}>
                {breathing ? "STOP ENGINE" : "START 4-7-8 SYNC"}
              </motion.button>

              {cycles > 0 && (
                <p className="text-xs text-center mt-3" style={{ color: colors.textMuted }}>
                  {cycles} cycle{cycles > 1 ? "s" : ""} completed · +{cycles * 10} XP earned
                </p>
              )}

              {/* How it works */}
              <div className="mt-6 p-4 rounded-xl clay-card" style={{ background: colors.surfaceContainer }}>
                <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: "#06B6D4" }}>How it works</p>
                <div className="flex gap-3">
                  {BREATHE_PHASES.map((p, i) => (
                    <div key={i} className="flex-1 text-center p-2 rounded-lg" style={{ background: colors.surfaceContainerLow }}>
                      <p className="font-headline text-lg font-black" style={{ color: "#22C55E" }}>{p.seconds}s</p>
                      <p className="text-[10px] font-bold uppercase" style={{ color: colors.textFaint }}>{p.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {tab === "STATS" && (
            <motion.div key="stats" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div className="rounded-2xl p-6 clay-card" style={{ background: colors.surfaceContainer }}>
                <h3 className="font-headline text-lg font-bold text-white mb-4">Wellness History</h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl" style={{ background: colors.surfaceContainerLowest }}>
                    <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: "#22C55E" }}>Avg. Stress</p>
                    <p className="font-headline text-2xl font-bold text-white">{mentalWellness.stressLevel || stress}/10</p>
                    <div className="w-full h-1.5 rounded-full mt-2 overflow-hidden" style={{ background: "rgba(34,197,94,0.15)" }}>
                      <motion.div className="h-full rounded-full" style={{ background: "#22C55E" }}
                        initial={{ width: 0 }} animate={{ width: `${((mentalWellness.stressLevel || stress) / 10) * 100}%` }} />
                    </div>
                  </div>
                  <div className="p-4 rounded-xl" style={{ background: colors.surfaceContainerLowest }}>
                    <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: "#06B6D4" }}>Avg. Sleep</p>
                    <p className="font-headline text-2xl font-bold text-white">{mentalWellness.sleepQuality || sleep}/10</p>
                    <div className="w-full h-1.5 rounded-full mt-2 overflow-hidden" style={{ background: "rgba(6,182,212,0.15)" }}>
                      <motion.div className="h-full rounded-full" style={{ background: "#06B6D4" }}
                        initial={{ width: 0 }} animate={{ width: `${((mentalWellness.sleepQuality || sleep) / 10) * 100}%` }} />
                    </div>
                  </div>
                  <div className="p-4 rounded-xl" style={{ background: colors.surfaceContainerLowest }}>
                    <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: "#FF9933" }}>Breathing Cycles</p>
                    <p className="font-headline text-2xl font-bold text-white">{cycles}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

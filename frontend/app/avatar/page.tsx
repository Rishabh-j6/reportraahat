"use client"
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const LEVELS = [
  { level: 1, emoji: "😔", title: "Rogi", color: "#EF4444", xp: 0 },
  { level: 2, emoji: "🙂", title: "Jagruk", color: "#F59E0B", xp: 150 },
  { level: 3, emoji: "💪", title: "Swasth", color: "#10B981", xp: 300 },
  { level: 4, emoji: "⚔️", title: "Yoddha", color: "#3B82F6", xp: 500 },
  { level: 5, emoji: "👑", title: "Nirogh", color: "#A855F7", xp: 750 },
];

const XP_ACTIONS = [
  { emoji: "📄", text: "Report upload karo", xp: 50 },
  { emoji: "✅", text: "Checklist complete karo", xp: 20 },
  { emoji: "💬", text: "5 messages bhejo", xp: 5 },
  { emoji: "🥗", text: "Meal log karo", xp: 15 },
  { emoji: "🏃", text: "Exercise karo", xp: 10 },
  { emoji: "😊", text: "Mood check-in karo", xp: 5 },
  { emoji: "🔥", text: "7-day streak banao", xp: 25 },
  { emoji: "📤", text: "Family se share karo", xp: 30 },
];

const currentXP = 240;
const currentLevel = 2;

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
});

export default function AvatarPage() {
  const router = useRouter();
  const lvl = LEVELS[currentLevel - 1];
  const nextLvl = LEVELS[currentLevel];
  const progress = nextLvl
    ? ((currentXP - lvl.xp) / (nextLvl.xp - lvl.xp)) * 100
    : 100;

  return (
    <div className="min-h-screen px-4 py-6 pb-24" style={{ background: "#0F172A", color: "#fff" }}>
      <motion.button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-1 text-sm"
        style={{ color: "#94A3B8" }}
        {...fade()}
      >
        <ArrowLeft size={18} /> Back
      </motion.button>

      <motion.h1
        className="mb-6 text-2xl font-bold"
        style={{ color: "#FF9933" }}
        {...fade(0.05)}
      >
        ⚡ Mera Avatar
      </motion.h1>

      {/* Main card */}
      <motion.div
        className="mb-8 rounded-2xl p-6 text-center"
        style={{
          border: `2px solid ${lvl.color}`,
          background: `${lvl.color}15`,
        }}
        {...fade(0.1)}
      >
        <div className="text-7xl mb-3">{lvl.emoji}</div>
        <div className="text-2xl font-bold mb-1">{lvl.title}</div>
        <div className="text-sm mb-4" style={{ color: "#94A3B8" }}>
          Level {currentLevel}
        </div>
        <div className="w-full rounded-full h-3 mb-2" style={{ background: "#1E293B" }}>
          <motion.div
            className="h-3 rounded-full"
            style={{ background: lvl.color }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </div>
        <div className="text-xs" style={{ color: "#94A3B8" }}>
          {currentXP} XP → {nextLvl?.xp ?? "MAX"} XP to Level {currentLevel + 1}
        </div>
      </motion.div>

      {/* Level roadmap */}
      <motion.div className="mb-8" {...fade(0.2)}>
        <h2 className="text-lg font-bold mb-4">🗺️ Level Journey</h2>
        <div className="flex flex-col gap-3">
          {LEVELS.map((l) => {
            const completed = l.level < currentLevel;
            const current = l.level === currentLevel;
            const future = l.level > currentLevel;
            return (
              <motion.div
                key={l.level}
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{
                  border: current ? `2px solid ${l.color}` : "2px solid transparent",
                  background: current ? `${l.color}15` : "#1E293B",
                  opacity: future ? 0.4 : completed ? 0.65 : 1,
                }}
                {...fade(0.2 + l.level * 0.05)}
              >
                <span className="text-3xl">{l.emoji}</span>
                <div className="flex-1">
                  <div className="font-semibold">{l.title}</div>
                  <div className="text-xs" style={{ color: "#94A3B8" }}>
                    Level {l.level}
                  </div>
                </div>
                {completed && <span className="text-lg">✅</span>}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* XP guide */}
      <motion.div {...fade(0.4)}>
        <h2 className="text-lg font-bold mb-4">💰 XP Kaise Kamayein</h2>
        <div className="grid grid-cols-2 gap-3">
          {XP_ACTIONS.map((a, i) => (
            <motion.div
              key={i}
              className="rounded-xl px-3 py-4 text-center"
              style={{ background: "#1E293B" }}
              {...fade(0.4 + i * 0.04)}
            >
              <div className="text-2xl mb-1">{a.emoji}</div>
              <div className="text-xs mb-1">{a.text}</div>
              <div className="text-sm font-bold" style={{ color: "#FF9933" }}>
                +{a.xp} XP
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

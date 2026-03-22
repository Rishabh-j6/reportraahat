"use client"

import { useGUCStore } from "@/lib/store"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { PageShell, PageHeader, Card, SectionLabel, Banner } from "@/components/ui"
import { motionPresets, colors } from "@/lib/tokens"

const LEVELS = [
  { level: 1, emoji: "😔", title: "Rogi", color: "#EF4444", xp: 0 },
  { level: 2, emoji: "🙂", title: "Jagruk", color: "#F59E0B", xp: 150 },
  { level: 3, emoji: "💪", title: "Swasth", color: "#10B981", xp: 300 },
  { level: 4, emoji: "⚔️", title: "Yoddha", color: "#3B82F6", xp: 500 },
  { level: 5, emoji: "👑", title: "Nirogh", color: "#A855F7", xp: 750 },
]

const XP_ACTIONS = [
  { emoji: "📄", text: "Report upload karo", xp: 50 },
  { emoji: "✅", text: "Checklist complete karo", xp: 20 },
  { emoji: "💬", text: "5 messages bhejo", xp: 5 },
  { emoji: "🥗", text: "Meal log karo", xp: 15 },
  { emoji: "🏃", text: "Exercise karo", xp: 10 },
  { emoji: "😊", text: "Mood check-in karo", xp: 5 },
  { emoji: "🔥", text: "7-day streak banao", xp: 25 },
  { emoji: "📤", text: "Family se share karo", xp: 30 },
]

export default function AvatarPage() {
  const router = useRouter()
  const { avatarXP: currentXP } = useGUCStore()
  const currentLevel = currentXP >= 750 ? 5 : currentXP >= 500 ? 4 : currentXP >= 300 ? 3 : currentXP >= 150 ? 2 : 1

  const lvl = LEVELS[currentLevel - 1]
  const nextLvl = LEVELS[currentLevel]
  const progress = nextLvl
    ? ((currentXP - lvl.xp) / (nextLvl.xp - lvl.xp)) * 100
    : 100

  return (
    <PageShell>

      {/* Back button */}
      <motion.button
        onClick={() => router.back()}
        className="mb-5 flex items-center gap-1.5 text-sm transition-colors"
        style={{ color: colors.textMuted }}
        whileHover={{ color: colors.textPrimary }}
        {...motionPresets.fadeIn}
      >
        <ArrowLeft size={16} /> Back
      </motion.button>

      <PageHeader icon="⚡" title="Mera Avatar" subtitle="Apni health journey track karo" />

      {/* Main level card */}
      <motion.div
        {...motionPresets.fadeUp}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="mb-6 rounded-2xl p-6 text-center"
        style={{
          border: `2px solid ${lvl.color}`,
          background: `${lvl.color}15`,
        }}
      >
        <div className="text-7xl mb-3">{lvl.emoji}</div>
        <div className="text-2xl font-bold mb-1 text-white">{lvl.title}</div>
        <div className="text-sm mb-5" style={{ color: colors.textMuted }}>Level {currentLevel}</div>

        {/* XP Progress bar */}
        <div className="w-full rounded-full h-2.5 mb-2" style={{ background: colors.bgSubtle }}>
          <motion.div
            className="h-2.5 rounded-full"
            style={{ background: lvl.color }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.9, delay: 0.4, ease: "easeOut" }}
          />
        </div>
        <div className="text-xs" style={{ color: colors.textFaint }}>
          {currentXP} XP → {nextLvl?.xp ?? "MAX"} XP to Level {currentLevel + 1}
        </div>
      </motion.div>

      {/* Level roadmap */}
      <SectionLabel>🗺️ Level Journey</SectionLabel>
      <div className="flex flex-col gap-2.5 mb-6">
        {LEVELS.map((l, i) => {
          const completed = l.level < currentLevel
          const current = l.level === currentLevel
          const future = l.level > currentLevel
          return (
            <motion.div
              key={l.level}
              className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{
                border: current ? `2px solid ${l.color}` : `1px solid ${colors.border}`,
                background: current ? `${l.color}15` : colors.bgCard,
                opacity: future ? 0.4 : completed ? 0.7 : 1,
              }}
              {...motionPresets.fadeUp}
              transition={{ duration: 0.3, delay: 0.15 + i * 0.05 }}
            >
              <span className="text-2xl">{l.emoji}</span>
              <div className="flex-1">
                <div className="font-semibold text-white text-sm">{l.title}</div>
                <div className="text-xs" style={{ color: colors.textMuted }}>
                  Level {l.level} · {l.xp} XP
                </div>
              </div>
              {completed && <span className="text-sm" style={{ color: colors.ok }}>✓ Done</span>}
              {current && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{ background: `${l.color}25`, color: l.color }}>
                  Current
                </span>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* XP guide */}
      <SectionLabel>💰 XP Kaise Kamayein</SectionLabel>
      <div className="grid grid-cols-2 gap-2.5">
        {XP_ACTIONS.map((a, i) => (
          <motion.div
            key={i}
            className="rounded-xl px-3 py-4 text-center"
            style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}
            {...motionPresets.fadeUp}
            transition={{ duration: 0.3, delay: 0.2 + i * 0.04 }}
          >
            <div className="text-2xl mb-1.5">{a.emoji}</div>
            <div className="text-xs mb-1.5" style={{ color: colors.textMuted }}>{a.text}</div>
            <div className="text-sm font-bold" style={{ color: colors.accent }}>+{a.xp} XP</div>
          </motion.div>
        ))}
      </div>

    </PageShell>
  )
}
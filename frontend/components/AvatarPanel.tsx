"use client"
import { motion } from "framer-motion"
import { useGUCStore } from "@/lib/store"

export default function AvatarPanel() {
  const { avatarState, avatarXP } = useGUCStore()
  const avatarLevel = avatarXP >= 750 ? 5 : avatarXP >= 500 ? 4 : avatarXP >= 300 ? 3 : avatarXP >= 150 ? 2 : 1

  const levelColors = ["", "#94a3b8", "#f97316", "#22c55e", "#3b82f6", "#fbbf24"]
  const levelTitles = ["", "Rogi", "Jagruk", "Swasth", "Yoddha", "Nirogh"]
  const color = levelColors[avatarLevel]

  const stateLabel: Record<string, string> = {
    THINKING:  "Soch raha hoon...",
    ANALYZING: "Analyze ho raha hai...",
    HAPPY:     "Shabash! 🎉",
    LEVEL_UP:  "Level Up! ⚡",
    SPEAKING:  "Sun lo...",
    CONCERNED: "Dhyan do...",
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-1.5">

      {/* State tooltip */}
      {avatarState !== "IDLE" && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.9 }}
          className="text-xs px-3 py-1.5 rounded-xl mb-1 text-center"
          style={{
            background: "rgba(13,13,26,0.9)",
            border: "1px solid rgba(255,153,51,0.25)",
            color: "#FF9933",
            backdropFilter: "blur(8px)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            whiteSpace: "nowrap",
          }}
        >
          {stateLabel[avatarState]}
        </motion.div>
      )}

      {/* Pulse ring (active when not IDLE) */}
      <div className="relative">
        {avatarState !== "IDLE" && (
          <>
            <span
              className="absolute inset-0 rounded-full"
              style={{
                border: `2px solid ${color}`,
                animation: "pulseRing 1.8s ease-out infinite",
              }}
            />
            <span
              className="absolute inset-0 rounded-full"
              style={{
                border: `2px solid ${color}`,
                animation: "pulseRing 1.8s ease-out 0.6s infinite",
              }}
            />
          </>
        )}

        {/* Avatar circle */}
        <motion.div
          className="w-14 h-14 rounded-full flex items-center justify-center text-2xl relative"
          style={{
            background: "rgba(13,13,26,0.95)",
            border: `2px solid ${color}`,
            boxShadow: `0 0 16px ${color}40`,
          }}
          whileHover={{ scale: 1.08 }}
          animate={avatarState === "HAPPY" ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.4 }}
        >
          🤖
        </motion.div>
      </div>

      {/* XP bar */}
      <div className="w-14 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
        <motion.div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            background: `linear-gradient(90deg, ${color}, ${color}aa)`,
            width: `${Math.min((avatarXP % 250) / 250 * 100, 100)}%`,
            boxShadow: `0 0 6px ${color}`,
          }}
        />
      </div>

      {/* Level label */}
      <span className="text-[9px] font-medium" style={{ color: "rgba(255,255,255,0.3)" }}>
        Lv.{avatarLevel} {levelTitles[avatarLevel]}
      </span>
    </div>
  )
}

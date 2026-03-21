"use client"
import { useGUCStore } from "@/lib/store"

export default function AvatarPanel() {
  const { avatarState, avatarXP } = useGUCStore()
  const avatarLevel = avatarXP >= 750 ? 5 : avatarXP >= 500 ? 4 : avatarXP >= 300 ? 3 : avatarXP >= 150 ? 2 : 1

  const levelColors = ["", "#94a3b8", "#f97316", "#22c55e", "#3b82f6", "#fbbf24"]
  const levelTitles = ["", "Rogi", "Jagruk", "Swasth", "Yoddha", "Nirogh"]
  const color = levelColors[avatarLevel]

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-1">

      {/* State tooltip */}
      {avatarState !== "IDLE" && (
        <div className="text-xs px-2 py-1 rounded-full bg-slate-800 border
          border-slate-600 text-[#FF9933] whitespace-nowrap mb-1">
          {avatarState === "THINKING" && "Soch raha hoon..."}
          {avatarState === "ANALYZING" && "Analyze ho raha hai..."}
          {avatarState === "HAPPY" && "Shabash! 🎉"}
          {avatarState === "LEVEL_UP" && "Level Up! ⚡"}
          {avatarState === "SPEAKING" && "Sun lo..."}
          {avatarState === "CONCERNED" && "Dhyan do..."}
        </div>
      )}

      {/* Avatar circle */}
      <div
        className="w-16 h-16 rounded-full bg-slate-900 border-2
          flex items-center justify-center text-2xl"
        style={{ borderColor: color }}
      >
        🤖
      </div>

      {/* XP bar */}
      <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            background: color,
            width: `${Math.min((avatarXP % 250) / 250 * 100, 100)}%`
          }}
        />
      </div>

      {/* Level label */}
      <span className="text-[10px] text-slate-500 font-medium">
        Lv.{avatarLevel} {levelTitles[avatarLevel]} • {avatarXP}xp
      </span>
    </div>
  )
}

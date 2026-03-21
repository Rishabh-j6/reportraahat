// OWNER: Member 3
// Fixed bottom-right Lottie avatar
// Reads avatarState from GUC store
// 9 states: IDLE, WAVING, THINKING, ANALYZING, SPEAKING, HAPPY, LEVEL_UP, CONCERNED, CELEBRATING
// Falls back to animated SVG if Lottie file missing
// Shows XP bar + level label underneath
//
// Lottie files to download from lottiefiles.com (search "robot doctor"):
//   public/lottie/idle.json
//   public/lottie/thinking.json
//   public/lottie/happy.json
//   public/lottie/levelup.json
//   public/lottie/concerned.json
//   public/lottie/celebrating.json

import { AvatarState } from "@/lib/store"

interface AvatarPanelProps {
  avatarState?: AvatarState
  avatarLevel?: number
  avatarXP?: number
}

export default function AvatarPanel({
  avatarState = "IDLE",
  avatarLevel = 1,
  avatarXP = 0,
}: AvatarPanelProps) {
  // TODO Member 3: implement full Lottie state machine
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-1">
      <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-primary
        flex items-center justify-center text-2xl">
        🤖
      </div>
      <span className="text-[10px] text-slate-500">
        Lv.{avatarLevel} • {avatarXP}xp
      </span>
    </div>
  )
}

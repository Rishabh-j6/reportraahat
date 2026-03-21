// OWNER: Member 3
// Slide-out chat panel from right side
// - User bubbles: saffron (#FF9933) left border
// - Dr. Raahat bubbles: slate background + stethoscope icon
// - Words stream in one-by-one as response arrives
// - 3 rotating suggestion chips from GUC findings
// - Mic button: Web Speech API STT → populates input
// - 🔊 button on each doctor message: TTS reads it aloud in Hindi/English
// - POST to /api/chat with full GUC context
// - Awards +5 XP every 5 messages via store.addXP(5)
// - Triggers store.setAvatarState('THINKING') on send
// - Triggers store.setAvatarState('SPEAKING') on response

interface DoctorChatProps {
  language?: "hindi" | "english"
  reportContext?: string
  onXPEarned?: (n: number) => void
  onAvatarState?: (s: string) => void
}

export default function DoctorChat({
  language = "hindi",
  onXPEarned,
  onAvatarState,
}: DoctorChatProps) {
  // TODO Member 3: implement full chat panel
  return (
    <button className="fixed bottom-6 left-6 z-50 bg-primary text-black
      px-4 py-3 rounded-full font-bold shadow-lg">
      💬 Dr. Raahat
    </button>
  )
}

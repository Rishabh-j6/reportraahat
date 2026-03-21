// OWNER: Member 4
// Mood check-in — emoji slider
// Writes to GUC.stressLevel
// If value <= 3: call store.setAvatarState('CONCERNED')
// Awards +5 XP via store.addXP(5)

interface MoodCheckInProps {
  onMoodSet: (score: number) => void
}

export default function MoodCheckIn({ onMoodSet }: MoodCheckInProps) {
  // TODO Member 4: implement emoji slider
  const emojis = ["😞", "😟", "😐", "🙂", "😄"]
  return (
    <div className="flex gap-4 justify-center">
      {emojis.map((e, i) => (
        <button key={i} onClick={() => onMoodSet(i + 1)}
          className="text-3xl hover:scale-125 transition-transform">
          {e}
        </button>
      ))}
    </div>
  )
}

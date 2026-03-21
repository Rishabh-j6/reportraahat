// OWNER: Member 3
// Achievement badge grid
// earned: string[] — list of earned badge IDs from GUC
// Locked badges show greyed out + grayscale filter
// Unlocked badges animate in with scale bounce on first render

interface BadgeGridProps {
  earned: string[]
}

export default function BadgeGrid({ earned }: BadgeGridProps) {
  // TODO Member 3: implement full badge grid
  return (
    <div className="text-slate-500 text-sm p-4">
      BadgeGrid — Member 3 ({earned.length} earned)
    </div>
  )
}

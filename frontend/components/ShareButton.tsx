// OWNER: Member 2
// WhatsApp share button
// Composes pre-filled Hindi summary deep link
// Clicking awards +30 XP via store.addXP(30)
// Format: https://wa.me/?text=<encoded Hindi summary>

interface ShareButtonProps {
  summaryHindi: string
  nextSteps: string[]
  onShare?: () => void
}

export default function ShareButton({ summaryHindi, nextSteps, onShare }: ShareButtonProps) {
  // TODO Member 2: implement
  const text = encodeURIComponent(`🏥 Meri report:\n\n${summaryHindi}\n\nNext steps:\n${nextSteps.slice(0, 2).join("\n")}`)
  return (
    <a
      href={`https://wa.me/?text=${text}`}
      target="_blank"
      onClick={onShare}
      className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500
        text-white px-4 py-2 rounded-xl font-medium transition-all text-sm"
    >
      📤 Family ko bhejo
    </a>
  )
}

// OWNER: Member 4
// 4-7-8 breathing widget — PURE CSS, no library
// Expanding circle: inhale 4s, hold 7s, exhale 8s
// Total cycle: 19s, loops infinitely
// @media prefers-reduced-motion: pause animation

export default function BreathingWidget() {
  // TODO Member 4: implement pure CSS animation
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="w-24 h-24 rounded-full border-4 border-primary
        flex items-center justify-center text-2xl
        animate-pulse">
        🌸
      </div>
      <p className="text-xs text-slate-400">
        Saans lo 4s • Roko 7s • Chodo 8s
      </p>
    </div>
  )
}

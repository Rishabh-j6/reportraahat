// OWNER: Member 3
// Health bar — CSS liquid fill animation (uses .health-bar-inner from globals.css)
// percent: 0-100, driven by avatarLevel / 5 * 100

interface HealthBarProps {
  percent: number
  color?: string
}

export default function HealthBar({ percent, color = "#22c55e" }: HealthBarProps) {
  // TODO Member 3: implement with CSS animation + shimmer
  return (
    <div className="w-full h-5 bg-slate-700 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000"
        style={{ width: `${Math.min(percent, 100)}%`, background: color }}
      />
    </div>
  )
}

// OWNER: Member 2
// Recharts RadialBarChart confidence gauge
// Counts up from 0 to score value with Framer Motion spring on mount
// Color: green if > 80, yellow if 60-80, orange if < 60

interface ConfidenceGaugeProps {
  score: number  // 0-100
}

export default function ConfidenceGauge({ score }: ConfidenceGaugeProps) {
  // TODO Member 2: implement with Recharts RadialBarChart
  return (
    <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
      ConfidenceGauge — Member 2 ({score}%)
    </div>
  )
}

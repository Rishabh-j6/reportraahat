// OWNER: Member 3
// XP counter — Framer Motion spring animation to current value

export default function XPCounter({ value }: { value: number }) {
  // TODO Member 3: implement with useSpring + useTransform
  return (
    <span className="text-4xl font-bold text-primary tabular-nums">
      {value}
    </span>
  )
}

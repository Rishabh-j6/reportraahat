// OWNER: Member 2
// Bento grid layout wrapper — 7 cards with Framer Motion staggerChildren
// Each card slides up with spring physics, 100ms stagger

export default function BentoGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{children}</div>
}

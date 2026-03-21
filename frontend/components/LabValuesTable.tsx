// OWNER: Member 2
// Lab values table with colored status pills
// RED pill = HIGH, ORANGE pill = LOW, GREEN pill = NORMAL, dark RED = CRITICAL
// Rows animate in one by one with 80ms stagger (Framer Motion)

import { Finding } from "@/lib/store"

interface LabValuesTableProps {
  findings: Finding[]
  language?: "hindi" | "english"
}

export default function LabValuesTable({ findings, language = "hindi" }: LabValuesTableProps) {
  // TODO Member 2: implement
  return (
    <div className="text-slate-500 text-sm p-4">
      LabValuesTable — Member 2 ({findings.length} findings)
    </div>
  )
}

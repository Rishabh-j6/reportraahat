// OWNER: Member 2
// Gamified checklist — next_steps from report
// Clicking an item:
//   1. Bouncing tick animation ✓
//   2. "+10 XP" particle text floats upward (canvas-confetti or CSS)
//   3. Calls store.addXP(10) and store.completeTask(taskId)
// Progress bar fills as tasks complete

interface HealthChecklistProps {
  steps: string[]
  completedIds: string[]
  onComplete: (taskId: string) => void
}

export default function HealthChecklist({ steps, completedIds, onComplete }: HealthChecklistProps) {
  // TODO Member 2: implement
  return (
    <div className="text-slate-500 text-sm p-4">
      HealthChecklist — Member 2 ({steps.length} steps)
    </div>
  )
}

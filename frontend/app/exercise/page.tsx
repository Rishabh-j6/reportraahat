// OWNER: Member 4
// Exercise page:
// - Reads exercise_flags from GUC
// - Maps to tier: LIGHT_WALKING_ONLY / CARDIO_RESTRICTED / NORMAL_ACTIVITY / ACTIVE_ENCOURAGED
// - Renders weekly schedule from GET /exercise
// - Breathing widget (pure CSS 4-7-8 animation)
// - "Mark done" button → calls store.addXP(10)

export default function ExercisePage() {
  return (
    <main className="min-h-screen p-6">
      <p className="text-primary text-2xl font-bold">
        Exercise Page — Member 4
      </p>
    </main>
  )
}

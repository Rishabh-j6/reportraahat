// OWNER: Member 4
// THE most critical file — publish on Day 1 before any feature code
// Everyone imports types and actions from here. Nobody redefines these.

import { create } from "zustand"
import { persist } from "zustand/middleware"

// ─── Shared Types (copy these into a team doc on Day 1) ───────

export type Language      = "english" | "hindi"
export type Severity      = "NORMAL" | "MILD_CONCERN" | "MODERATE_CONCERN" | "URGENT"
export type FindingStatus = "HIGH" | "LOW" | "NORMAL" | "CRITICAL"
export type AvatarState   =
  | "IDLE" | "WAVING" | "THINKING" | "ANALYZING"
  | "SPEAKING" | "HAPPY" | "LEVEL_UP" | "CONCERNED" | "CELEBRATING"

export interface Finding {
  parameter: string
  value: string
  normal_range: string
  status: FindingStatus
  simple_name_hindi: string
  simple_name_english: string
  layman_explanation_hindi: string
  layman_explanation_english: string
}

export interface ReportData {
  is_readable: boolean
  report_type: "LAB_REPORT" | "DISCHARGE_SUMMARY" | "PRESCRIPTION" | "SCAN_REPORT"
  patient_summary: { name: string; age: number; gender: string; report_date: string }
  findings: Finding[]
  affected_organs: string[]
  overall_summary_hindi: string
  overall_summary_english: string
  severity_level: Severity
  next_steps: string[]
  dietary_flags: string[]
  exercise_flags: string[]
  ai_confidence_score: number
  disclaimer: string
}

// ─── GUC State ────────────────────────────────────────────────

interface GUCState {
  language: Language
  patientName: string
  latestReport: ReportData | null
  reportHistory: Array<{ date: string; report: ReportData }>
  organFlags: string[]
  dietary_flags: string[]
  exercise_flags: string[]
  avatarXP: number
  avatarLevel: number
  avatarState: AvatarState
  checklistDone: string[]
  earnedBadges: string[]
  stressLevel: number
  sleepQuality: number
  chatHistory: Array<{ role: "user" | "model"; text: string }>
  isAnalyzing: boolean
}

// ─── Actions ──────────────────────────────────────────────────

interface GUCActions {
  setLanguage:    (l: Language) => void
  setAnalyzing:   (v: boolean) => void
  setReport:      (r: ReportData) => void
  setStress:      (v: number) => void
  setSleep:       (v: number) => void
  setAvatarState: (s: AvatarState) => void
  addXP:          (amount: number) => void
  completeTask:   (id: string) => void
  addChatMessage: (role: "user" | "model", text: string) => void
  clearChat:      () => void
  reset:          () => void
}

const getLevel = (xp: number) => {
  if (xp >= 1000) return 5
  if (xp >= 600)  return 4
  if (xp >= 300)  return 3
  if (xp >= 100)  return 2
  return 1
}

const DEFAULT: GUCState = {
  language: "hindi", patientName: "Patient",
  latestReport: null, reportHistory: [],
  organFlags: [], dietary_flags: [], exercise_flags: [],
  avatarXP: 0, avatarLevel: 1, avatarState: "IDLE",
  checklistDone: [], earnedBadges: [],
  stressLevel: 5, sleepQuality: 7,
  chatHistory: [], isAnalyzing: false,
}

export const useGUC = create<GUCState & GUCActions>()(
  persist(
    (set, get) => ({
      ...DEFAULT,
      setLanguage:    (language)     => set({ language }),
      setAnalyzing:   (isAnalyzing)  => set({ isAnalyzing }),
      setStress:      (stressLevel)  => set({ stressLevel }),
      setSleep:       (sleepQuality) => set({ sleepQuality }),
      setAvatarState: (avatarState)  => set({ avatarState }),

      setReport: (report) => {
        const prev = get().reportHistory
        set({
          latestReport:   report,
          reportHistory:  [{ date: new Date().toISOString(), report }, ...prev.slice(0, 9)],
          organFlags:     report.affected_organs,
          dietary_flags:  report.dietary_flags,
          exercise_flags: report.exercise_flags,
        })
      },

      addXP: (amount) => {
        const newXP    = get().avatarXP + amount
        const newLevel = getLevel(newXP)
        const oldLevel = get().avatarLevel
        set({ avatarXP: newXP, avatarLevel: newLevel,
              avatarState: newLevel > oldLevel ? "LEVEL_UP" : "HAPPY" })
        setTimeout(() => set({ avatarState: "IDLE" }), 3000)
      },

      completeTask: (id) => {
        const done = get().checklistDone
        if (!done.includes(id)) {
          set({ checklistDone: [...done, id] })
          get().addXP(10)
        }
      },

      addChatMessage: (role, text) => {
        const h = get().chatHistory
        set({ chatHistory: [...h.slice(-19), { role, text }] })
      },

      clearChat: () => set({ chatHistory: [] }),
      reset:     () => set(DEFAULT),
    }),
    { name: "reportraahat-guc" }
  )
)

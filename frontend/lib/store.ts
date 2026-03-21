"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ── Types ────────────────────────────────────────────────────

export type Language = "EN" | "HI" | "RAJ";
export type SeverityLevel = "NORMAL" | "MILD_CONCERN" | "MODERATE_CONCERN" | "URGENT";
export type ReportType = "LAB_REPORT" | "DISCHARGE_SUMMARY" | "PRESCRIPTION" | "SCAN_REPORT";
export type FindingStatus = "HIGH" | "LOW" | "NORMAL" | "CRITICAL";
export type OrganFlag = "LIVER" | "KIDNEY" | "HEART" | "LUNGS" | "BLOOD" | "SPINE" | "BRAIN" | "SYSTEMIC";
export type DietaryFlag =
  | "AVOID_FATTY_FOODS" | "INCREASE_IRON" | "INCREASE_VITAMIN_D"
  | "INCREASE_CALCIUM" | "INCREASE_PROTEIN" | "DRINK_MORE_WATER"
  | "REDUCE_SODIUM" | "REDUCE_SUGAR" | "LOW_POTASSIUM_DIET" | "DIABETIC_DIET";
export type ExerciseFlag = "LIGHT_WALKING_ONLY" | "CARDIO_RESTRICTED" | "NORMAL_ACTIVITY" | "ACTIVE_ENCOURAGED";
export type AvatarState =
  | "IDLE" | "WAVING" | "THINKING" | "ANALYZING"
  | "SPEAKING" | "HAPPY" | "LEVEL_UP" | "CONCERNED" | "CELEBRATING";

export interface LabFinding {
  parameter: string;
  value: string;
  normal_range: string;
  status: FindingStatus;
  simple_name_hindi: string;
  simple_name_english: string;
  layman_explanation_hindi: string;
  layman_explanation_english: string;
}

export interface ParsedReport {
  is_readable: boolean;
  report_type: ReportType;
  patient_summary: {
    name: string;
    age: number;
    gender: "MALE" | "FEMALE" | "UNKNOWN";
    report_date: string;
  };
  findings: LabFinding[];
  affected_organs: OrganFlag[];
  overall_summary_hindi: string;
  overall_summary_english: string;
  severity_level: SeverityLevel;
  next_steps: string[];
  dietary_flags: DietaryFlag[];
  exercise_flags: ExerciseFlag[];
  ai_confidence_score: number;
  disclaimer: string;
}

export interface ReportHistoryEntry {
  date: string;
  report: ParsedReport;
  id: string;
}

export interface MentalWellnessData {
  stressLevel: number;
  sleepQuality: number;
  lastCheckin: string;
  moodHistory: Array<{ date: string; stress: number; sleep: number }>;
}

export interface NutritionProfile {
  dailyTargets: {
    protein_g: number;
    iron_mg: number;
    calcium_mg: number;
    vitaminD_iu: number;
    fiber_g: number;
    calories_kcal: number;
  };
  deficiencies: DietaryFlag[];
  loggedToday: string[];
}

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  xpReward: number;
}

export interface GUCType {
  profile: {
    name: string;
    age: number;
    gender: "MALE" | "FEMALE" | "UNKNOWN";
    language: Language;
    location: string;
  };
  latestReport: ParsedReport | null;
  reportHistory: ReportHistoryEntry[];
  organFlags: OrganFlag[];
  labValues: LabFinding[];
  medicationsActive: string[];
  allergyFlags: string[];
  nutritionProfile: NutritionProfile;
  exerciseLevel: ExerciseFlag;
  mentalWellness: MentalWellnessData;
  avatarXP: number;
  avatarState: AvatarState;
  checklistProgress: ChecklistItem[];
  chatHistory: Array<{ role: "user" | "assistant"; content: string }>;
  sessionMeta: {
    uploadCount: number;
    lastUpload: string | null;
    analysisCount: number;
  };
}

interface GUCActions {
  setLatestReport: (report: ParsedReport) => void;
  clearReport: () => void;
  setProfile: (profile: Partial<GUCType["profile"]>) => void;
  setLanguage: (lang: Language) => void;
  addXP: (amount: number) => void;
  setAvatarState: (state: AvatarState) => void;
  completeChecklistItem: (id: string) => void;
  setChecklist: (items: ChecklistItem[]) => void;
  appendChatMessage: (role: "user" | "assistant", content: string) => void;
  clearChat: () => void;
  updateMentalWellness: (stress: number, sleep: number) => void;
  logFood: (foodName: string) => void;
  setNutritionTargets: (targets: Partial<NutritionProfile["dailyTargets"]>) => void;
  setExerciseLevel: (flag: ExerciseFlag) => void;
  resetGUC: () => void;
}

const defaultGUC: GUCType = {
  profile: { name: "User", age: 30, gender: "UNKNOWN", language: "EN", location: "Rajasthan" },
  latestReport: null,
  reportHistory: [],
  organFlags: [],
  labValues: [],
  medicationsActive: [],
  allergyFlags: [],
  nutritionProfile: {
    dailyTargets: { protein_g: 50, iron_mg: 18, calcium_mg: 1000, vitaminD_iu: 600, fiber_g: 25, calories_kcal: 2000 },
    deficiencies: [],
    loggedToday: [],
  },
  exerciseLevel: "NORMAL_ACTIVITY",
  mentalWellness: { stressLevel: 5, sleepQuality: 7, lastCheckin: "", moodHistory: [] },
  avatarXP: 0,
  avatarState: "IDLE",
  checklistProgress: [],
  chatHistory: [],
  sessionMeta: { uploadCount: 0, lastUpload: null, analysisCount: 0 },
};

function deriveNutritionFromFlags(flags: DietaryFlag[]): Partial<NutritionProfile["dailyTargets"]> {
  const t: Partial<NutritionProfile["dailyTargets"]> = {};
  if (flags.includes("INCREASE_IRON")) t.iron_mg = 27;
  if (flags.includes("INCREASE_VITAMIN_D")) t.vitaminD_iu = 1000;
  if (flags.includes("INCREASE_CALCIUM")) t.calcium_mg = 1200;
  if (flags.includes("INCREASE_PROTEIN")) t.protein_g = 70;
  return t;
}

function deriveExerciseFromFlags(flags: ExerciseFlag[]): ExerciseFlag {
  if (flags.includes("LIGHT_WALKING_ONLY")) return "LIGHT_WALKING_ONLY";
  if (flags.includes("CARDIO_RESTRICTED")) return "CARDIO_RESTRICTED";
  if (flags.includes("ACTIVE_ENCOURAGED")) return "ACTIVE_ENCOURAGED";
  return "NORMAL_ACTIVITY";
}

function generateChecklist(report: ParsedReport): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  report.findings
    .filter((f) => f.status === "HIGH" || f.status === "LOW" || f.status === "CRITICAL")
    .slice(0, 3)
    .forEach((f, i) => {
      items.push({ id: `finding-${i}`, label: `Follow up on ${f.simple_name_english} (${f.status.toLowerCase()})`, completed: false, xpReward: 10 });
    });
  report.next_steps.slice(0, 3).forEach((step, i) => {
    items.push({ id: `step-${i}`, label: step, completed: false, xpReward: 10 });
  });
  return items;
}

export const useGUCStore = create<GUCType & GUCActions>()(
  persist(
    (set) => ({
      ...defaultGUC,

      setLatestReport: (report) => {
        const entry: ReportHistoryEntry = { date: new Date().toISOString(), report, id: crypto.randomUUID() };
        set((s) => ({
          latestReport: report,
          reportHistory: [entry, ...s.reportHistory].slice(0, 10),
          organFlags: report.affected_organs,
          labValues: report.findings,
          exerciseLevel: deriveExerciseFromFlags(report.exercise_flags),
          nutritionProfile: {
            ...s.nutritionProfile,
            deficiencies: report.dietary_flags,
            dailyTargets: { ...s.nutritionProfile.dailyTargets, ...deriveNutritionFromFlags(report.dietary_flags) },
          },
          checklistProgress: generateChecklist(report),
          sessionMeta: { uploadCount: s.sessionMeta.uploadCount + 1, lastUpload: new Date().toISOString(), analysisCount: s.sessionMeta.analysisCount + 1 },
        }));
      },

      clearReport: () => set({ latestReport: null }),
      setProfile: (profile) => set((s) => ({ profile: { ...s.profile, ...profile } })),
      setLanguage: (lang) => set((s) => ({ profile: { ...s.profile, language: lang } })),
      addXP: (amount) => set((s) => ({ avatarXP: s.avatarXP + amount })),
      setAvatarState: (state) => set({ avatarState: state }),

      completeChecklistItem: (id) =>
        set((s) => {
          const item = s.checklistProgress.find((i) => i.id === id);
          return {
            checklistProgress: s.checklistProgress.map((i) => i.id === id ? { ...i, completed: true } : i),
            avatarXP: s.avatarXP + (item?.xpReward ?? 0),
          };
        }),

      setChecklist: (items) => set({ checklistProgress: items }),
      appendChatMessage: (role, content) =>
        set((s) => ({ chatHistory: [...s.chatHistory, { role, content }].slice(-40) })),
      clearChat: () => set({ chatHistory: [] }),

      updateMentalWellness: (stress, sleep) =>
        set((s) => {
          const now = new Date().toISOString();
          return {
            mentalWellness: {
              stressLevel: stress,
              sleepQuality: sleep,
              lastCheckin: now,
              moodHistory: [...s.mentalWellness.moodHistory, { date: now, stress, sleep }].slice(-30),
            },
          };
        }),

      logFood: (foodName) =>
        set((s) => ({ nutritionProfile: { ...s.nutritionProfile, loggedToday: [...s.nutritionProfile.loggedToday, foodName] } })),

      setNutritionTargets: (targets) =>
        set((s) => ({ nutritionProfile: { ...s.nutritionProfile, dailyTargets: { ...s.nutritionProfile.dailyTargets, ...targets } } })),

      setExerciseLevel: (flag) => set({ exerciseLevel: flag }),
      resetGUC: () => set(defaultGUC),
    }),
    {
      name: "reportraahat-guc",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

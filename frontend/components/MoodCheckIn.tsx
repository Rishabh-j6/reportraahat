"use client";

// ============================================================
// MoodCheckIn.tsx — MEMBER 4 OWNS THIS
// Emoji slider → writes to GUC.mentalWellness.stressLevel
// If stress ≤ 3, calls store.setAvatarState("CONCERNED")
// ============================================================

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGUCStore } from "@/lib/store";

const MOODS = [
  { emoji: "😞", label: "Very Stressed", stress: 1, color: "#EF4444" },
  { emoji: "😟", label: "Stressed", stress: 3, color: "#F97316" },
  { emoji: "😐", label: "Okay", stress: 5, color: "#EAB308" },
  { emoji: "😊", label: "Good", stress: 7, color: "#84CC16" },
  { emoji: "😄", label: "Great!", stress: 9, color: "#22C55E" },
];

interface MoodCheckInProps {
  onComplete?: () => void;
}

export default function MoodCheckIn({ onComplete }: MoodCheckInProps) {
  const mentalWellness       = useGUCStore((s) => s.mentalWellness);
  const updateMentalWellness = useGUCStore((s) => s.updateMentalWellness);
  const setAvatarState       = useGUCStore((s) => s.setAvatarState);
  const addXP                = useGUCStore((s) => s.addXP);

  const [selectedMoodIndex, setSelectedMoodIndex] = useState<number | null>(null);
  const [sleepRating, setSleepRating] = useState<number>(
    mentalWellness.sleepQuality || 7
  );
  const [submitted, setSubmitted] = useState(false);

  const handleMoodSelect = (index: number) => {
    setSelectedMoodIndex(index);
  };

  const handleSubmit = () => {
    if (selectedMoodIndex === null) return;

    const mood = MOODS[selectedMoodIndex];
    updateMentalWellness(mood.stress, sleepRating);

    // If very stressed or low sleep → show concerned avatar
    if (mood.stress <= 3 || sleepRating <= 3) {
      setAvatarState("CONCERNED");
    } else if (mood.stress >= 8) {
      setAvatarState("HAPPY");
    }

    addXP(5); // +5 XP for daily check-in
    setSubmitted(true);
    onComplete?.();
  };

  const alreadyCheckedIn =
    mentalWellness.lastCheckin &&
    new Date(mentalWellness.lastCheckin).toDateString() ===
      new Date().toDateString();

  if (submitted || alreadyCheckedIn) {
    const lastMood = MOODS.find(
      (m) => m.stress === mentalWellness.stressLevel
    );
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-5 text-center"
      >
        <p className="text-3xl mb-2">{lastMood?.emoji ?? "😊"}</p>
        <p className="text-white/60 text-sm">
          Today's check-in done!{" "}
          <span className="text-green-400 font-medium">+5 XP earned</span>
        </p>
        <p className="text-white/40 text-xs mt-1">
          Stress: {mentalWellness.stressLevel}/10 · Sleep:{" "}
          {mentalWellness.sleepQuality}/10
        </p>
      </motion.div>
    );
  }

  return (
    <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-5">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-white font-semibold text-sm">Daily Mood Check-in</h3>
        <p className="text-white/40 text-xs mt-0.5">
          How are you feeling today? +5 XP
        </p>
      </div>

      {/* Emoji mood selector */}
      <div className="flex justify-between gap-2 mb-5">
        {MOODS.map((mood, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => handleMoodSelect(i)}
            className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-xl transition-all ${
              selectedMoodIndex === i
                ? "bg-white/10 ring-2"
                : "hover:bg-white/5"
            }`}
            style={
              selectedMoodIndex === i
                ? { ringColor: mood.color, boxShadow: `0 0 0 2px ${mood.color}` }
                : {}
            }
          >
            <span className="text-2xl">{mood.emoji}</span>
            <span className="text-white/50 text-[9px] leading-tight text-center">
              {mood.label}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Sleep rating */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white/60 text-xs">Sleep Quality</span>
          <span className="text-white text-sm font-medium">{sleepRating}/10</span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          value={sleepRating}
          onChange={(e) => setSleepRating(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #FF9933 0%, #FF9933 ${
              (sleepRating - 1) * 11.11
            }%, rgba(255,255,255,0.15) ${(sleepRating - 1) * 11.11}%, rgba(255,255,255,0.15) 100%)`,
          }}
        />
        <div className="flex justify-between text-white/25 text-[9px] mt-1">
          <span>Poor 😴</span>
          <span>Excellent 🌙</span>
        </div>
      </div>

      {/* Contextual message */}
      <AnimatePresence>
        {selectedMoodIndex !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            {MOODS[selectedMoodIndex].stress <= 3 ? (
              <p className="text-orange-300/80 text-xs bg-orange-500/10 rounded-lg p-2.5">
                Dr. Raahat is here for you 💙 High stress can slow recovery. Try
                the 4-7-8 breathing exercise below.
              </p>
            ) : MOODS[selectedMoodIndex].stress >= 8 ? (
              <p className="text-green-300/80 text-xs bg-green-500/10 rounded-lg p-2.5">
                Amazing! A positive mindset speeds up healing. Keep it up! 🌟
              </p>
            ) : (
              <p className="text-white/40 text-xs bg-white/5 rounded-lg p-2.5">
                Thank you for checking in. Consistency is what matters most.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        disabled={selectedMoodIndex === null}
        onClick={handleSubmit}
        className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${
          selectedMoodIndex !== null
            ? "bg-[#FF9933] text-white hover:bg-[#e8882e]"
            : "bg-white/5 text-white/30 cursor-not-allowed"
        }`}
      >
        Save Check-in · +5 XP
      </motion.button>
    </div>
  );
}

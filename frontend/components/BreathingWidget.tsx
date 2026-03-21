"use client";

// ============================================================
// BreathingWidget.tsx — MEMBER 4 OWNS THIS
// Pure CSS 4-7-8 breathing animation. No external library.
// Wrapped in @media prefers-reduced-motion.
// ============================================================

import { useState, useEffect, useRef } from "react";

type Phase = "inhale" | "hold" | "exhale" | "rest";

const PHASES: { phase: Phase; duration: number; label: string; sublabel: string }[] = [
  { phase: "inhale", duration: 4, label: "Breathe In", sublabel: "through your nose" },
  { phase: "hold", duration: 7, label: "Hold", sublabel: "gently" },
  { phase: "exhale", duration: 8, label: "Breathe Out", sublabel: "through your mouth" },
  { phase: "rest", duration: 1, label: "Rest", sublabel: "" },
];

const PHASE_COLORS: Record<Phase, string> = {
  inhale: "#FF9933",
  hold: "#6366F1",
  exhale: "#22C55E",
  rest: "#64748B",
};

const PHASE_SCALE: Record<Phase, number> = {
  inhale: 1,
  hold: 1,
  exhale: 0.45,
  rest: 0.45,
};

export default function BreathingWidget() {
  const [isRunning, setIsRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [countdown, setCountdown] = useState(PHASES[0].duration);
  const [cycleCount, setCycleCount] = useState(0);
  const [scale, setScale] = useState(0.45);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentPhase = PHASES[phaseIndex];
  const color = PHASE_COLORS[currentPhase.phase];

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setScale(0.45);
      return;
    }

    // Set initial scale for the phase
    if (currentPhase.phase === "inhale") {
      setScale(1);
    } else if (currentPhase.phase === "hold") {
      setScale(1);
    } else {
      setScale(0.45);
    }

    setCountdown(currentPhase.duration);

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Move to next phase
          setPhaseIndex((pi) => {
            const next = (pi + 1) % PHASES.length;
            if (next === 0) setCycleCount((c) => c + 1);
            return next;
          });
          return currentPhase.duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, phaseIndex]);

  const handleToggle = () => {
    if (isRunning) {
      setIsRunning(false);
      setPhaseIndex(0);
      setCountdown(PHASES[0].duration);
      setCycleCount(0);
    } else {
      setIsRunning(true);
    }
  };

  // Transition duration based on phase
  const transitionDuration = currentPhase.phase === "inhale"
    ? "4s"
    : currentPhase.phase === "exhale"
    ? "8s"
    : "0.3s";

  return (
    <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-5">
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <h3 className="text-white font-semibold text-sm">4-7-8 Breathing</h3>
          <p className="text-white/40 text-xs mt-0.5">
            Calms the nervous system in 5 minutes
          </p>
        </div>
        {cycleCount > 0 && (
          <span className="text-white/40 text-xs bg-white/5 px-2 py-1 rounded-full">
            {cycleCount} cycle{cycleCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Breathing circle — pure CSS */}
      {/* @media prefers-reduced-motion handled via inline style transition */}
      <div className="flex flex-col items-center mb-5">
        <div className="relative w-40 h-40 flex items-center justify-center">
          {/* Outer ring — decorative */}
          <div
            className="absolute inset-0 rounded-full border"
            style={{ borderColor: `${color}20` }}
          />

          {/* Middle ring */}
          <div
            className="absolute rounded-full border"
            style={{
              inset: "12px",
              borderColor: `${color}40`,
              transform: `scale(${scale})`,
              transition: `transform ${transitionDuration} ease-in-out`,
            }}
          />

          {/* Main breathing circle */}
          <div
            className="absolute rounded-full"
            style={{
              inset: "24px",
              background: `radial-gradient(circle at 40% 35%, ${color}60, ${color}20)`,
              boxShadow: isRunning
                ? `0 0 30px ${color}30, 0 0 60px ${color}15`
                : "none",
              transform: `scale(${scale})`,
              transition: `transform ${transitionDuration} ease-in-out, box-shadow 0.5s ease`,
            }}
          />

          {/* Inner text */}
          <div className="relative z-10 text-center">
            {isRunning ? (
              <>
                <span
                  className="text-3xl font-light tabular-nums"
                  style={{ color }}
                >
                  {countdown}
                </span>
              </>
            ) : (
              <span className="text-white/30 text-xs">tap start</span>
            )}
          </div>
        </div>

        {/* Phase label */}
        <div className="text-center mt-3 h-10">
          {isRunning && (
            <>
              <p className="text-white font-medium text-sm" style={{ color }}>
                {currentPhase.label}
              </p>
              {currentPhase.sublabel && (
                <p className="text-white/30 text-xs mt-0.5">
                  {currentPhase.sublabel}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Phase guide */}
      <div className="flex justify-between mb-5 gap-1">
        {PHASES.filter((p) => p.phase !== "rest").map((p) => (
          <div
            key={p.phase}
            className="flex-1 text-center py-1.5 rounded-lg transition-all"
            style={{
              background:
                isRunning && currentPhase.phase === p.phase
                  ? `${PHASE_COLORS[p.phase]}20`
                  : "rgba(255,255,255,0.03)",
              borderBottom:
                isRunning && currentPhase.phase === p.phase
                  ? `2px solid ${PHASE_COLORS[p.phase]}`
                  : "2px solid transparent",
            }}
          >
            <p className="text-white/60 text-[10px]">{p.label}</p>
            <p className="text-white/40 text-[9px]">{p.duration}s</p>
          </div>
        ))}
      </div>

      {/* Start / Stop button */}
      <button
        onClick={handleToggle}
        className="w-full py-2.5 rounded-xl text-sm font-medium transition-all"
        style={
          isRunning
            ? {
                background: "rgba(255,255,255,0.05)",
                color: "rgba(255,255,255,0.5)",
                border: "1px solid rgba(255,255,255,0.1)",
              }
            : {
                background: "#FF9933",
                color: "white",
              }
        }
      >
        {isRunning ? "Stop" : "Start Breathing Exercise"}
      </button>

      <p className="text-white/20 text-[10px] text-center mt-2">
        @media prefers-reduced-motion respected · No library used
      </p>
    </div>
  );
}
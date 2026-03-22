"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import BodyMap from "@/components/BodyMap";
import LabValuesTable from "@/components/LabValuesTable";
import ConfidenceGauge from "@/components/ConfidenceGauge";
import HealthChecklist from "@/components/HealthChecklist";
import ShareButton from "@/components/ShareButton";
import DoctorChat from "@/components/DoctorChat";
import { PageShell, SectionLabel, Banner } from "@/components/ui";
import { colors, racingLabels } from "@/lib/tokens";
import { useGUCStore } from "@/lib/store";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: "easeOut" },
  }),
};

const ClayCard = ({ children, custom, className, style }: {
  children: React.ReactNode; custom: number; className?: string; style?: React.CSSProperties
}) => (
  <motion.div
    custom={custom} variants={cardVariants} initial="hidden" animate="visible"
    whileHover={{ y: -3, boxShadow: "0 12px 40px rgba(0,0,0,0.4)" }}
    transition={{ type: "spring", stiffness: 300, damping: 25 }}
    className={`rounded-xl p-6 md:p-8 clay-card ${className || ""}`}
    style={{ background: colors.surfaceContainer, ...style }}
  >
    {children}
  </motion.div>
);

export default function Dashboard() {
  const router = useRouter();
  const latestReport = useGUCStore((s) => s.latestReport);
  const profile = useGUCStore((s) => s.profile);
  const checklistProgress = useGUCStore((s) => s.checklistProgress);
  const addXP = useGUCStore((s) => s.addXP);
  const appendChatMessage = useGUCStore((s) => s.appendChatMessage);
  const chatHistory = useGUCStore((s) => s.chatHistory);

  const [speaking, setSpeaking] = useState(false);
  const [xp, setXp] = useState(0);
  const [showXPBurst, setShowXPBurst] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const language = profile.language === "HI" ? "hindi" : "english";

  useEffect(() => {
    setTimeout(() => setShowConfetti(true), 300);
    setTimeout(() => setShowConfetti(false), 2500);
  }, []);

  if (!latestReport) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <span className="text-6xl">🏎️</span>
          <h2 className="text-xl font-headline font-bold" style={{ color: colors.accentLight }}>No Engine Data</h2>
          <p className="text-sm text-center" style={{ color: colors.textMuted }}>
            Upload a medical report to start your health race.
          </p>
          <motion.button
            onClick={() => router.push("/")}
            className="mt-2 px-6 py-3 rounded-xl text-sm font-bold pixel-shadow-orange active:translate-y-0.5 active:shadow-none"
            style={{ background: "#FF9800", color: "#FFFFFF" }}
            whileTap={{ scale: 0.97 }}
          >
            ← Start Race
          </motion.button>
        </div>
      </PageShell>
    );
  }

  const report = latestReport;
  const abnormalFindings = report.findings.filter(
    (f) => f.status === "HIGH" || f.status === "LOW" || f.status === "CRITICAL"
  );
  const organFlags = {
    liver: report.affected_organs.includes("LIVER"),
    heart: report.affected_organs.includes("HEART"),
    kidney: report.affected_organs.includes("KIDNEY"),
    lungs: report.affected_organs.includes("LUNGS"),
  };
  const labValues = report.findings.map((f) => ({
    name: f.simple_name_english || f.parameter,
    nameHi: f.simple_name_hindi || f.parameter,
    value: parseFloat(f.value) || 0,
    unit: f.unit || "",
    status: (f.status === "CRITICAL" ? "HIGH" : f.status) as "HIGH" | "LOW" | "NORMAL",
  }));
  const checklist = checklistProgress.length > 0
    ? checklistProgress.map((c) => c.label)
    : ["Visit a doctor for proper diagnosis", "Follow dietary recommendations", "Take prescribed supplements", "Light daily exercise", "Re-test in 4-6 weeks"];
  const summaryText = language === "hindi" ? report.overall_summary_hindi : report.overall_summary_english;

  const handleListen = () => {
    if (!window.speechSynthesis) return;
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    const u = new SpeechSynthesisUtterance(
      language === "hindi" ? report.overall_summary_hindi : report.overall_summary_english
    );
    u.lang = language === "hindi" ? "hi-IN" : "en-IN";
    u.rate = 0.85;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const handleAddXP = (amount: number) => {
    setXp((p) => p + amount); addXP(amount);
    setShowXPBurst(true); setTimeout(() => setShowXPBurst(false), 1000);
  };

  const handleChatSend = async (message: string): Promise<string> => {
    appendChatMessage("user", message);
    try {
      const guc = { name: profile.name, age: profile.age, gender: profile.gender, language: profile.language, latestReport: report, mentalWellness: useGUCStore.getState().mentalWellness };
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message, history: chatHistory.slice(-20), guc }) });
      const data = await res.json();
      const reply = data.reply || "Sorry, I could not process your request.";
      appendChatMessage("assistant", reply); return reply;
    } catch {
      const fallback = "Sorry, I'm having trouble connecting. Please try again.";
      appendChatMessage("assistant", fallback); return fallback;
    }
  };

  // Racing-style telemetry label mapping
  const telemetryLabels: Record<string, string> = {
    "Heart Rate": "RPM (HEART RATE)", "Hemoglobin": "FUEL DENSITY (HEMOGLOBIN)",
    "Blood Sugar": "FUEL TEMP (GLUCOSE)", "Blood Pressure": "OIL PRESSURE (BLOOD)",
    "Oxygen": "AIR INTAKE (O2 SAT)", "Cholesterol": "EXHAUST FLOW (CHOLESTEROL)",
  };

  return (
    <PageShell>
      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {[...Array(25)].map((_, i) => (
              <motion.div key={i} className="absolute w-2 h-2"
                style={{
                  left: `${Math.random() * 100}%`, top: "-10px",
                  background: ["#FF9933", "#22C55E", "#3B82F6", "#EC4899"][i % 4],
                }}
                animate={{ y: ["0vh", "110vh"], rotate: [0, 720], opacity: [1, 1, 0] }}
                transition={{ duration: 1.5 + Math.random(), delay: Math.random() * 0.5 }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Dashboard header — Engine Status */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-sm" style={{ background: colors.tertiary }} />
          </div>
          <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: colors.accentLight }}>
            {racingLabels.dashboard}
          </h1>
          <p className="text-base" style={{ color: colors.textMuted }}>
            Race conditions: {report.severity_level === "URGENT" ? "Critical." : "Optimal."} {abnormalFindings.length > 0 ? `${abnormalFindings.length} alerts detected.` : "All systems nominal."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* XP pill */}
          <motion.div
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-black"
            style={{
              background: "rgba(255,153,51,0.12)", border: `1px solid rgba(255,153,51,0.25)`, color: colors.accent,
              boxShadow: showXPBurst ? "0 0 16px rgba(255,153,51,0.35)" : "none",
            }}
            animate={showXPBurst ? { scale: [1, 1.25, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            ⭐ {xp} XP
          </motion.div>
          {/* Listen */}
          <motion.button onClick={handleListen}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all"
            style={{
              background: speaking ? colors.accent : colors.surfaceContainerHigh,
              color: speaking ? "#0d0d1a" : colors.textMuted,
              border: `1px solid ${speaking ? colors.accent : colors.border}`,
            }} whileTap={{ scale: 0.95 }}>
            🎧 {speaking ? "रोकें" : "सुनें"}
          </motion.button>
          <a href="/" className="text-xs transition-colors" style={{ color: colors.textMuted }}>← New</a>
        </div>
      </div>

      {/* Alert banner */}
      {abnormalFindings.length > 0 && (
        <Banner color={colors.error} delay={0.05}>
          <span className="font-black uppercase text-xs">REDLINE DETECTED — </span>
          रिपोर्ट में {abnormalFindings.length} असामान्य मान मिले — {report.affected_organs.join(", ")} पर ध्यान दें।
        </Banner>
      )}

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">

        {/* Card 1 — Engine Log */}
        <ClayCard custom={0} className="md:col-span-7">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-headline text-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ color: colors.accentLight }}>description</span>
              {racingLabels.report}
            </h2>
            {abnormalFindings.length > 0 && (
              <span className="px-3 py-1 text-[10px] font-black rounded-full uppercase"
                style={{ background: colors.errorContainer, color: "#ffdad6" }}>
                Alert Detected
              </span>
            )}
          </div>
          {abnormalFindings.slice(0, 2).map((f, i) => (
            <div key={i} className="p-4 rounded-lg mb-2"
              style={{ background: colors.surfaceContainerLowest, borderLeft: `4px solid ${f.status === "CRITICAL" || f.status === "HIGH" ? colors.error : colors.caution}` }}>
              <p className="text-xs font-black uppercase mb-1" style={{ color: f.status === "CRITICAL" || f.status === "HIGH" ? colors.error : colors.caution }}>
                Redline Finding #{String(i + 1).padStart(2, "0")}
              </p>
              <p className="text-sm" style={{ color: colors.textPrimary }}>{f.simple_name_english || f.parameter}: {f.value} {f.unit}</p>
            </div>
          ))}
          <div className="p-4 rounded-lg mt-2" style={{ background: colors.surfaceContainerLow, borderLeft: `4px solid ${colors.tertiary}` }}>
            <p className="text-xs font-black uppercase mb-1" style={{ color: colors.tertiary }}>Status: Operational</p>
            <p className="text-sm italic" style={{ color: `${colors.textPrimary}cc` }}>{report.overall_summary_english}</p>
          </div>
          {/* Pixel accents */}
          <div className="flex gap-1 mt-4 justify-end">
            <div className="w-2 h-2" style={{ background: colors.accent }} />
            <div className="w-2 h-2" style={{ background: colors.secondary }} />
            <div className="w-2 h-2" style={{ background: colors.tertiary }} />
          </div>
        </ClayCard>

        {/* Card 2 — Driver's Tip */}
        <ClayCard custom={1} className="md:col-span-5 flex flex-col justify-center relative overflow-hidden"
          style={{ background: colors.primaryContainer }}>
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-3xl" />
          <div className="flex items-start gap-4 relative z-10">
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(105,56,0,0.20)" }}>
              <span className="material-symbols-outlined">volume_up</span>
            </div>
            <div>
              <h3 className="font-headline text-lg font-black uppercase tracking-tighter" style={{ color: colors.onPrimaryContainer }}>
                Driver&apos;s Tip
              </h3>
              <p className="text-base leading-snug mt-2 font-medium" style={{ color: colors.onPrimaryContainer }}>
                {language === "hindi" ? report.overall_summary_hindi : `"${report.overall_summary_english}"`}
              </p>
              <motion.button onClick={handleListen}
                className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                style={{ background: "rgba(105,56,0,0.20)", color: colors.onPrimaryContainer }}
                whileTap={{ scale: 0.97 }}>
                🎧 {speaking ? "Stop" : "Listen"}
              </motion.button>
            </div>
          </div>
        </ClayCard>

        {/* Card 3 — Internal Stage (Body Map) */}
        <ClayCard custom={2} className="md:col-span-5">
          <h2 className="font-headline text-lg font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ color: colors.secondary }}>accessibility_new</span>
            {racingLabels.bodyMap}
          </h2>
          <BodyMap organFlags={organFlags} />
        </ClayCard>

        {/* Card 4 — Telemetry Data (Lab Values) */}
        <ClayCard custom={3} className="md:col-span-7">
          <h2 className="font-headline text-lg font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ color: colors.tertiary }}>query_stats</span>
            {racingLabels.labValues}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {labValues.slice(0, 4).map((val, i) => {
              const racingName = Object.entries(telemetryLabels).find(([k]) =>
                val.name.toLowerCase().includes(k.toLowerCase()))?.[1] || val.name.toUpperCase();
              const statusBg = val.status === "HIGH" ? colors.errorContainer : val.status === "LOW" ? colors.secondaryContainer : `${colors.tertiaryContainer}`;
              const statusColor = val.status === "HIGH" ? "#ffdad6" : val.status === "LOW" ? "#b0b2ff" : colors.onTertiaryContainer;
              return (
                <div key={i} className="p-4 rounded-xl flex items-center justify-between"
                  style={{ background: colors.surfaceContainerLowest }}>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-tight" style={{ color: colors.textMuted }}>{racingName}</p>
                    <p className="text-2xl font-headline font-bold">{val.value} <span className="text-sm font-normal" style={{ color: colors.textMuted }}>{val.unit}</span></p>
                  </div>
                  <div className="w-12 h-12 flex items-center justify-center rounded-full font-black text-[10px]"
                    style={{ background: statusBg, color: statusColor }}>
                    {val.status === "NORMAL" ? "NORM" : val.status}
                  </div>
                </div>
              );
            })}
          </div>
        </ClayCard>

        {/* Card 5 — AI Accuracy */}
        <ClayCard custom={4} className="md:col-span-6 flex flex-col items-center">
          <h2 className="font-headline text-lg font-bold self-start mb-4">AI Accuracy</h2>
          <ConfidenceGauge score={report.ai_confidence_score} />
          <p className="text-sm text-center mt-3" style={{ color: colors.textMuted }}>
            Model trained on 4M+ hill climbs for maximum diagnostic precision.
          </p>
        </ClayCard>

        {/* Card 6 — Add to Crew (Share) */}
        <ClayCard custom={5} className="md:col-span-6">
          <h2 className="font-headline text-lg font-bold mb-4">{racingLabels.share}</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <ShareButton summary={summaryText} onXP={handleAddXP} />
          </div>
          <p className="mt-3 text-xs text-center" style={{ color: colors.textMuted }}>
            Share your telemetry with trusted pit crew members.
          </p>
        </ClayCard>

        {/* Card 7 — Race Plan (Checklist) — full width */}
        <ClayCard custom={6} className="md:col-span-12">
          <SectionLabel icon="checklist">{racingLabels.checklist}</SectionLabel>
          <HealthChecklist items={checklist} onXP={handleAddXP} />
        </ClayCard>
      </div>

      {/* Doctor Chat */}
      <DoctorChat onSend={handleChatSend} />
    </PageShell>
  );
}
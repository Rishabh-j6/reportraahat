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
import { colors } from "@/lib/tokens";
import { useGUCStore } from "@/lib/store";

// Shared card style — matches the dark theme
const CARD_STYLE: React.CSSProperties = {
  background: colors.bgCard,
  border: `1px solid ${colors.border}`,
  borderRadius: 16,
  padding: 20,
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: "easeOut" },
  }),
};

// Hover card wrapper
const HoverCard = ({ children, custom, style }: { children: React.ReactNode; custom: number; style?: React.CSSProperties }) => (
  <motion.div
    custom={custom} variants={cardVariants} initial="hidden" animate="visible"
    whileHover={{ y: -3, boxShadow: "0 8px 32px rgba(0,0,0,0.35)" }}
    transition={{ type: "spring", stiffness: 300, damping: 25 }}
    style={{ ...CARD_STYLE, ...style }}
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

  // Redirect to home if no report
  if (!latestReport) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <span className="text-6xl">📋</span>
          <h2 className="text-xl font-bold text-white">No Report Uploaded</h2>
          <p className="text-sm text-center" style={{ color: colors.textMuted }}>
            Upload a medical report first to see your analysis dashboard.
          </p>
          <motion.button
            onClick={() => router.push("/")}
            className="mt-2 px-6 py-3 rounded-xl text-sm font-bold"
            style={{
              background: "linear-gradient(135deg, #FF9933 0%, #FFAA55 100%)",
              color: "#0d0d1a",
              boxShadow: "0 2px 12px rgba(255,153,51,0.3)",
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            ← Upload Report
          </motion.button>
        </div>
      </PageShell>
    );
  }

  const report = latestReport;

  // Derive data from report
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
    : [
      "Visit a doctor for proper diagnosis",
      "Follow dietary recommendations",
      "Take prescribed supplements",
      "Light daily exercise",
      "Re-test in 4-6 weeks",
    ];

  const summaryText = language === "hindi"
    ? report.overall_summary_hindi
    : report.overall_summary_english;

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
    setXp((p) => p + amount);
    addXP(amount);
    setShowXPBurst(true);
    setTimeout(() => setShowXPBurst(false), 1000);
  };

  const handleChatSend = async (message: string): Promise<string> => {
    appendChatMessage("user", message);

    try {
      // Build GUC for the chat
      const guc = {
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        language: profile.language,
        latestReport: report,
        mentalWellness: useGUCStore.getState().mentalWellness,
      };

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history: chatHistory.slice(-20), // Last 20 messages for context
          guc,
        }),
      });

      const data = await res.json();
      const reply = data.reply || "Sorry, I could not process your request.";
      appendChatMessage("assistant", reply);
      return reply;
    } catch {
      const fallback = "Sorry, I'm having trouble connecting. Please try again.";
      appendChatMessage("assistant", fallback);
      return fallback;
    }
  };

  return (
    <PageShell>
      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {[...Array(25)].map((_, i) => (
              <motion.div key={i} className="absolute w-2 h-2 rounded-sm"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: "-10px",
                  background: ["#FF9933", "#22C55E", "#3B82F6", "#EC4899"][i % 4],
                }}
                animate={{ y: ["0vh", "110vh"], rotate: [0, 720], opacity: [1, 1, 0] }}
                transition={{ duration: 1.5 + Math.random(), delay: Math.random() * 0.5 }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Sticky header */}
      <div
        className="sticky top-0 z-40 flex items-center justify-between px-5 py-3 mb-5 -mx-4 rounded-b-2xl"
        style={{
          background: "rgba(13,13,26,0.94)",
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid rgba(255,153,51,0.08)`,
          boxShadow: "0 1px 0 rgba(255,153,51,0.05), 0 4px 24px rgba(0,0,0,0.3)",
        }}
      >
        <div className="absolute left-0 top-0 h-full w-16 pointer-events-none rounded-bl-2xl"
          style={{ background: "radial-gradient(ellipse at 0% 50%, rgba(255,153,51,0.06) 0%, transparent 80%)" }} />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🏥</span>
            <h1 className="text-lg font-black">
              <span style={{ color: "rgba(255,255,255,0.6)" }}>Report</span>
              <span style={{ color: colors.accent }}>Raahat</span>
            </h1>
          </div>
          <p className="text-xs font-devanagari" style={{ color: colors.textMuted }}>
            नमस्ते, {profile.name} 🙏
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* XP pill */}
          <motion.div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold"
            style={{
              background: "rgba(255,153,51,0.12)",
              border: `1px solid rgba(255,153,51,0.25)`,
              color: colors.accent,
              boxShadow: showXPBurst ? "0 0 16px rgba(255,153,51,0.35)" : "none",
            }}
            animate={showXPBurst ? { scale: [1, 1.25, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            ⭐ {xp} XP
          </motion.div>
          {/* Listen button */}
          <motion.button
            onClick={handleListen}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{
              background: speaking ? colors.accent : colors.bgSubtle,
              color: speaking ? "#0d0d1a" : colors.textMuted,
              border: `1px solid ${speaking ? colors.accent : colors.border}`,
              boxShadow: speaking ? "0 0 12px rgba(255,153,51,0.3)" : "none",
            }}
            whileTap={{ scale: 0.95 }}
          >
            🎧 {speaking ? "रोकें" : "सुनें"}
          </motion.button>
          <a href="/" className="text-xs transition-colors"
            style={{ color: colors.textMuted }}>
            ← New
          </a>
        </div>
      </div>

      {/* Deficiency banner */}
      {abnormalFindings.length > 0 && (
        <Banner delay={0.05}>
          रिपोर्ट में {abnormalFindings.length} असामान्य मान मिले — {report.affected_organs.join(", ")} पर ध्यान दें।
        </Banner>
      )}

      {/* 2-col card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

        {/* Card 1 — Report summary */}
        <HoverCard custom={0}>
          <SectionLabel>📄 Report Summary</SectionLabel>
          <p className="text-sm leading-relaxed mb-2" style={{ color: colors.textSecondary }}>
            {report.overall_summary_english}
          </p>
          {language === "hindi" && (
            <p className="text-sm leading-relaxed font-devanagari" style={{ color: "rgba(255,255,255,0.7)" }}>
              {report.overall_summary_hindi}
            </p>
          )}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-[10px] px-2 py-1 rounded-full font-medium"
              style={{
                background: report.severity_level === "URGENT" ? "rgba(239,68,68,0.15)" :
                  report.severity_level === "MODERATE_CONCERN" ? "rgba(245,158,11,0.15)" :
                    "rgba(34,197,94,0.15)",
                color: report.severity_level === "URGENT" ? "#EF4444" :
                  report.severity_level === "MODERATE_CONCERN" ? "#F59E0B" :
                    "#22C55E",
              }}>
              {report.severity_level.replace(/_/g, " ")}
            </span>
            <span className="text-[10px]" style={{ color: colors.textFaint }}>
              {report.report_type.replace(/_/g, " ")}
            </span>
          </div>
        </HoverCard>

        {/* Card 2 — Simple explanation */}
        <HoverCard custom={1} style={{ borderColor: colors.accentBorder }}>
          <SectionLabel>💬 आसान भाषा में</SectionLabel>
          <p className="text-white text-base leading-relaxed font-semibold mb-2">
            {report.overall_summary_hindi}
          </p>
          <p className="text-sm leading-relaxed mb-4" style={{ color: colors.textMuted }}>
            {report.overall_summary_english}
          </p>
          <motion.button
            onClick={handleListen}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
            style={{
              background: "linear-gradient(135deg, #FF9933 0%, #FFAA55 100%)",
              color: "#0d0d1a",
              boxShadow: "0 2px 12px rgba(255,153,51,0.35)"
            }}
            whileHover={{ scale: 1.02, boxShadow: "0 4px 20px rgba(255,153,51,0.45)" }}
            whileTap={{ scale: 0.97 }}
          >
            🎧 सुनें (Listen)
          </motion.button>
        </HoverCard>

        {/* Card 3 — Body Map */}
        <HoverCard custom={2}>
          <SectionLabel>🫀 Affected Body Part</SectionLabel>
          <BodyMap organFlags={organFlags} />
        </HoverCard>

        {/* Card 4 — Lab Values */}
        <HoverCard custom={3}>
          <SectionLabel>🧪 Lab Values</SectionLabel>
          <LabValuesTable values={labValues} />
        </HoverCard>

        {/* Card 5 — AI Confidence */}
        <HoverCard custom={4} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <SectionLabel>🎯 AI Confidence</SectionLabel>
          <ConfidenceGauge score={report.ai_confidence_score} />
        </HoverCard>

        {/* Card 6 — Checklist */}
        <HoverCard custom={5}>
          <SectionLabel>✅ अगले कदम (Next Steps)</SectionLabel>
          <HealthChecklist items={checklist} onXP={handleAddXP} />
        </HoverCard>

        {/* Card 7 — Share (full width) */}
        <HoverCard custom={6} style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <SectionLabel>📱 Share with Family</SectionLabel>
          <ShareButton summary={summaryText} onXP={handleAddXP} />
        </HoverCard>

      </div>

      {/* Doctor Chat */}
      <DoctorChat onSend={handleChatSend} />
    </PageShell>
  );
}
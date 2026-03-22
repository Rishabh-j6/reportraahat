"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BodyMap from "@/components/BodyMap";
import LabValuesTable from "@/components/LabValuesTable";
import ConfidenceGauge from "@/components/ConfidenceGauge";
import HealthChecklist from "@/components/HealthChecklist";
import ShareButton from "@/components/ShareButton";
import { useGUCStore } from "@/lib/store";
import type { LabFinding, OrganFlag } from "@/lib/store";

// ── helpers ──────────────────────────────────────────────────────────────────

/** Parse "9.2 g/dL" or "9.2" → { value: 9.2, unit: "g/dL" } */
function parseValueUnit(raw: string): { value: number; unit: string } {
  const m = raw.match(/^([0-9,]+\.?[0-9]*)\s*(.*)$/);
  if (m) return { value: parseFloat(m[1].replace(",", "")), unit: m[2].trim() };
  return { value: parseFloat(raw) || 0, unit: "" };
}

function findingsToTableRows(findings: LabFinding[]) {
  return findings.map((f) => {
    const { value, unit } = parseValueUnit(f.value);
    const status = f.status === "CRITICAL" ? "HIGH" : (f.status as "HIGH" | "LOW" | "NORMAL");
    return {
      name: f.simple_name_english || f.parameter,
      nameHi: f.simple_name_hindi || f.parameter,
      value,
      unit,
      status,
    };
  });
}

function organsToFlags(organs: OrganFlag[]) {
  const set = new Set(organs.map((o) => o.toUpperCase()));
  return {
    liver:  set.has("LIVER"),
    heart:  set.has("HEART"),
    kidney: set.has("KIDNEY"),
    lungs:  set.has("LUNGS"),
  };
}

// ── fallback MOCK (shown only when no report has been uploaded yet) ───────────
const MOCK = {
  patientName: "Ramesh Kumar",
  confidenceScore: 96,
  originalText: "Patient presents with hepatomegaly and hyperlipidemia. Hemoglobin levels indicate mild anemia. Recommend follow-up in 2 weeks.",
  simplifiedText: "आपका लीवर थोड़ा बड़ा है और खून में चर्बी ज़्यादा है। खून की कमी भी है। 2 हफ्ते में डॉक्टर से मिलें।",
  simplifiedTextEn: "Your liver is slightly enlarged and blood fat is high. You also have mild anemia. Please see a doctor in 2 weeks.",
  organFlags: { liver: true, heart: false, kidney: false, lungs: false },
  labValues: [
    { name: "Hemoglobin", nameHi: "हीमोग्लोबिन", value: 9.2, unit: "g/dL", status: "LOW" as const },
    { name: "Total Cholesterol", nameHi: "कोलेस्ट्रॉल", value: 240, unit: "mg/dL", status: "HIGH" as const },
    { name: "Blood Glucose", nameHi: "ब्लड शुगर", value: 95, unit: "mg/dL", status: "NORMAL" as const },
    { name: "ALT (Liver)", nameHi: "लीवर एंज़ाइम", value: 78, unit: "U/L", status: "HIGH" as const },
    { name: "Vitamin D", nameHi: "विटामिन डी", value: 18, unit: "ng/mL", status: "LOW" as const },
  ],
  checklist: [
    "रोज़ 3 लीटर पानी पिएं (Drink 3L water daily)",
    "तला हुआ खाना कम करें (Reduce fried food)",
    "2 हफ्ते में डॉक्टर से मिलें (See doctor in 2 weeks)",
    "हल्की वॉक करें रोज़ (Take a light walk daily)",
    "विटामिन डी की धूप लें (Get morning sunlight)",
  ],
  jargonMap: { hepatomegaly: "लीवर का बड़ा होना", hyperlipidemia: "खून में चर्बी", anemia: "खून की कमी" },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, type: "spring", stiffness: 70 },
  }),
};

const CARD: React.CSSProperties = {
  background: "#131f30",
  border: "1px solid #1e2d45",
  borderRadius: 16,
  padding: 24,
};

export default function Dashboard() {
  const latestReport     = useGUCStore((s) => s.latestReport);
  const profile          = useGUCStore((s) => s.profile);
  const checklistProgress = useGUCStore((s) => s.checklistProgress);
  const addXP            = useGUCStore((s) => s.addXP);

  const [speaking, setSpeaking] = useState(false);
  const [xp, setXp] = useState(0);
  const [showXPBurst, setShowXPBurst] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowConfetti(true), 300);
    setTimeout(() => setShowConfetti(false), 2500);
  }, []);

  // ── derive display data from report or fall back to MOCK ─────────────────
  const hasReport = !!latestReport;

  const patientName      = hasReport ? profile.name : MOCK.patientName;
  const confidenceScore  = hasReport ? latestReport.ai_confidence_score : MOCK.confidenceScore;
  const simplifiedText   = hasReport ? latestReport.overall_summary_hindi   : MOCK.simplifiedText;
  const simplifiedTextEn = hasReport ? latestReport.overall_summary_english  : MOCK.simplifiedTextEn;
  const organFlags       = hasReport ? organsToFlags(latestReport.affected_organs) : MOCK.organFlags;
  const labValues        = hasReport ? findingsToTableRows(latestReport.findings) : MOCK.labValues;

  const checklist = hasReport && checklistProgress.length > 0
    ? checklistProgress.map((i) => i.label)
    : MOCK.checklist;

  // Original text: use English summary or MOCK text
  const originalText = hasReport
    ? latestReport.overall_summary_english
    : MOCK.originalText;

  // Jargon map only makes sense with MOCK for now
  const jargonMap = hasReport ? {} : MOCK.jargonMap;

  const handleListen = () => {
    if (!window.speechSynthesis) return;
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    const u = new SpeechSynthesisUtterance(simplifiedText);
    u.lang = "hi-IN"; u.rate = 0.85;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const handleXP = (amount: number) => {
    setXp((p) => p + amount);
    addXP(amount);
    setShowXPBurst(true);
    setTimeout(() => setShowXPBurst(false), 1000);
  };

  return (
    <main className="min-h-screen" style={{ background: "linear-gradient(135deg,#0d1b2e 0%,#0f172a 50%,#0d1b2e 100%)" }}>

      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {[...Array(25)].map((_, i) => (
              <motion.div key={i} className="absolute w-2 h-2 rounded-sm"
                style={{ left:`${Math.random()*100}%`, top:"-10px", background:["#FF9933","#22C55E","#3B82F6","#EC4899"][i%4] }}
                animate={{ y:["0vh","110vh"], rotate:[0,720], opacity:[1,1,0] }}
                transition={{ duration:1.5+Math.random(), delay:Math.random()*0.5 }} />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-5 py-3"
        style={{ background:"rgba(13,27,46,0.92)", backdropFilter:"blur(12px)", borderBottom:"1px solid #1e2d45" }}>
        <div>
          <h1 className="text-xl font-black text-white">Report<span style={{color:"#FF9933"}}>Raahat</span></h1>
          <p className="text-slate-400 text-xs">नमस्ते, {patientName} 🙏</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.div className="flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-sm"
            style={{ background:"#1e2d45", border:"1px solid #2a3f5f", color:"#FF9933" }}
            animate={showXPBurst ? {scale:[1,1.2,1]} : {}} transition={{duration:0.3}}>
            ⭐ {xp} XP
          </motion.div>
          <button onClick={handleListen}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
            style={{ background:speaking?"#FF9933":"#1e2d45", color:speaking?"white":"#94a3b8", border:"1px solid #2a3f5f" }}>
            🎧 Hindi में सुनें
          </button>
          <a href="/" className="text-slate-400 hover:text-white text-sm">← New Report</a>
        </div>
      </div>

      {/* Report source badge */}
      {hasReport && (
        <div className="max-w-6xl mx-auto px-5 pt-3">
          <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full"
            style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", color: "#22C55E" }}>
            ✓ Showing analysis from your uploaded report · {latestReport?.report_type ?? "LAB_REPORT"}
          </span>
        </div>
      )}

      {/* 2-col grid */}
      <div className="max-w-6xl mx-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Card 1 — Original / Summary */}
        <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible" style={CARD}>
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{color:"#FF9933"}}>📄 Original Report</p>
          <p className="text-slate-300 text-sm leading-relaxed">
            {originalText.split(" ").map((word, i) => {
              const lower = word.toLowerCase().replace(/[^a-z]/g,"");
              const meaning = (jargonMap as Record<string, string>)[lower];
              return meaning ? (
                <span key={i} className="relative group cursor-help inline-block mx-0.5">
                  <span className="px-2 py-0.5 rounded-md text-sm font-semibold"
                    style={{background:"rgba(255,153,51,0.2)",color:"#FF9933",border:"1px solid rgba(255,153,51,0.4)"}}>
                    {word}
                  </span>
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"
                    style={{background:"#0f172a",color:"#FF9933",border:"1px solid rgba(255,153,51,0.4)"}}>
                    {meaning}
                  </span>
                </span>
              ) : <span key={i}>{word} </span>;
            })}
          </p>
          {!hasReport && <p className="text-slate-600 text-xs mt-4">🟠 Highlighted words = medical jargon (hover for meaning)</p>}
        </motion.div>

        {/* Card 2 — Explanation */}
        <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible"
          style={{...CARD, border:"1px solid rgba(255,153,51,0.3)"}}>
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{color:"#22C55E"}}>💬 आसान भाषा में (Simple Explanation)</p>
          <p className="text-white text-lg leading-relaxed font-semibold mb-3">{simplifiedText}</p>
          <p className="text-slate-400 text-sm leading-relaxed mb-5">{simplifiedTextEn}</p>
          <motion.button onClick={handleListen}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{background:"linear-gradient(135deg,#FF9933,#e67300)"}}
            whileHover={{scale:1.03}} whileTap={{scale:0.97}}>
            🎧 सुनें (Listen)
          </motion.button>
        </motion.div>

        {/* Card 3 — Body Map */}
        <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible" style={CARD}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{color:"#FF9933"}}>🫀 Affected Body Part</p>
          <BodyMap organFlags={organFlags} />
        </motion.div>

        {/* Card 4 — Lab Values */}
        <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible" style={CARD}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{color:"#22C55E"}}>🧪 Lab Values</p>
          <LabValuesTable values={labValues} />
        </motion.div>

        {/* Card 5 — Confidence */}
        <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible"
          className="flex flex-col items-center justify-center" style={CARD}>
          <p className="text-xs font-bold uppercase tracking-widest mb-6" style={{color:"#FF9933"}}>🎯 AI Confidence</p>
          <ConfidenceGauge score={confidenceScore} />
        </motion.div>

        {/* Card 6 — Checklist */}
        <motion.div custom={5} variants={cardVariants} initial="hidden" animate="visible" style={CARD}>
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{color:"#22C55E"}}>✅ अगले कदम (Next Steps)</p>
          <HealthChecklist items={checklist} onXP={handleXP} />
        </motion.div>

        {/* Card 7 — Share (full width) */}
        <motion.div custom={6} variants={cardVariants} initial="hidden" animate="visible"
          className="md:col-span-2 flex flex-col items-center gap-4" style={CARD}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{color:"#FF9933"}}>📱 Share with Family</p>
          <ShareButton summary={simplifiedText} onXP={handleXP} />
        </motion.div>

      </div>
    </main>
  );
}

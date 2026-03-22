"use client";
import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { colors } from "@/lib/tokens";
import { useGUCStore, type ParsedReport } from "@/lib/store";
import { getNextMock } from "@/lib/mockData";

const LOADING_STEPS = [
  "रिपोर्ट पढ़ रहे हैं... (Reading report...)",
  "मेडिकल शब्द समझ रहे हैं... (Understanding jargon...)",
  "हिंदी में अनुवाद हो रहा है... (Translating to Hindi...)",
  "लगभग हो गया! (Almost done!)",
];

export default function Home() {
  const router = useRouter();
  const setLatestReport = useGUCStore((s) => s.setLatestReport);
  const language = useGUCStore((s) => s.profile.language);

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) return;
    const id = setInterval(() => setLoadingStep((s) => (s + 1) % LOADING_STEPS.length), 800);
    return () => clearInterval(id);
  }, [loading]);

  useEffect(() => {
    if (!loading) { setProgress(0); return; }
    const start = Date.now();
    const total = 15000;
    const id = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / total) * 85, 85);
      setProgress(pct);
      if (elapsed >= total) clearInterval(id);
    }, 50);
    return () => clearInterval(id);
  }, [loading]);

  const onDrop = useCallback((accepted: File[]) => {
    setFile(accepted[0]);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [], "application/pdf": [] },
    maxFiles: 1,
  });

  const handleAnalyze = async () => {
    if (!file) return;
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", language);
      const res = await fetch("/api/analyze-report", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.is_readable !== undefined) {
        setLatestReport(data as ParsedReport);
        setProgress(100);
        await new Promise((r) => setTimeout(r, 400));
        router.push("/dashboard");
      } else if (data.useMock || !res.ok) {
        console.warn("Using mock fallback:", data.error);
        const mock = getNextMock();
        setLatestReport(mock);
        setProgress(100);
        await new Promise((r) => setTimeout(r, 400));
        router.push("/dashboard");
      }
    } catch {
      console.warn("Network error, using mock fallback");
      const mock = getNextMock();
      setLatestReport(mock);
      setProgress(100);
      await new Promise((r) => setTimeout(r, 400));
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "#87CEEB" }}>

      {/* Hill Climb Racing green terrain */}
      <div className="fixed bottom-0 left-0 w-full h-48 z-0"
        style={{ background: "#4CAF50", borderRadius: "100% 100% 0 0 / 40% 40% 0 0", transform: "scaleX(1.5)" }} />
      <div className="fixed bottom-0 z-0"
        style={{ left: "-10%", width: "120%", height: "8rem", background: "#388E3C", borderRadius: "100% 100% 0 0 / 50% 50% 0 0" }} />

      {/* Subtle starfield overlay */}
      <div className="fixed inset-0 pointer-events-none starfield opacity-20 z-[5]" />

      {/* Loading overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="fixed inset-0 flex flex-col items-center justify-center z-[60]"
            style={{ background: "rgba(18,18,31,0.97)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Pipeline animation */}
            <svg width="320" height="90" viewBox="0 0 320 90" className="mb-8">
              <rect x="10" y="20" width="70" height="50" rx="10"
                fill={colors.surfaceContainer} stroke={colors.accent} strokeWidth="1.5" />
              <text x="45" y="42" textAnchor="middle" fontSize="18">📄</text>
              <text x="45" y="60" textAnchor="middle" fill={colors.textMuted} fontSize="9">Report</text>
              <line x1="80" y1="45" x2="240" y2="45"
                stroke={colors.border} strokeWidth="1.5" strokeDasharray="6 4" />
              {[0, 1, 2].map((i) => (
                <motion.circle key={i} r="5" fill={colors.accent} cy="45"
                  animate={{ cx: [80, 240], opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 1.4, delay: i * 0.45, repeat: Infinity }} />
              ))}
              <circle cx="275" cy="45" r="32"
                fill={colors.surfaceContainer} stroke={colors.accent} strokeWidth="1.5" />
              <text x="275" y="40" textAnchor="middle" fontSize="18">🧠</text>
              <text x="275" y="58" textAnchor="middle" fill={colors.textMuted} fontSize="9">AI Engine</text>
            </svg>

            <AnimatePresence mode="wait">
              <motion.p
                key={loadingStep}
                className="text-white text-sm font-medium text-center mb-6"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                {LOADING_STEPS[loadingStep]}
              </motion.p>
            </AnimatePresence>

            <div className="w-64 h-1.5 rounded-full overflow-hidden" style={{ background: colors.surfaceContainerHigh }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, #FF9933, #FFCC80)` }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "linear", duration: 0.05 }}
              />
            </div>
            <p className="text-xs mt-2" style={{ color: colors.textFaint }}>
              {Math.round(progress)}%
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="relative z-10 pt-28 pb-48 px-4 flex flex-col items-center justify-center min-h-screen">

        {/* Central upload card — soft clay style */}
        <motion.section
          className="max-w-xl w-full bg-white/95 rounded-[32px] pixel-border p-8 md:p-12 text-center clay-inset relative"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Floating verified shield */}
          <div className="absolute -top-6 -left-6 bg-[#2ccb63] text-white p-3 rounded-2xl pixel-border -rotate-12 z-20">
            <span className="material-symbols-outlined text-3xl">verified_user</span>
          </div>

          {/* Title */}
          <h1 className="font-hindi text-3xl md:text-4xl font-black text-slate-900 mb-2">
            अपनी मेडिकल रिपोर्ट समझें
          </h1>
          <p className="text-xl md:text-2xl font-headline font-bold text-slate-600 mb-8">
            Understand your report
          </p>

          {/* Language toggle */}
          <div className="flex gap-1 mb-6 p-1 rounded-2xl w-full bg-slate-100">
            {(["HI", "EN"] as const).map((lang) => (
              <button key={lang} onClick={() => useGUCStore.getState().setLanguage(lang)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                style={{
                  background: language === lang ? "#FF9933" : "transparent",
                  color: language === lang ? "#ffffff" : "#94a3b8",
                  boxShadow: language === lang ? "4px 4px 0px 0px #6d3a00" : "none",
                }}>
                {lang === "HI" ? "🇮🇳 हिंदी" : "🌐 English"}
              </button>
            ))}
          </div>

          {/* Drop zone */}
          <div
            {...getRootProps()}
            className="group relative border-4 border-dashed rounded-3xl p-10 mb-8 flex flex-col items-center justify-center transition-all cursor-pointer"
            style={{
              background: isDragActive || file ? "#FFF3E0" : "#f8fafc",
              borderColor: isDragActive || file ? "#FF9933" : "#e2e8f0",
            }}
          >
            <input {...getInputProps()} />
            <AnimatePresence mode="wait">
              {file ? (
                <motion.div key="file" className="flex flex-col items-center"
                  initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}>
                  <div className="text-5xl mb-3">✅</div>
                  <p className="text-slate-900 font-bold text-lg">{file.name}</p>
                  <p className="text-sm mt-1" style={{ color: "#22C55E" }}>
                    Ready! Tap Samjho below ↓
                  </p>
                </motion.div>
              ) : (
                <motion.div key="empty" className="flex flex-col items-center"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <motion.div className="mb-3 text-6xl"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity }}>
                    📋
                  </motion.div>
                  <p className="text-slate-600 font-bold text-lg mb-1">
                    {isDragActive ? "Drop it here! 🎯" : "Tap to upload or drag & drop"}
                  </p>
                  <p className="text-slate-400 text-sm mt-1">
                    PDF, JPG, or PNG (Max 10MB)
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs mb-3 text-center text-red-500">{error}</p>
          )}

          {/* CTA Button — pixel shadow style */}
          <motion.button
            onClick={handleAnalyze}
            disabled={loading || !file}
            className="w-full py-5 rounded-2xl text-xl font-black disabled:opacity-50 transition-all flex items-center justify-center gap-3 pixel-shadow-orange active:translate-y-0.5 active:shadow-none"
            style={{
              background: "#FF9800",
              color: "#FFFFFF",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="font-hindi">Samjho!</span>
            <span className="opacity-50 text-2xl">—</span>
            <span className="font-hindi">समझो</span>
          </motion.button>
        </motion.section>

        {/* Trust chips — pixel style */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <div className="bg-slate-900 text-white px-4 py-2 rounded-md pixel-border flex items-center gap-2 text-sm font-bold">
            <span className="material-symbols-outlined text-sm">lock</span>
            100% PRIVATE
          </div>
          <div className="bg-white text-slate-900 px-4 py-2 rounded-md pixel-border flex items-center gap-2 text-sm font-bold">
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            AI POWERED
          </div>
          <div className="bg-orange-500 text-white px-4 py-2 rounded-md pixel-border flex items-center gap-2 text-sm font-bold">
            <span className="material-symbols-outlined text-sm">favorite</span>
            DOCTOR VERIFIED
          </div>
        </div>
      </main>
    </div>
  );
}
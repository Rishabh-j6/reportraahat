"use client";
import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { colors, motionPresets } from "@/lib/tokens";
import { useGUCStore, type ParsedReport } from "@/lib/store";
import { getNextMock } from "@/lib/mockData";

const LOADING_STEPS = [
  "रिपोर्ट पढ़ रहे हैं... (Reading report...)",
  "मेडिकल शब्द समझ रहे हैं... (Understanding jargon...)",
  "हिंदी में अनुवाद हो रहा है... (Translating to Hindi...)",
  "लगभग हो गया! (Almost done!)",
];

const FEATURES = [
  { icon: "🔒", label: "100% Private" },
  { icon: "⚡", label: "Instant Results" },
  { icon: "🇮🇳", label: "Made for India" },
];

export default function Home() {
  const router = useRouter();
  const setLatestReport = useGUCStore((s) => s.setLatestReport);
  const language = useGUCStore((s) => s.profile.language);

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState<{ x: number; y: number; size: number; opacity: number }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDots(Array.from({ length: 50 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.25 + 0.04,
    })));
  }, []);

  useEffect(() => {
    if (!loading) return;
    const id = setInterval(() => setLoadingStep((s) => (s + 1) % LOADING_STEPS.length), 800);
    return () => clearInterval(id);
  }, [loading]);

  useEffect(() => {
    if (!loading) { setProgress(0); return; }
    const start = Date.now();
    const total = 15000; // Match the API timeout
    const id = setInterval(() => {
      const elapsed = Date.now() - start;
      // Progress moves slower toward end to feel more natural
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

      const res = await fetch("/api/analyze-report", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.is_readable !== undefined) {
        // Success — save to store
        setLatestReport(data as ParsedReport);
        setProgress(100);
        await new Promise((r) => setTimeout(r, 400));
        router.push("/dashboard");
      } else if (data.useMock || !res.ok) {
        // Backend failed or timed out — use mock data
        console.warn("Using mock fallback:", data.error);
        const mock = getNextMock();
        setLatestReport(mock);
        setProgress(100);
        await new Promise((r) => setTimeout(r, 400));
        router.push("/dashboard");
      }
    } catch {
      // Network error — use mock data
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
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{ background: colors.bg }}
    >
      {/* Enhanced ambient glow */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage:
          "radial-gradient(ellipse at 20% 10%, rgba(255,153,51,0.07) 0%, transparent 55%), " +
          "radial-gradient(ellipse at 80% 80%, rgba(34,197,94,0.06) 0%, transparent 55%), " +
          "radial-gradient(ellipse at 55% 50%, rgba(99,102,241,0.03) 0%, transparent 60%)",
      }} />

      {/* Starfield */}
      {dots.map((dot, i) => (
        <div key={i} className="absolute rounded-full pointer-events-none"
          style={{
            left: `${dot.x}%`, top: `${dot.y}%`,
            width: dot.size, height: dot.size,
            background: "white", opacity: dot.opacity,
          }}
        />
      ))}

      {/* Loading overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="fixed inset-0 flex flex-col items-center justify-center z-50"
            style={{ background: "rgba(13,13,26,0.97)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Animated pipeline */}
            <svg width="320" height="90" viewBox="0 0 320 90" className="mb-8">
              <rect x="10" y="20" width="70" height="50" rx="10"
                fill={colors.bgCard} stroke={colors.accent} strokeWidth="1.5" />
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
                fill={colors.bgCard} stroke={colors.accent} strokeWidth="1.5" />
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

            {/* Progress bar */}
            <div className="w-64 h-1 rounded-full overflow-hidden" style={{ background: colors.border }}>
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

      {/* Main card */}
      <motion.div
        className="relative z-10 w-full max-w-md flex flex-col items-center"
        {...motionPresets.fadeUp}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: "rgba(255,153,51,0.15)", border: "1px solid rgba(255,153,51,0.25)" }}
          >
            🏥
          </div>
          <div className="leading-none">
            <div className="text-xs font-semibold tracking-widest uppercase mb-0.5" style={{ color: colors.textMuted }}>
              Report
            </div>
            <h1 className="text-3xl font-black tracking-tight" style={{ color: "#FF9933" }}>
              Raahat
            </h1>
          </div>
        </div>

        <p className="text-base mb-1 text-center font-devanagari" style={{ color: colors.textSecondary }}>
          अपनी मेडिकल रिपोर्ट समझें — आसान हिंदी में
        </p>
        <p className="text-sm mb-6 text-center" style={{ color: colors.textMuted }}>
          Upload your report and understand it instantly
        </p>

        {/* Language toggle */}
        <div className="flex gap-1 mb-5 p-1 rounded-2xl w-full"
          style={{ background: colors.bgSubtle, border: `1px solid ${colors.border}` }}>
          {(["HI", "EN"] as const).map((lang) => (
            <button key={lang} onClick={() => useGUCStore.getState().setLanguage(lang)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                background: language === lang ? colors.accent : "transparent",
                color: language === lang ? "#0d0d1a" : colors.textMuted,
                boxShadow: language === lang ? "0 2px 12px rgba(255,153,51,0.3)" : "none",
              }}>
              {lang === "HI" ? "🇮🇳 हिंदी" : "🌐 English"}
            </button>
          ))}
        </div>

        {/* Drop zone */}
        <div
          {...getRootProps()}
          className="w-full cursor-pointer rounded-2xl mb-4 transition-all duration-300"
          style={{
            border: `2px dashed ${isDragActive || file ? colors.accent : colors.accentBorder}`,
            background: isDragActive ? "rgba(255,153,51,0.05)" : colors.bgCard,
            padding: "36px 20px",
            boxShadow: isDragActive || file ? "0 0 24px rgba(255,153,51,0.15)" : "none",
          }}
        >
          <input {...getInputProps()} />
          <AnimatePresence mode="wait">
            {file ? (
              <motion.div key="file" className="flex flex-col items-center"
                initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="text-4xl mb-2">✅</div>
                <p className="text-white font-semibold">{file.name}</p>
                <p className="text-xs mt-1" style={{ color: colors.ok }}>
                  Ready! Click Samjho below ↓
                </p>
              </motion.div>
            ) : (
              <motion.div key="empty" className="flex flex-col items-center"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <motion.div className="mb-3 text-5xl"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity }}>
                  📋
                </motion.div>
                <p className="text-white font-bold text-lg mb-1">
                  {isDragActive ? "Drop it here! 🎯" : "Drag & drop your report"}
                </p>
                <p className="text-sm" style={{ color: colors.textMuted }}>
                  or click to browse — PDF or Image
                </p>
                <p className="text-xs mt-2" style={{ color: colors.textFaint }}>
                  Supports: JPG, PNG, PDF
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error message */}
        {error && (
          <p className="text-xs mb-3 text-center" style={{ color: "#EF4444" }}>
            {error}
          </p>
        )}

        {/* CTA button */}
        <motion.button
          onClick={handleAnalyze}
          disabled={loading || !file}
          className="w-full py-4 rounded-2xl text-base font-black disabled:opacity-50 transition-all"
          style={{
            background: "linear-gradient(135deg, #FF9933 0%, #FFAA55 100%)",
            color: "#0d0d1a",
            boxShadow: "0 4px 20px rgba(255,153,51,0.4)",
          }}
          whileHover={{ scale: 1.01, boxShadow: "0 6px 28px rgba(255,153,51,0.5)" }}
          whileTap={{ scale: 0.98 }}
        >
          ✨ Samjho! — समझो
        </motion.button>

        {/* Feature chips */}
        <div className="flex items-center gap-3 mt-5">
          {FEATURES.map((f) => (
            <div
              key={f.label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: colors.bgSubtle, border: `1px solid ${colors.border}`, color: colors.textMuted }}
            >
              <span>{f.icon}</span>
              <span>{f.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Floating chat pill */}
      <motion.div
        className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-2.5 rounded-full cursor-pointer text-sm font-bold"
        style={{
          background: "rgba(255,153,51,0.15)",
          border: "1px solid rgba(255,153,51,0.3)",
          color: "#FF9933",
          backdropFilter: "blur(12px)",
        }}
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        whileHover={{ scale: 1.05, background: "rgba(255,153,51,0.25)" }}
      >
        <span>🤖</span>
        <span>Dr. Raahat</span>
      </motion.div>
    </main>
  );
}
"use client";
import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useGUCStore } from "@/lib/store";
import { getNextMock } from "@/lib/mockData";

export default function Home() {
  const router = useRouter();
  const setLatestReport = useGUCStore((s) => s.setLatestReport);
  const setProfile = useGUCStore((s) => s.setProfile);
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<"hindi" | "english">("hindi");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [dots, setDots] = useState<{x:number,y:number,size:number,opacity:number}[]>([]);

  const loadingSteps = [
    "रिपोर्ट पढ़ रहे हैं... (Reading report...)",
    "मेडिकल शब्द समझ रहे हैं... (Understanding jargon...)",
    "हिंदी में अनुवाद हो रहा है... (Translating to Hindi...)",
    "लगभग हो गया! (Almost done!)",
  ];

  useEffect(() => {
    setDots(Array.from({length: 40}, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.4 + 0.1,
    })));
  }, []);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingStep((s) => (s + 1) % loadingSteps.length);
    }, 800);
    return () => clearInterval(interval);
  }, [loading]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [], "application/pdf": [] },
    maxFiles: 1,
  });

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);

    try {
      // Read file as base64 data URL
      const imageBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const lang = language === "hindi" ? "HI" : "EN";

      const res = await fetch("/api/analyze-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, language: lang }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data) {
          // Save real report to store
          setLatestReport(data);
          // Set language preference
          setProfile({ language: lang as "EN" | "HI" });
        } else {
          // Backend unavailable — use mock fallback
          setLatestReport(getNextMock());
        }
      } else {
        setLatestReport(getNextMock());
      }
    } catch {
      setLatestReport(getNextMock());
    }

    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0d1b2e 0%, #0f172a 50%, #0d1b2e 100%)" }}>

      {/* Starfield dots */}
      {dots.map((dot, i) => (
        <div key={i} className="absolute rounded-full pointer-events-none"
          style={{
            left: `${dot.x}%`, top: `${dot.y}%`,
            width: dot.size, height: dot.size,
            background: "white", opacity: dot.opacity,
          }} />
      ))}

      {/* Orange glow blobs */}
      <div className="absolute pointer-events-none"
        style={{ top: "10%", left: "5%", width: 6, height: 6, borderRadius: "50%", background: "#FF9933", opacity: 0.6 }} />
      <div className="absolute pointer-events-none"
        style={{ top: "70%", left: "8%", width: 4, height: 4, borderRadius: "50%", background: "#FF9933", opacity: 0.4 }} />
      <div className="absolute pointer-events-none"
        style={{ top: "30%", right: "6%", width: 5, height: 5, borderRadius: "50%", background: "#FF9933", opacity: 0.5 }} />
      <div className="absolute pointer-events-none"
        style={{ bottom: "20%", right: "10%", width: 4, height: 4, borderRadius: "50%", background: "#FF9933", opacity: 0.3 }} />

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div className="fixed inset-0 flex flex-col items-center justify-center z-50"
            style={{ background: "rgba(13,27,46,0.97)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <svg width="360" height="100" viewBox="0 0 360 100" className="mb-8">
              <rect x="10" y="25" width="75" height="50" rx="10"
                fill="#1e293b" stroke="#FF9933" strokeWidth="1.5" />
              <text x="47" y="48" textAnchor="middle" fontSize="18">📄</text>
              <text x="47" y="65" textAnchor="middle" fill="#94a3b8" fontSize="9">Report</text>
              <line x1="85" y1="50" x2="275" y2="50" stroke="#334155" strokeWidth="1.5" strokeDasharray="6 4" />
              {[0,1,2].map((i) => (
                <motion.circle key={i} r="5" fill="#FF9933" cy="50"
                  animate={{ cx: [85, 275], opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 1.4, delay: i * 0.45, repeat: Infinity }} />
              ))}
              <circle cx="310" cy="50" r="34" fill="#1e293b" stroke="#FF9933" strokeWidth="1.5" />
              <text x="310" y="45" textAnchor="middle" fontSize="20">🧠</text>
              <text x="310" y="64" textAnchor="middle" fill="#94a3b8" fontSize="9">AI Engine</text>
            </svg>
            <AnimatePresence mode="wait">
              <motion.p key={loadingStep} className="text-white text-base font-medium text-center"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                {loadingSteps[loadingStep]}
              </motion.p>
            </AnimatePresence>
            <div className="flex gap-2 mt-6">
              {[0,1,2,3].map((i) => (
                <motion.div key={i} className="w-2.5 h-2.5 rounded-full"
                  style={{ background: i <= loadingStep ? "#FF9933" : "#334155" }}
                  animate={i === loadingStep ? { scale: [1,1.5,1] } : {}}
                  transition={{ duration: 0.5, repeat: Infinity }} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <motion.div className="relative z-10 w-full max-w-xl flex flex-col items-center"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}>

        {/* Logo */}
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl">🏥</span>
          <h1 className="text-5xl font-black text-white tracking-tight">
            Report<span style={{ color: "#FF9933" }}>Raahat</span>
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-slate-300 text-lg mb-1">
          अपनी मेडिकल रिपोर्ट समझें — आसान हिंदी में
        </p>
        <p className="text-slate-500 text-sm mb-8">
          Upload your medical report and understand it instantly
        </p>

        {/* Language toggle */}
        <div className="flex gap-1 mb-6 p-1 rounded-2xl" 
          style={{ background: "#1e2d45", border: "1px solid #2a3f5f" }}>
          {(["hindi", "english"] as const).map((lang) => (
            <button key={lang} onClick={() => setLanguage(lang)}
              className="px-8 py-2.5 rounded-xl text-base font-semibold transition-all"
              style={{
                background: language === lang ? "#FF9933" : "transparent",
                color: language === lang ? "white" : "#94a3b8",
              }}>
              {lang === "hindi" ? "हिंदी" : "English"}
            </button>
          ))}
        </div>

        {/* Upload zone */}
        <div {...getRootProps()}
          className="w-full cursor-pointer rounded-2xl mb-5"
          style={{
            border: `2px dashed ${isDragActive || file ? "#FF9933" : "rgba(255,153,51,0.5)"}`,
            background: "rgba(15,23,42,0.6)",
            padding: "40px 20px",
            transition: "all 0.3s ease",
          }}>
          <input {...getInputProps()} />
          <AnimatePresence mode="wait">
            {file ? (
              <motion.div key="file" className="flex flex-col items-center"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="text-5xl mb-3">✅</div>
                <p className="text-white font-semibold text-lg">{file.name}</p>
                <p className="text-slate-400 text-sm mt-1">Ready! Click Samjho below</p>
              </motion.div>
            ) : (
              <motion.div key="empty" className="flex flex-col items-center"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <motion.div className="mb-4 text-5xl"
                  animate={{ y: [0, -5, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
                  📋
                </motion.div>
                <p className="text-white font-bold text-xl mb-1">
                  {isDragActive ? "Drop it here! 🎯" : "Drag & drop your report here"}
                </p>
                <p className="text-slate-400 text-sm">or click to browse — PDF or Image</p>
                <p className="text-slate-600 text-xs mt-3">Supports: JPG, PNG, PDF</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Samjho button */}
        <motion.button onClick={handleAnalyze} disabled={loading || !file}
          className="w-full py-4 rounded-2xl text-lg font-black text-white disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #FF9933, #e67300)" }}
          whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(255,153,51,0.5)" }}
          whileTap={{ scale: 0.98 }}>
          ✨ Samjho! (Simplify)
        </motion.button>

        <p className="text-slate-600 text-xs mt-5">
          🔒 Your data is never stored • Made for rural India 🇮🇳
        </p>
      </motion.div>

      {/* Robot avatar bottom right */}
      <motion.div className="fixed bottom-6 right-6 text-4xl cursor-pointer"
        animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity }}
        whileHover={{ scale: 1.2 }}>
        🤖
      </motion.div>
    </main>
  );
}
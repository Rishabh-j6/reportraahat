"use client";
import { useState } from "react";
import { motion } from "framer-motion";

interface Props {
  summary: string;
  onXP: (amount: number) => void;
}

export default function ShareButton({ summary, onXP }: Props) {
  const [shared, setShared] = useState(false);

  const handleShare = () => {
    const message = `🏥 *ReportRaahat* से मेरी रिपोर्ट का सारांश:\n\n${summary}\n\n_ReportRaahat पर देखें: reportraahat.vercel.app_`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    setShared(true);
    onXP(30);
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <p className="text-slate-400 text-xs text-center">
        परिवार को भेजें और उन्हें भी समझाएं
      </p>

      <motion.button onClick={handleShare}
        className="whatsapp-btn w-full py-3 px-6 flex items-center justify-center gap-2"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}>
        <span className="text-xl">💬</span>
        <span>WhatsApp पर Share करें</span>
      </motion.button>

      {shared && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          className="text-xs font-medium px-3 py-1 rounded-full"
          style={{ background: "rgba(37,211,102,0.15)", color: "#25D366" }}>
          ✅ Shared! +30 XP earned 🎉
        </motion.div>
      )}

      <div className="text-xs text-slate-600 text-center">
        🔒 No data is stored or sent to anyone
      </div>
    </div>
  );
}
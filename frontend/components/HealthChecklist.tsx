"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  items: string[];
  onXP: (amount: number) => void;
}

export default function HealthChecklist({ items, onXP }: Props) {
  const [checked, setChecked] = useState<boolean[]>(new Array(items.length).fill(false));
  const [floatingXP, setFloatingXP] = useState<{ id: number; x: number } | null>(null);

  const toggle = (i: number) => {
    if (checked[i]) return;
    const newChecked = [...checked];
    newChecked[i] = true;
    setChecked(newChecked);
    onXP(10);
    setFloatingXP({ id: Date.now(), x: Math.random() * 60 + 20 });
    setTimeout(() => setFloatingXP(null), 1000);
  };

  const doneCount = checked.filter(Boolean).length;

  return (
    <div className="relative">
      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 h-2 rounded-full" style={{ background: "#334155" }}>
          <motion.div className="h-2 rounded-full"
            style={{ background: "#22C55E" }}
            animate={{ width: `${(doneCount / items.length) * 100}%` }}
            transition={{ type: "spring", stiffness: 60 }}/>
        </div>
        <span className="text-xs text-slate-400">{doneCount}/{items.length}</span>
      </div>

      {/* Floating XP */}
      <AnimatePresence>
        {floatingXP && (
          <motion.div key={floatingXP.id}
            className="absolute z-10 text-sm font-bold pointer-events-none"
            style={{ left: `${floatingXP.x}%`, top: 0, color: "#FF9933" }}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -40 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}>
            +10 XP ⭐
          </motion.div>
        )}
      </AnimatePresence>

      {/* Items */}
      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <motion.div key={i}
            onClick={() => toggle(i)}
            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
            style={{
              background: checked[i] ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.03)",
              border: checked[i] ? "1px solid rgba(34,197,94,0.3)" : "1px solid #334155",
            }}
            whileTap={{ scale: 0.97 }}>
            <motion.div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm"
              style={{
                background: checked[i] ? "#22C55E" : "#334155",
                border: checked[i] ? "none" : "2px solid #475569",
              }}
              animate={{ scale: checked[i] ? [1, 1.3, 1] : 1 }}
              transition={{ duration: 0.3 }}>
              {checked[i] ? "✓" : ""}
            </motion.div>
            <span className={`text-sm ${checked[i] ? "line-through text-slate-500" : "text-slate-200"}`}>
              {item}
            </span>
            {!checked[i] && (
              <span className="ml-auto text-xs text-slate-600">+10 XP</span>
            )}
          </motion.div>
        ))}
      </div>

      {doneCount === items.length && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center py-3 rounded-xl text-sm font-medium"
          style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E",
            border: "1px solid rgba(34,197,94,0.3)" }}>
          🎉 शाबाश! सभी काम पूरे हो गए! (All done!)
        </motion.div>
      )}
    </div>
  );
}
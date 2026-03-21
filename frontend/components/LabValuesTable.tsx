"use client";
import { motion } from "framer-motion";

interface LabValue {
  name: string;
  nameHi: string;
  value: number;
  unit: string;
  status: "HIGH" | "LOW" | "NORMAL";
}

export default function LabValuesTable({ values }: { values: LabValue[] }) {
  const pillClass = {
    HIGH: "pill-high",
    LOW: "pill-low",
    NORMAL: "pill-normal",
  };

  const arrow = { HIGH: "↑", LOW: "↓", NORMAL: "✓" };

  return (
    <div className="flex flex-col gap-2">
      {values.map((v, i) => (
        <motion.div key={v.name}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className="flex items-center justify-between py-2 px-1"
          style={{ borderBottom: "1px solid #1e293b" }}>
          <div>
            <p className="text-white text-sm font-medium">{v.nameHi}</p>
            <p className="text-slate-500 text-xs">{v.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-300 text-sm">
              {v.value} <span className="text-slate-500 text-xs">{v.unit}</span>
            </span>
            <span className={pillClass[v.status]}>
              {arrow[v.status]} {v.status}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
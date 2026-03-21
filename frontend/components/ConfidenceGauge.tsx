"use client";
import { useEffect, useState } from "react";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";

export default function ConfidenceGauge({ score }: { score: number }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += 2;
      if (current >= score) { setDisplayed(score); clearInterval(interval); }
      else setDisplayed(current);
    }, 30);
    return () => clearInterval(interval);
  }, [score]);

  const color = displayed > 85 ? "#22C55E" : displayed > 60 ? "#FF9933" : "#EF4444";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="90%"
            startAngle={90} endAngle={-270}
            data={[{ value: displayed, fill: color }]}>
            <RadialBar dataKey="value" cornerRadius={10} background={{ fill: "#334155" }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>{displayed}%</span>
          <span className="text-slate-400 text-xs">Confidence</span>
        </div>
      </div>
      <p className="text-slate-400 text-xs mt-2 text-center">
        AI की रिपोर्ट पढ़ने की सटीकता
      </p>
      <div className="mt-2 px-3 py-1 rounded-full text-xs font-medium"
        style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}>
        {displayed > 85 ? "✅ High Accuracy" : displayed > 60 ? "⚠️ Medium" : "❌ Low"}
      </div>
    </div>
  );
}
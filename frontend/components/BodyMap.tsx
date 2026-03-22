"use client";
import { useEffect, useState } from "react";

interface Props {
  organFlags: {
    liver?: boolean;
    heart?: boolean;
    kidney?: boolean;
    lungs?: boolean;
  };
}

export default function BodyMap({ organFlags }: Props) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    setTimeout(() => setPulse(true), 600);
  }, []);

  const glowStyle = {
    fill: "#FF9933",
    opacity: pulse ? 1 : 0.3,
    transition: "opacity 0.5s ease",
  };

  const normalStyle = {
    fill: "#334155",
    opacity: 0.6,
  };

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 100 200" width="140" height="260">
        {/* Head */}
        <ellipse cx="50" cy="18" rx="16" ry="18"
          style={{ fill: "#475569" }} />

        {/* Neck */}
        <rect x="44" y="34" width="12" height="10"
          style={{ fill: "#475569" }} />

        {/* Body */}
        <rect x="28" y="44" width="44" height="60" rx="8"
          style={{ fill: "#1e293b", stroke: "#475569", strokeWidth: 1 }} />

        {/* Heart */}
        <ellipse cx="43" cy="62" rx="8" ry="8"
          style={organFlags.heart ? glowStyle : normalStyle}
          className={organFlags.heart && pulse ? "organ-pulse" : ""}/>
        {organFlags.heart && (
          <text x="43" y="65" textAnchor="middle" fontSize="8" fill="white">♥</text>
        )}

        {/* Lungs */}
        <ellipse cx="35" cy="68" rx="5" ry="9"
          style={organFlags.lungs ? glowStyle : normalStyle}
          className={organFlags.lungs && pulse ? "organ-pulse" : ""}/>
        <ellipse cx="65" cy="68" rx="5" ry="9"
          style={organFlags.lungs ? glowStyle : normalStyle}
          className={organFlags.lungs && pulse ? "organ-pulse" : ""}/>

        {/* Liver */}
        <ellipse cx="58" cy="80" rx="10" ry="7"
          style={organFlags.liver ? glowStyle : normalStyle}
          className={organFlags.liver && pulse ? "organ-pulse" : ""}/>
        {organFlags.liver && (
          <text x="58" y="83" textAnchor="middle" fontSize="6" fill="white">liver</text>
        )}

        {/* Kidneys */}
        <ellipse cx="38" cy="90" rx="5" ry="7"
          style={organFlags.kidney ? glowStyle : normalStyle}
          className={organFlags.kidney && pulse ? "organ-pulse" : ""}/>
        <ellipse cx="62" cy="90" rx="5" ry="7"
          style={organFlags.kidney ? glowStyle : normalStyle}
          className={organFlags.kidney && pulse ? "organ-pulse" : ""}/>

        {/* Arms */}
        <rect x="12" y="46" width="14" height="45" rx="7"
          style={{ fill: "#475569" }} />
        <rect x="74" y="46" width="14" height="45" rx="7"
          style={{ fill: "#475569" }} />

        {/* Legs */}
        <rect x="30" y="106" width="16" height="55" rx="8"
          style={{ fill: "#475569" }} />
        <rect x="54" y="106" width="16" height="55" rx="8"
          style={{ fill: "#475569" }} />
      </svg>

      {/* Legend */}
      <div className="mt-2 flex flex-wrap gap-2 justify-center">
        {Object.entries(organFlags).map(([organ, active]) =>
          active ? (
            <span key={organ} className="text-xs px-2 py-1 rounded-full font-medium"
              style={{ background: "rgba(255,153,51,0.2)", color: "#FF9933",
                border: "1px solid rgba(255,153,51,0.4)" }}>
              🟠 {organ.charAt(0).toUpperCase() + organ.slice(1)}
            </span>
          ) : null
        )}
        {!Object.values(organFlags).some(Boolean) && (
          <span className="text-xs text-slate-500">No specific organ detected</span>
        )}
      </div>
    </div>
  );
}
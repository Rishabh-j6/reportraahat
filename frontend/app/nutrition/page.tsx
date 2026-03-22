"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGUCStore } from "@/lib/store";
import { PageShell, SectionLabel, Chip } from "@/components/ui";
import { colors, racingLabels } from "@/lib/tokens";

interface NutrientTarget {
  name: string;
  current: number;
  target: number;
  unit: string;
  color: string;
}

interface FoodItem {
  name_english: string;
  name_hindi: string;
  food_group: string;
  key_nutrients: string[];
  serving_suggestion: string;
  why_recommended: string;
}

interface NutritionResponse {
  deficiencies: string[];
  daily_targets: NutrientTarget[];
  recommended_foods: FoodItem[];
  dietary_advice: string;
}

const GROUP_COLORS: Record<string, { color: string; glow: string }> = {
  "Green Leafy Vegetables": { color: "#22C55E", glow: "rgba(34,197,94,0.3)" },
  "Lentils & Pulses": { color: "#FF9933", glow: "rgba(255,153,51,0.3)" },
  "Fruits": { color: "#c0c1ff", glow: "rgba(192,193,255,0.3)" },
  "Dairy": { color: "#06B6D4", glow: "rgba(6,182,212,0.3)" },
  "Grains & Cereals": { color: "#F59E0B", glow: "rgba(245,158,11,0.3)" },
  "Nuts & Seeds": { color: "#EF4444", glow: "rgba(239,68,68,0.3)" },
  "Sweets & Snacks": { color: "#EF4444", glow: "rgba(239,68,68,0.3)" },
};

const FOOD_ICONS: Record<string, string> = {
  "Green Leafy Vegetables": "🥬", "Lentils & Pulses": "🫘", "Fruits": "🍎",
  "Dairy": "🥛", "Grains & Cereals": "🌾", "Nuts & Seeds": "🥜",
  "Sweets & Snacks": "🍬", "Spices": "🌶️", "Non-Veg": "🍗",
};

const FALLBACK: NutritionResponse = {
  deficiencies: ["Iron", "Vitamin D"],
  daily_targets: [
    { name: "Protein", current: 40, target: 55, unit: "g", color: "#FF9933" },
    { name: "Iron", current: 6, target: 18, unit: "mg", color: "#22C55E" },
    { name: "Calcium", current: 500, target: 1000, unit: "mg", color: "#06B6D4" },
    { name: "Fibre", current: 15, target: 25, unit: "g", color: "#c0c1ff" },
    { name: "Energy", current: 1500, target: 2000, unit: "kcal", color: "#F59E0B" },
  ],
  dietary_advice: "Focus on iron-rich foods like palak, bajra roti, and rajma.",
  recommended_foods: [
    { name_english: "Palak Paneer", name_hindi: "पालक पनीर", food_group: "Green Leafy Vegetables", key_nutrients: ["HIGH IRON", "LOW CARB"], serving_suggestion: "200g curry with 2 rotis", why_recommended: "Rich in iron and complete protein from paneer." },
    { name_english: "Bajra Roti", name_hindi: "बाजरा रोटी", food_group: "Grains & Cereals", key_nutrients: ["COMPLEX CARB", "GLUTEN FREE"], serving_suggestion: "2 rotis with ghee", why_recommended: "Complex carbohydrates for sustained fuel." },
    { name_english: "Aamras", name_hindi: "आमरस", food_group: "Fruits", key_nutrients: ["VITAMIN A", "QUICK FUEL"], serving_suggestion: "1 small bowl", why_recommended: "Natural vitamins and quick energy." },
    { name_english: "Samosa", name_hindi: "समोसा", food_group: "Sweets & Snacks", key_nutrients: ["OIL PENALTY", "HIGH SODIUM"], serving_suggestion: "Avoid or limit to 1 piece", why_recommended: "" },
  ],
};

export default function NutritionPage() {
  const latestReport = useGUCStore((s) => s.latestReport);
  const profile = useGUCStore((s) => s.profile);
  const addXP = useGUCStore((s) => s.addXP);

  const [data, setData] = useState<NutritionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedFood, setExpandedFood] = useState<string | null>(null);
  const language = profile.language === "HI" ? "hindi" : "english";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/nutrition", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
        if (!res.ok) throw new Error();
        const json = await res.json();
        setData(json);
      } catch { setData(FALLBACK); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  // Tank quality — average nutrient coverage
  const tankQuality = useMemo(() => {
    if (!data?.daily_targets?.length) return 0;
    const avg = data.daily_targets.reduce((sum, t) => sum + Math.min(t.current / t.target, 1), 0) / data.daily_targets.length;
    return Math.round(avg * 100);
  }, [data]);

  if (loading) {
    return (
      <PageShell>
        <div className="space-y-4">
          <div className="h-10 w-40 rounded-xl animate-pulse" style={{ background: colors.surfaceContainerHigh }} />
          <div className="h-64 rounded-2xl animate-pulse" style={{ background: colors.surfaceContainerHigh }} />
          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: colors.surfaceContainerHigh }} />
            ))}
          </div>
        </div>
      </PageShell>
    );
  }

  const targets = data?.daily_targets ?? FALLBACK.daily_targets;
  const foods = data?.recommended_foods ?? FALLBACK.recommended_foods;

  return (
    <PageShell>
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-black tracking-tight" style={{ color: colors.textPrimary }}>
          {racingLabels.nutrition}
        </h1>
        <p className="text-sm font-bold uppercase tracking-widest mt-1" style={{ color: colors.accent }}>
          Indian Food Database
        </p>
      </div>

      {/* Radar / Tank Quality - Pentagon approximation via CSS */}
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
        className="mb-10 flex flex-col items-center">
        {/* Nutrient labels around the pentagon */}
        <div className="relative w-72 h-72 flex items-center justify-center">
          {/* Pentagon outline */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 300 300" width="280" height="280" className="opacity-40">
              <polygon points="150,20 280,110 230,270 70,270 20,110" fill="none" stroke={colors.surfaceContainerHigh} strokeWidth="2" />
              <polygon points="150,70 230,130 200,230 100,230 70,130" fill="none" stroke={colors.border} strokeWidth="1" />
              <polygon points="150,120 180,150 170,190 130,190 120,150" fill="none" stroke={colors.border} strokeWidth="1" />
            </svg>
            <svg viewBox="0 0 300 300" width="280" height="280" className="absolute">
              <polygon
                points={targets.length >= 5
                  ? `150,${20 + (1 - Math.min(targets[0].current / targets[0].target, 1)) * 130} ${150 + Math.min(targets[1].current / targets[1].target, 1) * 130},${110 + (1 - Math.min(targets[1].current / targets[1].target, 1)) * 20} ${150 + Math.min(targets[2].current / targets[2].target, 1) * 80},${270 - (1 - Math.min(targets[2].current / targets[2].target, 1)) * 40} ${150 - Math.min(targets[3].current / targets[3].target, 1) * 80},${270 - (1 - Math.min(targets[3].current / targets[3].target, 1)) * 40} ${150 - Math.min(targets[4].current / targets[4].target, 1) * 130},${110 + (1 - Math.min(targets[4].current / targets[4].target, 1)) * 20}`
                  : "150,50 250,120 220,250 80,250 50,120"}
                fill={`${colors.accent}20`} stroke={colors.accent} strokeWidth="2"
              />
            </svg>
          </div>
          {/* Center value */}
          <div className="relative z-10 text-center">
            <motion.p className="font-headline text-5xl font-black"
              style={{ color: colors.accent }}
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}>
              {tankQuality}%
            </motion.p>
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: colors.textMuted }}>Tank Quality</p>
          </div>
          {/* Labels */}
          {targets.slice(0, 5).map((t, i) => {
            const positions = [
              { top: "-8px", left: "50%", transform: "translateX(-50%)" },
              { top: "30%", right: "-16px" },
              { bottom: "0", right: "8%" },
              { bottom: "0", left: "8%" },
              { top: "30%", left: "-16px" },
            ];
            return (
              <span key={t.name} className="absolute text-xs font-bold" style={{ color: t.color, ...positions[i] }}>
                {t.name.toUpperCase()}
              </span>
            );
          })}
        </div>
      </motion.div>

      {/* Food Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {foods.map((food, i) => {
          const cfg = GROUP_COLORS[food.food_group] ?? { color: colors.accent, glow: "rgba(255,153,51,0.3)" };
          const isNeg = food.key_nutrients.some((n) => n.includes("PENALTY") || n.includes("HIGH SODIUM"));
          const isExpanded = expandedFood === food.name_english;

          return (
            <motion.div key={food.name_english}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="rounded-xl clay-card overflow-hidden cursor-pointer"
              style={{
                background: colors.surfaceContainer,
                border: `1px solid ${isNeg ? `${colors.error}30` : `${cfg.color}30`}`,
              }}
              onClick={() => setExpandedFood(isExpanded ? null : food.name_english)}
              whileHover={{ y: -2 }}
            >
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: `${cfg.color}15`, border: `2px solid ${cfg.color}40`, boxShadow: `0 0 12px ${cfg.glow}` }}>
                    {FOOD_ICONS[food.food_group] || "🍽️"}
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-sm" style={{ color: colors.textPrimary }}>{food.name_english}</h3>
                    <p className="font-hindi text-xs" style={{ color: colors.textMuted }}>{food.name_hindi}</p>
                  </div>
                </div>
                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {food.key_nutrients.map((n) => (
                    <Chip key={n} label={n}
                      color={n.includes("PENALTY") || n.includes("HIGH SODIUM") ? colors.error :
                        n.includes("HIGH IRON") ? colors.ok :
                        n.includes("VITAMIN") ? colors.secondary : cfg.color} />
                  ))}
                </div>
                {/* Fuel bar */}
                <div className="h-1 rounded-full overflow-hidden" style={{ background: `${cfg.color}15` }}>
                  <motion.div className="h-full rounded-full"
                    style={{ background: isNeg ? colors.error : cfg.color }}
                    initial={{ width: 0 }}
                    animate={{ width: isNeg ? "100%" : `${Math.random() * 40 + 60}%` }}
                    transition={{ duration: 0.8, delay: i * 0.06 }}
                  />
                </div>
              </div>

              {/* Expanded details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-2 space-y-2" style={{ borderTop: `1px solid ${colors.border}` }}>
                      {food.why_recommended && (
                        <p className="text-xs" style={{ color: colors.textMuted }}>
                          <span className="font-bold" style={{ color: cfg.color }}>Why? </span>{food.why_recommended}
                        </p>
                      )}
                      <p className="text-xs" style={{ color: colors.textFaint }}>
                        <span className="font-bold" style={{ color: colors.textMuted }}>Serving: </span>{food.serving_suggestion}
                      </p>
                      {isNeg && (
                        <div className="px-3 py-2 rounded-lg text-xs font-bold" style={{ background: `${colors.error}10`, color: colors.error }}>
                          EMPTY TANK REQUIRED
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Target Grid */}
      <SectionLabel icon="dashboard">Daily Fuel Targets</SectionLabel>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {targets.map((t, i) => {
          const pct = Math.min(Math.round((t.current / t.target) * 100), 100);
          return (
            <motion.div key={t.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
              className="rounded-xl p-3 clay-card" style={{ background: colors.surfaceContainerLowest }}>
              <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: colors.textMuted }}>{t.name}</p>
              <p className="font-headline text-lg font-bold" style={{ color: colors.textPrimary }}>
                {t.current}<span className="text-xs ml-0.5 font-normal" style={{ color: colors.textFaint }}>/ {t.target}{t.unit}</span>
              </p>
              <div className="w-full h-1.5 rounded-full mt-2 overflow-hidden" style={{ background: `${t.color}15` }}>
                <motion.div className="h-full rounded-full" style={{ background: t.color }}
                  initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, delay: i * 0.05 }} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Need More Fuel promo */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="rounded-2xl p-6 clay-card flex items-center justify-between"
        style={{ background: colors.surfaceContainerHigh }}>
        <div>
          <h3 className="font-headline text-lg font-bold" style={{ color: colors.accentLight }}>Need More Fuel?</h3>
          <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
            Scan your meal receipt to unlock 8-bit regional specialties and triple your XP output.
          </p>
        </div>
        <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: colors.surfaceContainer }}>
          <span className="material-symbols-outlined text-xl" style={{ color: colors.accent }}>photo_camera</span>
        </div>
      </motion.div>
    </PageShell>
  );
}

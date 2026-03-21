"use client";

// ============================================================
// nutrition/page.tsx — MEMBER 4 OWNS THIS
// Radar chart of nutrient targets + food recommendation cards
// Calls GET /nutrition with dietary_flags from GUC
// ============================================================

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useGUCStore } from "@/lib/store";

// ── Types ─────────────────────────────────────────────────────

interface FoodItem {
  name_english: string;
  name_hindi: string;
  nutrient_highlights: Record<string, number>;
  serving_suggestion: string;
  food_group: string;
}

interface NutritionResponse {
  recommended_foods: FoodItem[];
  daily_targets: Record<string, number>;
  deficiency_summary: string;
}

// ── Nutrient display config ────────────────────────────────────

const NUTRIENT_LABELS: Record<string, { label: string; unit: string; icon: string }> = {
  protein_g: { label: "Protein", unit: "g", icon: "💪" },
  iron_mg: { label: "Iron", unit: "mg", icon: "🩸" },
  calcium_mg: { label: "Calcium", unit: "mg", icon: "🦴" },
  vitaminD_iu: { label: "Vit D", unit: "IU", icon: "☀️" },
  fiber_g: { label: "Fiber", unit: "g", icon: "🌾" },
  calories_kcal: { label: "Calories", unit: "kcal", icon: "⚡" },
};

const FOOD_GROUP_COLORS: Record<string, string> = {
  "Green Leafy Vegetables": "#22C55E",
  "Cereals & Millets": "#F59E0B",
  "Grain Legumes": "#F97316",
  "Fruits": "#EC4899",
  "Nuts & Oil Seeds": "#8B5CF6",
  "Milk & Products": "#06B6D4",
  "Eggs": "#EAB308",
  "Condiments & Spices": "#EF4444",
};

// ── Radar chart data builder ───────────────────────────────────

function buildRadarData(
  targets: Record<string, number>,
  logged: string[]
): { nutrient: string; target: number; current: number }[] {
  // Simplified current vs target — in real app would track logged meals
  const loggedCount = logged.length;
  return [
    { nutrient: "Protein", target: 100, current: Math.min(100, loggedCount * 15 + 30) },
    { nutrient: "Iron", target: 100, current: Math.min(100, loggedCount * 12 + 20) },
    { nutrient: "Calcium", target: 100, current: Math.min(100, loggedCount * 10 + 25) },
    { nutrient: "Vit D", target: 100, current: Math.min(100, loggedCount * 8 + 15) },
    { nutrient: "Fiber", target: 100, current: Math.min(100, loggedCount * 14 + 35) },
  ];
}

// ── Main component ────────────────────────────────────────────

export default function NutritionPage() {
  const {
    nutritionProfile,
    latestReport,
    profile,
    logFood,
    addXP,
    setAvatarState,
  } = useGUCStore();

  const [data, setData] = useState<NutritionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [loggedToday, setLoggedToday] = useState<string[]>(
    nutritionProfile.loggedToday
  );
  const [activeCard, setActiveCard] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  const flags = nutritionProfile.deficiencies.join(",") || "INCREASE_IRON";

  useEffect(() => {
    const fetchNutrition = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${API_BASE}/nutrition?dietary_flags=${flags}&language=${profile.language}`
        );
        if (!res.ok) throw new Error("API error");
        const json: NutritionResponse = await res.json();
        setData(json);
      } catch {
        // Fallback to static endpoint
        try {
          const res = await fetch(`${API_BASE}/nutrition/fallback`);
          const json: NutritionResponse = await res.json();
          setData(json);
        } catch {
          setError(true);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchNutrition();
  }, [flags]);

  const handleAddToToday = (food: FoodItem) => {
    logFood(food.name_english);
    setLoggedToday((prev) => [...prev, food.name_english]);
    addXP(15);
    setAvatarState("HAPPY");
  };

  const radarData = buildRadarData(
    nutritionProfile.dailyTargets,
    loggedToday
  );

  // ── Skeleton loader ───────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="h-8 w-48 bg-white/5 rounded-xl animate-pulse" />
          <div className="h-64 bg-white/5 rounded-2xl animate-pulse" />
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white">
      {/* Background texture */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 25%, #FF9933 0%, transparent 50%), radial-gradient(circle at 75% 75%, #22C55E 0%, transparent 50%)",
        }}
      />

      <div className="relative max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* ── Header ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">🥗</span>
            <h1 className="text-xl font-bold tracking-tight">
              Nutrition Profile
            </h1>
          </div>
          <p className="text-white/40 text-sm">
            Based on your report findings · IFCT 2017 Indian Food Data
          </p>
        </motion.div>

        {/* ── Deficiency Summary Banner ───────────────────── */}
        {data?.deficiency_summary && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-5 p-3.5 rounded-xl bg-[#FF9933]/10 border border-[#FF9933]/20"
          >
            <p className="text-[#FF9933] text-xs leading-relaxed">
              {data.deficiency_summary}
            </p>
          </motion.div>
        )}

        {/* ── Daily Targets Grid ──────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-5"
        >
          <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-3">
            Daily Targets
          </p>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(NUTRIENT_LABELS).map(([key, meta]) => {
              const value = data?.daily_targets[key] ?? nutritionProfile.dailyTargets[key as keyof typeof nutritionProfile.dailyTargets] ?? 0;
              return (
                <div
                  key={key}
                  className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-3"
                >
                  <div className="text-lg mb-1">{meta.icon}</div>
                  <div className="text-white font-semibold text-sm">
                    {typeof value === "number" ? value.toLocaleString() : value}
                    <span className="text-white/30 text-[10px] ml-0.5">
                      {meta.unit}
                    </span>
                  </div>
                  <div className="text-white/35 text-[10px]">{meta.label}</div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Radar Chart ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-5 bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4"
        >
          <div className="flex justify-between items-center mb-3">
            <p className="text-white/60 text-xs font-medium uppercase tracking-widest">
              Coverage Today
            </p>
            <div className="flex gap-3 text-[10px] text-white/40">
              <span className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ background: "#FF9933" }}
                />
                Current
              </span>
              <span className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full inline-block bg-white/20"
                />
                Target
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis
                dataKey="nutrient"
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
              />
              <Radar
                name="Target"
                dataKey="target"
                stroke="rgba(255,255,255,0.12)"
                fill="rgba(255,255,255,0.04)"
                strokeWidth={1}
              />
              <Radar
                name="Current"
                dataKey="current"
                stroke="#FF9933"
                fill="#FF9933"
                fillOpacity={0.18}
                strokeWidth={2}
              />
              <Tooltip
                contentStyle={{
                  background: "#1a1a2e",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  fontSize: "11px",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
          {loggedToday.length > 0 && (
            <p className="text-white/25 text-[10px] text-center mt-1">
              {loggedToday.length} food{loggedToday.length !== 1 ? "s" : ""} logged today
            </p>
          )}
        </motion.div>

        {/* ── Food Cards ─────────────────────────────────── */}
        <div className="mb-3">
          <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-3">
            Recommended for You · Top Indian Foods
          </p>

          {error && (
            <div className="text-white/40 text-sm text-center py-8">
              Unable to load food data. Check your connection.
            </div>
          )}

          <div className="space-y-2.5">
            <AnimatePresence>
              {(data?.recommended_foods ?? []).map((food, i) => {
                const groupColor =
                  FOOD_GROUP_COLORS[food.food_group] ?? "#FF9933";
                const isLogged = loggedToday.includes(food.name_english);
                const isExpanded = activeCard === food.name_english;

                return (
                  <motion.div
                    key={food.name_english}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.3 }}
                    className="rounded-xl border overflow-hidden"
                    style={{
                      background: isExpanded
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(255,255,255,0.025)",
                      borderColor: isExpanded
                        ? `${groupColor}40`
                        : "rgba(255,255,255,0.07)",
                    }}
                  >
                    {/* Card header */}
                    <button
                      className="w-full flex items-center gap-3 p-3.5 text-left"
                      onClick={() =>
                        setActiveCard(
                          isExpanded ? null : food.name_english
                        )
                      }
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
                        style={{ background: `${groupColor}20`, color: groupColor }}
                      >
                        {food.food_group.includes("Vegetable") ? "🥬" :
                         food.food_group.includes("Cereal") ? "🌾" :
                         food.food_group.includes("Legume") ? "🫘" :
                         food.food_group.includes("Fruit") ? "🍎" :
                         food.food_group.includes("Nut") ? "🥜" :
                         food.food_group.includes("Milk") ? "🥛" :
                         food.food_group.includes("Egg") ? "🥚" : "🌿"}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white text-sm font-medium">
                            {food.name_english}
                          </span>
                          <span className="text-white/40 text-xs">
                            {food.name_hindi}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-full"
                            style={{
                              background: `${groupColor}15`,
                              color: groupColor,
                            }}
                          >
                            {food.food_group}
                          </span>
                        </div>
                      </div>

                      <div className="flex-shrink-0 flex items-center gap-2">
                        {isLogged && (
                          <span className="text-green-400 text-xs">✓ added</span>
                        )}
                        <span className="text-white/20 text-xs">
                          {isExpanded ? "▲" : "▼"}
                        </span>
                      </div>
                    </button>

                    {/* Expanded details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-3.5 pb-3.5 space-y-3">
                            {/* Nutrient highlights */}
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(food.nutrient_highlights)
                                .filter(([, v]) => v > 0)
                                .slice(0, 5)
                                .map(([key, value]) => {
                                  const meta = NUTRIENT_LABELS[key];
                                  if (!meta) return null;
                                  return (
                                    <div
                                      key={key}
                                      className="flex items-center gap-1.5 bg-white/5 rounded-lg px-2 py-1"
                                    >
                                      <span className="text-xs">{meta.icon}</span>
                                      <span className="text-white/70 text-[11px]">
                                        {meta.label}:{" "}
                                        <strong className="text-white">
                                          {value}
                                        </strong>
                                        <span className="text-white/30">
                                          {meta.unit}
                                        </span>
                                      </span>
                                    </div>
                                  );
                                })}
                            </div>

                            {/* Serving suggestion */}
                            <p className="text-white/40 text-xs">
                              📏 {food.serving_suggestion}
                            </p>

                            {/* Add to today button */}
                            <motion.button
                              whileTap={{ scale: 0.96 }}
                              onClick={() => handleAddToToday(food)}
                              disabled={isLogged}
                              className="w-full py-2 rounded-lg text-xs font-medium transition-all"
                              style={
                                isLogged
                                  ? {
                                      background: "rgba(34,197,94,0.1)",
                                      color: "#22C55E",
                                    }
                                  : {
                                      background: groupColor,
                                      color: "#0d0d1a",
                                    }
                              }
                            >
                              {isLogged ? "✓ Added to Today" : "Add to Today · +15 XP"}
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* ── IFCT credit ─────────────────────────────────── */}
        <p className="text-white/15 text-[10px] text-center mt-6">
          Nutritional data: IFCT 2017 · National Institute of Nutrition, ICMR
        </p>
      </div>
    </div>
  );
}
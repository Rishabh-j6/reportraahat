# ============================================================
# nutrition.py — GET /nutrition — MEMBER 4 OWNS THIS
# Reads dietary_flags from GUC → queries IFCT2017 data →
# returns top-10 Indian foods with nutritional breakdown
# ============================================================

from fastapi import APIRouter
from app.schemas import NutritionRequest, NutritionResponse, FoodItem, DietaryFlag

router = APIRouter()

# ── IFCT2017 inline data (key Indian foods, verified values) ──
# Source: National Institute of Nutrition, ICMR 2017
# Full npm package: https://github.com/ifct2017/compositions
# Using inline data so the backend has zero npm dependency.

IFCT_DATA: dict[str, dict] = {
    "Spinach (Palak)": {
        "name_hindi": "पालक",
        "food_group": "Green Leafy Vegetables",
        "iron_mg": 1.14,
        "calcium_mg": 73.0,
        "protein_g": 1.9,
        "vitaminC_mg": 28.0,
        "vitaminA_mcg": 600.0,
        "fiber_g": 0.6,
        "calories_kcal": 23.0,
        "serving": "1 cup cooked (about 180g)",
    },
    "Methi (Fenugreek Leaves)": {
        "name_hindi": "मेथी",
        "food_group": "Green Leafy Vegetables",
        "iron_mg": 1.93,
        "calcium_mg": 395.0,
        "protein_g": 4.4,
        "vitaminC_mg": 52.0,
        "vitaminA_mcg": 750.0,
        "fiber_g": 1.1,
        "calories_kcal": 49.0,
        "serving": "1 cup cooked (about 180g)",
    },
    "Ragi (Finger Millet)": {
        "name_hindi": "रागी",
        "food_group": "Cereals & Millets",
        "iron_mg": 3.9,
        "calcium_mg": 364.0,
        "protein_g": 7.3,
        "vitaminC_mg": 0.0,
        "vitaminA_mcg": 0.0,
        "fiber_g": 3.6,
        "calories_kcal": 328.0,
        "serving": "1 small roti or 50g flour",
    },
    "Horse Gram (Kulthi Dal)": {
        "name_hindi": "कुलथी दाल",
        "food_group": "Grain Legumes",
        "iron_mg": 6.77,
        "calcium_mg": 287.0,
        "protein_g": 22.0,
        "vitaminC_mg": 1.0,
        "vitaminA_mcg": 0.0,
        "fiber_g": 5.3,
        "calories_kcal": 321.0,
        "serving": "1/2 cup cooked (about 120g)",
    },
    "Bajra (Pearl Millet)": {
        "name_hindi": "बाजरा",
        "food_group": "Cereals & Millets",
        "iron_mg": 8.0,
        "calcium_mg": 42.0,
        "protein_g": 11.6,
        "vitaminC_mg": 0.0,
        "vitaminA_mcg": 0.0,
        "fiber_g": 1.2,
        "calories_kcal": 361.0,
        "serving": "1 small roti or 50g flour",
    },
    "Chana Dal": {
        "name_hindi": "चना दाल",
        "food_group": "Grain Legumes",
        "iron_mg": 5.3,
        "calcium_mg": 56.0,
        "protein_g": 20.4,
        "vitaminC_mg": 3.0,
        "vitaminA_mcg": 0.0,
        "fiber_g": 7.6,
        "calories_kcal": 360.0,
        "serving": "1/2 cup cooked (about 120g)",
    },
    "Drumstick Leaves (Sahjan)": {
        "name_hindi": "सहजन पत्ते",
        "food_group": "Green Leafy Vegetables",
        "iron_mg": 7.0,
        "calcium_mg": 440.0,
        "protein_g": 6.7,
        "vitaminC_mg": 220.0,
        "vitaminA_mcg": 6780.0,
        "fiber_g": 2.0,
        "calories_kcal": 92.0,
        "serving": "1/2 cup cooked leaves",
    },
    "Sesame Seeds (Til)": {
        "name_hindi": "तिल",
        "food_group": "Nuts & Oil Seeds",
        "iron_mg": 9.3,
        "calcium_mg": 975.0,
        "protein_g": 17.7,
        "vitaminC_mg": 0.0,
        "vitaminA_mcg": 0.0,
        "fiber_g": 2.9,
        "calories_kcal": 563.0,
        "serving": "1 tbsp (about 9g)",
    },
    "Amla (Indian Gooseberry)": {
        "name_hindi": "आंवला",
        "food_group": "Fruits",
        "iron_mg": 1.2,
        "calcium_mg": 50.0,
        "protein_g": 0.5,
        "vitaminC_mg": 600.0,
        "vitaminA_mcg": 9.0,
        "fiber_g": 3.4,
        "calories_kcal": 44.0,
        "serving": "2 medium fruits (about 100g)",
    },
    "Rajma (Kidney Beans)": {
        "name_hindi": "राजमा",
        "food_group": "Grain Legumes",
        "iron_mg": 5.1,
        "calcium_mg": 260.0,
        "protein_g": 22.9,
        "vitaminC_mg": 4.0,
        "vitaminA_mcg": 0.0,
        "fiber_g": 6.4,
        "calories_kcal": 347.0,
        "serving": "1/2 cup cooked (about 130g)",
    },
    "Banana (Kela)": {
        "name_hindi": "केला",
        "food_group": "Fruits",
        "iron_mg": 0.36,
        "calcium_mg": 5.0,
        "protein_g": 1.1,
        "vitaminC_mg": 8.7,
        "vitaminA_mcg": 3.0,
        "fiber_g": 1.7,
        "calories_kcal": 89.0,
        "serving": "1 medium banana (about 118g)",
    },
    "Milk (Full Fat)": {
        "name_hindi": "दूध",
        "food_group": "Milk & Products",
        "iron_mg": 0.1,
        "calcium_mg": 120.0,
        "protein_g": 3.4,
        "vitaminC_mg": 1.5,
        "vitaminA_mcg": 46.0,
        "fiber_g": 0.0,
        "calories_kcal": 61.0,
        "serving": "1 glass (250ml)",
    },
    "Eggs": {
        "name_hindi": "अंडा",
        "food_group": "Eggs",
        "iron_mg": 1.2,
        "calcium_mg": 50.0,
        "protein_g": 13.3,
        "vitaminC_mg": 0.0,
        "vitaminA_mcg": 120.0,
        "fiber_g": 0.0,
        "calories_kcal": 143.0,
        "serving": "2 large eggs",
    },
    "Pumpkin Seeds": {
        "name_hindi": "कद्दू के बीज",
        "food_group": "Nuts & Oil Seeds",
        "iron_mg": 8.8,
        "calcium_mg": 46.0,
        "protein_g": 30.2,
        "vitaminC_mg": 1.9,
        "vitaminA_mcg": 0.0,
        "fiber_g": 6.0,
        "calories_kcal": 559.0,
        "serving": "2 tbsp (about 28g)",
    },
    "Turmeric (Haldi)": {
        "name_hindi": "हल्दी",
        "food_group": "Condiments & Spices",
        "iron_mg": 55.0,
        "calcium_mg": 183.0,
        "protein_g": 7.8,
        "vitaminC_mg": 25.9,
        "vitaminA_mcg": 0.0,
        "fiber_g": 22.7,
        "calories_kcal": 312.0,
        "serving": "1/2 tsp in food (about 2g) daily",
    },
}

# ── Flag → nutrient priority mapping ─────────────────────────

FLAG_NUTRIENTS: dict[str, str] = {
    "INCREASE_IRON": "iron_mg",
    "INCREASE_CALCIUM": "calcium_mg",
    "INCREASE_PROTEIN": "protein_g",
    "INCREASE_VITAMIN_D": "vitaminA_mcg",  # closest proxy in IFCT
    "DRINK_MORE_WATER": "fiber_g",  # fiber-rich foods increase water needs
    "AVOID_FATTY_FOODS": "fiber_g",
    "REDUCE_SODIUM": "calories_kcal",  # return low-cal, low-processed
    "REDUCE_SUGAR": "fiber_g",
    "DIABETIC_DIET": "fiber_g",
    "LOW_POTASSIUM_DIET": "protein_g",
}

# ── Default targets per flag ──────────────────────────────────

FLAG_TARGETS: dict[str, dict] = {
    "INCREASE_IRON": {"iron_mg": 27, "description": "Your report shows low iron. Aim for 27mg iron daily."},
    "INCREASE_CALCIUM": {"calcium_mg": 1200, "description": "Boost calcium to 1200mg daily for bone health."},
    "INCREASE_PROTEIN": {"protein_g": 70, "description": "Increase protein intake to 70g/day for recovery."},
    "INCREASE_VITAMIN_D": {"vitaminD_iu": 1000, "description": "Your Vitamin D is low. Target 1000 IU daily + sunlight."},
    "DRINK_MORE_WATER": {"water_ml": 3000, "description": "Drink at least 3 litres of water daily."},
    "AVOID_FATTY_FOODS": {"fat_g_max": 40, "description": "Keep total fat under 40g/day. Avoid fried foods."},
    "REDUCE_SODIUM": {"sodium_mg_max": 1500, "description": "Limit salt to 1500mg sodium per day."},
    "REDUCE_SUGAR": {"sugar_g_max": 25, "description": "Keep added sugars below 25g/day."},
    "DIABETIC_DIET": {"glycemic_index": "low", "description": "Choose low-glycemic foods. Avoid maida and white rice."},
    "LOW_POTASSIUM_DIET": {"potassium_mg_max": 2000, "description": "Limit potassium to 2000mg/day. Avoid bananas and potatoes."},
}


def score_food(food_data: dict, target_nutrient: str) -> float:
    return food_data.get(target_nutrient, 0.0)


def build_food_item(name: str, data: dict) -> FoodItem:
    return FoodItem(
        name_english=name,
        name_hindi=data["name_hindi"],
        nutrient_highlights={
            k: v
            for k, v in data.items()
            if k not in ("name_hindi", "food_group", "serving")
            and isinstance(v, (int, float))
            and v > 0
        },
        serving_suggestion=data["serving"],
        food_group=data["food_group"],
    )


@router.get("/", response_model=NutritionResponse)
def get_nutrition(dietary_flags: str = "", language: str = "EN"):
    """
    Query: /nutrition?dietary_flags=INCREASE_IRON,INCREASE_CALCIUM&language=EN
    Returns top-10 Indian foods matching the flags.
    """
    flags = [f.strip() for f in dietary_flags.split(",") if f.strip()]

    # Determine primary nutrient to sort by
    primary_nutrient = "iron_mg"  # sensible default
    for flag in flags:
        if flag in FLAG_NUTRIENTS:
            primary_nutrient = FLAG_NUTRIENTS[flag]
            break

    # Score and rank all foods
    scored = sorted(
        IFCT_DATA.items(),
        key=lambda x: score_food(x[1], primary_nutrient),
        reverse=True,
    )

    # Filter out unsafe foods for certain conditions
    filtered = scored
    if "AVOID_FATTY_FOODS" in flags:
        filtered = [(n, d) for n, d in scored if d.get("calories_kcal", 0) < 200]
    if "LOW_POTASSIUM_DIET" in flags:
        filtered = [(n, d) for n, d in scored if n not in ("Banana (Kela)",)]

    top_10 = [build_food_item(name, data) for name, data in filtered[:10]]

    # Build daily targets from flags
    daily_targets: dict = {
        "protein_g": 50,
        "iron_mg": 18,
        "calcium_mg": 1000,
        "vitaminD_iu": 600,
        "fiber_g": 25,
        "calories_kcal": 2000,
    }
    for flag in flags:
        if flag in FLAG_TARGETS:
            daily_targets.update(FLAG_TARGETS[flag])

    # Deficiency summary
    summaries = []
    for flag in flags:
        if flag in FLAG_TARGETS:
            summaries.append(FLAG_TARGETS[flag].get("description", ""))
    deficiency_summary = " ".join(summaries) if summaries else "Eat a balanced Indian diet with plenty of dals, sabzi, and roti."

    return NutritionResponse(
        recommended_foods=top_10,
        daily_targets=daily_targets,
        deficiency_summary=deficiency_summary,
    )


@router.get("/fallback", response_model=NutritionResponse)
def get_nutrition_fallback():
    """Static fallback — always works, no package needed."""
    default_foods = list(IFCT_DATA.items())[:10]
    return NutritionResponse(
        recommended_foods=[build_food_item(n, d) for n, d in default_foods],
        daily_targets={
            "protein_g": 50,
            "iron_mg": 18,
            "calcium_mg": 1000,
            "vitaminD_iu": 600,
            "fiber_g": 25,
            "calories_kcal": 2000,
        },
        deficiency_summary="Eat a balanced diet with seasonal Indian vegetables, lentils, and millets.",
    )
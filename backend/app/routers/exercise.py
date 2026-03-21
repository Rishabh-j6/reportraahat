# ============================================================
# exercise.py — GET /exercise — MEMBER 4 OWNS THIS
# Maps exercise_flags from GUC → adaptive weekly plan
# ============================================================

from fastapi import APIRouter
from app.schemas import ExerciseRequest, ExerciseResponse, ExerciseDay, ExerciseFlag, SeverityLevel

router = APIRouter()

# ── Exercise plan database ────────────────────────────────────

PLANS: dict[str, dict] = {
    "LIGHT_WALKING_ONLY": {
        "tier": "LIGHT_WALKING_ONLY",
        "tier_description": "Your report indicates gentle movement only. Light walking and breathing exercises will help your recovery without straining your body.",
        "general_advice": "Take it very easy. Rest is as important as movement. Listen to your body — stop if you feel any pain, dizziness, or shortness of breath. Morning sunlight during your walk helps with Vitamin D too.",
        "avoid": [
            "Heavy weights or gym equipment",
            "Running, jogging, or brisk walking",
            "Any exercise that raises heart rate above 100 BPM",
            "Swimming (until cleared by doctor)",
            "Sports or competitive activities",
        ],
        "weekly_plan": [
            {"day": "Monday", "activity": "Morning walk (flat surface)", "duration_minutes": 15, "intensity": "Very Low", "notes": "Walk slowly, wear comfortable shoes. Take rest if needed."},
            {"day": "Tuesday", "activity": "Seated deep breathing + gentle neck stretches", "duration_minutes": 10, "intensity": "Very Low", "notes": "Sit comfortably. Inhale 4 counts, hold 7, exhale 8 (4-7-8 breathing)."},
            {"day": "Wednesday", "activity": "Morning walk (flat surface)", "duration_minutes": 15, "intensity": "Very Low", "notes": "You can slightly increase pace if yesterday felt comfortable."},
            {"day": "Thursday", "activity": "Rest day — gentle leg raises while lying down", "duration_minutes": 10, "intensity": "Very Low", "notes": "Lie flat, lift each leg 10 times. Improves circulation."},
            {"day": "Friday", "activity": "Morning walk + 4-7-8 breathing", "duration_minutes": 20, "intensity": "Very Low", "notes": "Combine 15 min walk with 5 min breathing exercises."},
            {"day": "Saturday", "activity": "Rest day — hand and wrist gentle rotation", "duration_minutes": 5, "intensity": "Very Low", "notes": "Simple joint mobility. No strain."},
            {"day": "Sunday", "activity": "Full rest", "duration_minutes": 0, "intensity": "Rest", "notes": "Complete rest. Focus on hydration and good sleep."},
        ],
    },
    "CARDIO_RESTRICTED": {
        "tier": "CARDIO_RESTRICTED",
        "tier_description": "Your report shows a heart or blood pressure condition. Yoga, slow walking, and low-intensity movement are safe. Avoid raising your heart rate excessively.",
        "general_advice": "Monitor how you feel during exercise. If you feel chest tightness, palpitations, or dizziness — stop immediately and rest. Keep your heart rate under 110 BPM during exercise.",
        "avoid": [
            "Running, jogging, or sprinting",
            "HIIT or high-intensity interval training",
            "Heavy weightlifting (above 5kg)",
            "Breath-holding exercises (Kapalabhati, etc.)",
            "Competitive sports",
        ],
        "weekly_plan": [
            {"day": "Monday", "activity": "Slow morning walk", "duration_minutes": 25, "intensity": "Low", "notes": "Conversational pace — you should be able to talk while walking."},
            {"day": "Tuesday", "activity": "Yoga — Sukhasana, Tadasana, Balasana", "duration_minutes": 20, "intensity": "Low", "notes": "Focus on gentle poses and breath awareness. Avoid inversions."},
            {"day": "Wednesday", "activity": "Slow walk + stretching", "duration_minutes": 30, "intensity": "Low", "notes": "15 min walk, then 15 min gentle full-body stretches."},
            {"day": "Thursday", "activity": "Rest day — Pranayama (Anulom Vilom)", "duration_minutes": 15, "intensity": "Very Low", "notes": "Alternate nostril breathing. Proven to reduce blood pressure."},
            {"day": "Friday", "activity": "Yoga — Sun Salutation (modified, slow)", "duration_minutes": 20, "intensity": "Low", "notes": "Do 3-4 rounds slowly. Skip Chaturanga (use knees down)."},
            {"day": "Saturday", "activity": "Evening walk in open air", "duration_minutes": 25, "intensity": "Low", "notes": "Evening is ideal — cooler temperature, lower blood pressure."},
            {"day": "Sunday", "activity": "Rest", "duration_minutes": 0, "intensity": "Rest", "notes": "Full rest. Light household activity is fine."},
        ],
    },
    "NORMAL_ACTIVITY": {
        "tier": "NORMAL_ACTIVITY",
        "tier_description": "Your report shows mild or moderate concerns. Standard 30-minute exercise sessions are appropriate. You can walk, cycle, and do light strength training.",
        "general_advice": "You're cleared for moderate activity. Build a consistent habit — 5 days of 30 minutes is better than 1 day of 2 hours. Stay hydrated. Eat a banana or handful of chana before exercise.",
        "avoid": [
            "Exercising on an empty stomach",
            "High-impact jumping if joints are affected",
            "Exercising during fever or active illness",
        ],
        "weekly_plan": [
            {"day": "Monday", "activity": "Brisk walking or cycling", "duration_minutes": 30, "intensity": "Moderate", "notes": "Maintain a pace where you can talk but feel slightly breathless."},
            {"day": "Tuesday", "activity": "Bodyweight exercises — squats, push-ups, lunges", "duration_minutes": 30, "intensity": "Moderate", "notes": "3 sets of 12 reps each. Rest 60 seconds between sets."},
            {"day": "Wednesday", "activity": "Yoga or stretching + walking", "duration_minutes": 30, "intensity": "Low-Moderate", "notes": "Active recovery day. Focus on flexibility."},
            {"day": "Thursday", "activity": "Brisk walking or light jogging", "duration_minutes": 35, "intensity": "Moderate", "notes": "Interval: 3 min walk + 2 min jog, repeat 5 times."},
            {"day": "Friday", "activity": "Strength training — dumbbell or resistance band", "duration_minutes": 30, "intensity": "Moderate", "notes": "Focus on compound movements. Keep weights manageable."},
            {"day": "Saturday", "activity": "Recreational activity — badminton, cycling, swimming", "duration_minutes": 45, "intensity": "Moderate", "notes": "Make it fun! Social exercise is great for mental health too."},
            {"day": "Sunday", "activity": "Rest or light walk", "duration_minutes": 15, "intensity": "Very Low", "notes": "Active rest. Short walk for fresh air."},
        ],
    },
    "ACTIVE_ENCOURAGED": {
        "tier": "ACTIVE_ENCOURAGED",
        "tier_description": "Your report encourages active exercise. Higher-intensity cardio and strength training will actively improve your health markers. Push yourself (safely).",
        "general_advice": "Your body is ready for a challenge. Aim for progressive overload — gradually increase weight, duration, or intensity each week. Track your workouts. Sleep 7-8 hours — this is when your body repairs itself.",
        "avoid": [
            "Skipping warm-up and cool-down",
            "Training same muscle group two days in a row",
            "Ignoring pain (not the same as soreness — sharp pain means stop)",
        ],
        "weekly_plan": [
            {"day": "Monday", "activity": "Running or cycling (cardio)", "duration_minutes": 45, "intensity": "High", "notes": "Target heart rate zone: 70-80% of max HR. Use a fitness app to track."},
            {"day": "Tuesday", "activity": "Upper body strength — push/pull", "duration_minutes": 45, "intensity": "High", "notes": "Bench press, rows, shoulder press, bicep curls. 4 sets x 10 reps."},
            {"day": "Wednesday", "activity": "HIIT or dynamic cardio", "duration_minutes": 30, "intensity": "Very High", "notes": "20 sec on, 10 sec off (Tabata style). Burpees, jump squats, mountain climbers."},
            {"day": "Thursday", "activity": "Lower body strength — legs and core", "duration_minutes": 45, "intensity": "High", "notes": "Squats, lunges, deadlifts, planks. Crucial for metabolic health."},
            {"day": "Friday", "activity": "Running / swimming / sport", "duration_minutes": 45, "intensity": "Moderate-High", "notes": "Choose what you enjoy most. Consistency > intensity."},
            {"day": "Saturday", "activity": "Full body circuit training", "duration_minutes": 50, "intensity": "High", "notes": "Rotate through 6 exercises with minimal rest. Great metabolic workout."},
            {"day": "Sunday", "activity": "Active rest — yoga or long walk", "duration_minutes": 30, "intensity": "Low", "notes": "Recovery is part of training. Foam roll, stretch, and hydrate."},
        ],
    },
}


def resolve_tier(exercise_flags: list[str], severity: str) -> str:
    """Pick the most restrictive tier from the flags list."""
    priority = ["LIGHT_WALKING_ONLY", "CARDIO_RESTRICTED", "NORMAL_ACTIVITY", "ACTIVE_ENCOURAGED"]
    if severity == "URGENT":
        return "LIGHT_WALKING_ONLY"
    for tier in priority:
        if tier in exercise_flags:
            return tier
    return "NORMAL_ACTIVITY"


@router.get("/", response_model=ExerciseResponse)
def get_exercise_plan(
    exercise_flags: str = "NORMAL_ACTIVITY",
    severity_level: str = "MILD_CONCERN",
    language: str = "EN",
):
    """
    Query: /exercise?exercise_flags=LIGHT_WALKING_ONLY&severity_level=MODERATE_CONCERN
    Returns the adaptive weekly exercise plan.
    """
    flags = [f.strip() for f in exercise_flags.split(",") if f.strip()]
    tier_key = resolve_tier(flags, severity_level)
    plan_data = PLANS[tier_key]

    weekly_plan = [ExerciseDay(**day) for day in plan_data["weekly_plan"]]

    return ExerciseResponse(
        tier=plan_data["tier"],
        tier_description=plan_data["tier_description"],
        weekly_plan=weekly_plan,
        general_advice=plan_data["general_advice"],
        avoid=plan_data["avoid"],
    )
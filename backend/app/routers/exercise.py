from fastapi import APIRouter
from app.schemas import ExerciseResponse

router = APIRouter()


@router.post("/", response_model=ExerciseResponse)
async def get_exercise_plan():
    """Stub — Member 1 owns this file."""
    return ExerciseResponse(
        tier="Beginner",
        tier_reason="Based on moderate concern severity",
        weekly_plan=[
            {"day": "Monday", "activity": "Walking", "duration_minutes": 30,
                "intensity": "Light", "notes": "Morning walk"},
            {"day": "Tuesday", "activity": "Rest",
                "duration_minutes": 0, "intensity": "Rest", "notes": ""},
            {"day": "Wednesday", "activity": "Yoga", "duration_minutes": 20,
                "intensity": "Light", "notes": "Basic stretches"},
            {"day": "Thursday", "activity": "Walking", "duration_minutes": 30,
                "intensity": "Light", "notes": "Evening walk"},
            {"day": "Friday", "activity": "Rest", "duration_minutes": 0,
                "intensity": "Rest", "notes": ""},
            {"day": "Saturday", "activity": "Light jogging", "duration_minutes": 20,
                "intensity": "Moderate", "notes": "If comfortable"},
            {"day": "Sunday", "activity": "Rest", "duration_minutes": 0,
                "intensity": "Rest", "notes": ""},
        ],
        restrictions=["Avoid high-intensity activities",
                      "Consult doctor before starting"],
        encouragement="Start slow and build gradually for better health."
    )

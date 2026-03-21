# ============================================================
# schemas.py — ALL Pydantic models — shared contract
# Member 1 owns this. Everyone else imports from here.
# Frontend mirrors AnalyzeResponse as TypeScript type.
# ============================================================

from __future__ import annotations
from typing import Optional
from enum import Enum
from pydantic import BaseModel, Field


# ── Enums ─────────────────────────────────────────────────────

class SeverityLevel(str, Enum):
    NORMAL = "NORMAL"
    MILD_CONCERN = "MILD_CONCERN"
    MODERATE_CONCERN = "MODERATE_CONCERN"
    URGENT = "URGENT"


class FindingStatus(str, Enum):
    HIGH = "HIGH"
    LOW = "LOW"
    NORMAL = "NORMAL"
    CRITICAL = "CRITICAL"


class OrganFlag(str, Enum):
    LIVER = "LIVER"
    KIDNEY = "KIDNEY"
    HEART = "HEART"
    LUNGS = "LUNGS"
    BLOOD = "BLOOD"
    SPINE = "SPINE"
    BRAIN = "BRAIN"
    SYSTEMIC = "SYSTEMIC"


class DietaryFlag(str, Enum):
    AVOID_FATTY_FOODS = "AVOID_FATTY_FOODS"
    INCREASE_IRON = "INCREASE_IRON"
    INCREASE_VITAMIN_D = "INCREASE_VITAMIN_D"
    INCREASE_CALCIUM = "INCREASE_CALCIUM"
    INCREASE_PROTEIN = "INCREASE_PROTEIN"
    DRINK_MORE_WATER = "DRINK_MORE_WATER"
    REDUCE_SODIUM = "REDUCE_SODIUM"
    REDUCE_SUGAR = "REDUCE_SUGAR"
    LOW_POTASSIUM_DIET = "LOW_POTASSIUM_DIET"
    DIABETIC_DIET = "DIABETIC_DIET"


class ExerciseFlag(str, Enum):
    LIGHT_WALKING_ONLY = "LIGHT_WALKING_ONLY"
    CARDIO_RESTRICTED = "CARDIO_RESTRICTED"
    NORMAL_ACTIVITY = "NORMAL_ACTIVITY"
    ACTIVE_ENCOURAGED = "ACTIVE_ENCOURAGED"


class ReportType(str, Enum):
    LAB_REPORT = "LAB_REPORT"
    DISCHARGE_SUMMARY = "DISCHARGE_SUMMARY"
    PRESCRIPTION = "PRESCRIPTION"
    SCAN_REPORT = "SCAN_REPORT"


# ── Sub-models ────────────────────────────────────────────────

class PatientSummary(BaseModel):
    name: str = "Patient"
    age: int = 0
    gender: str = "UNKNOWN"           # "MALE" | "FEMALE" | "UNKNOWN"
    report_date: str = "2025-01-01"   # ISO date string


class LabFinding(BaseModel):
    parameter: str
    value: str
    normal_range: str
    status: FindingStatus
    simple_name_hindi: str
    simple_name_english: str
    layman_explanation_hindi: str
    layman_explanation_english: str


# ── /analyze ──────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    image_base64: str = Field(..., description="Base64-encoded image or PDF. May include data URI prefix.")
    language: str = Field("EN", description="EN | HI | RAJ")


class AnalyzeResponse(BaseModel):
    is_readable: bool
    report_type: str                        # ReportType enum value
    patient_summary: PatientSummary
    findings: list[LabFinding]
    affected_organs: list[OrganFlag]
    overall_summary_hindi: str
    overall_summary_english: str
    severity_level: SeverityLevel
    next_steps: list[str]
    dietary_flags: list[DietaryFlag]
    exercise_flags: list[ExerciseFlag]
    ai_confidence_score: float = Field(ge=0, le=100)
    disclaimer: str


# ── /chat ─────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str     # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., description="User's current message")
    guc_context: dict = Field(..., description="Full GUC object from Zustand store")
    history: list[ChatMessage] = Field(
        default_factory=list,
        description="Last N messages for conversation context"
    )


class ChatResponse(BaseModel):
    reply: str
    avatar_state: str = "SPEAKING"     # AvatarState hint for Member 3


# ── /nutrition ────────────────────────────────────────────────

class NutritionRequest(BaseModel):
    dietary_flags: list[DietaryFlag]
    language: str = "EN"


class FoodItem(BaseModel):
    name_english: str
    name_hindi: str
    nutrient_highlights: dict   # {"iron_mg": 3.5, "protein_g": 2.1, ...}
    serving_suggestion: str
    food_group: str


class NutritionResponse(BaseModel):
    recommended_foods: list[FoodItem]
    daily_targets: dict
    deficiency_summary: str


# ── /exercise ─────────────────────────────────────────────────

class ExerciseRequest(BaseModel):
    exercise_flags: list[ExerciseFlag]
    severity_level: SeverityLevel = SeverityLevel.MILD_CONCERN
    language: str = "EN"


class ExerciseDay(BaseModel):
    day: str                  # "Monday" ... "Sunday"
    activity: str
    duration_minutes: int
    intensity: str            # "Very Low" | "Low" | "Moderate" | "High" | "Rest"
    notes: str


class ExerciseResponse(BaseModel):
    tier: str
    tier_description: str
    weekly_plan: list[ExerciseDay]
    general_advice: str
    avoid: list[str]
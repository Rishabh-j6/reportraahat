from pydantic import BaseModel
from typing import Literal, Optional
from enum import Enum


class AnalyzeRequest(BaseModel):
    image_base64: str        # base64 encoded image or PDF
    language: str = "EN"    # HI or EN


class Finding(BaseModel):
    parameter: str
    value: str
    unit: str
    status: Literal["HIGH", "LOW", "NORMAL", "CRITICAL"]
    simple_name_hindi: str
    simple_name_english: str
    layman_explanation_hindi: str
    layman_explanation_english: str
    indian_population_mean: Optional[float] = None
    indian_population_std: Optional[float] = None
    status_vs_india: str
    normal_range: Optional[str] = None


class AnalyzeResponse(BaseModel):
    is_readable: bool
    report_type: Literal[
        "LAB_REPORT", "DISCHARGE_SUMMARY",
        "PRESCRIPTION", "SCAN_REPORT", "UNKNOWN"
    ]
    findings: list[Finding]
    affected_organs: list[str]
    overall_summary_hindi: str
    overall_summary_english: str
    severity_level: Literal[
        "NORMAL", "MILD_CONCERN",
        "MODERATE_CONCERN", "URGENT"
    ]
    dietary_flags: list[str]
    exercise_flags: list[str]
    ai_confidence_score: float
    grounded_in: str
    disclaimer: str


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []
    guc: dict = {}
    document_base64: Optional[str] = None    # base64 image or PDF
    document_type: Optional[str] = "image"   # "image" or "pdf"


class ChatResponse(BaseModel):
    reply: str


class NutritionRequest(BaseModel):
    dietary_flags: list[str] = []
    allergy_flags: list[str] = []
    vegetarian: bool = True


class FoodItem(BaseModel):
    food_name: str
    food_name_hindi: str = ""
    food_group: str = ""
    energy_kcal: Optional[float] = None
    protein_g: Optional[float] = None
    iron_mg: Optional[float] = None
    calcium_mg: Optional[float] = None
    vitamin_c_mg: Optional[float] = None
    vitamin_d_mcg: Optional[float] = None
    fibre_g: Optional[float] = None
    why_recommended: str = ""
    serving_suggestion: str = ""


class NutritionResponse(BaseModel):
    recommended_foods: list[FoodItem]
    daily_targets: dict[str, float]
    deficiencies: list[str]


class ExerciseDay(BaseModel):
    day: str
    activity: str
    duration_minutes: int
    intensity: str
    notes: str = ""


class ExerciseResponse(BaseModel):
    tier: str
    tier_reason: str
    weekly_plan: list[ExerciseDay]
    restrictions: list[str]
    encouragement: str

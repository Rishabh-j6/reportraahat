# OWNER: Member 1 (ML Engineer)
# Pydantic models — THE shared contract between backend and frontend
# Publish this on Day 1 so Member 2 can mirror as TypeScript AnalyzeResponse type
#
# Member 1 TODO: fill in all fields to match the Gemini JSON schema from the blueprint

from pydantic import BaseModel
from typing import List, Optional, Literal
from enum import Enum


class FindingStatus(str, Enum):
    HIGH     = "HIGH"
    LOW      = "LOW"
    NORMAL   = "NORMAL"
    CRITICAL = "CRITICAL"


class Severity(str, Enum):
    NORMAL           = "NORMAL"
    MILD_CONCERN     = "MILD_CONCERN"
    MODERATE_CONCERN = "MODERATE_CONCERN"
    URGENT           = "URGENT"


class ReportType(str, Enum):
    LAB_REPORT        = "LAB_REPORT"
    DISCHARGE_SUMMARY = "DISCHARGE_SUMMARY"
    PRESCRIPTION      = "PRESCRIPTION"
    SCAN_REPORT       = "SCAN_REPORT"


class PatientSummary(BaseModel):
    name:        str
    age:         int
    gender:      str
    report_date: str


class Finding(BaseModel):
    parameter:                 str
    value:                     str
    normal_range:              str
    status:                    FindingStatus
    simple_name_hindi:         str
    simple_name_english:       str
    layman_explanation_hindi:  str
    layman_explanation_english: str


# ── Request models ─────────────────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    image_base64: str
    mime_type:    str = "image/jpeg"
    language:     str = "hindi"
    session_id:   str = "default"


class ChatMessage(BaseModel):
    role: Literal["user", "model"]
    text: str


class ChatRequest(BaseModel):
    message:        str
    session_id:     str = "default"
    language:       str = "hindi"
    report_context: str = ""
    chat_history:   List[ChatMessage] = []


# ── Response models ────────────────────────────────────────────────────────────

class ReportData(BaseModel):
    is_readable:              bool
    report_type:              ReportType
    patient_summary:          PatientSummary
    findings:                 List[Finding]
    affected_organs:          List[str]
    overall_summary_hindi:    str
    overall_summary_english:  str
    severity_level:           Severity
    next_steps:               List[str]
    dietary_flags:            List[str]
    exercise_flags:           List[str]
    ai_confidence_score:      float
    disclaimer:               str


class AnalyzeResponse(ReportData):
    # Inherits all ReportData fields
    # Add any extra fields here if needed
    pass


class ChatResponse(BaseModel):
    answer: str


class NutritionFood(BaseModel):
    name_english: str
    name_hindi:   str
    nutrients:    str
    serving:      str
    emoji:        str


class NutritionResponse(BaseModel):
    dietary_flags: List[str]
    foods:         List[NutritionFood]


class ExerciseDay(BaseModel):
    day:          str
    activity:     str
    activity_hindi: str
    duration:     str


class ExerciseResponse(BaseModel):
    tier:         str
    title:        str
    title_hindi:  str
    description:  str
    days:         List[ExerciseDay]

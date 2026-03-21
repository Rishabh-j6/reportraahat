# ============================================================
# analyze.py — POST /analyze — MEMBER 1 OWNS THIS
# Flow:
#   1. Receive base64 image from frontend
#   2. Send to Google Gemini 1.5 Flash (Vision) with strict JSON schema
#   3. Parse and validate response into AnalyzeResponse
#   4. Fallback chain: timeout → MOCK_1, 429 → MOCK_2, error → MOCK_3
# ============================================================

import os
import json
import logging
import httpx
from fastapi import APIRouter
from app.schemas import AnalyzeRequest, AnalyzeResponse
from app.mock_data import MOCK_REPORT_ANEMIA, MOCK_REPORT_LIVER, MOCK_REPORT_VITAMIN_D

router = APIRouter()
logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-1.5-flash:generateContent"
)
GEMINI_TIMEOUT_SECONDS = 8

SYSTEM_PROMPT = """You are a medical report analysis AI. Analyze the provided medical report image.

CRITICAL: Respond ONLY with a valid JSON object. No markdown, no code blocks, no preamble. Raw JSON only.

Return exactly this schema:
{
  "is_readable": true,
  "report_type": "LAB_REPORT",
  "patient_summary": {
    "name": "patient name or Unknown",
    "age": 0,
    "gender": "MALE or FEMALE or UNKNOWN",
    "report_date": "YYYY-MM-DD"
  },
  "findings": [
    {
      "parameter": "exact medical term",
      "value": "value with unit e.g. 9.2 g/dL",
      "normal_range": "range e.g. 12-16 g/dL",
      "status": "HIGH or LOW or NORMAL or CRITICAL",
      "simple_name_hindi": "layman Hindi term e.g. खून की मात्रा",
      "simple_name_english": "layman English term e.g. Blood Level",
      "layman_explanation_hindi": "2-sentence simple Hindi for a 10-year-old",
      "layman_explanation_english": "2-sentence simple English for a 10-year-old"
    }
  ],
  "affected_organs": ["only from: LIVER KIDNEY HEART LUNGS BLOOD SPINE BRAIN SYSTEMIC"],
  "overall_summary_hindi": "3-sentence friendly Hindi summary, no scary words",
  "overall_summary_english": "3-sentence friendly English summary, no scary words",
  "severity_level": "NORMAL or MILD_CONCERN or MODERATE_CONCERN or URGENT",
  "next_steps": ["step1", "step2", "step3", "step4", "step5"],
  "dietary_flags": ["only from: AVOID_FATTY_FOODS INCREASE_IRON INCREASE_VITAMIN_D INCREASE_CALCIUM INCREASE_PROTEIN DRINK_MORE_WATER REDUCE_SODIUM REDUCE_SUGAR LOW_POTASSIUM_DIET DIABETIC_DIET"],
  "exercise_flags": ["EXACTLY ONE from: LIGHT_WALKING_ONLY CARDIO_RESTRICTED NORMAL_ACTIVITY ACTIVE_ENCOURAGED"],
  "ai_confidence_score": 85,
  "disclaimer": "This analysis is for informational purposes only and does not constitute medical advice. Please consult a qualified healthcare professional."
}

Rules:
- affected_organs: only organs actually mentioned/implied by findings
- exercise_flags: pick EXACTLY ONE, most restrictive appropriate value
- dietary_flags: only what findings actually suggest, can be multiple
- findings: extract EVERY lab value visible, even normal ones
- ai_confidence_score: honest 0-100 based on image quality and completeness
"""

VALID_ORGANS = {"LIVER","KIDNEY","HEART","LUNGS","BLOOD","SPINE","BRAIN","SYSTEMIC"}
VALID_DIETARY = {"AVOID_FATTY_FOODS","INCREASE_IRON","INCREASE_VITAMIN_D","INCREASE_CALCIUM","INCREASE_PROTEIN","DRINK_MORE_WATER","REDUCE_SODIUM","REDUCE_SUGAR","LOW_POTASSIUM_DIET","DIABETIC_DIET"}
VALID_EXERCISE = {"LIGHT_WALKING_ONLY","CARDIO_RESTRICTED","NORMAL_ACTIVITY","ACTIVE_ENCOURAGED"}
VALID_SEVERITY = {"NORMAL","MILD_CONCERN","MODERATE_CONCERN","URGENT"}
VALID_STATUS = {"HIGH","LOW","NORMAL","CRITICAL"}
VALID_REPORT_TYPE = {"LAB_REPORT","DISCHARGE_SUMMARY","PRESCRIPTION","SCAN_REPORT"}


async def call_gemini(image_base64: str, language: str) -> dict:
    media_type = "image/jpeg"
    if image_base64.startswith("data:"):
        header, image_base64 = image_base64.split(",", 1)
        if "png" in header:
            media_type = "image/png"
        elif "webp" in header:
            media_type = "image/webp"
        elif "pdf" in header:
            media_type = "application/pdf"

    lang_note = "\nPrefer Hindi in hindi fields. User language preference: " + language

    payload = {
        "contents": [{
            "parts": [
                {"text": SYSTEM_PROMPT + lang_note},
                {"inline_data": {"mime_type": media_type, "data": image_base64}},
            ]
        }],
        "generationConfig": {
            "temperature": 0.1,
            "maxOutputTokens": 2048,
            "responseMimeType": "application/json",
        },
    }

    async with httpx.AsyncClient(timeout=GEMINI_TIMEOUT_SECONDS) as client:
        response = await client.post(
            f"{GEMINI_URL}?key={GEMINI_API_KEY}",
            json=payload,
            headers={"Content-Type": "application/json"},
        )

    if response.status_code == 429:
        raise httpx.HTTPStatusError("Rate limited", request=response.request, response=response)
    if response.status_code != 200:
        raise ValueError(f"Gemini API {response.status_code}: {response.text[:200]}")

    raw_text = response.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
    if raw_text.startswith("```"):
        raw_text = raw_text.split("```")[1]
        if raw_text.startswith("json"):
            raw_text = raw_text[4:]
    return json.loads(raw_text)


def sanitize(data: dict) -> dict:
    data.setdefault("is_readable", True)
    data.setdefault("report_type", "LAB_REPORT")
    data.setdefault("overall_summary_hindi", "रिपोर्ट का विश्लेषण किया गया है।")
    data.setdefault("overall_summary_english", "Report has been analyzed.")
    data.setdefault("next_steps", ["Consult your doctor about these results."])
    data.setdefault("ai_confidence_score", 75)
    data.setdefault("disclaimer", "This analysis is for informational purposes only and does not constitute medical advice.")

    if data.get("report_type") not in VALID_REPORT_TYPE:
        data["report_type"] = "LAB_REPORT"
    if data.get("severity_level") not in VALID_SEVERITY:
        data["severity_level"] = "MILD_CONCERN"

    data["affected_organs"] = [o for o in data.get("affected_organs", []) if o in VALID_ORGANS] or ["SYSTEMIC"]
    data["dietary_flags"] = [f for f in data.get("dietary_flags", []) if f in VALID_DIETARY]

    raw_ex = data.get("exercise_flags", ["NORMAL_ACTIVITY"])
    if isinstance(raw_ex, str):
        raw_ex = [raw_ex]
    data["exercise_flags"] = [f for f in raw_ex if f in VALID_EXERCISE] or ["NORMAL_ACTIVITY"]

    ps = data.get("patient_summary", {})
    age_raw = ps.get("age", 0)
    data["patient_summary"] = {
        "name": str(ps.get("name", "Patient")),
        "age": int(age_raw) if str(age_raw).isdigit() else 0,
        "gender": ps.get("gender", "UNKNOWN") if ps.get("gender") in {"MALE","FEMALE","UNKNOWN"} else "UNKNOWN",
        "report_date": str(ps.get("report_date", "2025-01-01")),
    }

    clean = []
    for f in data.get("findings", []):
        if not isinstance(f, dict):
            continue
        clean.append({
            "parameter": str(f.get("parameter", "Unknown")),
            "value": str(f.get("value", "N/A")),
            "normal_range": str(f.get("normal_range", "N/A")),
            "status": f.get("status", "NORMAL") if f.get("status") in VALID_STATUS else "NORMAL",
            "simple_name_hindi": str(f.get("simple_name_hindi", f.get("parameter", ""))),
            "simple_name_english": str(f.get("simple_name_english", f.get("parameter", ""))),
            "layman_explanation_hindi": str(f.get("layman_explanation_hindi", "")),
            "layman_explanation_english": str(f.get("layman_explanation_english", "")),
        })
    data["findings"] = clean
    return data


@router.post("/", response_model=AnalyzeResponse)
async def analyze_report(request: AnalyzeRequest):
    """
    POST /analyze
    Body: { image_base64: "...", language: "EN" }

    Fallback chain:
      timeout  → MOCK_REPORT_ANEMIA
      429      → MOCK_REPORT_LIVER
      any error → MOCK_REPORT_VITAMIN_D
      no key   → MOCK_REPORT_ANEMIA
    """
    if not GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY not configured — returning mock anemia report")
        return AnalyzeResponse(**MOCK_REPORT_ANEMIA)

    try:
        raw = await call_gemini(request.image_base64, request.language)
        clean = sanitize(raw)
        return AnalyzeResponse(**clean)

    except httpx.TimeoutException:
        logger.warning("Gemini timed out after %ss — fallback: anemia mock", GEMINI_TIMEOUT_SECONDS)
        return AnalyzeResponse(**MOCK_REPORT_ANEMIA)

    except httpx.HTTPStatusError as e:
        if e.response.status_code == 429:
            logger.warning("Gemini rate limited — fallback: liver mock")
            return AnalyzeResponse(**MOCK_REPORT_LIVER)
        logger.error("Gemini HTTP error %s", e)
        return AnalyzeResponse(**MOCK_REPORT_ANEMIA)

    except (ValueError, KeyError, json.JSONDecodeError, IndexError) as e:
        logger.error("Gemini parse/validation error: %s", e)
        return AnalyzeResponse(**MOCK_REPORT_VITAMIN_D)

    except Exception as e:
        logger.error("Unexpected analyze error: %s", e)
        return AnalyzeResponse(**MOCK_REPORT_ANEMIA)
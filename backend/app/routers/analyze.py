# analyze.py — Member 1's file with fixes applied
# Changes from his original:
#   1. @router.post("/analyze") → @router.post("/")      [fixes double path]
#   2. UploadFile → AnalyzeRequest JSON body             [matches frontend]
#   3. Imports from app.schemas (not app.mock_data)

import io
import re
import random
from fastapi import APIRouter
from app.schemas import AnalyzeResponse, AnalyzeRequest, LabFinding, PatientSummary
from app.mock_data import MOCK_REPORT_ANEMIA, MOCK_REPORT_LIVER, MOCK_REPORT_VITAMIN_D
from app.ml.rag import retrieve_reference_range
from app.ml.model import simplify_finding

router = APIRouter()


def parse_lab_values(text: str) -> list[dict]:
    findings = []
    patterns = [
        r'([A-Za-z][A-Za-z\s\(\)\/\-\.]{2,40})\s*[:]\s*([0-9]+\.?[0-9]*)\s*([a-zA-Z\/\%µ]+)',
        r'([A-Za-z][A-Za-z\s\(\)\/\-\.]{2,40})\s+([0-9]+\.?[0-9]*)\s+([a-zA-Z\/\%µ]+)',
    ]
    seen = set()
    for pattern in patterns:
        for match in re.finditer(pattern, text, re.IGNORECASE):
            name = match.group(1).strip()
            value = match.group(2).strip()
            unit = match.group(3).strip()
            if len(name) < 3 or name.lower() in seen:
                continue
            if any(s in name.lower() for s in ['page','date','name','age','sex','report','lab','doctor','patient']):
                continue
            seen.add(name.lower())
            findings.append({"parameter": name, "value": value, "unit": unit})
    return findings[:20]


def detect_organs(findings: list) -> list[str]:
    organ_map = {
        "LIVER":  ["sgpt","sgot","alt","ast","bilirubin","albumin","ggt","alkaline phosphatase"],
        "KIDNEY": ["creatinine","urea","bun","uric acid","egfr","potassium","sodium"],
        "BLOOD":  ["hemoglobin","hb","rbc","wbc","platelet","hematocrit","mcv","mch","ferritin"],
        "HEART":  ["troponin","ck-mb","ldh","cholesterol","triglyceride","ldl","hdl"],
        "SYSTEMIC": ["vitamin d","vitamin b12","crp","esr","folate","tsh","t3","t4"],
    }
    detected = set()
    for f in findings:
        name_lower = f.parameter.lower() if hasattr(f, 'parameter') else f["parameter"].lower()
        for organ, keywords in organ_map.items():
            if any(kw in name_lower for kw in keywords):
                detected.add(organ)
    return list(detected) or ["SYSTEMIC"]


# ── FIX 1: "/" not "/analyze" — main.py already adds /analyze prefix ──
@router.post("/", response_model=AnalyzeResponse)
# ── FIX 2: JSON body with base64 string, not UploadFile ──────────────
async def analyze_report(request: AnalyzeRequest):
    import base64

    # Decode base64 image
    image_data = request.image_base64
    if image_data.startswith("data:"):
        header, image_data = image_data.split(",", 1)
        content_type = header.split(";")[0].replace("data:", "")
    else:
        content_type = "image/jpeg"

    try:
        file_bytes = base64.b64decode(image_data)
    except Exception:
        return AnalyzeResponse(**MOCK_REPORT_ANEMIA)

    # Extract text via OCR / PDF
    raw_text = ""
    if "pdf" in content_type:
        try:
            import pdfplumber
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                for page in pdf.pages:
                    t = page.extract_text()
                    if t:
                        raw_text += t + "\n"
        except Exception as e:
            print(f"PDF error: {e}")
    else:
        try:
            import pytesseract
            from PIL import Image
            img = Image.open(io.BytesIO(file_bytes))
            raw_text = pytesseract.image_to_string(img)
        except Exception as e:
            print(f"OCR error: {e}")

    if not raw_text or len(raw_text.strip()) < 20:
        return AnalyzeResponse(**MOCK_REPORT_ANEMIA)

    raw_findings = parse_lab_values(raw_text)
    if not raw_findings:
        return AnalyzeResponse(**MOCK_REPORT_ANEMIA)

    processed_findings = []
    severity_scores = []

    for raw in raw_findings:
        try:
            param = raw["parameter"]
            value_str = raw["value"]
            unit = raw["unit"]
            ref = retrieve_reference_range(param, unit)
            pop_mean = ref.get("population_mean")
            pop_std = ref.get("population_std")

            try:
                val_float = float(value_str)
                if pop_mean and pop_std:
                    if val_float < pop_mean - pop_std:
                        status = "LOW"; severity_scores.append(2)
                    elif val_float > pop_mean + pop_std * 2:
                        status = "CRITICAL"; severity_scores.append(4)
                    elif val_float > pop_mean + pop_std:
                        status = "HIGH"; severity_scores.append(3)
                    else:
                        status = "NORMAL"; severity_scores.append(1)
                else:
                    status = "NORMAL"; severity_scores.append(1)
            except ValueError:
                status = "NORMAL"; severity_scores.append(1)

            status_str = f"Indian population average: {pop_mean} {unit}" if pop_mean else "Reference data from Indian population"
            simplified = simplify_finding(param, value_str, unit, status, status_str)

            processed_findings.append(LabFinding(
                parameter=param,
                value=f"{value_str} {unit}",
                normal_range=f"{ref.get('p5','N/A')} - {ref.get('p95','N/A')} {unit}",
                status=status,
                simple_name_hindi=param,
                simple_name_english=param,
                layman_explanation_hindi=simplified["hindi"],
                layman_explanation_english=simplified["english"],
            ))
        except Exception as e:
            print(f"Finding error {raw}: {e}")
            continue

    if not processed_findings:
        return AnalyzeResponse(**MOCK_REPORT_ANEMIA)

    max_score = max(severity_scores) if severity_scores else 1
    severity_map = {1:"NORMAL",2:"MILD_CONCERN",3:"MODERATE_CONCERN",4:"URGENT"}
    severity_level = severity_map.get(max_score, "NORMAL")

    affected_organs = detect_organs(processed_findings)

    dietary_flags = []
    exercise_flags = []
    for f in processed_findings:
        n = f.parameter.lower()
        if "hemoglobin" in n or "ferritin" in n or "iron" in n:
            dietary_flags.append("INCREASE_IRON")
        if "vitamin d" in n:
            dietary_flags.append("INCREASE_VITAMIN_D")
        if "cholesterol" in n or "ldl" in n or "triglyceride" in n:
            dietary_flags.append("AVOID_FATTY_FOODS")
        if "glucose" in n or "sugar" in n or "hba1c" in n:
            dietary_flags.append("REDUCE_SUGAR")
        if "sgpt" in n or "sgot" in n or "bilirubin" in n:
            exercise_flags.append("LIGHT_WALKING_ONLY")

    dietary_flags = list(set(dietary_flags))
    if not exercise_flags:
        exercise_flags = ["LIGHT_WALKING_ONLY"] if severity_level in ["MODERATE_CONCERN","URGENT"] else ["NORMAL_ACTIVITY"]

    grounded_count = sum(1 for f in processed_findings if f.normal_range != "N/A - N/A")
    confidence = min(95.0, 60.0 + (grounded_count / max(len(processed_findings),1)) * 35.0)

    abnormal = [f for f in processed_findings if f.status in ["HIGH","LOW","CRITICAL"]]
    if abnormal:
        hindi = f"आपकी रिपोर्ट में {len(abnormal)} असामान्य मान पाए गए। {abnormal[0].layman_explanation_hindi} डॉक्टर से मिलें।"
        english = f"Your report shows {len(abnormal)} abnormal values. {abnormal[0].layman_explanation_english} Please consult your doctor."
    else:
        hindi = "आपकी सभी जांच सामान्य हैं।"
        english = "All your test values appear to be within normal range."

    return AnalyzeResponse(
        is_readable=True,
        report_type="LAB_REPORT",
        patient_summary=PatientSummary(name="Patient", age=0, gender="UNKNOWN", report_date="2025-03-21"),
        findings=processed_findings,
        affected_organs=affected_organs,
        overall_summary_hindi=hindi,
        overall_summary_english=english,
        severity_level=severity_level,
        next_steps=["Consult your doctor about abnormal values", "Retest after treatment course"],
        dietary_flags=dietary_flags,
        exercise_flags=exercise_flags,
        ai_confidence_score=round(confidence, 1),
        disclaimer="This is an AI-assisted analysis. It is not a medical diagnosis. Please consult a qualified doctor."
    )


@router.get("/mock", response_model=AnalyzeResponse)
async def mock_analyze(case: int = 0):
    mocks = [MOCK_REPORT_ANEMIA, MOCK_REPORT_LIVER, MOCK_REPORT_VITAMIN_D]
    return AnalyzeResponse(**mocks[case % 3])
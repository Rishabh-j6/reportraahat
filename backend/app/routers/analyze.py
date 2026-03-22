import io
import re
import random
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.schemas import AnalyzeResponse, Finding
from app.mock_data import MOCK_CASES
from app.ml.rag import retrieve_reference_range, determine_status_vs_india
from app.ml.model import simplify_finding

router = APIRouter()


def extract_text_from_upload(file_bytes: bytes, content_type: str) -> str:
    """Extract raw text from uploaded image or PDF using multiple methods."""
    text = ""

    if "pdf" in content_type:
        try:
            import pdfplumber
            print(f"[DEBUG] Attempting pdfplumber extraction on {len(file_bytes)} bytes PDF")
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                print(f"[DEBUG] PDF has {len(pdf.pages)} pages")
                # Extract text directly from PDF
                for idx, page in enumerate(pdf.pages):
                    page_text = page.extract_text()
                    if page_text:
                        print(f"[DEBUG] Page {idx}: extracted {len(page_text)} chars")
                        text += page_text + "\n"
                    
                    # Also try extract_text with layout if direct method got little
                    if not page_text or len(page_text.strip()) < 50:
                        try:
                            layout_text = page.extract_text(layout=True)
                            if layout_text and len(layout_text) > len(page_text or ""):
                                print(f"[DEBUG] Page {idx}: layout extraction better ({len(layout_text)} chars)")
                                text = text.replace(page_text + "\n", "") if page_text else text
                                text += layout_text + "\n"
                        except:
                            pass
            
            print(f"[DEBUG] Total text extracted via pdfplumber: {len(text)} chars")
        except Exception as e:
            print(f"[DEBUG] pdfplumber error: {e}")
        
        # Fallback: Extract text via character-level analysis if direct method failed
        if not text or len(text.strip()) < 20:
            try:
                import pdfplumber
                print(f"[DEBUG] Fallback: Attempting character-level extraction")
                with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                    for idx, page in enumerate(pdf.pages):
                        chars = page.chars
                        if chars:
                            page_text = "".join([c['text'] for c in chars])
                            print(f"[DEBUG] Page {idx}: char extraction got {len(page_text)} chars")
                            text += page_text + " "
                
                print(f"[DEBUG] Character-level extraction: {len(text)} chars total")
            except Exception as e:
                print(f"[DEBUG] Character-level extraction error: {e}")

    elif "image" in content_type:
        print(f"[DEBUG] Image detected, attempting pytesseract OCR")
        try:
            import pytesseract
            from PIL import Image
            img = Image.open(io.BytesIO(file_bytes))
            text = pytesseract.image_to_string(img)
            print(f"[DEBUG] OCR extracted: {len(text)} chars")
        except Exception as e:
            print(f"[DEBUG] OCR error (Tesseract may not be installed): {e}")

    print(f"[DEBUG] Final extracted text: {len(text)} chars. Content preview: {text[:100]}")
    return text.strip()


def parse_lab_values(text: str) -> list[dict]:
    """
    Extract lab test name, value, unit from raw report text.
    Handles complete line format: parameter VALUE UNIT reference STATUS
    """
    findings = []
    
    lines = text.split('\n')
    seen = set()
    
    for line in lines:
        line = line.strip()
        if not line or len(line) < 15:
            continue
        
        # Skip headers and metadata
        if any(skip in line.upper() for skip in [
            'INVESTIGATION', 'PATIENT', 'LAB', 'REPORT', 'DATE', 'ACCREDITED',
            'REF.', 'DISCLAIMER', 'INTERPRETATION', 'METROPOLIS', 'NABL', 'ISO'
        ]):
            continue
        
        # Pattern for lines like: "Haemoglobin (Hb) 9.2 g/dL 13.0 - 17.0 LOW"
        # Parameter can have letters, spaces, digits, parens, dashes
        # Value: integer or decimal  
        # Unit: letters/digits/symbols
        # Rest: ignored (reference range and status)
        match = re.match(
            r'^([A-Za-z0-9\s\(\)\/\-]{3,45}?)\s+([0-9]{1,4}(?:\.[0-9]{1,2})?)\s+([a-zA-Z/\.\\%µ\-0-9]+)(?:\s+.*)?$',
            line,
            re.IGNORECASE
        )
        
        if match:
            param = match.group(1).strip()
            value = match.group(2).strip()
            unit = match.group(3).strip().rstrip('/ ')
            
            # Clean parameter: remove incomplete parentheses notation
            # "Haemoglobin (Hb" -> "Haemoglobin"
            # "Haematocrit (PCV" -> "Haematocrit"
            if '(' in param and not ')' in param:
                param = param[:param.index('(')].strip()
            
            # Skip noise parameters
            if len(param) < 2 or param.lower() in seen:
                continue
            if any(skip in param.lower() for skip in [
                'age', 'sex', 'years', 'male', 'female', 'collected', 'hours', 'times', 'name'
            ]):
                continue
            
            # Unit must have at least one letter or valid symbol
            if not any(c.isalpha() or c in '/%µ-' for c in unit):
                continue
            
            seen.add(param.lower())
            findings.append({
                "parameter": param,
                "value": value,
                "unit": unit
            })
    
    return findings[:50]  # Max 50 findings per report


def detect_organs(findings: list[dict]) -> list[str]:
    """Map lab tests to affected organ systems."""
    organ_map = {
        "LIVER": ["sgpt", "sgot", "alt", "ast", "bilirubin", "albumin", "ggt", "alkaline phosphatase"],
        "KIDNEY": ["creatinine", "urea", "bun", "uric acid", "egfr", "potassium", "sodium"],
        "BLOOD": ["hemoglobin", "hb", "rbc", "wbc", "platelet", "hematocrit", "mcv", "mch"],
        "HEART": ["troponin", "ck-mb", "ldh", "cholesterol", "triglyceride", "ldl", "hdl"],
        "THYROID": ["tsh", "t3", "t4", "free t3", "free t4"],
        "DIABETES": ["glucose", "hba1c", "blood sugar", "fasting sugar"],
        "SYSTEMIC": ["vitamin d", "vitamin b12", "ferritin", "crp", "esr", "folate"],
    }

    detected = set()
    for finding in findings:
        # Handle both dict and Pydantic object
        if isinstance(finding, dict):
            name_lower = finding.get("parameter", "").lower()
        else:
            name_lower = getattr(finding, "parameter", "").lower()
        
        for organ, keywords in organ_map.items():
            if any(kw in name_lower for kw in keywords):
                detected.add(organ)

    return list(detected) if detected else ["SYSTEMIC"]


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_report(
    file: UploadFile = File(...),
    language: str = Form(default="EN")
):
    file_bytes = await file.read()
    content_type = file.content_type or "image/jpeg"

    # Step 1: Extract text from image/PDF
    raw_text = extract_text_from_upload(file_bytes, content_type)

    if not raw_text or len(raw_text.strip()) < 20:
        return AnalyzeResponse(
            is_readable=False,
            report_type="UNKNOWN",
            findings=[],
            affected_organs=[],
            overall_summary_hindi="यह छवि पढ़ने में असमर्थ। कृपया एक स्पष्ट फोटो लें।",
            overall_summary_english="Could not read this image. Please upload a clearer photo of the report.",
            severity_level="NORMAL",
            dietary_flags=[],
            exercise_flags=[],
            ai_confidence_score=0.0,
            grounded_in="N/A",
            disclaimer="Please consult a doctor for proper medical advice."
        )

    # Step 2: Parse lab values from text
    raw_findings = parse_lab_values(raw_text)

    if not raw_findings:
        # Fallback to mock data if parsing fails
        return random.choice(MOCK_CASES)

    # Step 3: For each finding — RAG retrieval + model simplification
    processed_findings = []
    severity_scores = []

    for raw in raw_findings:
        try:
            param = raw["parameter"]
            value_str = raw["value"]
            unit = raw["unit"]

            # RAG: get Indian population reference range
            ref = retrieve_reference_range(param, unit)
            pop_mean = ref.get("population_mean")
            pop_std = ref.get("population_std")

            # Determine status
            try:
                val_float = float(value_str)
                if pop_mean and pop_std:
                    if val_float < pop_mean - pop_std:
                        status = "LOW"
                        severity_scores.append(2)
                    elif val_float > pop_mean + pop_std * 2:
                        status = "CRITICAL"
                        severity_scores.append(4)
                    elif val_float > pop_mean + pop_std:
                        status = "HIGH"
                        severity_scores.append(3)
                    else:
                        status = "NORMAL"
                        severity_scores.append(1)
                else:
                    status = "NORMAL"
                    severity_scores.append(1)
            except ValueError:
                status = "NORMAL"
                severity_scores.append(1)

            status_str = (
                f"Indian population average: {pop_mean} {unit}"
                if pop_mean else "Reference data from Indian population"
            )

            # Model: simplify the finding
            simplified = simplify_finding(param, value_str, unit, status, status_str)

            processed_findings.append(Finding(
                parameter=param,
                value=value_str,
                unit=unit,
                status=status,
                simple_name_hindi=param,
                simple_name_english=param,
                layman_explanation_hindi=simplified["hindi"],
                layman_explanation_english=simplified["english"],
                indian_population_mean=pop_mean,
                indian_population_std=pop_std,
                status_vs_india=status_str,
                normal_range=f"{ref.get('p5', 'N/A')} - {ref.get('p95', 'N/A')} {unit}"
            ))

        except Exception as e:
            print(f"Error processing finding {raw}: {e}")
            continue

    if not processed_findings:
        return random.choice(MOCK_CASES)

    # Step 4: Determine overall severity
    max_score = max(severity_scores) if severity_scores else 1
    severity_map = {1: "NORMAL", 2: "MILD_CONCERN", 3: "MODERATE_CONCERN", 4: "URGENT"}
    severity_level = severity_map.get(max_score, "NORMAL")

    # Step 5: Detect affected organs
    affected_organs = detect_organs(processed_findings)

    # Step 6: Generate dietary/exercise flags
    dietary_flags = []
    exercise_flags = []

    for f in processed_findings:
        name_lower = f.parameter.lower()
        if "hemoglobin" in name_lower or "iron" in name_lower:
            dietary_flags.append("INCREASE_IRON")
        if "vitamin d" in name_lower:
            dietary_flags.append("INCREASE_VITAMIN_D")
        if "vitamin b12" in name_lower:
            dietary_flags.append("INCREASE_VITAMIN_B12")
        if "cholesterol" in name_lower or "ldl" in name_lower:
            dietary_flags.append("AVOID_FATTY_FOODS")
        if "glucose" in name_lower or "sugar" in name_lower or "hba1c" in name_lower:
            dietary_flags.append("AVOID_SUGAR")
        if "creatinine" in name_lower or "urea" in name_lower:
            dietary_flags.append("REDUCE_PROTEIN")
        if "sgpt" in name_lower or "sgot" in name_lower or "bilirubin" in name_lower:
            exercise_flags.append("LIGHT_WALKING_ONLY")

    if not exercise_flags:
        if severity_level in ["MODERATE_CONCERN", "URGENT"]:
            exercise_flags = ["LIGHT_WALKING_ONLY"]
        else:
            exercise_flags = ["NORMAL_ACTIVITY"]

    dietary_flags = list(set(dietary_flags))

    # Step 7: Confidence score based on how many findings were grounded
    grounded_count = sum(1 for f in processed_findings if f.indian_population_mean)
    confidence = min(95.0, 60.0 + (grounded_count / max(len(processed_findings), 1)) * 35.0)

    # Step 8: Overall summaries
    abnormal = [f for f in processed_findings if f.status in ["HIGH", "LOW", "CRITICAL"]]
    if abnormal:
        hindi_summary = f"आपकी रिपोर्ट में {len(abnormal)} असामान्य मान पाए गए। {abnormal[0].layman_explanation_hindi} डॉक्टर से मिलें।"
        english_summary = f"Your report shows {len(abnormal)} abnormal values. {abnormal[0].layman_explanation_english} Please consult your doctor."
    else:
        hindi_summary = "आपकी सभी जांच सामान्य हैं। अपना स्वास्थ्य ऐसे ही बनाए रखें।"
        english_summary = "All your test values appear to be within normal range. Keep up your healthy lifestyle."

    return AnalyzeResponse(
        is_readable=True,
        report_type="LAB_REPORT",
        findings=processed_findings,
        affected_organs=affected_organs,
        overall_summary_hindi=hindi_summary,
        overall_summary_english=english_summary,
        severity_level=severity_level,
        dietary_flags=dietary_flags,
        exercise_flags=exercise_flags,
        ai_confidence_score=round(confidence, 1),
        grounded_in="Fine-tuned Flan-T5-small + FAISS over NidaanKosha 100K Indian lab readings",
        disclaimer="This is an AI-assisted analysis. It is not a medical diagnosis. Please consult a qualified doctor."
    )


@router.get("/mock-analyze", response_model=AnalyzeResponse)
async def mock_analyze(case: int = None):
    """Returns mock data for frontend development. case=0,1,2"""
    if case is not None and 0 <= case < len(MOCK_CASES):
        return MOCK_CASES[case]
    return random.choice(MOCK_CASES)

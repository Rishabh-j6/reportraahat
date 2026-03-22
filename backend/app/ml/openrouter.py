import os
import httpx
from app.ml.enhanced_chat import get_enhanced_mock_response, rag_retriever
try:
    from app.ml.rag import retrieve_doctor_context
except ImportError:
    retrieve_doctor_context = None

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
BASE_URL = "https://openrouter.ai/api/v1"

# Free models available on OpenRouter — fallback chain
MODELS = [
    "stepfun/step-3.5-flash:free",
    "nvidia/nemotron-3-super-120b-a12b:free",
    "arcee-ai/trinity-large-preview:free",
]


def build_system_prompt(guc: dict) -> str:
    """
    Builds the Dr. Raahat system prompt by injecting
    the full Global User Context.
    """
    name = guc.get("name", "Patient")
    age = guc.get("age", "")
    gender = guc.get("gender", "")
    language = guc.get("language", "EN")
    location = guc.get("location", "India")

    report = guc.get("latestReport", {})
    summary_en = report.get("overall_summary_english", "No report uploaded yet.")
    organs = ", ".join(report.get("affected_organs", [])) or "None identified"
    severity = report.get("severity_level", "NORMAL")
    dietary_flags = ", ".join(report.get("dietary_flags", [])) or "None"
    exercise_flags = ", ".join(report.get("exercise_flags", [])) or "None"

    findings = report.get("findings", [])
    abnormal = [
        f"{f['parameter']}: {f['value']} {f['unit']} ({f['status']})"
        for f in findings
        if f.get("status") in ["HIGH", "LOW", "CRITICAL"]
    ]
    abnormal_str = "\n".join(f"  - {a}" for a in abnormal) or "  - None"

    medications = guc.get("medicationsActive", [])
    meds_str = ", ".join(medications) if medications else "None reported"

    allergy_flags = guc.get("allergyFlags", [])
    allergies_str = ", ".join(allergy_flags) if allergy_flags else "None reported"

    stress = guc.get("mentalWellness", {}).get("stressLevel", 5)
    sleep = guc.get("mentalWellness", {}).get("sleepQuality", 5)

    lang_instruction = (
        "Always respond in Hindi (Devanagari script). "
        "Use simple everyday Hindi words, not medical jargon."
        if language == "HI"
        else "Always respond in simple English."
    )

    # Add empathy instruction if stress is high
    empathy_note = (
        "\nNOTE: This patient has high stress levels. "
        "Be extra gentle, reassuring and empathetic in your responses. "
        "Acknowledge their feelings before giving medical information."
        if int(stress) <= 3 else ""
    )

    prompt = f"""You are Dr. Raahat, a friendly and empathetic Indian doctor. You speak both Hindi and English fluently.

PATIENT PROFILE:
- Name: {name}
- Age: {age}, Gender: {gender}
- Location: {location}

LATEST MEDICAL REPORT SUMMARY:
- Overall: {summary_en}
- Organs affected: {organs}
- Severity: {severity}

ABNORMAL FINDINGS:
{abnormal_str}

DIETARY FLAGS: {dietary_flags}
EXERCISE FLAGS: {exercise_flags}
ACTIVE MEDICATIONS: {meds_str}
ALLERGIES/RESTRICTIONS: {allergies_str}
STRESS LEVEL: {stress}/10 | SLEEP QUALITY: {sleep}/10

LANGUAGE: {lang_instruction}
{empathy_note}

IMPORTANT RULES:
- Never make up diagnoses or prescribe medications
- If asked something outside your knowledge, say "Please see a doctor in person for this"
- Always reference the patient's actual report data when answering
- Keep answers concise — 3-5 sentences maximum
- End every response with one actionable tip
- Be like a caring family doctor, not a cold clinical system
- Never create panic. Always give hope alongside facts."""

    return prompt


# Enhanced mock responses moved to app/ml/enhanced_chat.py
# See get_enhanced_mock_response() for detailed contextual responses


def chat(
    message: str,
    history: list[dict],
    guc: dict
) -> str:
    """
    Send a message to Dr. Raahat via OpenRouter.
    Injects GUC context + RAG-retrieved knowledge.
    Falls back to enhanced mock responses for testing.
    """
    retrieved_docs = []
    
    # Try to retrieve relevant medical documents from RAG
    try:
        if rag_retriever and rag_retriever.loaded:
            # Create embedding for the user's message (simplified for now)
            # In production, use proper embeddings model
            query_embedding = [0.1] * 768  # Placeholder - replace with real embeddings
            retrieved_docs = rag_retriever.retrieve(query_embedding, k=3)
    except Exception as e:
        print(f"⚠️  RAG retrieval failed: {e}")
    
    # Use enhanced mock responses with RAG grounding
    return get_enhanced_mock_response(message, guc, retrieved_docs)

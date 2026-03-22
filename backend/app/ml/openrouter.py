import os
import httpx
from dotenv import load_dotenv
load_dotenv()

# from app.ml.rag import retrieve_doctor_context  # Not yet implemented

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
BASE_URL = "https://openrouter.ai/api/v1"

# Free models available on OpenRouter — fallback chain
MODELS = [
    "nvidia/nemotron-3-super-120b-a12b:free",
    "stepfun/step-3.5-flash:free",
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

    report = guc.get("latestReport") or {}
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


def chat(
    message: str,
    history: list[dict],
    guc: dict,
    document_context: str = ""
) -> str:
    """
    Send a message to Dr. Raahat via OpenRouter.
    Injects GUC context + RAG-retrieved knowledge.
    """
    print(f"\n📋 CHAT FUNCTION CALLED")
    print(f"   Message: {message[:50]}...")
    print(f"   Document context length: {len(document_context)} chars")
    print(f"   Has document: {bool(document_context)}")
    
    if not OPENROUTER_API_KEY:
        return "API key not configured. Please set OPENROUTER_API_KEY."

    # RAG: retrieve relevant doctor KB chunks for this query (not yet implemented)
    rag_context = ""  # retrieve_doctor_context not yet available

    system_prompt = build_system_prompt(guc)
    if rag_context:
        system_prompt += f"\n\nRELEVANT KNOWLEDGE:\n{rag_context}"
    if document_context:
        system_prompt += f"\n\n{'='*60}\nDOCUMENT ANALYSIS TASK:\nThe patient has uploaded a medical document for you to review.\nAnalyze the content below and explain what it says in simple terms.\n\n{document_context}\n{'='*60}\n\nYour task: Analyze this document thoroughly. Explain all findings, values, and what they mean for the patient's health. Be specific and reference the actual data from the document."

    # Build messages array
    messages = [{"role": "system", "content": system_prompt}]

    # Add last 10 messages from history (keep context window small)
    for msg in history[-10:]:
        messages.append({
            "role": msg.get("role", "user"),
            "content": msg.get("content", "")
        })

    messages.append({"role": "user", "content": message})

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "HTTP-Referer": "https://reportraahat.vercel.app",
        "X-Title": "ReportRaahat",
        "Content-Type": "application/json"
    }

    # Try each model in fallback chain
    last_error = None
    for model in MODELS:
        try:
            response = httpx.post(
                f"{BASE_URL}/chat/completions",
                headers=headers,
                json={
                    "model": model,
                    "messages": messages,
                    "max_tokens": 300,
                    "temperature": 0.7
                },
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"].strip()

        except httpx.HTTPStatusError as e:
            print(f"OpenRouter {model} failed: {e}")
            last_error = str(e)
            continue
        except Exception as e:
            print(f"OpenRouter error with {model}: {e}")
            last_error = str(e)
            continue

    # All models failed
    print(f"All OpenRouter models failed. Last error: {last_error}")
    return (
        "Mujhe abhi thodi takleef ho rahi hai. "
        "Kripya thodi der baad dobara koshish karein. "
        "(I'm having trouble connecting right now. Please try again in a moment.)"
    )
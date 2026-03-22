import os
import httpx

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
BASE_URL = "https://openrouter.ai/api/v1"

# Use a fast model for simplification (called per-finding, so speed matters)
SIMPLIFY_MODEL = "deepseek/deepseek-chat-v3-0324:free"


def load_model():
    """
    Check if OpenRouter API key is available.
    In production, this would also load local models.
    """
    if OPENROUTER_API_KEY and not OPENROUTER_API_KEY.startswith("placeholder"):
        print("✅ OpenRouter API key found — using AI for simplification")
    else:
        print("⚠️ No OpenRouter API key — using template-based simplification")
    return None, None


# Hardcoded fallback templates for when AI is unavailable
FALLBACK_EXPLANATIONS = {
    ("HIGH", "GLUCOSE"): {
        "english": "Your blood glucose is elevated at {value} {unit}. This suggests your body is having trouble managing blood sugar. Reduce sugary foods and consult your doctor for diabetes screening.",
        "hindi": "आपका ब्लड ग्लूकोज़ {value} {unit} पर बढ़ा हुआ है। यह दर्शाता है कि आपका शरीर ब्लड शुगर को नियंत्रित करने में परेशानी आ रही है। मीठे खाना कम करें और डॉक्टर से मिलें।"
    },
    ("HIGH", "SGPT"): {
        "english": "Your liver enzyme SGPT is high at {value} {unit}. This indicates liver inflammation. Avoid fatty foods and alcohol.",
        "hindi": "आपका यकृत एंजाइम SGPT {value} {unit} पर बढ़ा हुआ है। यह यकृत में सूजन दर्शाता है। तैलीय खाना और शराब न लें।"
    },
    ("LOW", "HEMOGLOBIN"): {
        "english": "Your hemoglobin is low at {value} {unit}. You may be anemic. Increase iron-rich foods like spinach and beans.",
        "hindi": "आपका हीमोग्लोबिन {value} {unit} पर कम है। आपको एनीमिया हो सकता है। पालक और दाल जैसे आयरन युक्त खाना बढ़ाएं।"
    },
    ("HIGH", "CHOLESTEROL"): {
        "english": "Your cholesterol is elevated at {value} {unit}. Reduce saturated fats, increase fiber, and exercise regularly.",
        "hindi": "आपका कोलेस्ट्रॉल {value} {unit} पर बढ़ा हुआ है। संतृप्त वसा कम करें और नियमित व्यायाम करें।"
    },
    ("HIGH", "CREATININE"): {
        "english": "Your creatinine is elevated at {value} {unit}. This may indicate kidney issues. Reduce protein intake and stay hydrated.",
        "hindi": "आपका क्रिएटिनिन {value} {unit} पर बढ़ा है। यह गुर्दे की समस्या दर्शा सकता है। प्रोटीन इनटेक कम करें।"
    },
}


def _ai_simplify(parameter: str, value: str, unit: str, status: str, rag_context: str) -> dict | None:
    """Call OpenRouter to generate a layman explanation of a lab finding."""
    if not OPENROUTER_API_KEY or OPENROUTER_API_KEY.startswith("placeholder"):
        return None

    prompt = f"""You are a friendly Indian doctor explaining lab results to a patient who has no medical knowledge.

Lab Finding:
- Parameter: {parameter}
- Value: {value} {unit}
- Status: {status}
{f'- Context: {rag_context}' if rag_context else ''}

Provide two explanations (2-3 sentences each):
1. In simple English
2. In simple Hindi (Devanagari script, everyday words)

Format your response EXACTLY as:
ENGLISH: <explanation>
HINDI: <explanation>"""

    try:
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://reportraahat.app",
            "X-Title": "ReportRaahat",
        }

        with httpx.Client(timeout=15.0) as client:
            resp = client.post(
                f"{BASE_URL}/chat/completions",
                headers=headers,
                json={
                    "model": SIMPLIFY_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 300,
                    "temperature": 0.5,
                },
            )

        if resp.status_code == 200:
            text = resp.json()["choices"][0]["message"]["content"].strip()

            # Parse ENGLISH: and HINDI: from response
            english = ""
            hindi = ""
            for line in text.split("\n"):
                line = line.strip()
                if line.upper().startswith("ENGLISH:"):
                    english = line[8:].strip()
                elif line.upper().startswith("HINDI:"):
                    hindi = line[6:].strip()

            if english and hindi:
                return {"english": english, "hindi": hindi}

            # If parsing failed, use the full response as English
            return {"english": text[:200], "hindi": f"{parameter} {status.lower()} है। डॉक्टर से मिलें।"}

        print(f"⚠️ AI simplify failed ({resp.status_code})")
        return None

    except Exception as e:
        print(f"⚠️ AI simplify error: {e}")
        return None


def simplify_finding(
    parameter: str,
    value: str,
    unit: str,
    status: str,
    rag_context: str = ""
) -> dict:
    """
    Generate a layman-friendly explanation for a lab finding.
    Tries AI first, then falls back to templates.
    """

    # Try AI-powered simplification
    ai_result = _ai_simplify(parameter, value, unit, status, rag_context)
    if ai_result:
        return ai_result

    # Fallback to template matching
    param_upper = parameter.upper()
    status_upper = status.upper()

    for (status_key, param_key) in FALLBACK_EXPLANATIONS.keys():
        if param_key in param_upper and status_key == status_upper:
            template = FALLBACK_EXPLANATIONS[(status_key, param_key)]
            return {
                "english": template["english"].format(value=value, unit=unit),
                "hindi": template["hindi"].format(value=value, unit=unit),
            }

    # Generic default
    default_exp = {
        "HIGH": f"Your {parameter} is high at {value} {unit}. This needs attention. Consult your doctor.",
        "LOW": f"Your {parameter} is low at {value} {unit}. This may indicate a deficiency. Consult your doctor.",
        "CRITICAL": f"Your {parameter} is critically abnormal at {value} {unit}. Please see a doctor urgently.",
        "NORMAL": f"Your {parameter} is normal at {value} {unit}. Keep maintaining healthy habits."
    }

    return {
        "english": default_exp.get(status_upper, f"Your {parameter} is {status.lower()}."),
        "hindi": f"{parameter} {status.lower()} है। डॉक्टर से मिलें।"
    }

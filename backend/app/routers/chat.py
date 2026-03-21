# ============================================================
# chat.py — POST /chat — MEMBER 1 OWNS THIS
# Flow:
#   1. Receive user message + full GUC context from frontend
#   2. Build Dr. Raahat system prompt injecting GUC fields
#   3. Send to OpenRouter (free models: mistral-7b / llama-3-8b)
#   4. Stream response back token by token via SSE
#   5. Fallback: if OpenRouter fails, use Gemini text API
# ============================================================

import os
import json
import logging
import httpx
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.schemas import ChatRequest, ChatResponse

router = APIRouter()
logger = logging.getLogger(__name__)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
GEMINI_CHAT_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-1.5-flash:generateContent"
)

# Free models on OpenRouter — try in order until one works
OPENROUTER_MODELS = [
    "mistralai/mistral-7b-instruct:free",
    "meta-llama/llama-3-8b-instruct:free",
    "google/gemma-7b-it:free",
]

CHAT_TIMEOUT = 15  # seconds


# ── System prompt builder ─────────────────────────────────────

def build_system_prompt(guc: dict) -> str:
    profile = guc.get("profile", {})
    report = guc.get("latestReport") or {}
    patient_name = profile.get("name", "Patient")
    age = profile.get("age", "unknown")
    gender = profile.get("gender", "UNKNOWN").lower()
    location = profile.get("location", "India")
    language = profile.get("language", "EN")
    severity = report.get("severity_level", "")
    organs = ", ".join(report.get("affected_organs", [])) or "none identified"
    summary_en = report.get("overall_summary_english", "")
    meds = ", ".join(guc.get("medicationsActive", [])) or "none reported"
    allergies = ", ".join(guc.get("allergyFlags", [])) or "none reported"
    mental_stress = guc.get("mentalWellness", {}).get("stressLevel", 5)

    # Build abnormal findings summary
    findings = report.get("findings", [])
    abnormal = [
        f"{f['parameter']} ({f['value']}) — {f['status']}"
        for f in findings
        if f.get("status") in ("HIGH", "LOW", "CRITICAL")
    ]
    abnormal_str = "\n  - ".join(abnormal) if abnormal else "No abnormal findings in current report."

    lang_instruction = (
        "ALWAYS respond in Hindi (Devanagari script). Mix English medical terms in parentheses where helpful."
        if language == "HI"
        else "Respond in English. Use simple Hindi words occasionally (e.g. 'Aap ka' for your, 'bilkul' for certainly) to feel warm and Indian."
    )

    stress_note = (
        "\n\nIMPORTANT: This patient has reported high stress levels. Be extra warm, reassuring, and empathetic. "
        "Begin your response by acknowledging how they might be feeling before answering their question."
        if mental_stress <= 3
        else ""
    )

    return f"""You are Dr. Raahat, a warm, friendly, and knowledgeable Indian medical doctor working with the ReportRaahat health app.

PATIENT CONTEXT:
- Name: {patient_name}
- Age: {age} years old, {gender}
- Location: {location}
- Language preference: {language}

LATEST MEDICAL REPORT:
- Summary: {summary_en or 'No report uploaded yet.'}
- Severity: {severity or 'Not assessed'}
- Organs affected: {organs}
- Abnormal findings:
  - {abnormal_str}
- Active medications: {meds}
- Known allergies / dietary restrictions: {allergies}

YOUR PERSONALITY & RULES:
1. You are like a caring family doctor AND a trusted friend. Never cold or clinical.
2. Use the patient's first name ("{patient_name}") in your responses occasionally.
3. {lang_instruction}
4. NEVER make up diagnoses or prescribe specific medication dosages.
5. If asked about something serious or outside your confidence, say: "I'd strongly recommend discussing this with your doctor in person."
6. When referencing their report data, be specific — mention their actual values, not generic advice.
7. Keep responses to 3-5 sentences unless the patient asks for more detail.
8. End with one encouraging sentence or a practical next step.
9. Never use scary medical jargon without immediately explaining it in simple terms.
10. If the patient has no report uploaded yet, gently encourage them to upload one.{stress_note}"""


# ── OpenRouter call (with streaming) ─────────────────────────

async def call_openrouter_stream(system_prompt: str, messages: list[dict], model: str):
    """Generator that yields SSE chunks from OpenRouter."""
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://reportraahat.vercel.app",
        "X-Title": "ReportRaahat",
    }
    payload = {
        "model": model,
        "messages": [{"role": "system", "content": system_prompt}] + messages,
        "stream": True,
        "max_tokens": 400,
        "temperature": 0.7,
    }

    async with httpx.AsyncClient(timeout=CHAT_TIMEOUT) as client:
        async with client.stream("POST", OPENROUTER_URL, json=payload, headers=headers) as response:
            if response.status_code != 200:
                raise ValueError(f"OpenRouter {response.status_code}")
            async for line in response.aiter_lines():
                if line.startswith("data: "):
                    chunk = line[6:]
                    if chunk.strip() == "[DONE]":
                        break
                    try:
                        data = json.loads(chunk)
                        token = data["choices"][0]["delta"].get("content", "")
                        if token:
                            yield token
                    except (json.JSONDecodeError, KeyError):
                        continue


async def call_openrouter_sync(system_prompt: str, messages: list[dict]) -> str:
    """Non-streaming fallback — tries each free model in order."""
    for model in OPENROUTER_MODELS:
        try:
            headers = {
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://reportraahat.vercel.app",
                "X-Title": "ReportRaahat",
            }
            payload = {
                "model": model,
                "messages": [{"role": "system", "content": system_prompt}] + messages,
                "stream": False,
                "max_tokens": 400,
                "temperature": 0.7,
            }
            async with httpx.AsyncClient(timeout=CHAT_TIMEOUT) as client:
                response = await client.post(OPENROUTER_URL, json=payload, headers=headers)
            if response.status_code == 200:
                return response.json()["choices"][0]["message"]["content"]
        except Exception as e:
            logger.warning("OpenRouter model %s failed: %s", model, e)
            continue
    raise ValueError("All OpenRouter models failed")


# ── Gemini text fallback ──────────────────────────────────────

async def call_gemini_chat(system_prompt: str, messages: list[dict]) -> str:
    """Fallback to Gemini 1.5 Flash text when OpenRouter is unavailable."""
    if not GEMINI_API_KEY:
        raise ValueError("No Gemini key")

    # Convert messages to Gemini format
    contents = []
    for msg in messages:
        role = "user" if msg["role"] == "user" else "model"
        contents.append({"role": role, "parts": [{"text": msg["content"]}]})

    # Prepend system prompt to first user message
    if contents and contents[0]["role"] == "user":
        contents[0]["parts"][0]["text"] = system_prompt + "\n\nPatient: " + contents[0]["parts"][0]["text"]

    payload = {
        "contents": contents,
        "generationConfig": {"temperature": 0.7, "maxOutputTokens": 400},
    }
    async with httpx.AsyncClient(timeout=CHAT_TIMEOUT) as client:
        response = await client.post(
            f"{GEMINI_CHAT_URL}?key={GEMINI_API_KEY}",
            json=payload,
        )
    if response.status_code != 200:
        raise ValueError(f"Gemini chat {response.status_code}")
    return response.json()["candidates"][0]["content"]["parts"][0]["text"]


# ── Hardcoded fallback replies ────────────────────────────────

FALLBACK_REPLIES = [
    "Namaste! Main Dr. Raahat hoon. Aapka sawaal sun raha hoon — thodi connectivity issue hai abhi, lekin main yahan hoon. Kya aap apna sawaal dobara puch sakte hain? 💙",
    "I'm here with you. There seems to be a small connectivity issue right now. Please try asking again in a moment — I want to help you understand your health better.",
    "Aap bilkul sahi jagah aaye hain. Ek minute mein main aapko jawab dunga. Please try again! 🙏",
]
_fallback_idx = 0


# ── Streaming endpoint ────────────────────────────────────────

@router.post("/stream")
async def chat_stream(request: ChatRequest):
    """
    POST /chat/stream  — Server-Sent Events streaming
    Frontend reads: EventSource or fetch with ReadableStream
    Each chunk: plain text token
    """
    system_prompt = build_system_prompt(request.guc_context)
    messages = [{"role": m.role, "content": m.content} for m in request.history]
    messages.append({"role": "user", "content": request.message})

    async def generate():
        if not OPENROUTER_API_KEY:
            # No key — fall through to Gemini or hardcoded
            pass
        else:
            try:
                async for token in call_openrouter_stream(
                    system_prompt, messages, OPENROUTER_MODELS[0]
                ):
                    yield f"data: {json.dumps({'token': token})}\n\n"
                yield "data: [DONE]\n\n"
                return
            except Exception as e:
                logger.warning("OpenRouter streaming failed: %s — trying Gemini", e)

        # Gemini fallback (non-streaming, but we chunk it word by word for the illusion)
        try:
            reply = await call_gemini_chat(system_prompt, messages)
            for word in reply.split(" "):
                yield f"data: {json.dumps({'token': word + ' '})}\n\n"
            yield "data: [DONE]\n\n"
            return
        except Exception as e:
            logger.error("Gemini chat fallback also failed: %s", e)

        # Last resort — hardcoded reply
        global _fallback_idx
        reply = FALLBACK_REPLIES[_fallback_idx % len(FALLBACK_REPLIES)]
        _fallback_idx += 1
        for word in reply.split(" "):
            yield f"data: {json.dumps({'token': word + ' '})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


# ── Non-streaming endpoint (simpler, used by Member 3's DoctorChat.tsx) ──

@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    POST /chat — Non-streaming, returns full reply at once.
    Member 3's DoctorChat.tsx calls this and simulates streaming
    by revealing words one by one with a JS interval.
    """
    system_prompt = build_system_prompt(request.guc_context)
    messages = [{"role": m.role, "content": m.content} for m in request.history]
    messages.append({"role": "user", "content": request.message})

    # Determine avatar state hint based on message content
    msg_lower = request.message.lower()
    if any(w in msg_lower for w in ["serious", "dangerous", "urgent", "worried", "scared", "khatarnak"]):
        avatar_state = "CONCERNED"
    elif any(w in msg_lower for w in ["thank", "shukriya", "great", "better", "good"]):
        avatar_state = "HAPPY"
    else:
        avatar_state = "SPEAKING"

    # Try OpenRouter first
    if OPENROUTER_API_KEY:
        try:
            reply = await call_openrouter_sync(system_prompt, messages)
            return ChatResponse(reply=reply, avatar_state=avatar_state)
        except Exception as e:
            logger.warning("OpenRouter failed: %s — trying Gemini", e)

    # Gemini fallback
    if GEMINI_API_KEY:
        try:
            reply = await call_gemini_chat(system_prompt, messages)
            return ChatResponse(reply=reply, avatar_state=avatar_state)
        except Exception as e:
            logger.error("Gemini chat failed: %s", e)

    # Hardcoded last resort
    global _fallback_idx
    reply = FALLBACK_REPLIES[_fallback_idx % len(FALLBACK_REPLIES)]
    _fallback_idx += 1
    return ChatResponse(reply=reply, avatar_state="CONCERNED")
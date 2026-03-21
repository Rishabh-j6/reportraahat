# ============================================================
# main.py — FastAPI entry point — MEMBER 4 OWNS THIS
# Run: uvicorn app.main:app --reload --port 8000
# ============================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import nutrition, exercise, analyze, chat

app = FastAPI(
    title="ReportRaahat API",
    description="AI-powered medical report simplifier — HackerzStreet 4.0",
    version="2.0.0",
)

# ── CORS — allow Vercel frontend + local dev ──────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://*.vercel.app",
        # Add your Railway/Render URL here when deploying
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────
app.include_router(nutrition.router, prefix="/nutrition", tags=["Nutrition"])
app.include_router(exercise.router, prefix="/exercise", tags=["Exercise"])
app.include_router(analyze.router, prefix="/analyze", tags=["ML - Member 1"])
app.include_router(chat.router, prefix="/chat", tags=["ML - Member 1"])


@app.get("/")
def root():
    return {"status": "ok", "message": "ReportRaahat API is running 🏥"}


@app.get("/health")
def health():
    return {"status": "healthy"}
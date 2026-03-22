# main.py — MERGED VERSION
# Source backend routers (analyze, chat, doctor_upload) + scaffold routers (nutrition, exercise)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.routers import analyze, chat, doctor_upload, nutrition, exercise


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load ML models on startup (if available)
    print("Starting ReportRaahat backend...")
    try:
        from app.ml.model import load_model
        load_model()
        print("Model loading complete.")
    except Exception as e:
        print(f"Startup info — models not fully loaded: {e}")
        print("Mock endpoints will work for testing.")
    yield
    print("Shutting down ReportRaahat backend.")


app = FastAPI(
    title="ReportRaahat API",
    description="AI-powered medical report simplifier for rural India",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://reportraahat.vercel.app",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ML teammate's routes
app.include_router(analyze.router, tags=["Report Analysis"])
app.include_router(chat.router, tags=["Doctor Chat"])
app.include_router(doctor_upload.router, tags=["Human Dialogue"])

# Member 4's routes
app.include_router(nutrition.router, prefix="/nutrition", tags=["Nutrition"])
app.include_router(exercise.router, prefix="/exercise", tags=["Exercise"])


@app.get("/")
async def root():
    return {
        "name": "ReportRaahat API",
        "version": "2.0.0",
        "status": "running",
        "endpoints": {
            "analyze": "POST /analyze",
            "upload_and_chat": "POST /upload_and_chat (RECOMMENDED - starts dialogue immediately)",
            "chat": "POST /chat",
            "nutrition": "POST /nutrition",
            "exercise": "POST /exercise",
            "docs": "/docs"
        }
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}

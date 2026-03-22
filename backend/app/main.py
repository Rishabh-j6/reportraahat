# main.py — FINAL MERGED VERSION
# Member 4's CORS + routers + Member 1's lifespan ML preload

from dotenv import load_dotenv
load_dotenv()  # load .env before anything reads os.environ

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.routers import analyze, chat, nutrition, exercise  # ← all 4 routers


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting ReportRaahat backend...")
    try:
        # Note: These functions are not yet implemented
        # from app.ml.model import load_model
        # from app.ml.rag import load_nidaan_index, load_doctor_index
        # load_model()
        # load_nidaan_index()
        # load_doctor_index()
        # print("All ML models loaded.")
        print("Running in development mode (models not loaded)")
    except Exception as e:
        print(f"ML models not loaded (mock mode): {e}")
    yield
    print("Shutting down.")


app = FastAPI(
    title="ReportRaahat API",
    description="AI-powered medical report simplifier for rural India",
    version="2.0.0",
    lifespan=lifespan,
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

# Member 1's routes
app.include_router(analyze.router,   prefix="/analyze",   tags=["Report Analysis"])
app.include_router(chat.router,      prefix="/chat",      tags=["Doctor Chat"])

# Member 4's routes
app.include_router(nutrition.router, prefix="/nutrition", tags=["Nutrition"])
app.include_router(exercise.router,  prefix="/exercise",  tags=["Exercise"])


@app.get("/")
async def root():
    return {
        "name": "ReportRaahat API",
        "version": "2.0.0",
        "status": "running",
        "endpoints": {
            "analyze":   "POST /analyze",
            "mock":      "GET  /analyze/mock?case=0",
            "chat":      "POST /chat",
            "nutrition": "GET  /nutrition?dietary_flags=INCREASE_IRON",
            "exercise":  "GET  /exercise?exercise_flags=NORMAL_ACTIVITY",
            "docs":      "/docs",
        }
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}

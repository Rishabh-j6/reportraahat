# OWNER: Member 4
# FastAPI entry point — register all routers, configure CORS
# Member 4 wires up all 4 routers here once they're ready

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="ReportRaahat API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000"), "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# TODO Member 4: uncomment as each router is ready
# from app.routers import analyze, chat, nutrition, exercise
# app.include_router(analyze.router,   prefix="/api", tags=["Analysis"])
# app.include_router(chat.router,      prefix="/api", tags=["Chat"])
# app.include_router(nutrition.router, prefix="/api", tags=["Nutrition"])
# app.include_router(exercise.router,  prefix="/api", tags=["Exercise"])

@app.get("/health")
def health():
    return {"status": "ok", "version": "1.0.0"}

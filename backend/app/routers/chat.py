from fastapi import APIRouter
from app.schemas import ChatRequest, ChatResponse

router = APIRouter()

@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Stub — Member 1 owns this file."""
    return ChatResponse(reply="Dr. Raahat stub — Member 1 implements this.")
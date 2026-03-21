from fastapi import APIRouter
from app.schemas import ChatRequest, ChatResponse

router = APIRouter()

@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Stub — Member 1 owns this file."""
<<<<<<< HEAD
    return ChatResponse(reply="Dr. Raahat stub — Member 1 implements this.")
=======
    return ChatResponse(reply="Dr. Raahat stub — Member 1 implements this.")
>>>>>>> a8b61de3a0f89fd0ee578c57565031fc00e0f26b

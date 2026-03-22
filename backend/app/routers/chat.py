from fastapi import APIRouter
from app.schemas import ChatRequest, ChatResponse
from app.ml.openrouter import chat

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def doctor_chat(body: ChatRequest):
    reply = chat(
        message=body.message,
        history=[m.model_dump() for m in body.history],
        guc=body.guc
    )
    return ChatResponse(reply=reply)

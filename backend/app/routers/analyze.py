from fastapi import APIRouter
from app.schemas import AnalyzeRequest, AnalyzeResponse
from app.mock_data import MOCK_REPORT_ANEMIA

router = APIRouter()

@router.post("/", response_model=AnalyzeResponse)
async def analyze_report(request: AnalyzeRequest):
    """Stub — Member 1 owns this file."""
    return AnalyzeResponse(**MOCK_REPORT_ANEMIA)

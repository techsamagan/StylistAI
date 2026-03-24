from fastapi import APIRouter
from app.schemas import AISuggestionResponse

router = APIRouter(prefix="/suggestions", tags=["suggestions"])


@router.get("/today", response_model=AISuggestionResponse)
def get_today_suggestion():
    """AI suggestion for today – e.g. based on calendar/weather. Matches Digital Closet copy."""
    return AISuggestionResponse(
        item_name="Navy Blazer",
        reason="Based on your calendar, try the Navy Blazer today.",
    )

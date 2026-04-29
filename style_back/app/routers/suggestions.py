import datetime
import urllib.parse
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas import AISuggestionResponse
from app.database import get_db
from app.models import ClosetItemModel, CalendarEventModel
from app.auth_utils import get_current_user_id
from app.routers.weather import _fetch_json

router = APIRouter(prefix="/suggestions", tags=["suggestions"])

_FORMALITY_RANK = {"formal": 3, "business_casual": 2, "casual": 1}
_RAIN_CODES = {51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99}


def _get_weather(city: str):
    try:
        geo = _fetch_json(
            f"https://geocoding-api.open-meteo.com/v1/search"
            f"?name={urllib.parse.quote(city)}&count=1&language=en&format=json"
        )
        results = geo.get("results") or []
        if not results:
            return None
        r = results[0]
        wx = _fetch_json(
            f"https://api.open-meteo.com/v1/forecast"
            f"?latitude={r['latitude']}&longitude={r['longitude']}"
            f"&current=temperature_2m,weathercode&temperature_unit=celsius&timezone=auto"
        )
        current = wx.get("current", {})
        return {"temp_c": current.get("temperature_2m"), "code": current.get("weathercode", 0)}
    except Exception:
        return None


@router.get("/today", response_model=AISuggestionResponse)
def get_today_suggestion(
    city: Optional[str] = None,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    # Closet items
    q = db.query(ClosetItemModel)
    if user_id:
        q = q.filter(ClosetItemModel.user_id == user_id)
    items = q.all()

    if not items:
        return AISuggestionResponse(item_name="Empty closet", reason="Add items to your closet to get a daily suggestion.")

    # Today's calendar events
    today = datetime.date.today().isoformat()
    eq = db.query(CalendarEventModel).filter(CalendarEventModel.start.like(f"{today}%"))
    if user_id:
        eq = eq.filter(CalendarEventModel.user_id == user_id)
    today_events = eq.all()

    top_event = None
    if today_events:
        top_event = max(today_events, key=lambda e: _FORMALITY_RANK.get(e.formality or "", 0))

    event_formality = top_event.formality if top_event else None
    event_title = top_event.title if top_event else None

    # Weather
    weather = _get_weather(city) if city else None
    temp_c = weather["temp_c"] if weather else None
    is_rainy = weather and weather["code"] in _RAIN_CODES
    is_cold = temp_c is not None and temp_c < 15
    is_hot = temp_c is not None and temp_c > 25

    # Target formality
    if event_formality == "formal":
        target = {"FORMAL", "MODERATE"}
    elif event_formality == "business_casual":
        target = {"MODERATE", "FORMAL", "UNIVERSAL"}
    else:
        target = {"CASUAL", "MODERATE", "UNIVERSAL"}

    candidates = [i for i in items if i.formality and i.formality.upper() in target] or items

    if is_cold or is_rainy:
        preferred = [i for i in candidates if i.category == "Outerwear"]
    elif is_hot:
        preferred = [i for i in candidates if i.category == "Top"]
    else:
        preferred = [i for i in candidates if i.category in ("Top", "Outerwear")]

    pick = (preferred or candidates)[0]

    reasons = []
    if event_title:
        reasons.append(f"you have '{event_title}' on your calendar")
    if temp_c is not None:
        if is_rainy:
            reasons.append(f"rain is expected (currently {temp_c:.0f}°C)")
        elif is_cold:
            reasons.append(f"it's cold at {temp_c:.0f}°C — layering recommended")
        elif is_hot:
            reasons.append(f"it's warm at {temp_c:.0f}°C — keeping it light")
        else:
            reasons.append(f"the weather is mild at {temp_c:.0f}°C")

    if reasons:
        reason = f"Because {' and '.join(reasons)}, the {pick.name} is your best pick today."
    else:
        reason = f"The {pick.name} is a solid all-round choice for today."

    return AISuggestionResponse(item_name=pick.name, reason=reason)

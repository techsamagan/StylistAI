import json
import uuid
import random
import datetime
import urllib.parse
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.schemas import OutfitRequest, OutfitSuggestion, OutfitItem, SaveOutfitRequest, SavedOutfit
from app.database import get_db
from app.models import ClosetItemModel, CalendarEventModel, SavedOutfitModel, UserModel
from app.auth_utils import get_current_user_id, get_current_user
from app.routers.weather import _fetch_json

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
        return {
            "temp_c": current.get("temperature_2m"),
            "code": current.get("weathercode", 0),
            "city": r.get("name", city),
        }
    except Exception:
        return None

router = APIRouter(prefix="/outfits", tags=["outfits"])


def _pick(items, category, formalities):
    pool = [i for i in items if i.category == category and i.formality in formalities]
    return pool or [i for i in items if i.category == category]


@router.post("/generate", response_model=OutfitSuggestion)
def generate_outfit(
    req: OutfitRequest,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    q = db.query(ClosetItemModel)
    if user_id:
        q = q.filter(ClosetItemModel.user_id == user_id)
    items = q.all()

    vibe = req.vibe if req.vibe is not None else 50
    if vibe < 30:
        target = {"CASUAL", "MODERATE"}
    elif vibe > 70:
        target = {"FORMAL", "MODERATE"}
    else:
        target = {"CASUAL", "MODERATE", "FORMAL", "UNIVERSAL"}

    tops = _pick(items, "Top", target)
    bottoms = _pick(items, "Bottom", target)
    shoes = _pick(items, "Shoes", target)
    outer = _pick(items, "Outerwear", target)

    picked = []
    for item in [tops[0] if tops else None, bottoms[0] if bottoms else None, shoes[0] if shoes else None]:
        if item:
            picked.append(OutfitItem(id=item.id, name=item.name, category=item.category, image_url=item.image_url))
    if outer and (req.weather_temp_c is None or req.weather_temp_c < 18):
        picked.append(OutfitItem(id=outer[0].id, name=outer[0].name, category=outer[0].category, image_url=outer[0].image_url))

    vibe_note = " Styled for comfort." if vibe < 30 else " Styled for impact." if vibe > 70 else ""
    temp_note = f" {req.weather_temp_c:.0f}°C — layering recommended." if req.weather_temp_c is not None and req.weather_temp_c < 18 else ""
    explanation = f"This works for {req.context}: neutral base keeps it appropriate.{vibe_note}{temp_note}"
    return OutfitSuggestion(items=picked, explanation=explanation)


@router.get("/today", response_model=OutfitSuggestion)
def get_today_outfit(
    refresh: bool = False,
    db: Session = Depends(get_db),
    user: Optional[UserModel] = Depends(get_current_user),
):
    """
    Auto-generates a full outfit for today using the user's:
    - City weather (fetched live)
    - Calendar events (determines formality)
    - Closet items (picks matching pieces)
    Pass ?refresh=true to get a different combination.
    """
    user_id = user.id if user else None
    city = user.city if user else None

    # Closet
    q = db.query(ClosetItemModel)
    if user_id:
        q = q.filter(ClosetItemModel.user_id == user_id)
    items = q.all()
    if not items:
        return OutfitSuggestion(items=[], explanation="Add items to your closet to get outfit suggestions.")

    # Weather
    weather = _get_weather(city) if city else None
    temp_c = weather["temp_c"] if weather else None
    is_rainy = weather and weather["code"] in _RAIN_CODES
    is_cold = temp_c is not None and temp_c < 15
    is_hot = temp_c is not None and temp_c > 25
    weather_city = weather["city"] if weather else city

    # Today's calendar events
    today = datetime.date.today().isoformat()
    eq = db.query(CalendarEventModel).filter(CalendarEventModel.start.like(f"{today}%"))
    if user_id:
        eq = eq.filter(CalendarEventModel.user_id == user_id)
    events = eq.all()
    top_event = max(events, key=lambda e: _FORMALITY_RANK.get(e.formality or "", 0)) if events else None
    event_formality = top_event.formality if top_event else None
    event_title = top_event.title if top_event else None

    # Formality target
    if event_formality == "formal":
        target = {"FORMAL", "MODERATE"}
    elif event_formality == "business_casual":
        target = {"MODERATE", "FORMAL", "UNIVERSAL"}
    else:
        target = {"CASUAL", "MODERATE", "UNIVERSAL"}

    # Seed: same outfit all day, different on refresh
    seed = int(datetime.datetime.now().timestamp()) if refresh else int(datetime.date.today().strftime("%Y%m%d"))
    rng = random.Random(seed)

    def pick(cat):
        pool = [i for i in items if i.category == cat and i.formality in target]
        if not pool:
            pool = [i for i in items if i.category == cat]
        if not pool:
            return None
        rng.shuffle(pool)
        return pool[0]

    top = pick("Top")
    bottom = pick("Bottom")
    shoes = pick("Shoes")
    outer = pick("Outerwear") if (is_cold or is_rainy) else None

    picked = [OutfitItem(id=i.id, name=i.name, category=i.category, image_url=i.image_url)
              for i in [top, bottom, shoes, outer] if i]

    # Build explanation
    parts = []
    if event_title:
        parts.append(f"your {event_title} today")
    if temp_c is not None:
        if is_rainy:
            parts.append(f"rain expected in {weather_city} ({temp_c:.0f}°C)")
        elif is_cold:
            parts.append(f"cold weather in {weather_city} ({temp_c:.0f}°C)")
        elif is_hot:
            parts.append(f"warm weather in {weather_city} ({temp_c:.0f}°C)")
        else:
            parts.append(f"mild {temp_c:.0f}°C in {weather_city}")

    explanation = f"Chosen for {' and '.join(parts)}." if parts else "A well-balanced outfit for today."
    return OutfitSuggestion(items=picked, explanation=explanation)


@router.post("/save", response_model=SavedOutfit, status_code=201)
def save_outfit(
    req: SaveOutfitRequest,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    db_outfit = SavedOutfitModel(
        id=str(uuid.uuid4()),
        user_id=user_id,
        context=req.context,
        items_json=json.dumps([i.model_dump() for i in req.items]),
        explanation=req.explanation,
    )
    db.add(db_outfit)
    db.commit()
    db.refresh(db_outfit)
    return SavedOutfit(
        id=db_outfit.id,
        context=db_outfit.context,
        items=[OutfitItem(**i) for i in json.loads(db_outfit.items_json)],
        explanation=db_outfit.explanation,
        saved_at=db_outfit.saved_at.isoformat(),
    )


@router.get("/saved", response_model=list[SavedOutfit])
def list_saved(
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    q = db.query(SavedOutfitModel)
    if user_id:
        q = q.filter(SavedOutfitModel.user_id == user_id)
    return [
        SavedOutfit(
            id=o.id,
            context=o.context,
            items=[OutfitItem(**i) for i in json.loads(o.items_json)],
            explanation=o.explanation,
            saved_at=o.saved_at.isoformat(),
        )
        for o in q.all()
    ]


@router.delete("/saved/{outfit_id}", status_code=204)
def delete_saved(
    outfit_id: str,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    outfit = db.query(SavedOutfitModel).filter(SavedOutfitModel.id == outfit_id).first()
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found")
    db.delete(outfit)
    db.commit()
    return None

import os
from openai import OpenAI
from app.schemas import TryOnRequest, TryOnResponse

@router.post("/try-on", response_model=TryOnResponse)
def virtual_try_on(req: TryOnRequest):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured")
    
    client = OpenAI(api_key=api_key)
    items_desc = ", ".join(req.outfit_items)
    prompt = f"A photorealistic, high-fashion full-body portrait of a stylish person wearing the following outfit: {items_desc}. The context is: {req.context}. The person is standing confidently, studio lighting, highly detailed, premium look, clear facial features, modern aesthetic."
    
    try:
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",
            quality="standard",
            n=1,
        )
        image_url = response.data[0].url
        return TryOnResponse(image_url=image_url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image generation failed: {str(e)}")

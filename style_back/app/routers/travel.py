import random
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas import PackRequest, PackResponse, DailyOutfit, OutfitItem
from app.database import get_db
from app.models import ClosetItemModel
from app.auth_utils import get_current_user_id
from app.routers.weather import _get_weather

router = APIRouter(prefix="/travel", tags=["travel"])

@router.post("/pack", response_model=PackResponse)
def generate_packing_list(
    req: PackRequest,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    # Fetch user closet
    q = db.query(ClosetItemModel)
    if user_id:
        q = q.filter(ClosetItemModel.user_id == user_id)
    items = q.all()

    if not items:
        raise HTTPException(status_code=400, detail="Your closet is empty. Add items to generate a packing list.")

    # Get weather for destination
    weather = _get_weather(req.destination)
    temp_c = weather["temp_c"] if weather else None
    
    if weather and temp_c is not None:
        weather_summary = f"Expected weather in {weather['city']}: {temp_c:.1f}°C, {weather.get('code', 'clear')}."
        is_cold = temp_c < 18
    else:
        weather_summary = f"Could not fetch weather for {req.destination}. Packing a balanced set."
        is_cold = False

    # Seed rng
    rng = random.Random(req.destination + str(req.days))

    def pick(cat):
        pool = [i for i in items if i.category == cat]
        if not pool:
            return None
        rng.shuffle(pool)
        return pool[0]

    daily_outfits = []
    packed_ids = set()
    packing_list = []

    for day in range(1, req.days + 1):
        top = pick("Top")
        bottom = pick("Bottom")
        shoes = pick("Shoes")
        outer = pick("Outerwear") if is_cold else None

        day_items = []
        for i in [top, bottom, shoes, outer]:
            if i:
                oi = OutfitItem(id=i.id, name=i.name, category=i.category, image_url=i.image_url)
                day_items.append(oi)
                if i.id not in packed_ids:
                    packed_ids.add(i.id)
                    packing_list.append(oi)
        
        daily_outfits.append(DailyOutfit(day=day, items=day_items))

    return PackResponse(
        destination=req.destination,
        weather_summary=weather_summary,
        packing_list=packing_list,
        daily_outfits=daily_outfits
    )

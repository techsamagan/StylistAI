from fastapi import APIRouter
from app.schemas import OutfitRequest, OutfitSuggestion, OutfitItem
from app.routers.closet import _store
from app.routers.closet import _seed

router = APIRouter(prefix="/outfits", tags=["outfits"])


@router.post("/generate", response_model=OutfitSuggestion)
def generate_outfit(req: OutfitRequest):
    _seed()
    items = list(_store.values())
    # Simple rule-based pick for MVP: one top, one bottom, one shoes; optional outerwear if cold
    tops = [i for i in items if i.category.value == "Top"]
    bottoms = [i for i in items if i.category.value == "Bottom"]
    shoes = [i for i in items if i.category.value == "Shoes"]
    outer = [i for i in items if i.category.value == "Outerwear"]

    picked = []
    if tops:
        picked.append(OutfitItem(id=tops[0].id, name=tops[0].name, category=tops[0].category.value, image_url=tops[0].image_url))
    if bottoms:
        picked.append(OutfitItem(id=bottoms[0].id, name=bottoms[0].name, category=bottoms[0].category.value, image_url=bottoms[0].image_url))
    if shoes:
        picked.append(OutfitItem(id=shoes[0].id, name=shoes[0].name, category=shoes[0].category.value, image_url=shoes[0].image_url))
    if outer and (req.weather_temp_c is None or req.weather_temp_c < 18):
        picked.append(OutfitItem(id=outer[0].id, name=outer[0].name, category=outer[0].category.value, image_url=outer[0].image_url))

    temp_note = f" Temperature {req.weather_temp_c}°C — layering recommended." if req.weather_temp_c is not None and req.weather_temp_c < 18 else ""
    explanation = f"This works for {req.context}: neutral base keeps it appropriate.{temp_note}"
    return OutfitSuggestion(items=picked, explanation=explanation)

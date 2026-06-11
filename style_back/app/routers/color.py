"""
Selfie-based color analysis + tailored recommendations (ASANUR).

Endpoints
  POST /color/analyze          upload a selfie, run analysis, persist + return result
  GET  /color/result           latest saved analysis for the current user
  GET  /color/recommendations  latest season + matched closet items + matched shopping feed
  GET  /color/seasons          list of supported color seasons (reference)
"""

import json
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.auth_utils import get_current_user_id
from app.color_analysis import analyze_bytes, palette_hexes, SEASON_NAMES, palette_for_season
from app.color_map import season_matches, to_rgb, nearest, normalize_name, UNIVERSAL_NEUTRALS
from app.database import get_db
from app.models import ClosetItemModel, ColorAnalysisModel, ShoppingItemModel
from app.schemas import (
    ClosetItem,
    ColorAnalysisResult,
    ColorAxes,
    PaletteColor,
    ShoppingItem,
)
from app.storage import get_storage, make_key

router = APIRouter(prefix="/color", tags=["color"])

MAX_BYTES = 8 * 1024 * 1024  # 8 MB ceiling on selfie uploads
ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}


def _to_result(row: ColorAnalysisModel) -> ColorAnalysisResult:
    storage = get_storage()
    palette = [PaletteColor(**c) for c in json.loads(row.palette_json or "[]")]
    avoid = json.loads(row.avoid_json or "[]")
    return ColorAnalysisResult(
        id=row.id,
        season=row.season,
        undertone=row.undertone,
        description=row.description,
        skin_hex=row.skin_hex,
        selfie_url=storage.public_url(row.selfie_key) if row.selfie_key else None,
        palette=palette,
        avoid=avoid,
        created_at=row.created_at.isoformat() if row.created_at else None,
    )


def _latest_for_user(db: Session, user_id: Optional[int]) -> Optional[ColorAnalysisModel]:
    q = db.query(ColorAnalysisModel)
    if user_id:
        q = q.filter(ColorAnalysisModel.user_id == user_id)
    return q.order_by(ColorAnalysisModel.id.desc()).first()


@router.post("/analyze", response_model=ColorAnalysisResult, status_code=201)
async def analyze(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    if user_id is None:
        raise HTTPException(status_code=401, detail="Please sign in to analyze your colors.")
    content_type = (file.content_type or "").lower()
    if content_type and content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Please upload a JPEG, PNG, or WebP image.")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file.")
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="Image too large (max 8 MB).")

    # Run the color science first — no point storing an unreadable image.
    try:
        result = analyze_bytes(data)
    except ValueError:
        raise HTTPException(status_code=400, detail="Could not read that image. Try another selfie.")

    # Persist the selfie via the active storage backend (local FS or S3).
    storage = get_storage()
    key = make_key("selfies", file.filename, content_type or "image/jpeg")
    try:
        storage.save(data, key, content_type or "image/jpeg")
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Storage upload failed: {exc}")

    row = ColorAnalysisModel(
        user_id=user_id,
        selfie_key=key,
        season=result["season"],
        undertone=result["undertone"],
        skin_hex=result["skin_hex"],
        palette_json=json.dumps(result["palette"]),
        avoid_json=json.dumps(result["avoid"]),
        description=result["description"],
    )
    db.add(row)
    db.commit()
    db.refresh(row)

    out = _to_result(row)
    out.axes = ColorAxes(**result["axes"])  # surface the perceptual axes for this fresh analysis
    return out


@router.get("/result", response_model=ColorAnalysisResult)
def get_result(
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    if user_id is None:
        raise HTTPException(status_code=401, detail="Please sign in to view your color analysis.")
    row = _latest_for_user(db, user_id)
    if not row:
        raise HTTPException(status_code=404, detail="No color analysis yet. Upload a selfie to begin.")
    return _to_result(row)


@router.get("/recommendations")
def recommendations(
    limit: int = 24,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    """Latest season analysis joined with wardrobe + shopping matches by palette."""
    if user_id is None:
        raise HTTPException(status_code=401, detail="Please sign in to view recommendations.")
    row = _latest_for_user(db, user_id)
    if not row:
        raise HTTPException(status_code=404, detail="No color analysis yet. Upload a selfie to begin.")

    hexes = [c["hex"] for c in json.loads(row.palette_json or "[]")]

    closet_q = db.query(ClosetItemModel)
    if user_id:
        closet_q = closet_q.filter(ClosetItemModel.user_id == user_id)
    closet_matches = [i for i in closet_q.all() if season_matches(i.color, hexes)]

    shop_matches = [
        i for i in db.query(ShoppingItemModel).all() if season_matches(i.color, hexes)
    ][:limit]

    return {
        "analysis": _to_result(row).model_dump(),
        "closet_matches": [ClosetItem.model_validate(_closet_dict(i)).model_dump() for i in closet_matches],
        "shopping_matches": [ShoppingItem.model_validate(i).model_dump() for i in shop_matches],
    }


_LOOK_TITLES = [
    "The Signature Look",
    "Day to Evening",
    "The Statement Edit",
    "Off-Duty Polish",
]


def _build_looks(items: list[ShoppingItemModel], season: str, max_looks: int = 3) -> list[dict]:
    """Assemble complete outfits from palette-matching shop items, one per category."""
    by_cat: dict[str, list[ShoppingItemModel]] = {}
    for it in items:
        by_cat.setdefault(it.category, []).append(it)

    tops = by_cat.get("Top", [])
    bottoms = by_cat.get("Bottom", [])
    outer = by_cat.get("Outerwear", [])
    shoes = by_cat.get("Shoes", [])
    acc = by_cat.get("Accessory", [])

    # How many distinct looks we can reasonably build (need at least a top + bottom).
    n = min(max_looks, len(tops), len(bottoms)) if (tops and bottoms) else 0
    looks: list[dict] = []
    for i in range(n):
        chosen: list[ShoppingItemModel] = [tops[i % len(tops)], bottoms[i % len(bottoms)]]
        if outer:
            chosen.append(outer[i % len(outer)])
        if shoes:
            chosen.append(shoes[i % len(shoes)])
        if acc:
            chosen.append(acc[i % len(acc)])

        total = round(sum((it.price or 0) for it in chosen), 2)
        looks.append({
            "title": _LOOK_TITLES[i % len(_LOOK_TITLES)],
            "why": f"Built entirely from your {season} palette — these tones flatter your complexion together.",
            "total_price": total,
            "items": [ShoppingItem.model_validate(it).model_dump() for it in chosen],
        })
    return looks


@router.get("/shop")
def shop_recommendations(
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    """Selfie-driven shopping feed: color analysis + complete looks + single pieces."""
    if user_id is None:
        raise HTTPException(status_code=401, detail="Please sign in for recommendations.")
    row = _latest_for_user(db, user_id)
    if not row:
        raise HTTPException(status_code=404, detail="No color analysis yet. Upload a selfie to begin.")

    hexes = [c["hex"] for c in json.loads(row.palette_json or "[]")]
    matches = [i for i in db.query(ShoppingItemModel).all() if season_matches(i.color, hexes)]
    # Surface vivid on-palette pieces first; universal neutrals fill in after.
    matches.sort(key=lambda i: _signature_rank(i.color, hexes))

    return {
        "analysis": _to_result(row).model_dump(),
        "looks": _build_looks(matches, row.season),
        "singles": [ShoppingItem.model_validate(i).model_dump() for i in matches],
    }


# Warm/quiet neutrals that flatter broadly but shouldn't headline a "your colors" feed.
_QUIET_NEUTRALS = UNIVERSAL_NEUTRALS | {
    "beige", "tan", "taupe", "khaki", "camel", "sand", "nude", "brown", "chocolate",
}


def _signature_rank(color: Optional[str], hexes: list[str]) -> tuple:
    """Sort key: vivid palette hits (group 0) before quiet neutrals (group 1)."""
    name = normalize_name(color or "")
    is_neutral = name in _QUIET_NEUTRALS
    rgb = to_rgb(color)
    if rgb is None:
        return (2, 999.0)
    cands = [c for c in (to_rgb(h) for h in hexes) if c is not None]
    if not cands:
        return (1 if is_neutral else 0, 999.0)
    _, dist = nearest(rgb, cands)
    return (1 if is_neutral else 0, dist)


def _closet_dict(item: ClosetItemModel) -> dict:
    return {
        "id": item.id,
        "user_id": str(item.user_id) if item.user_id else None,
        "name": item.name,
        "category": item.category,
        "image_url": item.image_url,
        "color": item.color,
        "formality": item.formality,
        "formality_value": item.formality_value,
    }


@router.get("/seasons")
def list_seasons():
    return {"seasons": SEASON_NAMES}

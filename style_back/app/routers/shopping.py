import io
import os
import base64
import uuid
from pathlib import Path
from typing import Optional
from urllib.request import urlopen, Request
from urllib.error import URLError

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from openai import OpenAI

from app.schemas import ShoppingItem, ShoppingTryOnRequest, ShoppingTryOnResponse
from app.database import get_db
from app.models import ShoppingItemModel, UserModel
from app.auth_utils import get_current_user

router = APIRouter(prefix="/shopping", tags=["shopping"])

UPLOADS_DIR = Path(__file__).parent.parent.parent / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)


def _fetch_bytes(url: str) -> Optional[bytes]:
    try:
        req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urlopen(req, timeout=15) as resp:
            return resp.read()
    except Exception:
        return None


def _describe_clothing(client: OpenAI, image_url: str, item_name: str, fallback: str) -> str:
    """Use GPT-4o to get a hyper-detailed clothing description from the product image."""
    try:
        resp = client.chat.completions.create(
            model="gpt-4o",
            messages=[{
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": {"url": image_url, "detail": "high"}},
                    {
                        "type": "text",
                        "text": (
                            f"This is a product photo of '{item_name}'. "
                            "Describe the clothing item in extreme detail for a virtual try-on prompt. "
                            "Include: exact color(s) and any gradient/pattern, fabric texture and material look "
                            "(e.g. smooth cotton, ribbed knit, shiny satin), silhouette and cut (fitted/oversized/relaxed), "
                            "length and hem, collar/neckline style, sleeve style and length, any visible details like "
                            "buttons, zippers, pockets, logos, stitching, embroidery. "
                            "Write one dense descriptive paragraph. Be highly specific — this will be used to recreate "
                            "the item accurately on a person."
                        ),
                    },
                ],
            }],
            max_tokens=300,
        )
        return resp.choices[0].message.content.strip()
    except Exception:
        return fallback


def _describe_person(client: OpenAI, image_url: str, body_note: str) -> str:
    """Use GPT-4o to describe the person's appearance from their avatar."""
    try:
        resp = client.chat.completions.create(
            model="gpt-4o",
            messages=[{
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": {"url": image_url, "detail": "high"}},
                    {
                        "type": "text",
                        "text": (
                            "Describe this person's physical appearance for a virtual try-on. "
                            "Include: exact hair color and style, skin tone, eye color if visible, "
                            "face shape, approximate age range, and overall body build. "
                            "One concise sentence. Be very specific about hair and skin."
                        ),
                    },
                ],
            }],
            max_tokens=120,
        )
        desc = resp.choices[0].message.content.strip()
        return f"{desc}{body_note}"
    except Exception:
        return f"a stylish person{body_note}"


@router.get("/items", response_model=list[ShoppingItem])
def list_shopping_items(
    category: Optional[str] = None,
    tags: Optional[str] = None,
    season: Optional[str] = None,
    db: Session = Depends(get_db),
):
    q = db.query(ShoppingItemModel)
    if category:
        q = q.filter(ShoppingItemModel.category == category)
    if tags:
        q = q.filter(ShoppingItemModel.tags.ilike(f"%{tags}%"))
    items = q.all()
    # Filter the feed to colors that flatter the user's color season.
    if season and season.strip():
        from app.color_analysis import palette_for_season
        from app.color_map import season_matches
        palette = palette_for_season(season)
        if palette:
            items = [i for i in items if season_matches(i.color, palette)]
    return items


@router.post("/try-on", response_model=ShoppingTryOnResponse)
def shopping_try_on(
    body: ShoppingTryOnRequest,
    db: Session = Depends(get_db),
    user: Optional[UserModel] = Depends(get_current_user),
):
    item = db.query(ShoppingItemModel).filter(ShoppingItemModel.id == body.item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Shopping item not found")

    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

    # Resolve avatar to absolute URL
    avatar_abs_url = None
    if user and user.avatar_url:
        avatar_abs_url = user.avatar_url
        if avatar_abs_url.startswith("/uploads/"):
            avatar_abs_url = f"http://localhost:8000{avatar_abs_url}"

    # Body measurements context
    body_note = ""
    if user and user.height_cm and user.weight_kg:
        bmi = user.weight_kg / (user.height_cm / 100) ** 2
        if bmi < 18.5:
            build = "slim lean build"
        elif bmi < 25:
            build = "average well-proportioned build"
        elif bmi < 30:
            build = "athletic broader build"
        else:
            build = "full-figured build"
        body_note = f", {user.height_cm:.0f}cm tall, {build}"

    item_fallback = item.description or f"{item.color or ''} {item.category}".strip()
    item_label = f"{item.name} by {item.brand}" if item.brand else item.name

    # ── STEP 1: Analyze the clothing item image with GPT-4o ─────────────────
    clothing_desc = item_fallback
    if item.image_url:
        clothing_desc = _describe_clothing(client, item.image_url, item.name, item_fallback)

    # ── STEP 2: gpt-image-1 images.edit with the real user photo ────────────
    if avatar_abs_url:
        avatar_bytes = _fetch_bytes(avatar_abs_url)
        if avatar_bytes:
            # Analyze person appearance with GPT-4o
            person_appearance = _describe_person(client, avatar_abs_url, body_note)

            prompt = (
                f"VIRTUAL TRY-ON — STRICT RULES:\n"
                f"1. PRESERVE EXACTLY: this person's face, facial features, hair ({person_appearance}), "
                f"skin tone, eye color, body proportions, and pose. Do NOT alter their appearance in any way.\n"
                f"2. REPLACE ONLY their clothing with this exact item: {item_label}.\n"
                f"3. CLOTHING DETAILS to reproduce accurately: {clothing_desc}\n"
                f"4. The final image must look like a real photograph of THIS exact person wearing this outfit.\n"
                f"5. Full body visible from head to toe. Natural studio lighting. White or neutral background. "
                f"Ultra-photorealistic. Fashion editorial quality. No added accessories unless they are part of the item."
            )

            person_file = io.BytesIO(avatar_bytes)
            person_file.name = "person.png"

            try:
                edit_resp = client.images.edit(
                    model="gpt-image-1",
                    image=person_file,
                    prompt=prompt,
                    size="1024x1536",
                    quality="high",
                )
                b64 = edit_resp.data[0].b64_json
                img_bytes = base64.b64decode(b64)
                filename = f"tryon_{uuid.uuid4().hex}.png"
                (UPLOADS_DIR / filename).write_bytes(img_bytes)
                return ShoppingTryOnResponse(
                    image_url=f"/uploads/{filename}",
                    item_name=item.name,
                    prompt_used=prompt,
                )
            except Exception as e:
                # Surface the real error so we can debug
                raise HTTPException(
                    status_code=500,
                    detail=f"gpt-image-1 failed: {str(e)}"
                )

    # ── FALLBACK: No avatar — DALL-E 3 HD with detailed text prompt ──────────
    if avatar_abs_url:
        person_desc = _describe_person(client, avatar_abs_url, body_note)
    else:
        person_desc = f"a stylish person{body_note}"

    dalle_prompt = (
        f"Photorealistic full-body fashion editorial photo. "
        f"A {person_desc} wearing {item_label}. "
        f"Clothing description: {clothing_desc}. "
        f"Full body visible head to toe, neutral studio background, professional fashion lighting, "
        f"ultra high detail, magazine quality photograph."
    )

    try:
        dalle_resp = client.images.generate(
            model="dall-e-3",
            prompt=dalle_prompt[:4000],
            size="1024x1792",
            quality="hd",
            n=1,
        )
        image_url = dalle_resp.data[0].url
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image generation failed: {str(e)}")

    return ShoppingTryOnResponse(
        image_url=image_url,
        item_name=item.name,
        prompt_used=dalle_prompt,
    )

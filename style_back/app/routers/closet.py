from fastapi import APIRouter, HTTPException
from app.schemas import ClosetItem, ClosetItemCreate, Category

router = APIRouter(prefix="/closet", tags=["closet"])

# In-memory store for MVP (replace with DB later)
_store: dict[int, ClosetItem] = {}
_next_id = 1

# Dashboard seed – exact items from Digital Closet reference (colors, formality)
def _seed():
    global _next_id, _store
    if _store:
        return
    samples = [
        {"name": "Oxford Shirt", "category": Category.TOP, "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuBju7RUqBntgGKE6lhRK8ESVEMLuiwTpexhuVsbc77L2_99GHboW8OTriB-zKTMd0ay7CASdu9H9s9RMvDphJaP1kzYayEkW2demUTbhyJciGi9AjXb1nfd5o2qCajKcKaegIPhpO5hkxZGiOdXXtqLSrvhd13iGUDZZLd1GlK68Ae4Rs1HgrZ4pqoIbsLzZMDtaQ67_BXmW5yB5cmmQmApS5uFdeLcuH_aj8JClC7nmAFzdfCKx0YeukE43clHRwGo6HFcPgkX-K4", "color": "white", "formality": "MODERATE", "formality_value": 65},
        {"name": "Indigo Denim", "category": Category.BOTTOM, "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuBk5SSfRM4npjoIrwaM8sAtmKCf0NgPW-qJc0TxCOh3fEdbvkzJc4e1fcqiY2NSLiOAPSxUovPJgXEqCjk-rGB3_sGdTnWzu78Ho5jfSizH8Y_3U8zdtpcDDsFW3jv9Q-GcqhcvMkXySkqFu5cFnnVckYHcvxaMJF63BeQDTpO-MAdckBa9BUDXBKclMNQPtSub3DPJWyDbmnVaHSWAMx-_cECD-CUbSEeQvc0UOR6WEJGAMqPmbf0n2qCq-_oQ4I_N7eZG1TcwL6I", "color": "navy", "formality": "CASUAL", "formality_value": 25},
        {"name": "Bomber Jacket", "category": Category.OUTERWEAR, "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuBtvDMttMsRITDLPv9ls7B7dv27FHt7Jv9XXNMXo2AXIXEWm0SmL43v11cCdRWPcMKfowRH48FFPQW5WtW-cpv0uruJWnU05x2FZh7oe2v0hSG0kfIM7DUydR_fc7RUxNJBMiEnObFKC8DtHBMtuZg2rerTQZ_u20et95jdNshFchLVxzEOiJGMOh5ivVEIxkoOCXXNYJqEOp6VOq4fu5uV7wS_8wN_Urzbh1S8ySa9mLVvsm3pd051tVGt2_rwkRXNAVk8hzMTMgA", "color": "green", "formality": "CASUAL", "formality_value": 35},
        {"name": "Derby Shoes", "category": Category.SHOES, "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuCBhlKb3VoKiJ2o_l5shR5q9Btjvml-pjUkHqwhB2eEAj4uCmIfXNibha1HQyf8rnnaNkupDie4tZ6yttomiwtg_EImt3UDeaHP2WFKCgh_maF516lr_xC6UYUQXGr8pp8plv8w-i-2-65rUHBvwjh3d9NhjK5pYsh5_g8Mh4RnaErlRb3IIOCvjvVV7yrhnhfCMBBNZ2DDrkR_HMTrs3HB_reV3xpC53GWjj8gADLzDGFWK0gVRmBKw55guYKTcpr0Nrow2vRJaP0", "color": "amber", "formality": "FORMAL", "formality_value": 90},
        {"name": "Cotton Tee", "category": Category.TOP, "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuBEK7q7CeebRahjvOdinEdQKwIr-q0GbByJkSPpkIXOem-si5oEwkzOGRJwKfpYHiwi9yBinq8pfpWNgI5GEAvBQYfQ-j5-woP8DtyENBFY6LRgsEOuyK-EAKwUEV-V2HbCqz4ATbIMQyKl0MkfhCHO39vMQbWgIr00wlX2H2ZJdW0KtdBvOxE0df23kBDb4bFtD1Bmk-6Q2liH03Gmmgy_tf1YTmFutnLaXWz1K_orCZB3xit17QUx55eH71i5h1JBFlyyGGt7sps", "color": "black", "formality": "CASUAL", "formality_value": 10},
        {"name": "Steel Watch", "category": Category.ACCESSORY, "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuDSG3r2IobZHdwgutDYrh2MJcvunBf5QHHrq3qCnyK9atPY685tzwTTm5-PQmPYhntctj-XBgDfTh4JPKbgxxVfPAVkUHmAYSqGw_KrfN30YF74VN8maooV73QMPjN1X6A_hhaZmGld99BFR6WNX95k59THnkhNOl743dCjK3Ho7Ufba1HW8_aItvKz_6YBaraJCI9j1bVfgkcYMwe7K1OZ2OLd01NaBUX4rqM8aUlTlEEjUZoMkv9L-Car8_jcjLu1Li5WGKXtFy4", "color": "slate", "formality": "UNIVERSAL", "formality_value": 50},
    ]
    for s in samples:
        item = ClosetItem(id=_next_id, user_id=None, **s)
        _store[_next_id] = item
        _next_id += 1


@router.get("", response_model=list[ClosetItem])
def list_items(
    category: Category | None = None,
    color: str | None = None,
    formality: str | None = None,
    search: str | None = None,
):
    """List closet items with optional filters: category, color, formality, search (name/category/color)."""
    _seed()
    items = list(_store.values())
    if category is not None:
        items = [i for i in items if i.category == category]
    if color is not None and color.strip():
        c = color.strip().lower()
        items = [i for i in items if i.color and i.color.lower() == c]
    if formality is not None and formality.strip():
        f = formality.strip().upper()
        items = [i for i in items if i.formality and i.formality.upper() == f]
    if search is not None and search.strip():
        q = search.strip().lower()
        items = [
            i for i in items
            if (i.name and q in i.name.lower())
            or (i.category and q in i.category.value.lower())
            or (i.color and q in i.color.lower())
        ]
    return items


@router.get("/{item_id}", response_model=ClosetItem)
def get_item(item_id: int):
    _seed()
    if item_id not in _store:
        raise HTTPException(status_code=404, detail="Item not found")
    return _store[item_id]


@router.post("", response_model=ClosetItem, status_code=201)
def create_item(item: ClosetItemCreate):
    global _next_id
    _seed()
    new = ClosetItem(id=_next_id, user_id=None, **item.model_dump())
    _store[_next_id] = new
    _next_id += 1
    return new


@router.delete("/{item_id}", status_code=204)
def delete_item(item_id: int):
    _seed()
    if item_id not in _store:
        raise HTTPException(status_code=404, detail="Item not found")
    del _store[item_id]
    return None

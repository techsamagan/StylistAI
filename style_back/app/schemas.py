from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class Category(str, Enum):
    TOP = "Top"
    BOTTOM = "Bottom"
    OUTERWEAR = "Outerwear"
    SHOES = "Shoes"
    ACCESSORY = "Accessory"


class ClosetItemCreate(BaseModel):
    name: str
    category: Category
    image_url: Optional[str] = None
    color: Optional[str] = None  # primary color: black, white, navy, primary, grey, blue, green, amber, slate
    formality: Optional[str] = None  # MODERATE, CASUAL, FORMAL, UNIVERSAL
    formality_value: Optional[int] = None  # 0-100 for progress bar


class ClosetItem(ClosetItemCreate):
    id: int
    user_id: Optional[str] = None

    class Config:
        from_attributes = True


class ClosetItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[Category] = None
    image_url: Optional[str] = None
    color: Optional[str] = None
    formality: Optional[str] = None
    formality_value: Optional[int] = None


class OutfitRequest(BaseModel):
    context: str = Field(..., description="e.g. Office, Date Night, Travel, Gym")
    weather_temp_c: Optional[float] = None
    formality_preference: Optional[str] = None
    vibe: Optional[int] = Field(None, ge=0, le=100, description="0=comfort, 100=style")


class SaveOutfitRequest(BaseModel):
    context: str
    items: list["OutfitItem"]
    explanation: str


class SavedOutfit(BaseModel):
    id: str
    context: str
    items: list["OutfitItem"]
    explanation: str
    saved_at: str


class OutfitItem(BaseModel):
    id: int
    name: str
    category: str
    image_url: Optional[str] = None


class OutfitSuggestion(BaseModel):
    items: list[OutfitItem]
    explanation: str


class UserCreate(BaseModel):
    email: str
    password: str
    name: Optional[str] = None
    city: Optional[str] = None  # e.g. "London" or "New York" for weather


class UserUpdate(BaseModel):
    name: Optional[str] = None
    city: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None

class UserProfile(BaseModel):
    email: str
    name: Optional[str] = None
    city: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    avatar_url: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    city: Optional[str] = None
    name: Optional[str] = None


class AISuggestionResponse(BaseModel):
    item_name: str
    reason: str


class CalendarEvent(BaseModel):
    id: str
    title: str
    start: str  # ISO datetime e.g. "2026-03-24T10:00"
    end: str    # ISO datetime e.g. "2026-03-24T11:00"
    formality: Optional[str] = None

class PackRequest(BaseModel):
    destination: str
    days: int

class DailyOutfit(BaseModel):
    day: int
    items: list[OutfitItem]

class PackResponse(BaseModel):
    destination: str
    weather_summary: str
    packing_list: list[OutfitItem]
    daily_outfits: list[DailyOutfit]

class TryOnRequest(BaseModel):
    outfit_items: list[str]
    context: str

class TryOnResponse(BaseModel):
    image_url: str


class ShoppingItem(BaseModel):
    id: int
    name: str
    brand: Optional[str] = None
    category: str
    price: Optional[float] = None
    color: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    tags: Optional[str] = None
    store_url: Optional[str] = None

    class Config:
        from_attributes = True


class ShoppingTryOnRequest(BaseModel):
    item_id: int
    context: Optional[str] = "Casual"


class ShoppingTryOnResponse(BaseModel):
    image_url: str
    item_name: str
    prompt_used: Optional[str] = None

from sqlalchemy import Column, Integer, String, Text, DateTime, Float
from sqlalchemy.sql import func
from app.database import Base


class UserModel(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=True)
    city = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    height_cm = Column(Float, nullable=True)
    weight_kg = Column(Float, nullable=True)
    avatar_url = Column(Text, nullable=True)


class ClosetItemModel(Base):
    __tablename__ = "closet_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False)
    image_url = Column(Text, nullable=True)
    color = Column(String(50), nullable=True)
    formality = Column(String(50), nullable=True)
    formality_value = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class CalendarEventModel(Base):
    __tablename__ = "calendar_events"

    id = Column(String(36), primary_key=True)
    user_id = Column(Integer, nullable=True, index=True)
    title = Column(String(255), nullable=False)
    start = Column(String(30), nullable=False)
    end_time = Column(String(30), nullable=False)
    formality = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class SavedOutfitModel(Base):
    __tablename__ = "saved_outfits"

    id = Column(String(36), primary_key=True)
    user_id = Column(Integer, nullable=True, index=True)
    context = Column(String(100), nullable=False)
    items_json = Column(Text, nullable=False)
    explanation = Column(Text, nullable=False)
    saved_at = Column(DateTime(timezone=True), server_default=func.now())


class ColorAnalysisModel(Base):
    __tablename__ = "color_analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, index=True)
    selfie_key = Column(Text, nullable=True)        # storage key (local path or S3 object key)
    season = Column(String(40), nullable=False)     # e.g. "Deep Winter"
    undertone = Column(String(20), nullable=True)   # warm | cool | neutral
    skin_hex = Column(String(7), nullable=True)     # detected dominant skin tone
    palette_json = Column(Text, nullable=False)     # [{"name","hex","role"}, ...]
    avoid_json = Column(Text, nullable=True)        # ["#hex", ...]
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ShoppingItemModel(Base):
    __tablename__ = "shopping_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    brand = Column(String(255), nullable=True)
    category = Column(String(50), nullable=False)  # Top/Bottom/Outerwear/Shoes/Accessory
    price = Column(Float, nullable=True)
    color = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    image_url = Column(Text, nullable=True)
    tags = Column(String(255), nullable=True)  # comma-separated e.g. "sport,casual"
    store_url = Column(Text, nullable=True)   # link to the product page on the store website

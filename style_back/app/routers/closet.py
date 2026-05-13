import uuid
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Request
from sqlalchemy.orm import Session
from app.schemas import ClosetItem, ClosetItemCreate, ClosetItemUpdate, Category
from app.database import get_db
from app.models import ClosetItemModel
from app.auth_utils import get_current_user_id

router = APIRouter(prefix="/closet", tags=["closet"])

UPLOADS_DIR = Path(__file__).parent.parent.parent / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)


def _to_schema(item: ClosetItemModel) -> ClosetItem:
    return ClosetItem(
        id=item.id,
        user_id=str(item.user_id) if item.user_id else None,
        name=item.name,
        category=Category(item.category),
        image_url=item.image_url,
        color=item.color,
        formality=item.formality,
        formality_value=item.formality_value,
    )


@router.get("", response_model=list[ClosetItem])
def list_items(
    category: Optional[Category] = None,
    color: Optional[str] = None,
    formality: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    q = db.query(ClosetItemModel)
    if user_id:
        q = q.filter(ClosetItemModel.user_id == user_id)
    if category:
        q = q.filter(ClosetItemModel.category == category.value)
    if color and color.strip():
        q = q.filter(ClosetItemModel.color == color.strip().lower())
    if formality and formality.strip():
        q = q.filter(ClosetItemModel.formality == formality.strip().upper())
    if search and search.strip():
        s = f"%{search.strip().lower()}%"
        q = q.filter(
            ClosetItemModel.name.ilike(s) |
            ClosetItemModel.category.ilike(s) |
            ClosetItemModel.color.ilike(s)
        )
    return [_to_schema(i) for i in q.all()]


@router.get("/{item_id}", response_model=ClosetItem)
def get_item(
    item_id: int,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    item = db.query(ClosetItemModel).filter(ClosetItemModel.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return _to_schema(item)


@router.post("", response_model=ClosetItem, status_code=201)
def create_item(
    item: ClosetItemCreate,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    db_item = ClosetItemModel(user_id=user_id, **item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return _to_schema(db_item)


@router.patch("/{item_id}", response_model=ClosetItem)
def update_item(
    item_id: int,
    update: ClosetItemUpdate,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    item = db.query(ClosetItemModel).filter(ClosetItemModel.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    for field, value in update.model_dump(exclude_unset=True).items():
        setattr(item, field, value if not hasattr(value, 'value') else value.value)
    db.commit()
    db.refresh(item)
    return _to_schema(item)


@router.post("/upload", response_model=ClosetItem, status_code=201)
async def upload_item(
    request: Request,
    name: str = Form(...),
    category: str = Form("Top"),
    color: Optional[str] = Form(None),
    formality: str = Form("MODERATE"),
    formality_value: int = Form(50),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    image_url = None
    if file and file.filename:
        raw_bytes = await file.read()
        filename = ""
        try:
            from rembg import remove
            output_bytes = remove(raw_bytes)
            ext = ".png"
            filename = f"{uuid.uuid4()}{ext}"
            dest = UPLOADS_DIR / filename
            dest.write_bytes(output_bytes)
        except Exception:
            ext = Path(file.filename).suffix.lower() or ".jpg"
            filename = f"{uuid.uuid4()}{ext}"
            dest = UPLOADS_DIR / filename
            dest.write_bytes(raw_bytes)
            
        base = str(request.base_url).rstrip("/")
        image_url = f"{base}/uploads/{filename}"

    db_item = ClosetItemModel(
        user_id=user_id,
        name=name,
        category=category,
        image_url=image_url,
        color=color or None,
        formality=formality,
        formality_value=formality_value,
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return _to_schema(db_item)


@router.delete("/{item_id}", status_code=204)
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    user_id: Optional[int] = Depends(get_current_user_id),
):
    item = db.query(ClosetItemModel).filter(ClosetItemModel.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
    return None

import uuid
import bcrypt
from pathlib import Path
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Request
from sqlalchemy.orm import Session
from app.schemas import UserCreate, UserLogin, Token
from app.database import get_db
from app.models import UserModel

UPLOADS_DIR = Path(__file__).parent.parent.parent / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

router = APIRouter(prefix="/auth", tags=["auth"])


def _hash(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def _verify(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


@router.post("/register", response_model=Token, status_code=201)
def register(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(UserModel).filter(UserModel.email == user.email).first():
        raise HTTPException(status_code=400, detail="User already exists")
    db_user = UserModel(
        email=user.email,
        password_hash=_hash(user.password),
        name=user.name,
        city=user.city,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return Token(access_token=f"token-{user.email}", city=user.city, name=user.name)


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.email == credentials.email).first()
    if not user or not _verify(credentials.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    return Token(access_token=f"token-{user.email}", city=user.city, name=user.name)

from app.schemas import UserProfile, UserUpdate
from app.auth_utils import get_current_user

@router.get("/me", response_model=UserProfile)
def get_me(user: UserModel = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return UserProfile(
        email=user.email,
        name=user.name,
        city=user.city,
        height_cm=user.height_cm,
        weight_kg=user.weight_kg,
        avatar_url=user.avatar_url,
    )

@router.put("/me", response_model=Token)
def update_me(update: UserUpdate, db: Session = Depends(get_db), user: UserModel = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    if update.email and update.email != user.email:
        if db.query(UserModel).filter(UserModel.email == update.email).first():
            raise HTTPException(status_code=400, detail="Email already taken")
        user.email = update.email

    if update.name is not None:
        user.name = update.name
    if update.city is not None:
        user.city = update.city
    if update.password:
        user.password_hash = _hash(update.password)
    if update.height_cm is not None:
        user.height_cm = update.height_cm
    if update.weight_kg is not None:
        user.weight_kg = update.weight_kg

    db.commit()
    db.refresh(user)
    return Token(access_token=f"token-{user.email}", city=user.city, name=user.name)


@router.post("/avatar", response_model=UserProfile)
async def upload_avatar(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: UserModel = Depends(get_current_user),
):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    raw_bytes = await file.read()
    ext = Path(file.filename).suffix.lower() if file.filename else ".jpg"
    if ext not in (".jpg", ".jpeg", ".png", ".webp"):
        ext = ".jpg"
    filename = f"avatar_{uuid.uuid4()}{ext}"
    dest = UPLOADS_DIR / filename
    dest.write_bytes(raw_bytes)
    user.avatar_url = f"/uploads/{filename}"
    db.commit()
    db.refresh(user)
    return UserProfile(
        email=user.email,
        name=user.name,
        city=user.city,
        height_cm=user.height_cm,
        weight_kg=user.weight_kg,
        avatar_url=user.avatar_url,
    )

import bcrypt
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.schemas import UserCreate, UserLogin, Token
from app.database import get_db
from app.models import UserModel

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

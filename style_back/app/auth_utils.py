from typing import Optional
from fastapi import Header, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import UserModel


def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> Optional[UserModel]:
    if not authorization or not authorization.startswith("Bearer token-"):
        return None
    email = authorization[len("Bearer token-"):]
    return db.query(UserModel).filter(UserModel.email == email).first()


def get_current_user_id(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> Optional[int]:
    if not authorization or not authorization.startswith("Bearer token-"):
        return None
    email = authorization[len("Bearer token-"):]
    user = db.query(UserModel).filter(UserModel.email == email).first()
    return user.id if user else None

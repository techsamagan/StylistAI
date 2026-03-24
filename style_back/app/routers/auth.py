from fastapi import APIRouter, HTTPException
from app.schemas import UserCreate, UserLogin, Token

router = APIRouter(prefix="/auth", tags=["auth"])

# In-memory user store for MVP (email -> {password, name, city})
_users: dict[str, dict] = {}


@router.post("/register", response_model=Token, status_code=201)
def register(user: UserCreate):
    if user.email in _users:
        raise HTTPException(status_code=400, detail="User already exists")
    _users[user.email] = {
        "email": user.email,
        "password": user.password,
        "name": user.name,
        "city": user.city,
    }
    token = f"token-{user.email}"
    return Token(access_token=token, city=user.city, name=user.name)


@router.post("/login", response_model=Token)
def login(credentials: UserLogin):
    stored = _users.get(credentials.email)
    if not stored or stored["password"] != credentials.password:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    token = f"token-{credentials.email}"
    return Token(access_token=token, city=stored.get("city"), name=stored.get("name"))


import os
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import engine
from app.models import Base
from app.routers import health, closet, outfits, auth, suggestions, calendar, weather, travel, shopping, color

Base.metadata.create_all(bind=engine)

UPLOADS_DIR = Path(__file__).parent / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

# ── Access control ───────────────────────────────────────────────────────────
# Optional IP allowlist (opt-in). When ALLOWED_IPS is set (e.g. for a private
# LAN deployment), only those client IPs may reach the API. When UNSET (the
# default — normal production), no IP restriction is applied. Set it in .env to
# lock the app to specific machines.
ALLOWED_IPS = {
    ip.strip() for ip in os.getenv("ALLOWED_IPS", "").split(",") if ip.strip()
}
# CORS: comma-separated frontend origins. Defaults to localhost for dev; set
# ALLOWED_ORIGINS to your deployed frontend URL(s) in production.
ALLOWED_ORIGINS = [o.strip() for o in os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000",
).split(",") if o.strip()]

app = FastAPI(
    title="ASANUR API",
    description="Backend for the ASANUR AI styling and wardrobe assistant",
    version="0.2.0",
)


@app.middleware("http")
async def restrict_client_ip(request: Request, call_next):
    # No restriction unless an allowlist is configured.
    if ALLOWED_IPS:
        client = request.client.host if request.client else None
        if client not in ALLOWED_IPS:
            return JSONResponse(status_code=403, content={"detail": "Forbidden"})
    return await call_next(request)


app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(closet.router)
app.include_router(outfits.router)
app.include_router(auth.router)
app.include_router(suggestions.router)
app.include_router(calendar.router)
app.include_router(weather.router)
app.include_router(travel.router)
app.include_router(shopping.router)
app.include_router(color.router)

app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")


@app.get("/")
def root():
    return {"message": "ASANUR API", "docs": "/docs"}

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import health, closet, outfits, auth, suggestions, calendar, weather

app = FastAPI(
    title="Style API",
    description="Backend for AI-powered wardrobe and outfit suggestions",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
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


@app.get("/")
def root():
    return {"message": "Style API", "docs": "/docs"}

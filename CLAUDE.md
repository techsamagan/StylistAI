# ASANUR

AI personal-styling and wardrobe assistant. Frontend: `style_front` (React + Tailwind). Backend: `style_back` (FastAPI + SQLAlchemy + Pillow; SQLite by default, Postgres-ready; local-FS storage with optional S3).

## Design System
Always read **DESIGN.md** before making any visual or UI decision.
All font choices (Fraunces + Instrument Sans), colors (warm-neutral tokens: ink/bone/porcelain/stone/clay/champagne), spacing, layout, and motion are defined there.
Do not deviate without explicit user approval. The brand name is **ASANUR** (always all-caps).
When reviewing UI code, flag anything that doesn't match DESIGN.md (e.g. the legacy green `#13ec80` / `#0d1a12` theme, Inter, colored CTAs, bubble border-radius).

## Running locally
- Backend: `cd style_back && source .venv/bin/activate && uvicorn main:app --port 8000` (needs `.env` with `DATABASE_URL`).
- Frontend: `cd style_front && npm start` (needs `.env` with `REACT_APP_API_URL=http://localhost:8000`).

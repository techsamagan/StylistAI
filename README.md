# Style — Wardrobe & Outfit Assistant

AI-powered personal wardrobe and styling assistant: build a digital closet and get context-aware outfit recommendations (weather, meeting type, formality).

## Stack

- **Frontend:** React + Tailwind CSS (`style_front`)
- **Backend:** FastAPI (`style_back`)

## Run locally

**Backend (FastAPI)** — from repo root:

```bash
cd style_back && python -m venv venv && source venv/bin/activate
pip install -r requirements.txt && uvicorn main:app --reload --port 8000
```

**Frontend (React)** — in another terminal:

```bash
cd style_front && npm install && npm start
```

Optional: copy `style_front/.env.example` to `style_front/.env` and set `REACT_APP_API_URL=http://localhost:8000` so the app uses the API for wardrobe and outfit generation. Without it, the app uses mock data.

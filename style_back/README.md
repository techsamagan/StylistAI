# Style API (FastAPI)

Backend for the wardrobe & outfit assistant. Run with React frontend on port 3000.

## Setup

```bash
cd style_back
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn main:app --reload --port 8000
```

- API: http://localhost:8000  
- Docs: http://localhost:8000/docs  

## Endpoints

- `GET /health` — health check
- `GET /closet` — list closet items (optional `?category=Top|Bottom|...`)
- `POST /closet` — add item
- `DELETE /closet/{id}` — remove item
- `POST /outfits/generate` — get outfit suggestion (body: `context`, `weather_temp_c`, `formality_preference`)

CORS is set for `http://localhost:3000` so the React app can call the API.

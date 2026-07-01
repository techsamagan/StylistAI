# Deploying FitCheck AI to Vercel

This repo is configured to deploy **both tiers on a single Vercel project**:

- the **React frontend** (`style_front`) is built to static files, and
- the **FastAPI backend** (`style_back`) runs as a **Python serverless function** at `/api/*`.

Everything is served from one origin, so there is **no CORS** to configure — the
frontend calls the API at `/api` on the same domain.

## Files that make this work

| File | Purpose |
|------|---------|
| `vercel.json` | Build command + output dir for the SPA, and rewrites: `/api/*` and `/uploads/*` → the Python function; all other paths → `index.html` (client-side routing). |
| `api/index.py` | Serverless entrypoint. Imports the FastAPI app from `style_back`, sets serverless-safe defaults, and strips the `/api` prefix so the backend's routes match. |
| `requirements.txt` (repo root) | Python deps Vercel installs for the API function. |
| `.vercelignore` | Keeps `node_modules`, `.venv`, the dev SQLite db, and the generated documents out of the upload. |

The frontend is built with `REACT_APP_API_URL=/api` (set inside the build command),
so the API client (`style_front/src/api`) calls the same-origin API automatically.

## One-time deploy

1. Push this repo to GitHub/GitLab/Bitbucket.
2. In Vercel: **Add New… → Project**, import the repo.
3. Leave the **Root Directory** as the repository root (do **not** set it to `style_front`).
   Vercel reads `vercel.json` from the root.
4. Add the environment variables below (Project → Settings → Environment Variables).
5. Deploy. Vercel builds the frontend, bundles the API, and gives you a live URL.

## Required environment variables (Production)

Serverless functions are **stateless** with an **ephemeral, read-only filesystem**
(only `/tmp` is writable and it is wiped between cold starts). So for anything
beyond a throwaway demo you must externalize state:

| Variable | Required? | Example / Notes |
|----------|-----------|-----------------|
| `DATABASE_URL` | **Yes (prod)** | `postgresql+psycopg2://USER:PASS@HOST:5432/DB` — use Neon, Supabase, or Vercel Postgres. Without it, the app falls back to an ephemeral `/tmp` SQLite that resets on every cold start. |
| `S3_BUCKET` | **Yes if users upload** | e.g. `fitcheck-uploads`. Uploaded selfies/avatars must go to S3; the local `uploads/` folder does not persist on Vercel. |
| `AWS_REGION` | with S3 | `us-east-1` |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | with S3 | Or use an IAM role/profile. |
| `OPENAI_API_KEY` | for try-on | Enables the shopping virtual try-on. |
| `ALLOWED_ORIGINS` | optional | Only if a client is served from a **different** domain. Same-origin needs nothing. |
| `ALLOWED_IPS` | optional | Leave unset in normal production (no IP restriction). |

## Local development (unchanged)

```bash
# Backend
cd style_back && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# .env with DATABASE_URL=sqlite:///./style.db
uvicorn main:app --reload --port 8000

# Frontend (another terminal)
cd style_front && npm install && npm start
# style_front/.env with REACT_APP_API_URL=http://localhost:8000
```

## Notes & limitations

- **Cold starts / bundle size.** The API function pulls in Pillow, SQLAlchemy,
  boto3 and the OpenAI SDK. This is comfortably within Vercel's serverless limits,
  but the first request after idle will be slightly slower (cold start).
- **No local file persistence.** Always use S3 in production; `/uploads` local
  storage is for development only.
- **Alternative topology.** If you prefer, deploy only the frontend to Vercel and
  host the FastAPI backend on a stateful platform (Render, Railway, Fly.io). In that
  case set `REACT_APP_API_URL` to the backend's URL and set `ALLOWED_ORIGINS` on the
  backend to the Vercel domain.

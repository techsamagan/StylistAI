"""
Vercel Python (serverless) entrypoint for the FitCheck AI backend.

Vercel routes every ``/api/*`` request to this file — see ``vercel.json``. The
real FastAPI application lives in ``../style_back/main.py``. Here we:

  1. put ``style_back`` on ``sys.path`` so ``from main import app`` resolves,
  2. supply serverless-safe env defaults, and
  3. expose a real FastAPI ``app`` that mounts the backend under ``/api``.

Vercel preserves the original request path through the rewrite, so a request to
``/api/closet`` reaches this app as ``/api/closet``; the mount forwards it to the
backend as ``/closet`` and its routers match unchanged. Exposing a genuine
FastAPI instance (rather than a bare ASGI callable) guarantees Vercel's Python
runtime detects it as an ASGI app.

── Serverless caveats (see DEPLOYMENT.md) ────────────────────────────────────
Vercel functions are stateless with an ephemeral, read-only filesystem (only
``/tmp`` is writable). For anything beyond a throwaway demo you MUST set:

  • ``DATABASE_URL``  → a managed Postgres (Neon, Supabase, Vercel Postgres).
                        The ``/tmp`` SQLite fallback below resets on cold start.
  • ``S3_BUCKET`` (+ AWS creds) → so uploaded selfies/avatars persist. The local
                        ``uploads/`` directory is read-only/ephemeral on Vercel.
"""

import os
import sys
from pathlib import Path

# ── 1. Make the FastAPI backend importable ───────────────────────────────────
BACKEND_DIR = Path(__file__).resolve().parent.parent / "style_back"
sys.path.insert(0, str(BACKEND_DIR))

# ── 2. Serverless-safe defaults (real values come from Vercel env vars) ───────
os.environ.setdefault("DATABASE_URL", "sqlite:////tmp/fitcheck.db")

from fastapi import FastAPI  # noqa: E402
from main import app as backend_app  # noqa: E402  (import after sys.path tweak)

# ── 3. Mount the backend under /api so its own routes match unchanged ─────────
app = FastAPI(title="FitCheck AI (Vercel)")
app.mount("/api", backend_app)

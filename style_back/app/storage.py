"""
Storage abstraction for user-uploaded images (selfies, avatars, etc.).

Two interchangeable backends:

  • LocalStorage  – writes to the existing ``uploads/`` directory and serves
                    files through FastAPI's StaticFiles mount at ``/uploads``.
                    This is the default and requires zero configuration, so the
                    app runs end-to-end on any machine.

  • S3Storage     – uploads objects to an AWS S3 bucket and hands back short-lived
                    presigned GET URLs for viewing. Activated automatically when
                    the ``S3_BUCKET`` environment variable is present. ``boto3`` is
                    imported lazily so the dependency is only required when S3 is
                    actually used.

The active backend is chosen once by :func:`get_storage`. Callers deal only with
opaque ``key`` strings (e.g. ``"selfies/ab12.jpg"``) plus a ``public_url(key)``
that resolves to something a browser can load — identical surface in both modes.
"""

from __future__ import annotations

import os
import uuid
from pathlib import Path
from typing import Optional

# uploads/ lives at the backend root (same directory main.py mounts as StaticFiles)
UPLOADS_DIR = Path(__file__).parent.parent / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

_EXT_BY_CONTENT_TYPE = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


def _safe_ext(filename: Optional[str], content_type: Optional[str]) -> str:
    """Pick a safe image extension from the filename, falling back to content-type."""
    if filename:
        ext = Path(filename).suffix.lower()
        if ext in (".jpg", ".jpeg", ".png", ".webp"):
            return ".jpg" if ext == ".jpeg" else ext
    return _EXT_BY_CONTENT_TYPE.get((content_type or "").lower(), ".jpg")


def make_key(prefix: str, filename: Optional[str] = None, content_type: Optional[str] = None) -> str:
    """Build a collision-free storage key like ``selfies/3f2a....jpg``."""
    ext = _safe_ext(filename, content_type)
    return f"{prefix.strip('/')}/{uuid.uuid4().hex}{ext}"


class StorageBackend:
    """Interface implemented by every storage backend."""

    name: str = "base"

    def save(self, data: bytes, key: str, content_type: str = "image/jpeg") -> str:
        raise NotImplementedError

    def public_url(self, key: str) -> str:
        """Return a browser-loadable URL for a stored key."""
        raise NotImplementedError

    def delete(self, key: str) -> None:
        raise NotImplementedError


class LocalStorage(StorageBackend):
    """Writes files under ``uploads/`` and serves them via the ``/uploads`` mount."""

    name = "local"

    def __init__(self, base_dir: Path = UPLOADS_DIR):
        self.base_dir = base_dir
        self.base_dir.mkdir(exist_ok=True)

    def _path(self, key: str) -> Path:
        # Keys may contain a prefix dir (e.g. "selfies/x.jpg"); create it.
        dest = self.base_dir / key
        dest.parent.mkdir(parents=True, exist_ok=True)
        return dest

    def save(self, data: bytes, key: str, content_type: str = "image/jpeg") -> str:
        self._path(key).write_bytes(data)
        return key

    def public_url(self, key: str) -> str:
        # Relative URL; the frontend prepends REACT_APP_API_URL.
        return f"/uploads/{key}"

    def delete(self, key: str) -> None:
        try:
            self._path(key).unlink(missing_ok=True)
        except OSError:
            pass


class S3Storage(StorageBackend):
    """Uploads to S3 and returns presigned GET URLs. boto3 imported lazily."""

    name = "s3"

    def __init__(self):
        self.bucket = os.environ["S3_BUCKET"]
        self.region = os.environ.get("AWS_REGION", "us-east-1")
        self.url_ttl = int(os.environ.get("S3_URL_TTL_SECONDS", "3600"))
        try:
            import boto3  # lazy: only needed in S3 mode
        except ImportError as exc:  # pragma: no cover - depends on env
            raise RuntimeError(
                "S3_BUCKET is set but boto3 is not installed. "
                "Run `pip install boto3` or unset S3_BUCKET to use local storage."
            ) from exc
        # Credentials resolve from the standard AWS chain (env, profile, IAM role).
        self._client = boto3.client("s3", region_name=self.region)

    def save(self, data: bytes, key: str, content_type: str = "image/jpeg") -> str:
        self._client.put_object(
            Bucket=self.bucket,
            Key=key,
            Body=data,
            ContentType=content_type,
        )
        return key

    def public_url(self, key: str) -> str:
        return self._client.generate_presigned_url(
            "get_object",
            Params={"Bucket": self.bucket, "Key": key},
            ExpiresIn=self.url_ttl,
        )

    def delete(self, key: str) -> None:
        try:
            self._client.delete_object(Bucket=self.bucket, Key=key)
        except Exception:
            pass


_storage: Optional[StorageBackend] = None


def get_storage() -> StorageBackend:
    """Return the process-wide storage backend (S3 when configured, else local)."""
    global _storage
    if _storage is None:
        _storage = S3Storage() if os.environ.get("S3_BUCKET") else LocalStorage()
    return _storage

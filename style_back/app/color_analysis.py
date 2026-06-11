"""
Selfie → color-season analysis. Pillow only, fully deterministic.

Pipeline:
  1. Decode + downscale the selfie.
  2. Extract the dominant *skin* tone (center-weighted skin-pixel mask, with a
     quantization fallback when too few skin pixels are found).
  3. Project that tone onto three perceptual axes — undertone (cool↔warm),
     depth (light↔deep), clarity (muted↔clear) — derived from CIELAB.
  4. Classify into the 12-season color system by nearest archetype.
  5. Return the season, a curated hex palette (with named roles) and an
     "avoid" list.

It is honest color science, not a face-recognition model: no opencv/dlib, so it
installs and runs anywhere Pillow does. The result shape is stable, so a true
vision model can later be slotted in behind :func:`analyze_selfie` unchanged.
"""

from __future__ import annotations

import io
from typing import Optional

from PIL import Image

from app.color_map import RGB, rgb_to_hex, rgb_to_lab

MAX_DIM = 220  # downscale target — plenty for color statistics, fast to process


# ── 12-season archetypes on (undertone, depth, clarity) ∈ [-1, 1]³ ──────────
#   undertone: -1 cool  → +1 warm
#   depth:     -1 light  → +1 deep
#   clarity:   -1 muted  → +1 clear
_SEASONS: dict[str, dict] = {
    "Light Spring": {
        "vector": (0.5, -0.8, 0.2),
        "undertone": "warm",
        "description": "Warm and delicate. Light, fresh tones with a golden glow look effortless on you.",
        "palette": [
            ("Peach", "#FFCBA4", "signature"), ("Coral", "#FF7F50", "pop"),
            ("Warm Mint", "#B8E0D2", "fresh"), ("Light Camel", "#D9B99B", "neutral"),
            ("Buttercup", "#F3E37C", "accent"), ("Aqua", "#7FD8D8", "cool-pop"),
            ("Ivory", "#FFFFF0", "base"), ("Salmon Pink", "#FA8072", "soft"),
        ],
        "avoid": ["#000000", "#36454F", "#800020"],
    },
    "Warm Spring": {
        "vector": (0.9, 0.0, 0.4),
        "undertone": "warm",
        "description": "Golden and radiant. Rich, warm hues with yellow undertones bring out your warmth.",
        "palette": [
            ("Golden Amber", "#D97706", "signature"), ("Warm Coral", "#FF6F50", "pop"),
            ("Olive", "#708238", "neutral"), ("Turquoise", "#40C4B0", "cool-pop"),
            ("Camel", "#C19A6B", "base"), ("Tomato", "#E14B36", "accent"),
            ("Cream", "#FFFDD0", "soft"), ("Moss", "#8A9A5B", "earthy"),
        ],
        "avoid": ["#000000", "#B0E0E6", "#915F6D"],
    },
    "Bright Spring": {
        "vector": (0.4, 0.0, 0.9),
        "undertone": "warm",
        "description": "Clear and vivid. High-energy, saturated colors with warmth suit your bright contrast.",
        "palette": [
            ("Bright Coral", "#FF5349", "signature"), ("Emerald", "#1FB47A", "pop"),
            ("Cobalt", "#1565C0", "cool-pop"), ("Hot Pink", "#EC4899", "accent"),
            ("Golden Yellow", "#EAB308", "warm-pop"), ("Ivory", "#FFFFF0", "base"),
            ("Bright Navy", "#1F2A6B", "neutral"), ("Apple Green", "#8DC63F", "fresh"),
        ],
        "avoid": ["#9CAF88", "#B38B6D", "#915F6D"],
    },
    "Light Summer": {
        "vector": (-0.5, -0.8, -0.2),
        "undertone": "cool",
        "description": "Cool and soft. Gentle, light tones with a blue base keep your look luminous.",
        "palette": [
            ("Powder Blue", "#B0E0E6", "signature"), ("Soft Rose", "#DE9C9C", "pop"),
            ("Lavender", "#C7B8E0", "accent"), ("Dove Grey", "#C9CBD0", "neutral"),
            ("Mint", "#B8E0D2", "fresh"), ("Periwinkle", "#9DB4D6", "cool"),
            ("Soft White", "#F7F5F1", "base"), ("Cool Pink", "#E6A8C6", "soft"),
        ],
        "avoid": ["#000000", "#D97706", "#B7410E"],
    },
    "Cool Summer": {
        "vector": (-0.9, 0.0, -0.2),
        "undertone": "cool",
        "description": "Pure cool tones. Blue-based colors with medium softness flatter you most.",
        "palette": [
            ("Soft Fuchsia", "#C154A0", "signature"), ("Cool Blue", "#3B6CA8", "pop"),
            ("Spruce", "#3F6F6F", "neutral"), ("Raspberry", "#B03A6E", "accent"),
            ("Slate Blue", "#6A7BA2", "base"), ("Cool Mint", "#9FD8C8", "fresh"),
            ("Soft White", "#F2F2F0", "soft"), ("Plum", "#8E4585", "deep"),
        ],
        "avoid": ["#D97706", "#C19A6B", "#EAB308"],
    },
    "Soft Summer": {
        "vector": (-0.4, 0.0, -0.8),
        "undertone": "cool",
        "description": "Muted and cool. Hazy, dusty tones with a soft blue base bring quiet elegance.",
        "palette": [
            ("Dusty Rose", "#C76B7E", "signature"), ("Sage", "#9CAF88", "neutral"),
            ("Mauve", "#915F6D", "pop"), ("Slate", "#708090", "base"),
            ("Soft Teal", "#5F9EA0", "cool"), ("Cocoa", "#6F5B52", "deep"),
            ("Pewter", "#A8A9AD", "soft"), ("Soft Plum", "#7E5C73", "accent"),
        ],
        "avoid": ["#FF5349", "#EAB308", "#000000"],
    },
    "Soft Autumn": {
        "vector": (0.4, 0.0, -0.8),
        "undertone": "warm",
        "description": "Muted and warm. Earthy, low-saturation tones with a golden base look harmonious.",
        "palette": [
            ("Terracotta", "#C66B3D", "signature"), ("Sage", "#9CAF88", "neutral"),
            ("Camel", "#C19A6B", "base"), ("Soft Olive", "#8A8B5C", "earthy"),
            ("Salmon", "#E08A6E", "pop"), ("Teal", "#4F8A8B", "cool"),
            ("Warm Beige", "#D9C2A6", "soft"), ("Brick", "#9C5B3F", "deep"),
        ],
        "avoid": ["#FF5349", "#000000", "#B0E0E6"],
    },
    "Warm Autumn": {
        "vector": (0.9, 0.3, -0.2),
        "undertone": "warm",
        "description": "Rich and golden. Deep, spicy earth tones with strong warmth are your power colors.",
        "palette": [
            ("Rust", "#B7410E", "signature"), ("Mustard", "#C9A227", "pop"),
            ("Olive", "#708238", "neutral"), ("Pumpkin", "#D2691E", "accent"),
            ("Chocolate", "#5C4033", "base"), ("Forest", "#0B6623", "cool"),
            ("Cream", "#F5EAD0", "soft"), ("Teal", "#13767F", "deep"),
        ],
        "avoid": ["#B0E0E6", "#EC4899", "#000000"],
    },
    "Deep Autumn": {
        "vector": (0.5, 0.9, 0.0),
        "undertone": "warm",
        "description": "Deep and warm. Dark, rich tones with golden depth give you striking presence.",
        "palette": [
            ("Burnt Orange", "#A84B2A", "signature"), ("Deep Teal", "#0E5A5A", "pop"),
            ("Espresso", "#3B2A20", "base"), ("Olive", "#5B6133", "neutral"),
            ("Brick Red", "#8B2E1E", "accent"), ("Mustard", "#B8860B", "warm-pop"),
            ("Cream", "#EFE3C8", "soft"), ("Forest", "#14452F", "deep"),
        ],
        "avoid": ["#B0E0E6", "#F7F5F1", "#E6A8C6"],
    },
    "Deep Winter": {
        "vector": (-0.5, 0.9, 0.2),
        "undertone": "cool",
        "description": "Deep and cool. Bold, dark tones with a cool base create dramatic contrast on you.",
        "palette": [
            ("True Black", "#000000", "base"), ("Sapphire", "#0F52BA", "signature"),
            ("Burgundy", "#800020", "pop"), ("Emerald", "#046307", "accent"),
            ("Icy White", "#F4F8FB", "soft"), ("Deep Plum", "#4E2A4E", "deep"),
            ("Pine", "#13433C", "neutral"), ("Crimson", "#9E1B32", "warm-pop"),
        ],
        "avoid": ["#D9B99B", "#C19A6B", "#9CAF88"],
    },
    "Cool Winter": {
        "vector": (-0.9, 0.3, 0.2),
        "undertone": "cool",
        "description": "Pure and cool. Icy, blue-based colors with crisp contrast suit you best.",
        "palette": [
            ("Royal Blue", "#1E3A8A", "signature"), ("Fuchsia", "#C2185B", "pop"),
            ("Icy Pink", "#F2C6D6", "soft"), ("Emerald", "#0B7A52", "accent"),
            ("Charcoal", "#36454F", "neutral"), ("Cool Ruby", "#9B1B40", "deep"),
            ("Pure White", "#FFFFFF", "base"), ("Cobalt", "#0047AB", "cool-pop"),
        ],
        "avoid": ["#D97706", "#C19A6B", "#EAB308"],
    },
    "Bright Winter": {
        "vector": (-0.4, 0.2, 0.9),
        "undertone": "cool",
        "description": "Clear and cool. Vivid, saturated colors with icy contrast make you shine.",
        "palette": [
            ("Hot Pink", "#E91E63", "signature"), ("Electric Blue", "#1565C0", "pop"),
            ("Emerald", "#00875A", "accent"), ("True Red", "#D81E2C", "warm-pop"),
            ("Pure White", "#FFFFFF", "base"), ("Black", "#000000", "neutral"),
            ("Icy Violet", "#B39DDB", "soft"), ("Lemon", "#F4E04D", "bright"),
        ],
        "avoid": ["#C19A6B", "#9CAF88", "#B38B6D"],
    },
}


# ── skin-tone extraction ────────────────────────────────────────────────────
def _is_skin(r: int, g: int, b: int) -> bool:
    """Kovac et al. RGB skin-detection rule (uniform daylight)."""
    mx, mn = max(r, g, b), min(r, g, b)
    return (
        r > 95 and g > 40 and b > 20
        and (mx - mn) > 15
        and abs(r - g) > 15
        and r > g and r > b
    )


def _dominant_skin_rgb(img: Image.Image) -> RGB:
    """Average skin-colored pixels in the central region; quantize as fallback."""
    img = img.convert("RGB")
    img.thumbnail((MAX_DIM, MAX_DIM))
    w, h = img.size

    # Center crop (faces tend to sit centrally in a selfie) reduces background bias.
    cx0, cy0 = int(w * 0.2), int(h * 0.15)
    cx1, cy1 = int(w * 0.8), int(h * 0.85)
    center = img.crop((cx0, cy0, max(cx1, cx0 + 1), max(cy1, cy0 + 1)))

    pixels = list(center.getdata())
    skin = [(r, g, b) for (r, g, b) in pixels if _is_skin(r, g, b)]

    if len(skin) >= 25:
        n = len(skin)
        return (
            sum(p[0] for p in skin) // n,
            sum(p[1] for p in skin) // n,
            sum(p[2] for p in skin) // n,
        )

    # Fallback: quantize to a small palette and pick the most skin-like / common.
    qimg = center.convert("RGB").quantize(colors=6, method=Image.MEDIANCUT)
    palette = qimg.getpalette() or []
    counts = qimg.getcolors() or []  # list of (count, palette_index)
    counts.sort(reverse=True)
    best_rgb: Optional[RGB] = None
    for _, idx in counts:
        rgb = (palette[idx * 3], palette[idx * 3 + 1], palette[idx * 3 + 2])
        if _is_skin(*rgb):
            best_rgb = rgb
            break
    if best_rgb is None and counts:
        idx = counts[0][1]
        best_rgb = (palette[idx * 3], palette[idx * 3 + 1], palette[idx * 3 + 2])
    return best_rgb or (200, 160, 130)


# ── season classification ───────────────────────────────────────────────────
def _axes_from_skin(rgb: RGB) -> tuple[float, float, float]:
    """Map a skin RGB to (undertone, depth, clarity), each clamped to [-1, 1]."""
    L, a, b = rgb_to_lab(rgb)
    chroma = (a * a + b * b) ** 0.5

    def clamp(x: float) -> float:
        return max(-1.0, min(1.0, x))

    # warmth: yellow (b) dominance over red (a). ~6 = neutral.
    undertone = clamp((b - a - 6.0) / 8.0)
    # depth: darker skin → deeper coloring. L≈93 light, L≈43 deep.
    depth = clamp((68.0 - L) / 25.0)
    # clarity: higher chroma → clearer; lower → muted. ~22 = neutral.
    clarity = clamp((chroma - 22.0) / 12.0)
    return undertone, depth, clarity


def _classify(axes: tuple[float, float, float]) -> str:
    u, d, c = axes
    best_name, best_dist = "Soft Autumn", float("inf")
    for name, spec in _SEASONS.items():
        tu, td, tc = spec["vector"]
        dist = (u - tu) ** 2 + (d - td) ** 2 + (c - tc) ** 2
        if dist < best_dist:
            best_dist, best_name = dist, name
    return best_name


def analyze_bytes(data: bytes) -> dict:
    """
    Analyze raw image bytes and return a season result dict:
        {
          "season", "undertone", "description",
          "skin_hex", "axes": {undertone, depth, clarity},
          "palette": [{"name","hex","role"}...],
          "avoid": ["#hex"...],
        }
    Raises ValueError on undecodable input.
    """
    try:
        img = Image.open(io.BytesIO(data))
        img.load()
    except Exception as exc:
        raise ValueError("Could not read image") from exc

    skin = _dominant_skin_rgb(img)
    u, d, c = _axes_from_skin(skin)
    season = _classify((u, d, c))
    spec = _SEASONS[season]

    return {
        "season": season,
        "undertone": spec["undertone"],
        "description": spec["description"],
        "skin_hex": rgb_to_hex(skin),
        "axes": {"undertone": round(u, 3), "depth": round(d, 3), "clarity": round(c, 3)},
        "palette": [{"name": n, "hex": h, "role": role} for (n, h, role) in spec["palette"]],
        "avoid": list(spec["avoid"]),
    }


def palette_hexes(result: dict) -> list[str]:
    """Convenience: pull just the hex list from an analysis result."""
    return [c["hex"] for c in result.get("palette", [])]


SEASON_NAMES: list[str] = list(_SEASONS.keys())


def palette_for_season(season: str) -> list[str]:
    """Hex palette for a season name (case-insensitive). Empty list if unknown."""
    spec = _SEASONS.get(season) or next(
        (v for k, v in _SEASONS.items() if k.lower() == (season or "").strip().lower()),
        None,
    )
    return [h for (_n, h, _r) in spec["palette"]] if spec else []

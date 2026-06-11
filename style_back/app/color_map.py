"""
Bridges the gap between free-text item colors and hex palettes.

Closet and shopping items store colors as loose strings ("navy", "off white",
"#0F52BA"). Color analysis produces hex palettes. To filter a wardrobe by a
season's palette we need a single source of truth that can:

  1. resolve any item color string to an RGB triple (``to_rgb``), and
  2. decide whether that color is "close enough" to any color in a palette
     (``matches_palette`` / ``season_matches``).

Distance is computed in CIELAB space (Delta-E 76), which tracks human color
perception far better than raw RGB. Pure-Python, no third-party deps.
"""

from __future__ import annotations

import math
import re
from typing import Iterable, Optional, Tuple

RGB = Tuple[int, int, int]

# ── Named fashion colors → hex ──────────────────────────────────────────────
# Common wardrobe vocabulary. Extend freely; unknown names fall back to None
# and are treated as non-matching (callers may choose to keep them).
NAMED_COLORS: dict[str, str] = {
    # neutrals
    "black": "#000000", "white": "#FFFFFF", "off white": "#F7F5F1",
    "offwhite": "#F7F5F1", "ivory": "#FFFFF0", "cream": "#FFFDD0",
    "grey": "#808080", "gray": "#808080", "charcoal": "#36454F",
    "silver": "#C0C0C0", "slate": "#708090", "stone": "#E7E2DA",
    "beige": "#F5F5DC", "tan": "#D2B48C", "taupe": "#B38B6D",
    "khaki": "#C3B091", "camel": "#C19A6B", "brown": "#8B4513",
    "chocolate": "#5C4033", "nude": "#E3BC9A", "sand": "#E0CDA9",
    # blues
    "navy": "#1F2A44", "blue": "#2563EB", "royal": "#1E3A8A",
    "royal blue": "#1E3A8A", "sky": "#87CEEB", "sky blue": "#87CEEB",
    "teal": "#008080", "turquoise": "#40E0D0", "cobalt": "#0047AB",
    "denim": "#3B5998", "sapphire": "#0F52BA", "powder blue": "#B0E0E6",
    # greens
    "green": "#16A34A", "olive": "#708238", "emerald": "#046307",
    "sage": "#9CAF88", "mint": "#98FF98", "forest": "#0B6623",
    "lime": "#A8E10C",
    # reds / pinks / purples
    "red": "#DC2626", "burgundy": "#800020", "maroon": "#800000",
    "wine": "#722F37", "pink": "#EC4899", "blush": "#DE9C9C",
    "rose": "#C76B7E", "coral": "#FF7F50", "salmon": "#FA8072",
    "fuchsia": "#C154C1", "magenta": "#C2185B", "purple": "#7E22CE",
    "lavender": "#B57EDC", "plum": "#8E4585", "mauve": "#915F6D",
    # yellows / oranges / golds
    "yellow": "#EAB308", "mustard": "#C9A227", "gold": "#C9A24B",
    "amber": "#D97706", "orange": "#EA580C", "rust": "#B7410E",
    "terracotta": "#C66B3D", "peach": "#FFCBA4", "apricot": "#FBCEB1",
}

# Colors that flatter virtually everyone — never filtered out by season match.
UNIVERSAL_NEUTRALS = {
    "black", "white", "off white", "offwhite", "ivory", "cream",
    "grey", "gray", "charcoal", "navy", "denim", "stone",
}

_HEX_RE = re.compile(r"^#?([0-9a-fA-F]{6})$")


# ── conversions ─────────────────────────────────────────────────────────────
def hex_to_rgb(value: str) -> Optional[RGB]:
    m = _HEX_RE.match(value.strip())
    if not m:
        return None
    h = m.group(1)
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


def rgb_to_hex(rgb: RGB) -> str:
    r, g, b = (max(0, min(255, int(round(c)))) for c in rgb)
    return f"#{r:02X}{g:02X}{b:02X}"


def normalize_name(name: str) -> str:
    return re.sub(r"\s+", " ", name.strip().lower())


def to_rgb(color: Optional[str]) -> Optional[RGB]:
    """Resolve a color string (hex or named) to an RGB triple, or None."""
    if not color:
        return None
    color = color.strip()
    rgb = hex_to_rgb(color)
    if rgb is not None:
        return rgb
    name = normalize_name(color)
    if name in NAMED_COLORS:
        return hex_to_rgb(NAMED_COLORS[name])
    # tolerate compound names: take the last recognised word ("dark olive" -> olive)
    words = name.split(" ")
    for w in reversed(words):
        if w in NAMED_COLORS:
            return hex_to_rgb(NAMED_COLORS[w])
    return None


# ── CIELAB Delta-E distance ─────────────────────────────────────────────────
def _srgb_to_linear(c: float) -> float:
    c /= 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def rgb_to_lab(rgb: RGB) -> Tuple[float, float, float]:
    r, g, b = (_srgb_to_linear(c) for c in rgb)
    # linear sRGB -> XYZ (D65)
    x = r * 0.4124 + g * 0.3576 + b * 0.1805
    y = r * 0.2126 + g * 0.7152 + b * 0.0722
    z = r * 0.0193 + g * 0.1192 + b * 0.9505
    # normalize by D65 white point
    x, y, z = x / 0.95047, y / 1.0, z / 1.08883

    def f(t: float) -> float:
        return t ** (1 / 3) if t > 0.008856 else (7.787 * t) + 16 / 116

    fx, fy, fz = f(x), f(y), f(z)
    return (116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz))


def delta_e(c1: RGB, c2: RGB) -> float:
    """Perceptual distance (CIE76). ~2.3 = just-noticeable difference."""
    l1, a1, b1 = rgb_to_lab(c1)
    l2, a2, b2 = rgb_to_lab(c2)
    return math.sqrt((l1 - l2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2)


# Default match threshold (Delta-E). Generous enough to group color families
# ("navy" ~ "sapphire") without collapsing distinct hues.
DEFAULT_TOLERANCE = 28.0


def nearest(color: RGB, candidates: Iterable[RGB]) -> Tuple[Optional[RGB], float]:
    """Return the closest candidate and its Delta-E distance."""
    best: Optional[RGB] = None
    best_d = float("inf")
    for cand in candidates:
        d = delta_e(color, cand)
        if d < best_d:
            best_d, best = d, cand
    return best, best_d


def matches_palette(
    item_color: Optional[str],
    palette_hexes: Iterable[str],
    tolerance: float = DEFAULT_TOLERANCE,
    allow_neutrals: bool = True,
) -> bool:
    """
    True if ``item_color`` is within ``tolerance`` of any palette color.

    Universal neutrals (black/white/navy/…) pass by default since they flatter
    every season. Unrecognised colors return False.
    """
    if not item_color:
        return False
    if allow_neutrals and normalize_name(item_color) in UNIVERSAL_NEUTRALS:
        return True
    rgb = to_rgb(item_color)
    if rgb is None:
        return False
    candidates = [c for c in (to_rgb(h) for h in palette_hexes) if c is not None]
    if not candidates:
        return False
    _, dist = nearest(rgb, candidates)
    return dist <= tolerance


# Alias used by the routers for readability.
def season_matches(item_color: Optional[str], palette_hexes: Iterable[str], **kw) -> bool:
    return matches_palette(item_color, palette_hexes, **kw)

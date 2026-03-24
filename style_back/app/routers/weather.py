from fastapi import APIRouter, HTTPException
import urllib.request
import json

router = APIRouter(prefix="/weather", tags=["weather"])


def _fetch_json(url: str) -> dict:
    """Simple HTTP GET using stdlib – no extra dependencies needed."""
    with urllib.request.urlopen(url, timeout=5) as resp:
        return json.loads(resp.read())


WMO_CODE_MAP = {
    0: ("Clear sky", "clear_day"),
    1: ("Mainly clear", "partly_cloudy_day"),
    2: ("Partly cloudy", "partly_cloudy_day"),
    3: ("Overcast", "cloud"),
    45: ("Foggy", "foggy"),
    48: ("Foggy", "foggy"),
    51: ("Light drizzle", "rainy_light"),
    53: ("Moderate drizzle", "rainy"),
    55: ("Heavy drizzle", "rainy_heavy"),
    61: ("Light rain", "rainy_light"),
    63: ("Moderate rain", "rainy"),
    65: ("Heavy rain", "rainy_heavy"),
    71: ("Light snow", "weather_snowy"),
    73: ("Moderate snow", "weather_snowy"),
    75: ("Heavy snow", "weather_snowy"),
    80: ("Rain showers", "rainy"),
    81: ("Rain showers", "rainy"),
    82: ("Violent rain", "thunderstorm"),
    95: ("Thunderstorm", "thunderstorm"),
    96: ("Thunderstorm", "thunderstorm"),
    99: ("Thunderstorm", "thunderstorm"),
}


@router.get("/current")
def get_current_weather(city: str | None = None, lat: float | None = None, lon: float | None = None):
    """
    Get current weather.
    - Pass ?city=London  OR  ?lat=51.5&lon=-0.12
    - Returns temp_c, description, icon, city_name.
    Uses Open-Meteo (free, no API key required).
    """
    if lat is None or lon is None:
        if not city:
            raise HTTPException(status_code=400, detail="Provide city or lat/lon")
        # Geocode – Open-Meteo Geocoding API (free)
        geo_url = (
            f"https://geocoding-api.open-meteo.com/v1/search"
            f"?name={urllib.parse.quote(city)}&count=1&language=en&format=json"
        )
        try:
            geo = _fetch_json(geo_url)
        except Exception:
            raise HTTPException(status_code=503, detail="Geocoding service unavailable")
        results = geo.get("results") or []
        if not results:
            raise HTTPException(status_code=404, detail=f"City '{city}' not found")
        r = results[0]
        lat = r["latitude"]
        lon = r["longitude"]
        city_name = f"{r.get('name', city)}, {r.get('country_code', '')}"
    else:
        city_name = city or f"{lat:.2f}, {lon:.2f}"

    # Weather API
    wx_url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        f"&current=temperature_2m,weathercode"
        f"&temperature_unit=celsius"
        f"&timezone=auto"
    )
    try:
        wx = _fetch_json(wx_url)
    except Exception:
        raise HTTPException(status_code=503, detail="Weather service unavailable")

    current = wx.get("current", {})
    temp_c = current.get("temperature_2m", 0)
    code = current.get("weathercode", 0)
    description, icon = WMO_CODE_MAP.get(code, ("Unknown", "cloud"))

    return {
        "city": city_name,
        "temp_c": round(temp_c, 1),
        "description": description,
        "icon": icon,
        "lat": lat,
        "lon": lon,
    }


# urllib.parse is used above – import it
import urllib.parse  # noqa: E402

/**
 * API client for Style backend (FastAPI).
 * Base URL: set REACT_APP_API_URL in .env (e.g. http://localhost:8000).
 */

const BASE = process.env.REACT_APP_API_URL || '';

function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('auth_token');
}

async function request(path, options = {}) {
  const url = `${BASE}${path}`;
  const token = getAuthToken();
  const res = await fetch(url, {
    headers: { 
      'Content-Type': 'application/json', 
      ...(token ? { Authorization: `Bearer ${token}` } : {}), 
      ...options.headers 
    },
    ...options,
  });
  if (!res.ok) {
    const err = new Error(res.statusText);
    err.status = res.status;
    try {
      err.body = await res.json();
    } catch {
      err.body = await res.text();
    }
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

const memCache = {};

async function cachedRequest(path, cacheKey) {
  if (memCache[cacheKey]) {
    // Background update
    request(path).then(res => { memCache[cacheKey] = res; }).catch(() => {});
    return Promise.resolve(memCache[cacheKey]);
  }
  const res = await request(path);
  memCache[cacheKey] = res;
  return res;
}

export function getCachedSync(cacheKey) {
  return memCache[cacheKey] || null;
}

function clearCache() {
  for (let key in memCache) delete memCache[key];
}

export const api = {
  health() {
    return request('/health');
  },

  register({ name, email, password, city }) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, city }),
    }).then(res => {
      if (res?.access_token) {
        localStorage.setItem('auth_token', res.access_token);
        if (res.city) localStorage.setItem('user_city', res.city);
        if (res.name) localStorage.setItem('user_name', res.name);
      }
      return res;
    });
  },

  login({ email, password }) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }).then(res => {
      if (res?.access_token) {
        localStorage.setItem('auth_token', res.access_token);
        if (res.city) localStorage.setItem('user_city', res.city);
        if (res.name) localStorage.setItem('user_name', res.name);
      }
      return res;
    });
  },

  getProfile() {
    return request('/auth/me');
  },

  updateProfile(data) {
    return request('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }).then(res => {
      if (res?.access_token) {
        localStorage.setItem('auth_token', res.access_token);
        localStorage.setItem('user_city', res.city || '');
        localStorage.setItem('user_name', res.name || '');
      }
      return res;
    });
  },

  getCloset({ category = null, color = null, formality = null, search = null } = {}) {
    const params = new URLSearchParams();
    if (category != null && category !== '' && category !== 'all') params.set('category', category);
    if (color != null && color !== '') params.set('color', color);
    if (formality != null && formality !== '') params.set('formality', formality);
    if (search != null && search.trim() !== '') params.set('search', search.trim());
    const q = params.toString() ? `?${params.toString()}` : '';
    return cachedRequest(`/closet${q}`, `closet-${q}`);
  },

  getClosetItem(id) {
    return cachedRequest(`/closet/${id}`, `closet-item-${id}`);
  },

  createClosetItem(item) {
    clearCache();
    return request('/closet', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  uploadClosetItem(formData) {
    clearCache();
    const url = `${BASE}/closet/upload`;
    const token = getAuthToken();
    return fetch(url, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(async (res) => {
      if (!res.ok) {
        const err = new Error(res.statusText);
        err.status = res.status;
        try { err.body = await res.json(); } catch { err.body = await res.text(); }
        throw err;
      }
      return res.json();
    });
  },

  updateClosetItem(id, data) {
    clearCache();
    return request(`/closet/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteClosetItem(id) {
    clearCache();
    return request(`/closet/${id}`, { method: 'DELETE' });
  },

  getTodayOutfit(refresh = false) {
    return cachedRequest(`/outfits/today${refresh ? '?refresh=true' : ''}`, `outfit-today-${refresh}`);
  },

  generateOutfit({ context, weather_temp_c, formality_preference, vibe }) {
    // Generative AI should not be aggressively cached, but we could cache the exact request
    return request('/outfits/generate', {
      method: 'POST',
      body: JSON.stringify({
        context: context || 'Office',
        weather_temp_c: weather_temp_c ?? null,
        formality_preference: formality_preference ?? null,
        vibe: vibe ?? 50,
      }),
    });
  },

  saveOutfit({ context, items, explanation }) {
    clearCache();
    return request('/outfits/save', {
      method: 'POST',
      body: JSON.stringify({ context, items, explanation }),
    });
  },

  getSavedOutfits() {
    return cachedRequest('/outfits/saved', 'saved-outfits');
  },

  virtualTryOn(data) {
    return request('/outfits/try-on', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getSuggestionsToday() {
    const city = typeof window !== 'undefined' ? localStorage.getItem('user_city') : null;
    const q = city ? `?city=${encodeURIComponent(city)}` : '';
    return cachedRequest(`/suggestions/today${q}`, `suggestions-today-${q}`);
  },

  getWardrobeGaps() {
    return cachedRequest('/suggestions/gaps', 'wardrobe-gaps');
  },

  getCalendarEvents(date = null) {
    const q = date ? `?date=${encodeURIComponent(date)}` : '';
    return cachedRequest(`/calendar/events${q}`, `calendar-events-${q}`);
  },

  createCalendarEvent(event) {
    clearCache();
    return request('/calendar/events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  },

  deleteCalendarEvent(id) {
    clearCache();
    return request(`/calendar/events/${id}`, { method: 'DELETE' });
  },

  /** Get weather by city name OR lat/lon coordinates */
  getWeather({ city, lat, lon } = {}) {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (lat != null) params.set('lat', lat);
    if (lon != null) params.set('lon', lon);
    return cachedRequest(`/weather/current?${params.toString()}`, `weather-${params.toString()}`);
  },

  generatePackingList(data) {
    return request('/travel/pack', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getShoppingItems({ category, tags } = {}) {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.set('category', category);
    if (tags) params.set('tags', tags);
    const q = params.toString() ? `?${params.toString()}` : '';
    return request(`/shopping/items${q}`);
  },

  shoppingTryOn({ item_id, context }) {
    return request('/shopping/try-on', {
      method: 'POST',
      body: JSON.stringify({ item_id, context }),
    });
  },

  // ── Color analysis (selfie-driven recommendations) ──────────────────────
  analyzeSelfie(formData) {
    const url = `${BASE}/color/analyze`;
    const token = getAuthToken();
    return fetch(url, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(async (res) => {
      if (!res.ok) {
        const err = new Error(res.statusText);
        err.status = res.status;
        try { err.body = await res.json(); } catch { err.body = await res.text(); }
        throw err;
      }
      return res.json();
    });
  },

  getColorShop() {
    return request('/color/shop');
  },

  uploadAvatar(formData) {
    const url = `${BASE}/auth/avatar`;
    const token = getAuthToken();
    return fetch(url, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(async (res) => {
      if (!res.ok) {
        const err = new Error(res.statusText);
        err.status = res.status;
        try { err.body = await res.json(); } catch { err.body = await res.text(); }
        throw err;
      }
      return res.json();
    });
  },

  updateBodyMeasurements({ height_cm, weight_kg }) {
    return this.updateProfile({ height_cm, weight_kg });
  },
};

export const isApiConfigured = () => Boolean(BASE);

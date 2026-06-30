import React, { useState, useEffect, useRef } from 'react';
import { api, isApiConfigured } from '../api/client';
import Toast from '../components/Toast';

const BASE = process.env.REACT_APP_API_URL || '';

function resolveAvatarUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BASE}${url}`;
}

const ProfileView = ({ onLogout }) => {
  const [profile, setProfile] = useState({ name: '', email: '', city: '', height_cm: '', weight_kg: '' });
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef(null);

  useEffect(() => {
    if (isApiConfigured()) {
      api.getProfile()
        .then(res => {
          setProfile({
            name: res.name || '',
            email: res.email || '',
            city: res.city || '',
            height_cm: res.height_cm != null ? String(res.height_cm) : '',
            weight_kg: res.weight_kg != null ? String(res.weight_kg) : '',
          });
          if (res.avatar_url) {
            setAvatarUrl(res.avatar_url);
            try { localStorage.setItem('user_avatar', res.avatar_url); } catch {}
          }
        })
        .catch(err => setError(err.message || 'Failed to load profile'))
        .finally(() => setInitialLoading(false));
    } else {
      setInitialLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isApiConfigured()) {
        const updateData = { ...profile };
        if (password.trim()) {
          updateData.password = password;
        }
        // Convert measurement strings to numbers or null
        updateData.height_cm = profile.height_cm ? parseFloat(profile.height_cm) : null;
        updateData.weight_kg = profile.weight_kg ? parseFloat(profile.weight_kg) : null;
        await api.updateProfile(updateData);
        setToast('Profile updated successfully!');
        setPassword('');
      } else {
        await new Promise(r => setTimeout(r, 1000));
        localStorage.setItem('user_name', profile.name);
        localStorage.setItem('user_city', profile.city);
        setToast('Mock profile updated!');
      }
    } catch (err) {
      setError(err.body?.detail || err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Photo must be under 5 MB.');
      return;
    }
    setAvatarUploading(true);
    setError(null);
    try {
      if (isApiConfigured()) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.uploadAvatar(formData);
        if (res?.avatar_url) {
          setAvatarUrl(res.avatar_url);
          try { localStorage.setItem('user_avatar', res.avatar_url); } catch {}
        }
        setToast('Photo uploaded successfully!');
      } else {
        setToast('Mock: photo uploaded!');
      }
    } catch (err) {
      setError(err.body?.detail || err.message || 'Failed to upload photo');
    } finally {
      setAvatarUploading(false);
      // Reset input so same file can be re-uploaded
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <span className="material-symbols-outlined text-[40px] text-gold-soft animate-spin">refresh</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-up max-w-2xl mx-auto">
      <div className="mb-7">
        <h1 className="text-3xl font-serif font-light text-fg tracking-tight">My Profile</h1>
        <p className="text-subtle text-sm mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="bg-card border border-line p-6 rounded-2xl">
        {error && (
          <div className="mb-6 bg-error/12 border border-error/30 text-error text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              placeholder="Your name"
              className="w-full bg-canvas border border-line rounded-xl px-4 py-3 text-sm text-fg focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">City (For Weather Updates)</label>
            <input
              type="text"
              name="city"
              value={profile.city}
              onChange={handleChange}
              placeholder="e.g. London"
              className="w-full bg-canvas border border-line rounded-xl px-4 py-3 text-sm text-fg focus:outline-none focus:border-primary/50 transition-colors"
            />
            <p className="text-[10px] text-subtle mt-1.5 ml-1">Used to provide accurate weather-based outfit suggestions.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full bg-canvas border border-line rounded-xl px-4 py-3 text-sm text-fg focus:outline-none focus:border-primary/50 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
              className="w-full bg-canvas border border-line rounded-xl px-4 py-3 text-sm text-fg focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {/* ── Body Measurements ─────────────────────────────────────── */}
          <div className="pt-4 border-t border-line">
            <p className="text-xs font-bold text-muted uppercase tracking-widest mb-0.5">Body Measurements</p>
            <p className="text-[10px] text-subtle mb-3">Used to personalize virtual try-on results.</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">Height (cm)</label>
                <input
                  type="number"
                  name="height_cm"
                  value={profile.height_cm}
                  onChange={handleChange}
                  placeholder="e.g. 175"
                  min={100}
                  max={250}
                  className="w-full bg-canvas border border-line rounded-xl px-4 py-3 text-sm text-fg focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2">Weight (kg)</label>
                <input
                  type="number"
                  name="weight_kg"
                  value={profile.weight_kg}
                  onChange={handleChange}
                  placeholder="e.g. 70"
                  min={30}
                  max={300}
                  className="w-full bg-canvas border border-line rounded-xl px-4 py-3 text-sm text-fg focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-line flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-primary text-[#1F2937] px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary/90 disabled:opacity-50 transition-all shadow-lg shadow-primary/10"
            >
              {loading ? (
                <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
              ) : (
                <span className="material-symbols-outlined text-[16px]">save</span>
              )}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Your Photo (avatar for try-on) ─────────────────────────────── */}
      <div className="mt-6 bg-card border border-line p-6 rounded-2xl">
        <p className="text-xs font-bold text-muted uppercase tracking-widest mb-0.5">Your Photo</p>
        <p className="text-[10px] text-subtle mb-4">Used for advanced AI virtual try-on in the Shop. PNG or JPG, max 5 MB.</p>

        <div className="flex items-center gap-5">
          {/* Avatar preview */}
          <div className="flex-shrink-0">
            {avatarUrl ? (
              <img
                src={resolveAvatarUrl(avatarUrl)}
                alt="Your avatar"
                className="size-20 rounded-full object-cover border-2 border-primary/30"
              />
            ) : (
              <div className="size-20 rounded-full bg-canvas border-2 border-dashed border-line flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px] text-subtle">person</span>
              </div>
            )}
          </div>

          {/* Upload controls */}
          <div className="flex-1 min-w-0">
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleAvatarUpload}
              className="hidden"
              id="avatar-upload"
            />
            <label
              htmlFor="avatar-upload"
              className={`inline-flex items-center gap-2 cursor-pointer bg-canvas border border-line text-fg px-4 py-2.5 rounded-xl text-sm font-bold hover:border-line-strong transition-all ${avatarUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {avatarUploading ? (
                <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
              ) : (
                <span className="material-symbols-outlined text-[16px]">upload</span>
              )}
              {avatarUploading ? 'Uploading…' : avatarUrl ? 'Change Photo' : 'Upload Photo'}
            </label>
            {avatarUrl && (
              <p className="text-[10px] text-gold-soft mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">check_circle</span>
                Photo saved — try-on will use your appearance
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Sign Out ──────────────────────────────────────────────── */}
      <div className="mt-6">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 bg-error/10 border border-error/30 text-error hover:bg-error hover:text-fg hover:border-error py-3 rounded-2xl font-semibold text-sm transition-all duration-200 active:scale-[.98]"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Sign Out
        </button>
      </div>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
};

export default ProfileView;

import React, { useState, useCallback } from 'react';

const DARK_KEY = 'style-dark-mode';

const isDark = () => {
  try { return document.documentElement.classList.contains('dark'); } catch { return false; }
};

/**
 * Light/dark theme toggle.
 * - Controlled: pass `value` (bool) + `onChange` (used inside AppShell, driven by App state).
 * - Uncontrolled: omit them — it flips the `dark` class + persists directly (used on the Landing page).
 */
const ThemeToggle = ({ value, onChange, className = '', showLabel = false }) => {
  const controlled = typeof value === 'boolean';
  const [internal, setInternal] = useState(isDark);
  const dark = controlled ? value : internal;

  const toggle = useCallback(() => {
    const next = !dark;
    if (controlled) {
      onChange(next);
    } else {
      document.documentElement.classList.toggle('dark', next);
      try { localStorage.setItem(DARK_KEY, next ? '1' : '0'); } catch {}
      setInternal(next);
    }
  }, [dark, controlled, onChange]);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
      className={`inline-flex items-center gap-2 justify-center rounded-xl border border-line text-muted hover:text-fg hover:border-line-strong transition-colors ${className}`}
    >
      <span className="material-symbols-outlined text-[18px]">{dark ? 'light_mode' : 'dark_mode'}</span>
      {showLabel && <span className="text-sm font-medium">{dark ? 'Light mode' : 'Dark mode'}</span>}
    </button>
  );
};

export default ThemeToggle;

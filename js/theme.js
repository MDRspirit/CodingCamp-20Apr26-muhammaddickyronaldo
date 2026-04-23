/**
 * theme.js — Light/Dark theme toggle.
 * Persists preference to localStorage under the key `pd_theme`.
 */

import { load, save } from './storage.js';

const STORAGE_KEY = 'pd_theme';

/**
 * Pure helper: given a theme value, return the corresponding body class name.
 * @param {"light"|"dark"} theme
 * @returns {string} e.g. "theme-light" or "theme-dark"
 */
export function applyTheme(theme) {
  return `theme-${theme}`;
}

/**
 * Pure helper: return the opposite theme.
 * @param {"light"|"dark"} current
 * @returns {"light"|"dark"}
 */
export function nextTheme(current) {
  return current === 'light' ? 'dark' : 'light';
}

/**
 * Toggle the current theme, update <body> class, and persist.
 */
export function toggle() {
  const body = document.body;
  const current = body.classList.contains('theme-dark') ? 'dark' : 'light';
  const next = nextTheme(current);
  body.classList.remove(applyTheme(current));
  body.classList.add(applyTheme(next));
  save(STORAGE_KEY, next);
}

/**
 * Initialise the theme module:
 * - Load persisted theme (default: "light")
 * - Apply class to <body>
 * - Wire the #theme-toggle button
 */
export function init() {
  const saved = load(STORAGE_KEY);
  const theme = saved === 'dark' ? 'dark' : 'light';

  document.body.classList.remove('theme-light', 'theme-dark');
  document.body.classList.add(applyTheme(theme));

  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.addEventListener('click', toggle);
  }
}

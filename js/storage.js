/**
 * storage.js — thin wrapper around localStorage with graceful degradation.
 * If localStorage is unavailable (e.g. private browsing, quota exceeded),
 * operations fail silently and the app continues to work in-memory.
 */

/**
 * Load a value from localStorage by key.
 * @param {string} key
 * @returns {any|null} Parsed value, or null if absent or on error.
 */
export function load(key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Save a JSON-serializable value to localStorage.
 * @param {string} key
 * @param {any} value
 */
export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Graceful degradation: ignore write failures
  }
}

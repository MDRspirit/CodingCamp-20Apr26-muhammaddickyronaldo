/**
 * greeting.js — Greeting Widget
 * Displays current time, date, and a time-appropriate greeting phrase.
 * Optionally personalizes with a saved user name.
 */

import { load, save } from './storage.js';

const STORAGE_KEY = 'pd_userName';

/**
 * Format a Date as "HH:MM" (24-hour, zero-padded).
 * @param {Date} date
 * @returns {string}
 */
export function formatTime(date) {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

/**
 * Format a Date as a human-readable string, e.g. "Monday, July 14, 2025".
 * @param {Date} date
 * @returns {string}
 */
export function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Map an hour [0–23] to a greeting phrase.
 * 05–11 → "Good morning"
 * 12–17 → "Good afternoon"
 * 18–21 → "Good evening"
 * 22–23, 0–4 → "Good night"
 * @param {number} hour
 * @returns {string}
 */
export function getGreetingPhrase(hour) {
  if (hour >= 5 && hour <= 11) return 'Good morning';
  if (hour >= 12 && hour <= 17) return 'Good afternoon';
  if (hour >= 18 && hour <= 21) return 'Good evening';
  return 'Good night';
}

/**
 * Pure function: compose the greeting string from a phrase and optional name.
 * @param {string} phrase - e.g. "Good morning"
 * @param {string} [name] - optional user name
 * @returns {string}
 */
export function renderGreeting(phrase, name) {
  const trimmed = name ? name.trim() : '';
  return trimmed ? `${phrase}, ${trimmed}!` : phrase;
}

/**
 * Render the greeting, time, and date into the DOM.
 */
function render() {
  const now = new Date();
  const timeEl = document.getElementById('greeting-time');
  const dateEl = document.getElementById('greeting-date');
  const textEl = document.getElementById('greeting-text');

  if (timeEl) timeEl.textContent = formatTime(now);
  if (dateEl) dateEl.textContent = formatDate(now);

  if (textEl) {
    const phrase = getGreetingPhrase(now.getHours());
    const name = load(STORAGE_KEY);
    textEl.textContent = renderGreeting(phrase, name);
  }
}

/**
 * Mount the greeting widget and start the clock interval.
 */
export function init() {
  render();
  setInterval(render, 1000);

  const form = document.getElementById('greeting-name-form');
  const input = document.getElementById('greeting-name-input');

  // Pre-fill input with saved name if present
  const savedName = load(STORAGE_KEY);
  if (input && savedName) {
    input.value = savedName;
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const trimmed = input ? input.value.trim() : '';
      if (trimmed) {
        save(STORAGE_KEY, trimmed);
      } else {
        save(STORAGE_KEY, null);
      }
      render();
    });
  }
}

// Feature: personal-dashboard — Property-based tests for storage.js
// Properties: 4, 6, 15, 18, 20

import assert from 'node:assert/strict';
import fc from 'fast-check';

// ── Mock localStorage for Node.js ──────────────────────────────────────────
// storage.js reads/writes globalThis.localStorage, so we provide an
// in-memory implementation before importing the module.
const store = new Map();
globalThis.localStorage = {
  getItem(key) { return store.has(key) ? store.get(key) : null; },
  setItem(key, value) { store.set(key, String(value)); },
  removeItem(key) { store.delete(key); },
  clear() { store.clear(); },
};

// ── Import storage module ──────────────────────────────────────────────────
const { load, save } = await import('../js/storage.js');

// ── Arbitraries ────────────────────────────────────────────────────────────
const taskArb = fc.record({
  id: fc.string({ minLength: 1 }),
  label: fc.string({ minLength: 1 }),
  completed: fc.boolean(),
  createdAt: fc.integer({ min: 0 }),
});

const linkArb = fc.record({
  id: fc.string({ minLength: 1 }),
  label: fc.string({ minLength: 1 }),
  url: fc.string({ minLength: 1 }),
});

// ── Helper: reset store between runs ──────────────────────────────────────
function clearStore() { store.clear(); }

// ── Property 4: Storage round-trip for User_Name ──────────────────────────
// Feature: personal-dashboard, Property 4: Storage round-trip for User_Name
console.log('Running Property 4: Storage round-trip for User_Name...');
fc.assert(
  fc.property(fc.string({ minLength: 1 }), (name) => {
    clearStore();
    save('pd_userName', name);
    const result = load('pd_userName');
    assert.deepEqual(result, name);
  }),
  { numRuns: 100 }
);
console.log('  ✓ Property 4 passed');

// ── Property 6: Storage round-trip for timer duration ─────────────────────
// Feature: personal-dashboard, Property 6: Storage round-trip for timer duration
console.log('Running Property 6: Storage round-trip for timer duration...');
fc.assert(
  fc.property(fc.integer({ min: 1, max: 90 }), (duration) => {
    clearStore();
    save('pd_timerDuration', duration);
    const result = load('pd_timerDuration');
    assert.deepEqual(result, duration);
  }),
  { numRuns: 100 }
);
console.log('  ✓ Property 6 passed');

// ── Property 15: Storage round-trip for tasks ─────────────────────────────
// Feature: personal-dashboard, Property 15: Storage round-trip for tasks
console.log('Running Property 15: Storage round-trip for tasks...');
fc.assert(
  fc.property(fc.array(taskArb), (tasks) => {
    clearStore();
    // Normalize to plain objects (fc.record may produce null-prototype objects)
    const normalized = JSON.parse(JSON.stringify(tasks));
    save('pd_tasks', normalized);
    const result = load('pd_tasks');
    assert.deepEqual(result, normalized);
  }),
  { numRuns: 100 }
);
console.log('  ✓ Property 15 passed');

// ── Property 18: Storage round-trip for links ─────────────────────────────
// Feature: personal-dashboard, Property 18: Storage round-trip for links
console.log('Running Property 18: Storage round-trip for links...');
fc.assert(
  fc.property(fc.array(linkArb), (links) => {
    clearStore();
    // Normalize to plain objects (fc.record may produce null-prototype objects)
    const normalized = JSON.parse(JSON.stringify(links));
    save('pd_links', normalized);
    const result = load('pd_links');
    assert.deepEqual(result, normalized);
  }),
  { numRuns: 100 }
);
console.log('  ✓ Property 18 passed');

// ── Property 20: Storage round-trip for theme ─────────────────────────────
// Feature: personal-dashboard, Property 20: Storage round-trip for theme
console.log('Running Property 20: Storage round-trip for theme...');
fc.assert(
  fc.property(fc.constantFrom('light', 'dark'), (theme) => {
    clearStore();
    save('pd_theme', theme);
    const result = load('pd_theme');
    assert.deepEqual(result, theme);
  }),
  { numRuns: 100 }
);
console.log('  ✓ Property 20 passed');

console.log('\nAll storage property tests passed.');

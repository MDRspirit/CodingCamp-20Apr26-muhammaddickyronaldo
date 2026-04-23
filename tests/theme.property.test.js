// Feature: personal-dashboard, Property 19: Theme toggle is an involution

import assert from 'node:assert/strict';
import fc from 'fast-check';

import { nextTheme } from '../js/theme.js';

// ── Property 19: Theme toggle is an involution ────────────────────────────
// For any theme, calling nextTheme(nextTheme(theme)) returns the original theme.
console.log('Running Property 19: Theme toggle is an involution...');
fc.assert(
  fc.property(fc.constantFrom('light', 'dark'), (theme) => {
    assert.equal(nextTheme(nextTheme(theme)), theme);
  }),
  { numRuns: 100 }
);
console.log('  ✓ Property 19 passed');

console.log('\nAll theme property tests passed.');

// Feature: personal-dashboard, Property 1: Greeting phrase covers all hours

import assert from 'node:assert/strict';
import fc from 'fast-check';

const { getGreetingPhrase } = await import('../js/greeting.js');

const VALID_PHRASES = new Set([
  'Good morning',
  'Good afternoon',
  'Good evening',
  'Good night',
]);

// Property 1: Greeting phrase covers all hours
// Validates: Requirements 1.3, 1.4, 1.5, 1.6
console.log('Running Property 1: Greeting phrase covers all hours...');
fc.assert(
  fc.property(fc.integer({ min: 0, max: 23 }), (hour) => {
    const phrase = getGreetingPhrase(hour);
    assert.ok(
      VALID_PHRASES.has(phrase),
      `Hour ${hour} returned unexpected phrase: "${phrase}"`
    );
  }),
  { numRuns: 100 }
);
console.log('  ✓ Property 1 passed');

console.log('\nAll greeting property tests passed.');

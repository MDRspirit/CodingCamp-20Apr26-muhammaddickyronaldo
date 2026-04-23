// Feature: personal-dashboard, Property 2: Greeting phrase with name
// Feature: personal-dashboard, Property 3: Empty name produces no suffix

import assert from 'node:assert/strict';
import fc from 'fast-check';

const { getGreetingPhrase, renderGreeting } = await import('../js/greeting.js');

// Property 2: Greeting phrase with name
// Validates: Requirements 2.2
console.log('Running Property 2: Greeting phrase with name...');
fc.assert(
  fc.property(
    fc.integer({ min: 0, max: 23 }),
    fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
    (hour, name) => {
      const phrase = getGreetingPhrase(hour);
      const result = renderGreeting(phrase, name);
      assert.strictEqual(
        result,
        `${phrase}, ${name.trim()}!`,
        `Expected "${phrase}, ${name.trim()}!" but got "${result}"`
      );
    }
  ),
  { numRuns: 100 }
);
console.log('  ✓ Property 2 passed');

// Property 3: Empty name produces no suffix
// Validates: Requirements 2.3
console.log('Running Property 3: Empty name produces no suffix...');
fc.assert(
  fc.property(
    fc.integer({ min: 0, max: 23 }),
    fc.constantFrom('', '   ', '\t'),
    (hour, name) => {
      const phrase = getGreetingPhrase(hour);
      const result = renderGreeting(phrase, name);
      assert.strictEqual(
        result,
        phrase,
        `Expected bare phrase "${phrase}" but got "${result}"`
      );
    }
  ),
  { numRuns: 100 }
);
console.log('  ✓ Property 3 passed');

console.log('\nAll greeting-name property tests passed.');

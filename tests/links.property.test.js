// Feature: personal-dashboard, Property 16: Valid URL acceptance
// Feature: personal-dashboard, Property 17: Invalid URL rejection

import fc from 'fast-check';
import assert from 'node:assert/strict';
import { isValidUrl } from '../js/links.js';

// Property 16: Valid URL acceptance
// Validates: Requirements 8.2
{
  let failures = 0;
  fc.assert(
    fc.property(fc.webUrl(), url => {
      const result = isValidUrl(url);
      if (!result) failures++;
      return result === true;
    }),
    { numRuns: 100 }
  );
  assert.equal(failures, 0, 'Property 16 failed: isValidUrl returned false for a valid URL');
  console.log('✓ Property 16: Valid URL acceptance — passed');
}

// Property 17: Invalid URL rejection
// Validates: Requirements 8.4
{
  let failures = 0;
  fc.assert(
    fc.property(
      fc.string().filter(s => {
        try { new URL(s); return false; } catch { return true; }
      }),
      url => {
        const result = isValidUrl(url);
        if (result) failures++;
        return result === false;
      }
    ),
    { numRuns: 100 }
  );
  assert.equal(failures, 0, 'Property 17 failed: isValidUrl returned true for an invalid URL');
  console.log('✓ Property 17: Invalid URL rejection — passed');
}

console.log('All links property tests passed.');

// Unit tests for greeting.js — formatTime and formatDate
// Validates: Requirements 1.1, 1.2

import assert from 'node:assert/strict';

const { formatTime, formatDate } = await import('../js/greeting.js');

// ── formatTime tests ───────────────────────────────────────────────────────

console.log('Testing formatTime...');

// midnight → "00:00"
assert.strictEqual(formatTime(new Date(2025, 6, 14, 0, 0)), '00:00');
console.log('  ✓ midnight → "00:00"');

// noon → "12:00"
assert.strictEqual(formatTime(new Date(2025, 6, 14, 12, 0)), '12:00');
console.log('  ✓ noon → "12:00"');

// single-digit minutes → zero-padded
assert.strictEqual(formatTime(new Date(2025, 6, 14, 9, 5)), '09:05');
console.log('  ✓ 9:05 → "09:05"');

// ── formatDate tests ───────────────────────────────────────────────────────

console.log('Testing formatDate...');

// Known date: July 14, 2025 is a Monday
assert.strictEqual(formatDate(new Date(2025, 6, 14)), 'Monday, July 14, 2025');
console.log('  ✓ new Date(2025, 6, 14) → "Monday, July 14, 2025"');

console.log('\nAll greeting unit tests passed.');

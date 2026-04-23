// Unit tests for timer.js — timerReducer state transitions
// Validates: Requirements 3.3, 3.4, 3.5, 3.6, 3.7, 3.8

import assert from 'node:assert/strict';
import { createTimerState, timerReducer, formatCountdown } from '../js/timer.js';

// ── formatCountdown ──────────────────────────────────────────────────────────

console.log('Testing formatCountdown...');

assert.strictEqual(formatCountdown(0), '00:00');
console.log('  ✓ 0 → "00:00"');

assert.strictEqual(formatCountdown(90), '01:30');
console.log('  ✓ 90 → "01:30"');

assert.strictEqual(formatCountdown(25 * 60), '25:00');
console.log('  ✓ 1500 → "25:00"');

assert.strictEqual(formatCountdown(65), '01:05');
console.log('  ✓ 65 → "01:05"');

// ── timerReducer: start ──────────────────────────────────────────────────────

console.log('Testing timerReducer: start...');

{
  const state = createTimerState(25);
  const next = timerReducer(state, { type: 'start', intervalId: 42 });
  assert.strictEqual(next.status, 'running');
  assert.strictEqual(next.intervalId, 42);
  console.log('  ✓ idle + start → status="running", intervalId set');
}

{
  // start from paused
  const state = { ...createTimerState(25), status: 'paused', remainingSeconds: 100 };
  const next = timerReducer(state, { type: 'start', intervalId: 99 });
  assert.strictEqual(next.status, 'running');
  assert.strictEqual(next.intervalId, 99);
  assert.strictEqual(next.remainingSeconds, 100); // unchanged
  console.log('  ✓ paused + start → status="running"');
}

// ── timerReducer: stop ───────────────────────────────────────────────────────

console.log('Testing timerReducer: stop...');

{
  const state = { ...createTimerState(25), status: 'running', intervalId: 42 };
  const next = timerReducer(state, { type: 'stop' });
  assert.strictEqual(next.status, 'paused');
  assert.strictEqual(next.intervalId, null);
  console.log('  ✓ running + stop → status="paused", intervalId=null');
}

// ── timerReducer: reset ──────────────────────────────────────────────────────

console.log('Testing timerReducer: reset...');

{
  const state = { ...createTimerState(25), status: 'running', remainingSeconds: 500, intervalId: 42 };
  const next = timerReducer(state, { type: 'reset' });
  assert.strictEqual(next.status, 'idle');
  assert.strictEqual(next.remainingSeconds, 25 * 60);
  assert.strictEqual(next.intervalId, null);
  console.log('  ✓ running + reset → status="idle", remainingSeconds restored, intervalId=null');
}

{
  const state = { ...createTimerState(10), status: 'paused', remainingSeconds: 200, intervalId: null };
  const next = timerReducer(state, { type: 'reset' });
  assert.strictEqual(next.status, 'idle');
  assert.strictEqual(next.remainingSeconds, 10 * 60);
  console.log('  ✓ paused + reset → status="idle", remainingSeconds restored');
}

// ── timerReducer: tick reaching 00:00 ────────────────────────────────────────

console.log('Testing timerReducer: tick to 00:00...');

{
  // remainingSeconds === 1, one tick should reach finished
  const state = { ...createTimerState(25), status: 'running', remainingSeconds: 1, intervalId: 42 };
  const next = timerReducer(state, { type: 'tick' });
  assert.strictEqual(next.status, 'finished');
  assert.strictEqual(next.remainingSeconds, 0);
  assert.strictEqual(next.intervalId, null);
  console.log('  ✓ running + tick (remainingSeconds=1) → status="finished", remainingSeconds=0, intervalId=null');
}

{
  // normal tick decrements by 1
  const state = { ...createTimerState(25), status: 'running', remainingSeconds: 60, intervalId: 42 };
  const next = timerReducer(state, { type: 'tick' });
  assert.strictEqual(next.status, 'running');
  assert.strictEqual(next.remainingSeconds, 59);
  console.log('  ✓ running + tick (remainingSeconds=60) → remainingSeconds=59, still running');
}

console.log('\nAll timer unit tests passed.');

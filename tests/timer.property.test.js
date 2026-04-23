// Feature: personal-dashboard, Property 5: Timer duration validation
// Validates: Requirements 4.1, 4.3

import fc from 'fast-check';
import assert from 'node:assert/strict';
import { createTimerState, timerReducer } from '../js/timer.js';

const MIN_DURATION = 1;
const MAX_DURATION = 90;

console.log('Testing Property 5: Timer duration validation...');

fc.assert(
  fc.property(
    fc.integer({ min: -100, max: 200 }),
    (d) => {
      const initialDuration = 25;
      const idleState = createTimerState(initialDuration);

      const nextState = timerReducer(idleState, { type: 'setDuration', durationMinutes: d });

      if (d >= MIN_DURATION && d <= MAX_DURATION) {
        // Valid range: state should be updated
        assert.strictEqual(nextState.durationMinutes, d, `Expected durationMinutes=${d}`);
        assert.strictEqual(nextState.remainingSeconds, d * 60, `Expected remainingSeconds=${d * 60}`);
      } else {
        // Out of range: state should be unchanged
        assert.strictEqual(nextState.durationMinutes, initialDuration, `Expected durationMinutes to remain ${initialDuration}`);
        assert.strictEqual(nextState.remainingSeconds, initialDuration * 60, `Expected remainingSeconds to remain ${initialDuration * 60}`);
      }
    }
  ),
  { numRuns: 100 }
);

console.log('  ✓ Valid durations (1–90) update durationMinutes and remainingSeconds');
console.log('  ✓ Invalid durations (<1 or >90) leave state unchanged');

// Also verify setDuration is rejected when timer is running
console.log('Testing Property 5: setDuration rejected when running...');

fc.assert(
  fc.property(
    fc.integer({ min: 1, max: 90 }),
    (d) => {
      const runningState = { ...createTimerState(25), status: 'running' };
      const nextState = timerReducer(runningState, { type: 'setDuration', durationMinutes: d });

      // Should be unchanged when running
      assert.strictEqual(nextState.durationMinutes, 25);
      assert.strictEqual(nextState.remainingSeconds, 25 * 60);
    }
  ),
  { numRuns: 100 }
);

console.log('  ✓ setDuration is rejected when timer is running');

console.log('\nAll Property 5 tests passed.');

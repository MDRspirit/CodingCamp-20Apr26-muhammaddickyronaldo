// Feature: personal-dashboard, Property 12: Sort order — incomplete first
// Feature: personal-dashboard, Property 13: Sort order — completed first
// Feature: personal-dashboard, Property 14: Sort order — default preserves insertion order

import fc from 'fast-check';
import assert from 'node:assert/strict';
import { sortTasks } from '../js/todo.js';

// ── Arbitrary for a Task ───────────────────────────────────────────────────
const taskArb = fc.record({
  id: fc.uuid(),
  label: fc.string({ minLength: 1 }).map(s => s.trim()).filter(s => s.length > 0),
  completed: fc.boolean(),
  createdAt: fc.integer({ min: 0 }),
});

// ── Property 12: Sort order — incomplete first ────────────────────────────
// Validates: Requirements 7.2
console.log('Running Property 12: Sort order — incomplete first...');

fc.assert(
  fc.property(
    fc.array(taskArb),
    (tasks) => {
      const sorted = sortTasks(tasks, 'incomplete');

      // Find the index of the last incomplete task and the first completed task
      const lastIncompleteIdx = sorted.map(t => t.completed).lastIndexOf(false);
      const firstCompletedIdx = sorted.findIndex(t => t.completed === true);

      // If both exist, all incompletes must come before all completes
      if (lastIncompleteIdx !== -1 && firstCompletedIdx !== -1) {
        assert.ok(
          lastIncompleteIdx < firstCompletedIdx,
          `All incomplete tasks should appear before completed tasks. lastIncompleteIdx=${lastIncompleteIdx}, firstCompletedIdx=${firstCompletedIdx}`
        );
      }

      // Input must not be mutated
      assert.strictEqual(sorted.length, tasks.length, 'Sorted array should have same length');
    }
  ),
  { numRuns: 100 }
);

console.log('  ✓ Property 12 passed');

// ── Property 13: Sort order — completed first ─────────────────────────────
// Validates: Requirements 7.3
console.log('Running Property 13: Sort order — completed first...');

fc.assert(
  fc.property(
    fc.array(taskArb),
    (tasks) => {
      const sorted = sortTasks(tasks, 'completed');

      const lastCompletedIdx = sorted.map(t => t.completed).lastIndexOf(true);
      const firstIncompleteIdx = sorted.findIndex(t => t.completed === false);

      // If both exist, all completed must come before all incompletes
      if (lastCompletedIdx !== -1 && firstIncompleteIdx !== -1) {
        assert.ok(
          lastCompletedIdx < firstIncompleteIdx,
          `All completed tasks should appear before incomplete tasks. lastCompletedIdx=${lastCompletedIdx}, firstIncompleteIdx=${firstIncompleteIdx}`
        );
      }

      assert.strictEqual(sorted.length, tasks.length, 'Sorted array should have same length');
    }
  ),
  { numRuns: 100 }
);

console.log('  ✓ Property 13 passed');

// ── Property 14: Sort order — default preserves insertion order ───────────
// Validates: Requirements 7.4
console.log('Running Property 14: Sort order — default preserves insertion order...');

fc.assert(
  fc.property(
    fc.array(taskArb),
    (tasks) => {
      const sorted = sortTasks(tasks, 'default');

      // The sorted result should be in ascending createdAt order
      for (let i = 1; i < sorted.length; i++) {
        assert.ok(
          sorted[i - 1].createdAt <= sorted[i].createdAt,
          `Tasks should be sorted by createdAt ascending. Index ${i - 1} (${sorted[i - 1].createdAt}) > index ${i} (${sorted[i].createdAt})`
        );
      }

      assert.strictEqual(sorted.length, tasks.length, 'Sorted array should have same length');

      // Input must not be mutated
      const originalOrder = tasks.map(t => t.id);
      const inputAfter = tasks.map(t => t.id);
      assert.deepStrictEqual(inputAfter, originalOrder, 'Input array should not be mutated');
    }
  ),
  { numRuns: 100 }
);

console.log('  ✓ Property 14 passed');

console.log('\nAll todo-sort property tests passed.');

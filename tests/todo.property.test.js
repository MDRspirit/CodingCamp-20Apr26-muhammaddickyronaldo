// Feature: personal-dashboard, Property 7: Adding a task grows the list
// Feature: personal-dashboard, Property 8: Empty or whitespace task labels are rejected
// Feature: personal-dashboard, Property 9: Task completion toggle is an involution
// Feature: personal-dashboard, Property 10: Duplicate task labels are rejected (case-insensitive)

import fc from 'fast-check';
import assert from 'node:assert/strict';
import { addTask, toggleTask, isDuplicate } from '../js/todo.js';

// ── Arbitrary for a Task ───────────────────────────────────────────────────
const taskArb = fc.record({
  id: fc.uuid(),
  label: fc.string({ minLength: 1 }).map((s) => s.trim()).filter((s) => s.length > 0),
  completed: fc.boolean(),
  createdAt: fc.integer({ min: 0 }),
});

// ── Property 7: Adding a task grows the list ──────────────────────────────
// Validates: Requirements 5.2
console.log('Running Property 7: Adding a task grows the list...');

fc.assert(
  fc.property(
    fc.array(taskArb),
    fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
    (tasks, label) => {
      // Ensure unique ids in the generated task list
      const seen = new Set();
      const uniqueTasks = tasks.filter((t) => {
        if (seen.has(t.id)) return false;
        seen.add(t.id);
        return true;
      });

      // Skip if label is already in the list (case-insensitive)
      if (isDuplicate(label, uniqueTasks)) return true;

      const result = addTask(uniqueTasks, label);

      assert.strictEqual(result.ok, true, 'Expected ok: true for non-duplicate, non-empty label');
      assert.strictEqual(result.tasks.length, uniqueTasks.length + 1, 'Expected list to grow by 1');

      const newTask = result.tasks[result.tasks.length - 1];
      assert.strictEqual(newTask.completed, false, 'New task should have completed: false');
      assert.strictEqual(newTask.label, label.trim(), 'New task label should match trimmed input');
    }
  ),
  { numRuns: 100 }
);

console.log('  ✓ Property 7 passed');

// ── Property 8: Empty or whitespace task labels are rejected ──────────────
// Validates: Requirements 5.3
console.log('Running Property 8: Empty or whitespace task labels are rejected...');

fc.assert(
  fc.property(
    fc.array(taskArb),
    fc.array(fc.constantFrom(' ', '\t', '\n')).map((chars) => chars.join('')),
    (tasks, label) => {
      const result = addTask(tasks, label);

      assert.strictEqual(result.ok, false, 'Expected ok: false for whitespace-only label');
      // List should be unchanged (addTask is pure, original tasks array untouched)
      assert.deepStrictEqual(tasks, tasks, 'Task list should remain unchanged');
    }
  ),
  { numRuns: 100 }
);

console.log('  ✓ Property 8 passed');

// ── Property 9: Task completion toggle is an involution ───────────────────
// Validates: Requirements 5.4
console.log('Running Property 9: Task completion toggle is an involution...');

fc.assert(
  fc.property(
    taskArb,
    (task) => {
      const once = toggleTask([task], task.id);
      const twice = toggleTask(once, task.id);

      assert.strictEqual(twice[0].completed, task.completed, 'Double toggle should restore original completed state');
      assert.strictEqual(twice[0].id, task.id, 'Task id should be unchanged');
      assert.strictEqual(twice[0].label, task.label, 'Task label should be unchanged');
    }
  ),
  { numRuns: 100 }
);

console.log('  ✓ Property 9 passed');

// ── Property 10: Duplicate task labels are rejected (case-insensitive) ────
// Validates: Requirements 6.1
console.log('Running Property 10: Duplicate task labels are rejected (case-insensitive)...');

fc.assert(
  fc.property(
    fc.array(taskArb, { minLength: 1 }),
    (tasks) => {
      // Ensure unique ids
      const seen = new Set();
      const uniqueTasks = tasks.filter((t) => {
        if (seen.has(t.id)) return false;
        seen.add(t.id);
        return true;
      });
      if (uniqueTasks.length === 0) return true;

      // Pick an existing task's label (possibly with different casing)
      const existing = uniqueTasks[0];
      const duplicateLabel = existing.label.toUpperCase();

      const result = addTask(uniqueTasks, duplicateLabel);

      assert.strictEqual(result.ok, false, 'Expected ok: false for duplicate label');
    }
  ),
  { numRuns: 100 }
);

console.log('  ✓ Property 10 passed');

console.log('\nAll todo property tests passed.');

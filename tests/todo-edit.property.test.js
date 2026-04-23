// Feature: personal-dashboard, Property 11: Duplicate edit labels are rejected (case-insensitive)

import fc from 'fast-check';
import assert from 'node:assert/strict';
import { editTask } from '../js/todo.js';

// ── Arbitrary for a Task ───────────────────────────────────────────────────
const taskArb = fc.record({
  id: fc.uuid(),
  label: fc.string({ minLength: 1 }).map((s) => s.trim()).filter((s) => s.length > 0),
  completed: fc.boolean(),
  createdAt: fc.integer({ min: 0 }),
});

// ── Property 11: Duplicate edit labels are rejected (case-insensitive) ────
// Validates: Requirements 6.2
console.log('Running Property 11: Duplicate edit labels are rejected (case-insensitive)...');

fc.assert(
  fc.property(
    fc.array(taskArb, { minLength: 2 }),
    (tasks) => {
      // Ensure unique ids and unique labels (case-insensitive) to avoid false positives
      const seenIds = new Set();
      const seenLabels = new Set();
      const uniqueTasks = tasks.filter((t) => {
        const labelKey = t.label.toLowerCase();
        if (seenIds.has(t.id) || seenLabels.has(labelKey)) return false;
        seenIds.add(t.id);
        seenLabels.add(labelKey);
        return true;
      });

      // Need at least 2 tasks with distinct labels
      if (uniqueTasks.length < 2) return true;

      const target = uniqueTasks[0];
      const other = uniqueTasks[1];

      // Try to edit target's label to match other's label (case-insensitive variants)
      const duplicateLabel = other.label.toUpperCase();

      const result = editTask(uniqueTasks, target.id, duplicateLabel);

      assert.strictEqual(result.ok, false, 'Expected ok: false when editing to a duplicate label');

      // The task's label should remain unchanged
      const targetTask = uniqueTasks.find((t) => t.id === target.id);
      assert.strictEqual(targetTask.label, target.label, 'Task label should remain unchanged after rejected edit');
    }
  ),
  { numRuns: 100 }
);

console.log('  ✓ Property 11 passed');

console.log('\nAll todo-edit property tests passed.');

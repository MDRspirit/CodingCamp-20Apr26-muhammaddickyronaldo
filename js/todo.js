/**
 * todo.js — To-Do List widget
 * Handles task creation, completion toggle, deletion, duplicate detection,
 * and persistence via localStorage.
 */

import { load, save } from './storage.js';

const STORAGE_KEY = 'pd_tasks';
const SORT_KEY = 'pd_sortOrder';

// ── Pure helper functions (exported for testing) ───────────────────────────

/**
 * Returns true if any task in `tasks` has a label matching `label`
 * case-insensitively, optionally excluding the task with `excludeId`.
 * @param {string} label
 * @param {Array} tasks
 * @param {string} [excludeId]
 * @returns {boolean}
 */
export function isDuplicate(label, tasks, excludeId) {
  const normalized = label.trim().toLowerCase();
  return tasks.some(
    (t) => t.label.toLowerCase() === normalized && t.id !== excludeId
  );
}

/**
 * Attempt to add a task with the given label to the tasks array.
 * @param {Array} tasks
 * @param {string} label
 * @returns {{ ok: true, tasks: Array } | { ok: false, error: string }}
 */
export function addTask(tasks, label) {
  const trimmed = label.trim();
  if (trimmed.length === 0) {
    return { ok: false, error: 'Task label cannot be empty' };
  }
  if (isDuplicate(trimmed, tasks)) {
    return { ok: false, error: 'A task with this name already exists' };
  }
  const newTask = {
    id: typeof crypto !== 'undefined' ? crypto.randomUUID() : String(Date.now()),
    label: trimmed,
    completed: false,
    createdAt: Date.now(),
  };
  return { ok: true, tasks: [...tasks, newTask] };
}

/**
 * Toggle the completed state of the task with the given id.
 * @param {Array} tasks
 * @param {string} id
 * @returns {Array}
 */
export function toggleTask(tasks, id) {
  return tasks.map((t) =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );
}

/**
 * Remove the task with the given id from the tasks array.
 * @param {Array} tasks
 * @param {string} id
 * @returns {Array}
 */
export function deleteTask(tasks, id) {
  return tasks.filter((t) => t.id !== id);
}

/**
 * Attempt to edit the label of the task with the given id.
 * @param {Array} tasks
 * @param {string} id
 * @param {string} newLabel
 * @returns {{ ok: true, tasks: Array } | { ok: false, error: string }}
 */
export function editTask(tasks, id, newLabel) {
  const trimmed = newLabel.trim();
  if (trimmed.length === 0) {
    return { ok: false, error: 'Task label cannot be empty' };
  }
  if (isDuplicate(trimmed, tasks, id)) {
    return { ok: false, error: 'A task with this name already exists' };
  }
  return { ok: true, tasks: tasks.map((t) => t.id === id ? { ...t, label: trimmed } : t) };
}

// ── Internal helpers ───────────────────────────────────────────────────────

/**
 * Sort tasks according to the given order.
 * Returns a new sorted array without mutating the input.
 * @param {Array} tasks
 * @param {'default'|'incomplete'|'completed'} order
 * @returns {Array}
 */
export function sortTasks(tasks, order) {
  const copy = [...tasks];
  if (order === 'incomplete') {
    copy.sort((a, b) => Number(a.completed) - Number(b.completed));
  } else if (order === 'completed') {
    copy.sort((a, b) => Number(b.completed) - Number(a.completed));
  } else {
    copy.sort((a, b) => a.createdAt - b.createdAt);
  }
  return copy;
}

/**
 * Build an <li> element for a task.
 * @param {object} task
 * @param {Function} onToggle
 * @param {Function} onDelete
 * @param {Function} onEdit
 * @returns {HTMLLIElement}
 */
export function renderTask(task, onToggle, onDelete, onEdit) {
  const li = document.createElement('li');
  li.dataset.id = task.id;
  li.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:0.5rem;border-bottom:1px solid #f3f4f6;border-radius:0.25rem;transition:background-color 0.2s;gap:0.5rem;';

  // Left: checkbox + label
  const left = document.createElement('div');
  left.style.cssText = 'display:flex;align-items:center;gap:0.75rem;flex:1;cursor:pointer;';
  left.addEventListener('click', () => onToggle && onToggle(task.id));

  // Custom checkbox
  const checkBox = document.createElement('div');
  checkBox.style.cssText = `width:1.25rem;height:1.25rem;border-radius:0.25rem;display:flex;align-items:center;justify-content:center;transition:all 0.2s;flex-shrink:0;border:1px solid ${task.completed ? '#6b65e3' : '#9ca3af'};background:${task.completed ? '#6b65e3' : 'transparent'};`;
  if (task.completed) {
    checkBox.innerHTML = '<svg width="12" height="12" fill="none" stroke="white" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>';
  }

  const span = document.createElement('span');
  span.textContent = task.label;
  span.style.cssText = task.completed
    ? 'text-decoration:line-through;color:#9ca3af;transition:color 0.2s;'
    : 'color:#1f2937;transition:color 0.2s;';

  left.appendChild(checkBox);
  left.appendChild(span);

  // Right: edit + delete buttons
  const right = document.createElement('div');
  right.style.cssText = 'display:flex;gap:0.375rem;flex-shrink:0;';

  const editBtn = document.createElement('button');
  editBtn.textContent = 'Edit';
  editBtn.setAttribute('aria-label', `Edit task "${task.label}"`);
  editBtn.style.cssText = 'padding:0.25rem 0.6rem;background:#e2e4e9;color:#1f2937;border:none;border-radius:0.375rem;font-size:0.75rem;cursor:pointer;font-family:inherit;';
  editBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = task.label;
    input.style.cssText = 'flex:1;border:1px solid #6b65e3;border-radius:0.375rem;padding:0.25rem 0.5rem;font-family:inherit;font-size:0.875rem;outline:none;';
    left.replaceChild(input, span);
    input.focus();

    const saveEdit = () => {
      if (onEdit) {
        onEdit(task.id, input.value);
      } else {
        left.replaceChild(span, input);
      }
    };

    input.addEventListener('blur', saveEdit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { input.removeEventListener('blur', saveEdit); saveEdit(); }
      else if (e.key === 'Escape') { input.removeEventListener('blur', saveEdit); left.replaceChild(span, input); }
    });
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.setAttribute('aria-label', `Delete task "${task.label}"`);
  deleteBtn.style.cssText = 'padding:0.25rem 0.6rem;background:#dd696a;color:white;border:none;border-radius:0.375rem;font-size:0.75rem;cursor:pointer;font-family:inherit;';
  deleteBtn.addEventListener('click', () => onDelete && onDelete(task.id));

  right.appendChild(editBtn);
  right.appendChild(deleteBtn);

  li.appendChild(left);
  li.appendChild(right);
  return li;
}

// ── Module state ───────────────────────────────────────────────────────────

let tasks = [];
let sortOrder = 'default';

function persist() {
  save(STORAGE_KEY, tasks);
}

function render() {
  const list = document.getElementById('todo-list');
  if (!list) return;
  list.innerHTML = '';
  const sorted = sortTasks(tasks, sortOrder);
  for (const task of sorted) {
    list.appendChild(
      renderTask(
        task,
        (id) => {
          tasks = toggleTask(tasks, id);
          persist();
          render();
        },
        (id) => {
          tasks = deleteTask(tasks, id);
          persist();
          render();
        },
        (id, newLabel) => {
          const result = editTask(tasks, id, newLabel);
          if (!result.ok) {
            showError(result.error);
            // Restore original label in DOM
            const li = list.querySelector(`[data-id="${id}"]`);
            if (li) {
              const input = li.querySelector('input[type="text"]');
              if (input) {
                const originalTask = tasks.find((t) => t.id === id);
                const restoredSpan = document.createElement('span');
                restoredSpan.textContent = originalTask ? originalTask.label : '';
                restoredSpan.style.cssText = originalTask && originalTask.completed
                  ? 'text-decoration:line-through;color:#9ca3af;'
                  : 'color:#1f2937;';
                const left = li.querySelector('div');
                if (left) left.replaceChild(restoredSpan, input);
                else li.replaceChild(restoredSpan, input);
              }
            }
            return;
          }
          clearError();
          tasks = result.tasks;
          persist();
          render();
        }
      )
    );
  }
}

function showError(msg) {
  const el = document.getElementById('todo-error');
  if (el) el.textContent = msg;
}

function clearError() {
  const el = document.getElementById('todo-error');
  if (el) el.textContent = '';
}

// ── init ───────────────────────────────────────────────────────────────────

export function init() {
  // Load persisted data
  tasks = load(STORAGE_KEY) || [];
  sortOrder = load(SORT_KEY) || 'default';

  // Wire sort control
  const sortSelect = document.getElementById('todo-sort-select');
  if (sortSelect) {
    sortSelect.value = sortOrder;
    sortSelect.addEventListener('change', () => {
      sortOrder = sortSelect.value;
      save(SORT_KEY, sortOrder);
      render();
    });
  }

  // Wire add form
  const form = document.getElementById('todo-add-form');
  const input = document.getElementById('todo-input');
  if (form && input) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const result = addTask(tasks, input.value);
      if (!result.ok) {
        showError(result.error);
        return;
      }
      clearError();
      tasks = result.tasks;
      persist();
      input.value = '';
      render();
    });
  }

  render();
}

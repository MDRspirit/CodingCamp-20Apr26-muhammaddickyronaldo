# Implementation Plan: Personal Dashboard

## Overview

Build a single-page personal dashboard using plain HTML, CSS, and Vanilla JavaScript (ES modules). All state is persisted via `localStorage`. The implementation proceeds module-by-module, wiring everything together in the final step.

## Tasks

- [x] 1. Set up project structure and shared utilities
  - Create `index.html` with semantic layout sections for each widget and `<script type="module" src="js/app.js">`
  - Create `css/style.css` with base styles, CSS custom properties for light/dark themes, and widget layout
  - Create `js/app.js` that imports each module and calls `init()` on `DOMContentLoaded`
  - Create `js/storage.js` with `load(key)` and `save(key, value)` wrapping `localStorage` in try/catch for graceful degradation
  - _Requirements: 10.1, 10.2, 10.4_

  - [x] 1.1 Write property tests for storage round-trip (Properties 4, 6, 15, 18, 20)
    - **Property 4: Storage round-trip for User_Name** — `fc.string({ minLength: 1 })`
    - **Property 6: Storage round-trip for timer duration** — `fc.integer({ min: 1, max: 90 })`
    - **Property 15: Storage round-trip for tasks** — `fc.array(taskArb)`
    - **Property 18: Storage round-trip for links** — `fc.array(linkArb)`
    - **Property 20: Storage round-trip for theme** — `fc.constantFrom("light", "dark")`
    - **Validates: Requirements 2.4, 2.5, 4.4, 4.5, 5.9, 8.6, 9.3**

- [x] 2. Implement Greeting Widget
  - Create `js/greeting.js` with `init()` that mounts the widget DOM, starts a `setInterval` updating time every 60 seconds
  - Implement `formatTime(date)` returning `"HH:MM"` (zero-padded)
  - Implement `formatDate(date)` returning a human-readable string (e.g., `"Monday, July 14, 2025"`)
  - Implement `getGreetingPhrase(hour)` mapping hour [0–23] to one of the four greeting strings per the time bands in requirements
  - Render the greeting text as the bare phrase initially
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [x] 2.1 Write property test for greeting phrase coverage (Property 1)
    - **Property 1: Greeting phrase covers all hours** — `fc.integer({ min: 0, max: 23 })`
    - **Validates: Requirements 1.3, 1.4, 1.5, 1.6**

  - [x] 2.2 Write unit tests for `formatTime` and `formatDate`
    - Test midnight (00:00), noon (12:00), single-digit minutes
    - Test a known date → expected formatted string
    - _Requirements: 1.1, 1.2_

- [x] 3. Implement Custom Name in Greeting
  - Add a name input field and submit button to the greeting widget DOM
  - On submit: trim the value; if non-empty, save to `pd_userName` and re-render greeting as `"[phrase], [User_Name]!"`; if empty, render bare phrase
  - On `init()`: load `pd_userName` from storage and apply immediately if present
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 3.1 Write property test for greeting with name (Property 2)
    - **Property 2: Greeting phrase with name** — `fc.integer({ min: 0, max: 23 })`, `fc.string({ minLength: 1 })`
    - **Validates: Requirements 2.2**

  - [x] 3.2 Write property test for empty name produces no suffix (Property 3)
    - **Property 3: Empty name produces no suffix** — `fc.constantFrom("", "   ", "\t")`
    - **Validates: Requirements 2.3**

- [x] 4. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement Focus Timer
  - Create `js/timer.js` with `init()` that mounts the timer DOM (MM:SS display, Start/Stop/Reset buttons, duration input)
  - Implement the state machine: Idle → Running → Paused → Idle, and Running → Finished → Idle
  - On Start: begin `setInterval` decrementing `remainingSeconds` each second, update display, disable Start, enable Stop/Reset
  - On Stop: clear interval, enable Start, disable Stop
  - On Reset: clear interval, restore `remainingSeconds` to `durationMinutes * 60`, update display, enable Start, disable Stop
  - On reaching 00:00: clear interval, show visual notification (e.g., flash banner or CSS class), transition to Finished state
  - Load `pd_timerDuration` from storage on init; default to 25 if absent
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [x] 5.1 Write unit tests for timer state transitions
    - Test: start → running, stop → paused, reset → idle, reach 00:00 → finished
    - _Requirements: 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [x] 6. Implement Configurable Timer Duration
  - Wire the duration input: on change/submit, parse integer value; if `1 ≤ d ≤ 90` and timer is not running, update `durationMinutes`, reset display, save to `pd_timerDuration`; otherwise reject and restore previous value
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 6.1 Write property test for timer duration validation (Property 5)
    - **Property 5: Timer duration validation** — `fc.integer({ min: -100, max: 200 })`
    - **Validates: Requirements 4.1, 4.3**

- [x] 7. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement To-Do List core
  - Create `js/todo.js` with `init()` that mounts the task list DOM (input, Add button, task list container, sort control)
  - Implement `isDuplicate(label, tasks, excludeId?)` for case-insensitive matching
  - Implement `renderTask(task)` returning an `<li>` with complete toggle, inline edit, and delete controls; apply strikethrough style to completed tasks
  - On Add: trim label; reject if empty (show inline error); reject if duplicate (show "A task with this name already exists"); otherwise push `{ id, label, completed: false, createdAt: Date.now() }`, persist, re-render
  - On complete toggle: flip `task.completed`, persist, re-render
  - On delete: remove task by id, persist, re-render
  - Load `pd_tasks` from storage on init
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.8, 5.9, 6.1_

  - [x] 8.1 Write property test for adding a task grows the list (Property 7)
    - **Property 7: Adding a task grows the list** — `fc.array(taskArb)`, `fc.string({ minLength: 1 })`
    - **Validates: Requirements 5.2**

  - [x] 8.2 Write property test for empty/whitespace labels rejected (Property 8)
    - **Property 8: Empty or whitespace task labels are rejected** — `fc.stringOf(fc.constantFrom(" ", "\t", "\n"))`
    - **Validates: Requirements 5.3**

  - [x] 8.3 Write property test for completion toggle involution (Property 9)
    - **Property 9: Task completion toggle is an involution** — `taskArb`
    - **Validates: Requirements 5.4**

  - [x] 8.4 Write property test for duplicate add rejected (Property 10)
    - **Property 10: Duplicate task labels are rejected (case-insensitive)** — `fc.array(taskArb, { minLength: 1 })`
    - **Validates: Requirements 6.1**

- [x] 9. Implement To-Do List inline edit and duplicate-edit rejection
  - On edit activate: replace label text with an `<input>` pre-filled with current label
  - On save: trim new label; reject if empty (restore original); reject if duplicate against a *different* task (restore original, show inline error); otherwise update label, persist, re-render
  - _Requirements: 5.5, 5.6, 5.7, 6.2_

  - [x] 9.1 Write property test for duplicate edit rejected (Property 11)
    - **Property 11: Duplicate edit labels are rejected (case-insensitive)** — `fc.array(taskArb, { minLength: 2 })`
    - **Validates: Requirements 6.2**

- [x] 10. Implement Task Sorting
  - Implement `sortTasks(tasks, order)` for `"default"` (by `createdAt` asc), `"incomplete"` (incomplete first), `"completed"` (completed first)
  - Wire sort control: on change, update `pd_sortOrder` in storage, re-render sorted list
  - Load `pd_sortOrder` from storage on init; default to `"default"` if absent
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 10.1 Write property test for sort incomplete first (Property 12)
    - **Property 12: Sort order — incomplete first** — `fc.array(taskArb)`
    - **Validates: Requirements 7.2**

  - [x] 10.2 Write property test for sort completed first (Property 13)
    - **Property 13: Sort order — completed first** — `fc.array(taskArb)`
    - **Validates: Requirements 7.3**

  - [x] 10.3 Write property test for sort default preserves insertion order (Property 14)
    - **Property 14: Sort order — default preserves insertion order** — `fc.array(taskArb)`
    - **Validates: Requirements 7.4**

- [x] 11. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Implement Quick Links panel
  - Create `js/links.js` with `init()` that mounts the links DOM (label input, URL input, Add button, links container)
  - Implement `isValidUrl(url)` using `new URL()` in a try/catch; return `true` if it parses, `false` otherwise
  - On Add: reject if label is empty or URL is invalid (show inline error); otherwise push `{ id, label, url }`, persist to `pd_links`, re-render
  - Render each link as a `<button>` or `<a target="_blank">` that opens the URL in a new tab
  - On delete: remove link by id, persist, re-render
  - Load `pd_links` from storage on init
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [x] 12.1 Write property test for valid URL acceptance (Property 16)
    - **Property 16: Valid URL acceptance** — `fc.webUrl()`
    - **Validates: Requirements 8.2**

  - [x] 12.2 Write property test for invalid URL rejection (Property 17)
    - **Property 17: Invalid URL rejection** — `fc.string()` filtered to non-URLs
    - **Validates: Requirements 8.4**

- [x] 13. Implement Light/Dark Theme toggle
  - Create `js/theme.js` with `init()` and `toggle()`
  - On `init()`: load `pd_theme` from storage; apply `"light"` if absent; set class on `<body>` accordingly
  - On `toggle()`: flip current theme, update `<body>` class, persist to `pd_theme`
  - Wire the toggle button in `index.html` / `app.js` to call `toggle()`
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [x] 13.1 Write property test for theme toggle involution (Property 19)
    - **Property 19: Theme toggle is an involution** — `fc.constantFrom("light", "dark")`
    - **Validates: Requirements 9.2**

- [x] 14. Wire all modules together in app.js
  - Import `greeting`, `timer`, `todo`, `links`, `theme` in `js/app.js`
  - Call each module's `init()` inside a `DOMContentLoaded` listener
  - Verify all widgets render without JS errors and `localStorage` keys are written after interactions
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 15. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property-based tests use [fast-check](https://github.com/dubzzz/fast-check) with a minimum of 100 iterations per property
- Unit tests can use [uvu](https://github.com/lukeed/uvu) or plain Node `assert`
- Each property test file should include a comment: `// Feature: personal-dashboard, Property N: <property text>`
- All 20 correctness properties from the design are covered across the optional test sub-tasks

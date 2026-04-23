# Requirements Document

## Introduction

A personal dashboard web app built with HTML, CSS, and Vanilla JavaScript. It runs entirely in the browser with no backend — all data is persisted via the Local Storage API. The dashboard provides a greeting with the current time and date, a Pomodoro-style focus timer, a to-do list, and a quick links panel. Three optional challenges are included: light/dark mode toggle, custom name in greeting, and configurable Pomodoro duration.

## Glossary

- **Dashboard**: The single-page web application that hosts all widgets.
- **Greeting_Widget**: The UI component that displays the current time, date, and a personalized greeting.
- **Timer**: The Pomodoro-style countdown timer widget.
- **Todo_List**: The UI component that manages the user's task list.
- **Quick_Links**: The UI component that manages and displays user-defined website shortcuts.
- **Storage**: The browser's Local Storage API used for all client-side data persistence.
- **Task**: A single to-do item with a text label and a completion state.
- **Link**: A user-defined shortcut consisting of a label and a URL.
- **Theme**: The visual color scheme of the Dashboard, either light or dark.
- **User_Name**: An optional custom name entered by the user, displayed in the greeting.

---

## Requirements

### Requirement 1: Greeting Widget

**User Story:** As a user, I want to see the current time, date, and a time-appropriate greeting when I open the dashboard, so that I have immediate context about the current moment.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL display the current time in HH:MM format, updated every minute.
2. THE Greeting_Widget SHALL display the current date in a human-readable format (e.g., "Monday, July 14, 2025").
3. WHEN the local time is between 05:00 and 11:59, THE Greeting_Widget SHALL display the greeting "Good morning".
4. WHEN the local time is between 12:00 and 17:59, THE Greeting_Widget SHALL display the greeting "Good afternoon".
5. WHEN the local time is between 18:00 and 21:59, THE Greeting_Widget SHALL display the greeting "Good evening".
6. WHEN the local time is between 22:00 and 04:59, THE Greeting_Widget SHALL display the greeting "Good night".

---

### Requirement 2: Custom Name in Greeting

**User Story:** As a user, I want to enter my name so that the greeting is personalized to me.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL provide an input field for the user to enter a User_Name.
2. WHEN the user submits a non-empty User_Name, THE Greeting_Widget SHALL display the greeting in the format "[greeting], [User_Name]!".
3. WHEN the user submits an empty User_Name, THE Greeting_Widget SHALL display the greeting without a name suffix.
4. WHEN a User_Name is saved, THE Storage SHALL persist the User_Name so that it is restored on the next page load.
5. WHEN the Dashboard loads and a User_Name exists in Storage, THE Greeting_Widget SHALL display the saved User_Name without requiring re-entry.

---

### Requirement 3: Focus Timer

**User Story:** As a user, I want a countdown timer so that I can work in focused Pomodoro sessions.

#### Acceptance Criteria

1. THE Timer SHALL display a countdown in MM:SS format.
2. WHEN the Dashboard loads and no custom duration is saved, THE Timer SHALL initialize to 25 minutes (25:00).
3. WHEN the user activates the Start control, THE Timer SHALL begin counting down one second per second.
4. WHEN the user activates the Stop control, THE Timer SHALL pause the countdown at the current value.
5. WHEN the user activates the Reset control, THE Timer SHALL reset the countdown to the configured duration without starting automatically.
6. WHEN the countdown reaches 00:00, THE Timer SHALL stop automatically and display a visual or audible notification to the user.
7. WHILE the Timer is counting down, THE Timer SHALL disable the Start control and enable the Stop and Reset controls.
8. WHILE the Timer is paused or reset, THE Timer SHALL enable the Start control and disable the Stop control.

---

### Requirement 4: Configurable Pomodoro Duration

**User Story:** As a user, I want to set a custom focus duration so that I can adapt the timer to my preferred work intervals.

#### Acceptance Criteria

1. THE Timer SHALL provide an input that allows the user to set a duration between 1 and 90 minutes (inclusive).
2. WHEN the user sets a valid duration, THE Timer SHALL update the displayed countdown to the new duration immediately if the timer is not running.
3. IF the user enters a duration outside the range of 1 to 90 minutes, THEN THE Timer SHALL reject the input and retain the previous valid duration.
4. WHEN a custom duration is saved, THE Storage SHALL persist the duration so that it is restored on the next page load.
5. WHEN the Dashboard loads and a custom duration exists in Storage, THE Timer SHALL initialize to the saved duration.

---

### Requirement 5: To-Do List

**User Story:** As a user, I want to manage a list of tasks so that I can track what I need to accomplish.

#### Acceptance Criteria

1. THE Todo_List SHALL provide an input field and an Add control for creating new tasks.
2. WHEN the user submits a non-empty task label, THE Todo_List SHALL add the task to the list with a default incomplete state.
3. WHEN the user submits an empty task label, THE Todo_List SHALL reject the input and not add a task.
4. WHEN the user activates the complete control on a Task, THE Todo_List SHALL toggle the Task's completion state and apply a visual distinction (e.g., strikethrough) to completed tasks.
5. WHEN the user activates the edit control on a Task, THE Todo_List SHALL allow the user to modify the Task's label inline.
6. WHEN the user saves an edited Task with a non-empty label, THE Todo_List SHALL update the Task's label.
7. IF the user saves an edited Task with an empty label, THEN THE Todo_List SHALL reject the change and restore the original label.
8. WHEN the user activates the delete control on a Task, THE Todo_List SHALL remove the Task from the list.
9. WHEN the task list changes, THE Storage SHALL persist the full task list so that tasks are restored on the next page load.

---

### Requirement 6: Prevent Duplicate Tasks

**User Story:** As a user, I want the to-do list to prevent duplicate entries so that my task list stays clean and unambiguous.

#### Acceptance Criteria

1. WHEN the user submits a new task label that matches an existing Task label (case-insensitive), THE Todo_List SHALL reject the input and display an inline error message indicating the duplicate.
2. WHEN the user saves an edited Task label that matches a different existing Task label (case-insensitive), THE Todo_List SHALL reject the change, restore the original label, and display an inline error message indicating the duplicate.

---

### Requirement 7: Sort Tasks

**User Story:** As a user, I want to sort my tasks so that I can prioritize completed or incomplete work.

#### Acceptance Criteria

1. THE Todo_List SHALL provide a sort control that allows the user to choose a sort order.
2. WHEN the user selects "Incomplete first", THE Todo_List SHALL display all incomplete tasks before all completed tasks.
3. WHEN the user selects "Completed first", THE Todo_List SHALL display all completed tasks before all incomplete tasks.
4. WHEN the user selects "Default", THE Todo_List SHALL display tasks in the order they were added.
5. WHEN a sort order is selected, THE Storage SHALL persist the selected sort order so that it is restored on the next page load.

---

### Requirement 8: Quick Links

**User Story:** As a user, I want to save and access my favorite websites from the dashboard so that I can navigate quickly without typing URLs.

#### Acceptance Criteria

1. THE Quick_Links SHALL provide input fields for a label and a URL, and an Add control for creating new links.
2. WHEN the user submits a Link with a non-empty label and a valid URL, THE Quick_Links SHALL add the Link as a clickable button.
3. WHEN the user activates a Link button, THE Quick_Links SHALL open the associated URL in a new browser tab.
4. IF the user submits a Link with an empty label or an invalid URL, THEN THE Quick_Links SHALL reject the input and display an inline error message.
5. WHEN the user activates the delete control on a Link, THE Quick_Links SHALL remove the Link from the panel.
6. WHEN the links list changes, THE Storage SHALL persist the full links list so that links are restored on the next page load.

---

### Requirement 9: Light / Dark Mode

**User Story:** As a user, I want to toggle between light and dark themes so that I can use the dashboard comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a toggle control to switch between the light Theme and the dark Theme.
2. WHEN the user activates the theme toggle, THE Dashboard SHALL apply the selected Theme to all UI components immediately without a page reload.
3. WHEN a Theme is selected, THE Storage SHALL persist the Theme preference so that it is restored on the next page load.
4. WHEN the Dashboard loads and no Theme preference exists in Storage, THE Dashboard SHALL apply the light Theme by default.

---

### Requirement 10: File Structure and Compatibility

**User Story:** As a developer, I want the project to follow a clean file structure and run in all modern browsers, so that the codebase is maintainable and accessible to all users.

#### Acceptance Criteria

1. THE Dashboard SHALL be implemented using exactly one HTML file, one CSS file located in a `css/` directory, and one JavaScript file located in a `js/` directory.
2. THE Dashboard SHALL function correctly in the current stable versions of Chrome, Firefox, Edge, and Safari without requiring any build tools or server.
3. THE Dashboard SHALL load and become interactive in under 2 seconds on a standard broadband connection.
4. THE Dashboard SHALL use only the browser Local Storage API for data persistence, with no external network requests for data storage or retrieval.

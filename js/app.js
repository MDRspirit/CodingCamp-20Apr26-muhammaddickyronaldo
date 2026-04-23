/**
 * app.js — entry point.
 * Imports each widget module and calls init() on DOMContentLoaded.
 */
import { init as initGreeting } from './greeting.js';
import { init as initTimer } from './timer.js';
import { init as initTodo } from './todo.js';
import { init as initLinks } from './links.js';
import { init as initTheme } from './theme.js';

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initGreeting();
  initTimer();
  initTodo();
  initLinks();
});

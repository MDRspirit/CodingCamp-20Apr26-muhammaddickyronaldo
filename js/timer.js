/**
 * timer.js — Focus Timer widget
 * Implements a Pomodoro-style countdown timer with state machine:
 *   Idle → Running → Paused → Idle
 *   Running → Finished → Idle
 */

import { load, save } from './storage.js';

const STORAGE_KEY = 'pd_timerDuration';
const DEFAULT_DURATION = 25;
const MIN_DURATION = 1;
const MAX_DURATION = 90;

// ── Pure helpers ─────────────────────────────────────────────────────────────

/**
 * Format a number of seconds as "MM:SS" (zero-padded).
 * @param {number} seconds
 * @returns {string}
 */
export function formatCountdown(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Create the initial timer state.
 * @param {number} durationMinutes
 * @returns {object}
 */
export function createTimerState(durationMinutes) {
  return {
    durationMinutes,
    remainingSeconds: durationMinutes * 60,
    status: 'idle',
    intervalId: null,
  };
}

/**
 * Pure state reducer for timer actions.
 * Note: 'start' and 'tick' actions that involve side-effects (setInterval)
 * accept an optional intervalId parameter for testability.
 *
 * @param {object} state
 * @param {{ type: string, intervalId?: number }} action
 * @returns {object} new state
 */
export function timerReducer(state, action) {
  switch (action.type) {
    case 'start':
      if (state.status === 'idle' || state.status === 'paused') {
        return {
          ...state,
          status: 'running',
          intervalId: action.intervalId ?? state.intervalId,
        };
      }
      return state;

    case 'stop':
      if (state.status === 'running') {
        return {
          ...state,
          status: 'paused',
          intervalId: null,
        };
      }
      return state;

    case 'reset':
      return {
        ...state,
        status: 'idle',
        remainingSeconds: state.durationMinutes * 60,
        intervalId: null,
      };

    case 'tick': {
      if (state.status !== 'running') return state;
      const next = state.remainingSeconds - 1;
      if (next <= 0) {
        return {
          ...state,
          remainingSeconds: 0,
          status: 'finished',
          intervalId: null,
        };
      }
      return { ...state, remainingSeconds: next };
    }

    case 'setDuration':
      if (state.status === 'idle' || state.status === 'paused') {
        const d = action.durationMinutes;
        if (d >= MIN_DURATION && d <= MAX_DURATION) {
          return {
            ...state,
            durationMinutes: d,
            remainingSeconds: d * 60,
          };
        }
      }
      return state;

    default:
      return state;
  }
}

// ── DOM wiring ───────────────────────────────────────────────────────────────

export function init() {
  const displayEl = document.getElementById('timer-display');
  const startBtn = document.getElementById('timer-start');
  const stopBtn = document.getElementById('timer-stop');
  const resetBtn = document.getElementById('timer-reset');
  const durationInput = document.getElementById('timer-duration-input');
  const notificationEl = document.getElementById('timer-notification');

  // Load persisted duration
  const saved = load(STORAGE_KEY);
  const initialDuration =
    typeof saved === 'number' && saved >= MIN_DURATION && saved <= MAX_DURATION
      ? saved
      : DEFAULT_DURATION;

  let state = createTimerState(initialDuration);
  durationInput.value = initialDuration;

  function render() {
    displayEl.textContent = formatCountdown(state.remainingSeconds);

    const isRunning = state.status === 'running';
    const isFinished = state.status === 'finished';

    startBtn.disabled = isRunning || isFinished;
    stopBtn.disabled = !isRunning;
    resetBtn.disabled = false;

    if (state.status === 'finished') {
      notificationEl.textContent = "Time's up! 🎉";
      notificationEl.hidden = false;
      notificationEl.classList.add('flash');
    } else {
      notificationEl.hidden = true;
      notificationEl.classList.remove('flash');
    }
  }

  function clearCurrentInterval() {
    if (state.intervalId !== null) {
      clearInterval(state.intervalId);
    }
  }

  function dispatch(action) {
    clearCurrentInterval();

    if (action.type === 'start') {
      const id = setInterval(() => {
        dispatch({ type: 'tick' });
      }, 1000);
      state = timerReducer(state, { ...action, intervalId: id });
    } else {
      state = timerReducer(state, action);
    }

    render();
  }

  startBtn.addEventListener('click', () => dispatch({ type: 'start' }));
  stopBtn.addEventListener('click', () => dispatch({ type: 'stop' }));
  resetBtn.addEventListener('click', () => dispatch({ type: 'reset' }));

  durationInput.addEventListener('change', () => {
    const val = parseInt(durationInput.value, 10);
    if (!isNaN(val) && val >= MIN_DURATION && val <= MAX_DURATION) {
      state = timerReducer(state, { type: 'setDuration', durationMinutes: val });
      save(STORAGE_KEY, val);
    } else {
      // Restore previous valid value
      durationInput.value = state.durationMinutes;
    }
    render();
  });

  render();
}

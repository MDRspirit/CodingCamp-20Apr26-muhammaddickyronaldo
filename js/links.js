import { load, save } from './storage.js';

const STORAGE_KEY = 'pd_links';

/** @type {Array<{id: string, label: string, url: string}>} */
let links = [];

/**
 * Returns true if the string is a valid URL parseable by new URL().
 * @param {string} url
 * @returns {boolean}
 */
export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function persist() {
  save(STORAGE_KEY, links);
}

function render() {
  const container = document.getElementById('links-list');
  if (!container) return;
  container.innerHTML = '';
  links.forEach(link => {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:relative;display:inline-block;';

    const a = document.createElement('a');
    a.href = link.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = link.label;
    a.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;min-width:100px;height:40px;background:#6b65e3;color:white;text-decoration:none;border-radius:0.5rem;font-size:0.875rem;padding:0 1.5rem;box-shadow:0 1px 2px rgba(0,0,0,0.05);transition:background-color 0.2s;';
    a.addEventListener('mouseenter', () => { a.style.backgroundColor = '#5a54d1'; });
    a.addEventListener('mouseleave', () => { a.style.backgroundColor = '#6b65e3'; });

    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '&times;';
    deleteBtn.setAttribute('aria-label', `Delete link ${link.label}`);
    deleteBtn.style.cssText = 'position:absolute;top:-8px;right:-8px;width:20px;height:20px;background:#5c54c4;color:white;border:none;border-radius:50%;font-size:14px;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transition:opacity 0.2s,background-color 0.2s;z-index:10;';
    deleteBtn.addEventListener('mouseenter', () => { deleteBtn.style.backgroundColor = '#dd696a'; });
    deleteBtn.addEventListener('mouseleave', () => { deleteBtn.style.backgroundColor = '#5c54c4'; });
    deleteBtn.addEventListener('click', () => {
      links = links.filter(l => l.id !== link.id);
      persist();
      render();
    });

    wrapper.addEventListener('mouseenter', () => { deleteBtn.style.opacity = '1'; });
    wrapper.addEventListener('mouseleave', () => { deleteBtn.style.opacity = '0'; });

    wrapper.appendChild(a);
    wrapper.appendChild(deleteBtn);
    container.appendChild(wrapper);
  });
}

function showError(msg) {
  const el = document.getElementById('links-error');
  if (el) el.textContent = msg;
}

function clearError() {
  const el = document.getElementById('links-error');
  if (el) el.textContent = '';
}

export function init() {
  const saved = load(STORAGE_KEY);
  if (Array.isArray(saved)) links = saved;

  const form = document.getElementById('links-add-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const labelInput = document.getElementById('links-label-input');
    const urlInput = document.getElementById('links-url-input');

    const label = labelInput.value.trim();
    const url = urlInput.value.trim();

    // Auto-prefix https:// if missing protocol
    const normalizedUrl = url && !url.startsWith('http://') && !url.startsWith('https://')
      ? 'https://' + url
      : url;

    if (!label || !isValidUrl(normalizedUrl)) {
      showError('Please enter a valid label and URL.');
      return;
    }

    clearError();
    links.push({ id: crypto.randomUUID(), label, url: normalizedUrl });
    persist();
    render();

    labelInput.value = '';
    urlInput.value = '';
  });

  render();
}

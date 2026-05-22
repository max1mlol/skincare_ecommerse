/** Screen-reader announcements for dynamic UI updates (WCAG aria-live). */

let politeEl = null;
let assertiveEl = null;

export function registerLiveRegions({ polite, assertive }) {
  politeEl = polite;
  assertiveEl = assertive;
}

export function announce(message, priority = 'polite') {
  if (!message) return;
  const el = priority === 'assertive' ? assertiveEl : politeEl;
  if (!el) return;
  el.textContent = '';
  requestAnimationFrame(() => {
    el.textContent = message;
  });
}

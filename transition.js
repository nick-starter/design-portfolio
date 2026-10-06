/* ==================================================================
   Page transition — shared by index + project pages.
   An ink veil slides across the screen between pages: it covers
   from the right when a link is followed, and the arriving page
   slides it back off to the left.
================================================================= */

const $ = (s, r = document) => r.querySelector(s);
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Clear the entrance veil once it has slid off the screen. */
const veil = $('.pg-veil');
if (veil) {
  const done = () => veil.remove();
  veil.addEventListener('animationend', done, { once: true });
  setTimeout(done, 900);
}

let busy = false;
function cover(href) {
  busy = true;
  if (reduced) { location.href = href; return; }
  const v = document.createElement('div');
  v.className = 'pg-veil pg-veil--cover';
  v.setAttribute('aria-hidden', 'true');
  document.body.appendChild(v);
  const go = () => { location.href = href; };
  v.addEventListener('animationend', go, { once: true });
  setTimeout(go, 700); /* safety net if animationend never fires */
}

/* Intercept outbound links that match `selector` and play the
   cover before navigating. `opts.skip()` can veto (e.g. a
   drag in progress on the gallery track). */
export function armPageTransition(selector, opts = {}) {
  document.addEventListener('click', (e) => {
    if (busy) return;
    if (opts.skip && opts.skip()) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest(selector);
    if (!a) return;
    e.preventDefault();
    cover(a.href);
  });
}

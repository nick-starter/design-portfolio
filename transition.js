/* ==================================================================
   Page transition — shared by index + project pages.
   An ink veil slides across the screen between pages: it covers
   from the right when a link is followed, and the arriving page
   slides it back off to the left.
================================================================= */

import { PROJECTS } from './projects.js?v=32';

const $ = (s, r = document) => r.querySelector(s);
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Clear the entrance veil once it has slid off the screen. When the
   index is arriving back from a project, the veil waits until
   landFromProject() has put the project's card in view (or, where the
   browser runs the page-slide view transition, is hidden outright). */
const veil = $('.pg-veil');
if (veil) {
  const done = () => veil.remove();
  const arm = () => {
    veil.addEventListener('animationend', done, { once: true });
    setTimeout(done, 900);
  };
  if (document.documentElement.classList.contains('pj-back')) addEventListener('pj-landed', arm, { once: true });
  else arm();
}

/* Clean URLs: the index is "/", each project lives at "/<id>"
   (a generated <id>.html, see scripts/build-pages.mjs). */
export const projectUrl = (id) => `/${id}`;
export function slugOf(u) {
  try {
    const url = new URL(u, location.href);
    if (url.origin !== location.origin) return null;
    const s = url.pathname.replace(/^\/+|\/+$/g, '').replace(/\.html$/, '');
    if (s === 'project') return url.searchParams.get('id') || url.searchParams.get('p') || '';
    return s;
  } catch { return null; }
}
const isIndexUrl = (u) => { const s = slugOf(u); return s === '' || s === 'index'; };
const onProject = document.documentElement.dataset.page === 'project';

/* Cross-document view transitions (styles.css opts both pages in)
   are only used for project → index: the page slide run by the
   index's head script. Every other navigation has its own
   transition, so the browser's default cross-fade is skipped. */
/* The card expand is the other exception: its view transition keeps
   a snapshot of this page (the clone sitting on the project's hero
   rect) on screen until the project page has its hero decoded and
   calls skipTransition() (see settleArrival), so there's no frame of
   bare ink or unfilled page in between. */
let expanding = false;
addEventListener('pageswap', (e) => {
  if (!e.viewTransition) return;
  const to = e.activation && e.activation.entry && e.activation.entry.url;
  if (expanding) return;
  if (!(onProject && to && isIndexUrl(to))) e.viewTransition.skipTransition();
});
/* Tell the index which project it is coming back from (covers
   browsers without the Navigation API's activation info). */
if (onProject) {
  addEventListener('pagehide', () => {
    try {
      sessionStorage.setItem('pj-left', JSON.stringify({
        id: slugOf(location.href) || '', t: Date.now(),
      }));
    } catch { /* noop */ }
  });
}

let busy = false;

/* Coming back via the back button restores this page from the
   bfcache with the outgoing veil/expander still on screen. */
addEventListener('pageshow', (e) => {
  if (!e.persisted) return;
  busy = false;
  expanding = false;
  document.querySelectorAll('.pg-veil--cover, .pg-expand').forEach((el) => el.remove());
});

/* ---------------- card → project image ----------------
   A fixed clone of the project image grows from a gallery card's
   rect to where the first image tile on the project page is
   expected to sit; the project page then starts its tile on the
   clone's final rect and settles it (inline script in the page head),
   so a wrong guess is harmless. (The way back is a whole-page slide,
   see leaveProject.) */
const EXPAND_KEY = 'pj-expand';
const EASE = 'cubic-bezier(0.76, 0, 0.24, 1)';
const DUR = 700;
const TILE_RADIUS = '0px';

/* Project title: the company logo (white, in a fixed-height box set
   in CSS, so the header is the same height before and after the
   image loads) or, for a project without one, the name as text.
   Shared by the project page and tileGuess's measuring copy. */
export function fillTitle(h1, p) {
  if (!p.logo) { h1.textContent = p.name; return; }
  const img = document.createElement('img');
  img.src = p.logo;
  img.alt = p.name;
  img.decoding = 'async';
  h1.classList.add('pj-logo');
  if (p.logoScale) h1.style.setProperty('--pj-logo-s', p.logoScale);
  h1.replaceChildren(img);
}

/* Where the project page's lead image sits: full-bleed at the top
   of the page, so the window's width by the lead tile's CSS height
   (the window height, or 4:5 on portrait phones). Exact if that project
   has been opened at this window size before (project.js records it);
   otherwise measured from an off-screen tile with the same classes. */
function tileGuess(id) {
  const W = document.documentElement.clientWidth;
  try {
    const seen = JSON.parse(sessionStorage.getItem(`pj-tile3:${id}:${W}x${innerHeight}`) || 'null');
    if (seen) return seen;
  } catch { /* noop */ }
  const probe = document.createElement('figure');
  probe.className = 'pj-tile pj-tile--hero';
  probe.setAttribute('aria-hidden', 'true');
  Object.assign(probe.style, {
    position: 'absolute', left: '0', top: '0', width: `${W}px`, margin: '0',
    visibility: 'hidden', pointerEvents: 'none',
  });
  document.body.appendChild(probe);
  const height = probe.getBoundingClientRect().height || innerHeight;
  probe.remove();
  return { left: 0, top: 0, width: W, height };
}
const box = (r) => ({ left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });

/* A project's crop for its full-bleed lead image (`heroPos`). */
/* `heroPosNarrow` overrides it where the hero is the 9:10 crop. */
const narrowHero = () => matchMedia('(max-aspect-ratio: 9 / 10)').matches;
export const heroPos = (id) => {
  const p = PROJECTS.find((x) => x.id === id) || {};
  return (narrowHero() && p.heroPosNarrow) || p.heroPos || '50% 50%';
};

function makeClone(bg, rect, pos) {
  const backdrop = document.createElement('div');
  backdrop.className = 'pg-expand pg-expand-bg';
  const el = document.createElement('div');
  el.className = 'pg-expand';
  el.innerHTML = '<div class="pg-expand-img"></div>';
  el.firstChild.style.backgroundImage = bg;
  if (pos) el.firstChild.style.backgroundPosition = pos;
  Object.assign(el.style, box(rect));
  [backdrop, el].forEach((n) => n.setAttribute('aria-hidden', 'true'));
  document.body.append(backdrop, el);
  return { el, backdrop };
}

function expand(href, from) {
  busy = true;
  expanding = true;
  const r = from.getBoundingClientRect();
  const id = slugOf(href) || '';
  const to = tileGuess(id);
  const bg = getComputedStyle(from).backgroundImage;
  /* The clone starts on the card's crop (`cardPos`) and pans to the
     hero's as it grows. */
  const fromPos = getComputedStyle(from).backgroundPosition;
  const toPos = heroPos(id);
  const { el, backdrop } = makeClone(bg, r, fromPos);
  if (fromPos !== toPos) {
    el.firstChild.animate([{ backgroundPosition: fromPos }, { backgroundPosition: toPos }], { duration: DUR, easing: EASE, fill: 'forwards' });
  }
  /* The project's lead image (may differ from the card's) starts
     loading now, so the project page finds it in the cache. */
  const p = PROJECTS.find((x) => x.id === id);
  const lead = p && (p.lead || p.image);
  if (lead) { const warm = new Image(); warm.src = lead; }
  el.animate(
    [{ ...box(r), borderRadius: '64px' }, { ...box(to), borderRadius: TILE_RADIUS }],
    { duration: DUR, easing: EASE, fill: 'forwards' }
  );
  /* Ink fades in behind the clone so the page beneath is gone
     by the time the project page paints. */
  backdrop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: DUR * 0.8, easing: 'ease-out', fill: 'forwards' });

  let gone = false;
  const go = () => {
    if (gone) return;
    gone = true;
    const image = (bg.match(/url\(["']?(.*?)["']?\)/) || [])[1] || '';
    try {
      sessionStorage.setItem(EXPAND_KEY, JSON.stringify({
        id,
        image,
        rect: to,
        pos: heroPos(id),
      }));
    } catch { /* noop */ }
    location.href = href;
  };
  setTimeout(go, DUR + 20);
}

/* Project page → index (Close / Escape). The whole project page
   slides off to the right, uncovering the index underneath, the
   mirror of the veil that covers from the right on the way in.
   Where the index is the previous history entry this is a real
   history.back(), so the browser restores the index exactly where
   it was left (and the browser's own Back button gets the same
   slide). The slide itself is a cross-document view transition
   run by the index's head script. Browsers without one slide
   this page out over ink here, then load the index. */
const hasPageVT = 'PageRevealEvent' in window;
function prevIsIndex() {
  try {
    if (window.navigation && navigation.entries) {
      const i = navigation.currentEntry.index;
      return i > 0 && isIndexUrl(navigation.entries()[i - 1].url);
    }
    return history.length > 1 && isIndexUrl(document.referrer);
  } catch { return false; }
}
export function leaveProject(href, id) {
  if (busy) return;
  busy = true;
  const back = prevIsIndex();
  if (!back) {
    try { sessionStorage.setItem('pj-close', id || ''); } catch { /* noop */ }
  }
  const go = () => { if (back) history.back(); else location.href = href; };
  if (reduced || hasPageVT) { go(); return; }
  const html = document.documentElement;
  html.style.overflowX = 'clip';
  html.animate(
    [{ transform: 'translateX(0)' }, { transform: 'translateX(100%)' }],
    { duration: 520, easing: EASE, fill: 'forwards' }
  ).finished.then(go, go);
}
/* Back on this page from the bfcache: undo the fallback slide. */
addEventListener('pageshow', (e) => {
  if (!e.persisted) return;
  document.documentElement.getAnimations().forEach((a) => a.cancel());
  document.documentElement.style.overflowX = '';
});

/* Index side of the trip back. The index's head script marks
   html.pj-back with the project's id when the card has to be put in
   view (after a Close with no history to go back to); `findCard`
   does that. After a Back that reloaded the index, `restore` puts
   the gallery back where it was. Then the waiting page slide (or, in
   the fallback, the entrance veil) is released. */
export async function landFromProject(findCard, restore) {
  const html = document.documentElement;
  const id = html.dataset.pjPlace;
  try {
    if (id) await findCard(id);
    else if (html.dataset.pjRestore && restore) await restore();
  } catch { /* noop */ }
  window.__pjLanded = true;
  html.classList.remove('pj-back');
  dispatchEvent(new Event('pj-landed'));
}

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
   drag in progress on the gallery track); `opts.expandFrom(a)`
   can return an element to grow into the project hero instead. */
export function armPageTransition(selector, opts = {}) {
  document.addEventListener('click', (e) => {
    if (busy) return;
    if (opts.skip && opts.skip()) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest(selector);
    if (!a) return;
    e.preventDefault();
    const from = !reduced && opts.expandFrom && opts.expandFrom(a);
    if (from) expand(a.href, from);
    else cover(a.href);
  });
}

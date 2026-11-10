/* ==================================================================
   Page transition — shared by index + project pages.
   An ink veil slides across the screen between pages: it covers
   from the right when a link is followed, and the arriving page
   slides it back off to the left.
================================================================= */

import { PROJECTS } from './projects.js?v=2';

const $ = (s, r = document) => r.querySelector(s);
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Clear the entrance veil once it has slid off the screen. When the
   index is arriving from a project Close, the veil is holding the
   hero image instead and landFromProject() takes it down. */
const veil = $('.pg-veil');
if (veil && !document.documentElement.classList.contains('from-project')) {
  const done = () => veil.remove();
  veil.addEventListener('animationend', done, { once: true });
  setTimeout(done, 900);
}

let busy = false;

/* Coming back via the back button restores this page from the
   bfcache with the outgoing veil/expander still on screen. */
addEventListener('pageshow', (e) => {
  if (!e.persisted) return;
  busy = false;
  document.querySelectorAll('.pg-veil--cover, .pg-expand').forEach((el) => el.remove());
});

/* ---------------- card ⇄ project image ----------------
   A fixed clone of the project image moves between a gallery
   card's rect and the first image tile on the project page.
   Expand: card → where that tile is expected to sit; the project
   page then starts its tile on the clone's final rect and settles
   it (inline script in project.html), so a wrong guess is harmless.
   Close:  the project page fades to ink around the tile, then the
   index opens holding the image on that same rect and shrinks it
   into the card. */
const EXPAND_KEY = 'pj-expand';
const COLLAPSE_KEY = 'pj-collapse';
const EASE = 'cubic-bezier(0.76, 0, 0.24, 1)';
const DUR = 700;
const TILE_RADIUS = '2px';

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

/* Where the project page's lead image sits. Exact if that project
   has been opened at this window size before (project.js records
   it); otherwise measured from an off-screen copy of the project
   header (same logo or title, headline and CSS), since the tile sits right
   under it: full width less the page edge, 3:2. */
function tileGuess(id) {
  const W = document.documentElement.clientWidth;
  try {
    const seen = JSON.parse(sessionStorage.getItem(`pj-tile2:${id}:${W}x${innerHeight}`) || 'null');
    if (seen) return seen;
  } catch { /* noop */ }
  const p = PROJECTS.find((x) => x.id === id) || PROJECTS[0];
  const head = document.createElement('header');
  head.className = 'pj-head';
  head.setAttribute('aria-hidden', 'true');
  Object.assign(head.style, {
    position: 'absolute', left: '0', top: '0', width: '100%', boxSizing: 'border-box',
    paddingInline: matchMedia('(max-width: 900px)').matches ? 'var(--gut)' : '40px',
    visibility: 'hidden', pointerEvents: 'none',
  });
  head.innerHTML = '<h1 class="disp"></h1><p class="pj-headline"></p>';
  fillTitle(head.firstChild, p);
  head.lastChild.textContent = p.headline || p.blurb;
  document.body.appendChild(head);
  const r = head.getBoundingClientRect();
  const g = parseFloat(getComputedStyle(head).paddingLeft) || 0;
  head.remove();
  const width = r.width - 2 * g;
  return { left: g, top: r.height, width, height: (width * 2) / 3 };
}
const box = (r) => ({ left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
const plain = (r) => ({ left: r.left, top: r.top, width: r.width, height: r.height });

function makeClone(bg, rect) {
  const backdrop = document.createElement('div');
  backdrop.className = 'pg-expand pg-expand-bg';
  const el = document.createElement('div');
  el.className = 'pg-expand';
  el.innerHTML = '<div class="pg-expand-img"></div>';
  el.firstChild.style.backgroundImage = bg;
  Object.assign(el.style, box(rect));
  [backdrop, el].forEach((n) => n.setAttribute('aria-hidden', 'true'));
  document.body.append(backdrop, el);
  return { el, backdrop };
}

function expand(href, from) {
  busy = true;
  const r = from.getBoundingClientRect();
  const id = new URL(href, location.href).searchParams.get('id') || '';
  const to = tileGuess(id);
  const bg = getComputedStyle(from).backgroundImage;
  const { el, backdrop } = makeClone(bg, r);
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
      }));
    } catch { /* noop */ }
    location.href = href;
  };
  setTimeout(go, DUR + 20);
}

/* Project page → index. `tile` is the project's first image tile;
   if the page is scrolled, the image first glides back to where
   the tile sits at the top of the page. */
export function leaveProject(href, id, image, tile) {
  if (busy) return;
  if (reduced || !image || !tile) { location.href = href; return; }
  busy = true;
  const r = tile.getBoundingClientRect();
  const home = { left: r.left, top: r.top + scrollY, width: r.width, height: r.height };
  const { el, backdrop } = makeClone(`url("${image}")`, r);
  el.style.borderRadius = TILE_RADIUS;
  const out = 380;
  backdrop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: out, easing: 'ease-out', fill: 'forwards' });
  el.animate([box(r), box(home)], { duration: out, easing: EASE, fill: 'forwards' });
  setTimeout(() => {
    try { sessionStorage.setItem(COLLAPSE_KEY, JSON.stringify({ id, image, rect: plain(home) })); } catch { /* noop */ }
    location.href = href;
  }, out + 20);
}

/* Index side of Close. index.html's head script has already set
   html.from-project and made the veil show the image on the rect
   the project page left it at, so the first paint matches.
   `findCard` puts the project's card in view and returns its cover. */
export async function landFromProject(findCard) {
  const html = document.documentElement;
  if (!html.classList.contains('from-project')) return;
  const id = html.dataset.pjId;
  const image = getComputedStyle(html).getPropertyValue('--pj-img').trim();
  let start = tileGuess(id);
  try { if (html.dataset.pjRect) start = JSON.parse(html.dataset.pjRect); } catch { /* noop */ }
  const card = await findCard(id);
  const { el, backdrop } = makeClone(image, start);
  el.style.borderRadius = TILE_RADIUS;
  $('.pg-veil--reveal')?.remove();
  html.classList.remove('from-project');

  const done = () => { el.remove(); backdrop.remove(); };
  if (!card) {
    el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: 'forwards' });
    backdrop.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: 'forwards' }).finished.then(done);
    return;
  }
  const r = card.getBoundingClientRect();
  el.animate(
    [{ ...box(start), borderRadius: TILE_RADIUS }, { ...box(r), borderRadius: '64px' }],
    { duration: DUR, easing: EASE, fill: 'forwards' }
  ).finished.then(done);
  backdrop.animate([{ opacity: 1 }, { opacity: 0 }], { duration: DUR * 0.8, delay: DUR * 0.2, easing: 'ease-in', fill: 'forwards' });
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

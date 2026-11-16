/* ==================================================================
   Nick Child — individual project page
   Reads the project id from the URL ("/<id>") and renders the project's visual area,
   case study and prev/next navigation.
================================================================== */

import { PROJECTS } from './projects.js?v=59';
import { armPageTransition, leaveProject, fillTitle, projectUrl, slugOf } from './transition.js?v=65';

const $ = (s, r = document) => r.querySelector(s);

const wanted = slugOf(location.href);
let index = PROJECTS.findIndex((p) => p.id === wanted);
if (index < 0) index = 0;

const p = PROJECTS[index];
const total = PROJECTS.length;
const prev = PROJECTS[(index - 1 + total) % total];
const next = PROJECTS[(index + 1) % total];

/* ---------------- document head ---------------- */
document.title = `${p.name} | Nick Child`;
const md = document.querySelector('meta[name="description"]');
if (md) md.setAttribute('content', `${p.name}: ${p.blurb}`);

/* ---------------- header + lead image ---------------- */
fillTitle($('#pjName'), p);
$('#pjHeadline').textContent = p.headline || p.blurb;
const cover = $('#pjCover');
/* `lead` overrides the gallery thumbnail as the project page's lead
   image; without it the thumbnail image is used for both. */
const leadImage = p.lead || p.image;
if (leadImage) {
  cover.src = leadImage;
  cover.alt = `${p.name} cover`;
}
/* Crop of the full-bleed lead image (CSS object-position). */
if (p.heroPos) document.documentElement.style.setProperty('--pj-pos', p.heroPos);
if (p.heroPosNarrow) document.documentElement.style.setProperty('--pj-pos-narrow', p.heroPosNarrow);
/* Client logo, white, at the bottom left of the lead image. */
if (p.logo) {
  const mark = document.createElement('img');
  mark.className = 'pj-hero-logo';
  mark.src = p.logo;
  mark.alt = `${p.name} logo`;
  if (p.logoScale) mark.style.setProperty('--pj-logo-s', p.logoScale);
  $('#pjHero').appendChild(mark);
}

/* Card expand hand-off: the lead image is full-bleed at the top of the
   page, so its spot doesn't depend on the header any more; once the web
   fonts are in and the image is decoded (or 1.2s), start the tile where
   the card's clone finished, drop the held homepage frame and let it
   settle. */
/* Logo + Close fade in: 150ms after the hero lands, or 250ms after the
   hero has decoded on a direct load (1s cap). */
const showChrome = (delay) => setTimeout(() => document.documentElement.classList.remove('pj-chrome-wait'), delay);
(function settleArrival() {
  const a = window.__pjArrive;
  const tile = $('#pjHero');
  if (!a || !a.rect || !tile) {
    Promise.race([
      cover.decode ? cover.decode().catch(() => {}) : null,
      new Promise((res) => setTimeout(res, 1000)),
    ]).then(() => showChrome(250));
    return;
  }
  const run = () => {
    if (tile.dataset.settled) return;
    tile.dataset.settled = '1';
    const r = tile.getBoundingClientRect();
    const f = a.rect;
    if (r.width && r.height) {
      tile.style.transformOrigin = '0 0';
      tile.style.transform = `translate(${f.left - r.left}px,${f.top - r.top}px) scale(${f.width / r.width},${f.height / r.height})`;
    }
    tile.style.visibility = 'visible';
    $('.pg-veil--reveal')?.remove();
    /* Drop the held homepage frame now the tile is on the clone's rect. */
    try { window.__pjVT?.skipTransition(); } catch { /* noop */ }
    requestAnimationFrame(() => requestAnimationFrame(() => {
      tile.style.transition = 'transform .5s cubic-bezier(.2,.7,.2,1)';
      tile.style.transform = 'none';
      showChrome(500 + 150);
    }));
  };
  /* Wait for the fonts and for the hero to be decoded, so the tile is
     never shown (and the veil never lifted) on a blank image. */
  const decoded = Promise.all([
    cover.decode ? cover.decode().catch(() => {}) : null,
    window.__pjArriveDecode,
  ]);
  Promise.race([
    Promise.all([document.fonts?.ready, decoded]),
    new Promise((res) => setTimeout(res, 1200)),
  ]).then(() => requestAnimationFrame(run));
})();

/* ---------------- details ---------------- */
/* Three facts: Role, Contribution,
   Platform. Platform is the project's `platform`, or else the
   platform-like tag (Web / Mobile / Digital); the remaining tags
   are the contribution. (Duration/year removed, Nov 2026.) */
const PLATFORMS = ['Web', 'Mobile', 'Digital'];
const platform = p.platform || p.tags.find((t) => PLATFORMS.includes(t)) || 'Web';
const contribution = p.tags.filter((t) => t !== platform).join(', ');
$('#pjFacts').innerHTML = `
  <div><dt>Role:</dt><dd>${p.role}</dd></div>
  <div><dt>Contribution:</dt><dd>${contribution}</dd></div>
  <div><dt>Platform:</dt><dd>${platform}</dd></div>`;
/* Body text: the project's written story (challenge, approach,
   outcome) as running paragraphs, or the standard approach paragraph
   for projects that don't have one yet. */
const bodyParas = p.body
  ? p.body
  : p.story
  ? [...p.story.challenge, ...p.story.approach, ...p.story.outcome]
  : [`Started with the constraint, not the canvas, mapping the states the product actually
    needed before drawing a single screen. Tokens, components and responsive rules were
    authored alongside the interface so the design survived implementation across phone,
    tablet and web, and motion was designed as part of the interaction rather than added
    afterwards.`];
$('#pjBody').innerHTML = bodyParas.map((t) => `<p>${t}</p>`).join('');

/* ---------------- gallery ---------------- */
/* Only real images are shown: `p.gallery` lists a path or `{ src, alt }`
   per tile; empty slots and placeholder art are skipped. Tiles are full
   width unless an item sets `half: true`. */
const galleryEl = $('#pjGallery');
const escAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const galleryItems = (p.gallery || []).filter((item) => {
  const src = item && (item.src || item);
  return typeof src === 'string' && !/placeholder/i.test(src);
});
galleryEl.innerHTML = galleryItems.map((item, i) => {
  const src = item.src || item;
  const kind = item.half ? 'half' : 'full';
  const alt = item.alt || `${p.name}, image ${i + 1}`;
  return `<figure class="pj-tile pj-slot--${kind}">
    <img src="${escAttr(src)}" alt="${escAttr(alt)}" loading="lazy" />
  </figure>`;
}).join('');
galleryEl.hidden = galleryItems.length === 0;

/* Remember where the lead image sits on this project at this window
   size, so the gallery card's expand can aim straight at it. Measured
   from layout offsets (immune to the arrival transform) once the web
   fonts are in, since the header's height depends on them. */
function rememberTile() {
  const tile = $('#pjHero');
  let left = 0;
  let top = 0;
  for (let el = tile; el; el = el.offsetParent) { left += el.offsetLeft; top += el.offsetTop; }
  try {
    sessionStorage.setItem(
      `pj-tile3:${p.id}:${document.documentElement.clientWidth}x${innerHeight}`,
      JSON.stringify({ left, top, width: tile.offsetWidth, height: tile.offsetHeight })
    );
  } catch { /* noop */ }
}
(document.fonts?.ready || Promise.resolve()).then(() => requestAnimationFrame(() => requestAnimationFrame(rememberTile)));
addEventListener('load', () => setTimeout(rememberTile, 300));
addEventListener('resize', () => setTimeout(rememberTile, 200), { passive: true });

/* ---------------- prev / next ---------------- */
const prevA = $('#pjPrev');
prevA.href = projectUrl(prev.id);
prevA.innerHTML = `<span class="arr">←</span><span class="d-pn-t"><span class="mono">Previous project</span><span class="d-pn-name">${prev.name}</span></span>`;

const nextA = $('#pjNext');
nextA.href = projectUrl(next.id);
nextA.innerHTML = `<span class="d-pn-t"><span class="mono">Next project</span><span class="d-pn-name">${next.name}</span></span><span class="arr">→</span>`;

addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') location.href = prevA.href;
  if (e.key === 'ArrowRight') location.href = nextA.href;
  /* Down arrow from the hero jumps to the section below it. */
  if (e.key === 'ArrowDown' && !e.repeat && !e.altKey && !e.metaKey && !e.ctrlKey) {
    const hero = $('#pjHero');
    const head = document.querySelector('.pj-head');
    if (hero && head && scrollY < hero.offsetHeight * 0.5 && !document.querySelector('.mm.is-open, dialog[open]')) {
      e.preventDefault();
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      scrollTo({ top: head.getBoundingClientRect().top + scrollY, behavior: reduce ? 'auto' : 'smooth' });
      return;
    }
  }
  /* Escape = Close, via click() so it plays the same page transition.
     Ignore key-repeat and focused fields; if an overlay (mobile menu,
     dialog) already handled Escape, leave the project open. */
  if (e.key !== 'Escape' || e.repeat || e.defaultPrevented) return;
  const t = e.target;
  if (t instanceof HTMLElement && (
    t.closest('input, textarea, select, [contenteditable="true"]') ||
    t.isContentEditable
  )) return;
  if (document.querySelector('.mm.is-open, dialog[open]')) return;
  const close = $('.d-close');
  if (!close) return;
  e.preventDefault();
  close.click();
});

/* ---------------- misc ---------------- */
$('#year').textContent = new Date().getFullYear();

/* ---------------- page transition ---------------- */
/* Close, logo and prev/next all glide behind
   the ink veil (the entrance veil is cleared by
   transition.js itself). */
armPageTransition('a.d-pn, a.logo');

/* Close (and Escape) slide the whole page away to the index (see
   leaveProject). Stopping propagation keeps the veil handler above
   out of it. */
$('.d-close').addEventListener('click', (e) => {
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  e.stopPropagation();
  leaveProject('/', p.id);
});

/* QA handle */
window.__project = { projects: PROJECTS, index, project: p };

/* ==================================================================
   Nicholas Child — folio interactions
   Work gallery, case-study overlay, method step-through, nav spy.
================================================================== */

import { PROJECTS, projectCover } from './projects.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------------- data ---------------- */
const JOBS = [
  { yr: 'Now', co: 'Bupa', desc: 'Senior Visual & Interaction Designer · 2023 – Present' },
  { yr: '2022', co: 'Super Retail Group', desc: 'UI Designer — Rebel Sport website · 2022 – 2023' },
  { yr: '2020', co: 'Telstra', desc: "Visual Designer — activation & recharge, Telstra 'Able' design system · 2020 – 2022" },
  { yr: '2015', co: 'TBWA \\ Tequila', desc: 'Senior Digital Designer — Nissan, ANZ, Medibank · 2015 – 2018' },
  { yr: '2012', co: 'JWT', desc: 'Digital Creative Lead · 2012 – 2015' },
  { yr: '2008', co: 'WCRS', desc: 'Senior Digital Designer · 2008 – 2012' },
  { yr: '2005', co: 'Publicis', desc: 'Digital Designer · 2005 – 2008' },
  { yr: '2005', co: 'Staffordshire University', desc: 'BA Hons (First Class) — Interactive Multimedia' },
];

const METHOD = [
  { t: 'Research & discovery', d: 'Start with the problem, the audience and the constraint. Interviews, analytics and competitive review before any pixels.' },
  { t: 'Concept & visual direction', d: 'Explore the widest range quickly, then commit to a direction with a clear point of view and the craft to sell it.' },
  { t: 'Interaction & motion', d: 'Prototype the flow in Figma and Rive. Motion is designed with the interface, never layered on after the fact.' },
  { t: 'Systems & handover', d: 'Semantic tokens, component variants and specs authored so the design survives build across web and mobile.' },
];

/* ---------------- cover cache + placement ---------------- */
const COVER_SIZE = 900;
const coverCache = new Map();

function coverSource(p) {
  if (!coverCache.has(p.id)) coverCache.set(p.id, projectCover(p, COVER_SIZE));
  return coverCache.get(p.id);
}

function coverEl(p) {
  const src = coverSource(p);
  const c = document.createElement('canvas');
  c.width = src.width;
  c.height = src.height;
  c.getContext('2d').drawImage(src, 0, 0);
  c.style.width = '100%';
  c.style.height = '100%';
  c.style.display = 'block';
  return c;
}

function fillSlot(el, p) {
  if (!el) return;
  el.appendChild(coverEl(p));
}

/* ---------------- hero + feature slots ---------------- */
fillSlot($('#heroSlot'), PROJECTS[0]);
fillSlot($('#aboutSlot'), PROJECTS[1]);
fillSlot($('#expSlot'), PROJECTS[2]);
fillSlot($('#cSlot1'), PROJECTS[0]);
fillSlot($('#cSlot2'), PROJECTS[2]);
fillSlot($('#cSlot3'), PROJECTS[4]);

const mObjects = $('#mObjects');
if (mObjects) {
  fillSlot($('[data-slot="big"]', mObjects), PROJECTS[3]);
  fillSlot($('[data-slot="tl"]', mObjects), PROJECTS[4]);
  fillSlot($('[data-slot="br"]', mObjects), PROJECTS[5]);
}

/* ---------------- work gallery ---------------- */
const track = $('#track');
const workIndex = $('#workIndex');
const workTotal = $('#workTotal');

function projectCardMarkup(p, i) {
  const n = String(i + 1).padStart(2, '0');
  return `
    <article class="proj">
      <button class="proj-open" data-i="${i}" aria-label="Open ${p.name} case study">
        <span class="cover"><span class="open-tag">Open case study</span></span>
      </button>
      <div class="proj-meta">
        <span class="mono n">${n}</span>
        <h3>${p.name}</h3>
        <span class="d mono">${p.role} · ${p.year}</span>
      </div>
    </article>`;
}

track.innerHTML =
  PROJECTS.map(projectCardMarkup).join('') +
  `<article class="proj end">
     <h3>Want the full story?</h3>
     <p class="mono">6 selected projects. Each one shipped to real users.</p>
     <a class="btn" href="#contact">Start a project</a>
   </article>`;

$$('.proj:not(.end)').forEach((card, i) => {
  fillSlot($('.cover', card), PROJECTS[i]);
});

if (workTotal) workTotal.textContent = String(PROJECTS.length).padStart(2, '0');

let workRaf = 0;
function syncWorkIndex() {
  const cards = $$('.proj:not(.end)', track);
  if (!cards.length || !workIndex) return;
  const left = track.scrollLeft;
  let best = 0;
  let bestDist = Infinity;
  cards.forEach((c, i) => {
    const d = Math.abs(c.offsetLeft - track.offsetLeft - left);
    if (d < bestDist) { bestDist = d; best = i; }
  });
  workIndex.textContent = String(best + 1).padStart(2, '0');
}
track.addEventListener('scroll', () => {
  cancelAnimationFrame(workRaf);
  workRaf = requestAnimationFrame(syncWorkIndex);
}, { passive: true });

/* wheel → horizontal on desktop */
track.addEventListener('wheel', (e) => {
  if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
    track.scrollLeft += e.deltaY;
    e.preventDefault();
  }
}, { passive: false });

/* drag to scroll */
let dragging = false, dragX = 0, dragScroll = 0, moved = false;
track.addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  dragging = true; moved = false;
  dragX = e.clientX; dragScroll = track.scrollLeft;
  track.setPointerCapture(e.pointerId);
});
track.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const dx = e.clientX - dragX;
  if (Math.abs(dx) > 4) moved = true;
  track.scrollLeft = dragScroll - dx;
});
const endDrag = (e) => {
  if (!dragging) return;
  dragging = false;
  try { track.releasePointerCapture(e.pointerId); } catch { /* noop */ }
};
track.addEventListener('pointerup', endDrag);
track.addEventListener('pointercancel', endDrag);

/* ---------------- experience ---------------- */
const jobs = $('#jobs');
jobs.innerHTML = JOBS.map((j) => `
  <article class="job">
    <span class="yr mono">${j.yr}</span>
    <h3>${j.co}</h3>
    <p>${j.desc}</p>
  </article>`).join('');

/* ---------------- method steps ---------------- */
const stepsEl = $('#steps');
const methodSection = $('#method');
stepsEl.innerHTML = METHOD.map((m, i) => `
  <article class="step" data-step="${i}">
    <span class="n mono">(0${i + 1})</span>
    <h3>${m.t}</h3>
    <p><span>${m.d}</span></p>
  </article>`).join('');
const stepEls = $$('.step', stepsEl);

const isMobile = () => window.matchMedia('(max-width: 900px)').matches;

function updateSteps() {
  if (isMobile()) {
    stepEls.forEach((s) => s.classList.add('on'));
    return;
  }
  const rect = methodSection.getBoundingClientRect();
  const total = methodSection.offsetHeight - window.innerHeight;
  const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
  const active = Math.min(stepEls.length - 1, Math.floor(p * stepEls.length));
  stepEls.forEach((s, i) => s.classList.toggle('on', i === active));
}
window.addEventListener('scroll', updateSteps, { passive: true });
window.addEventListener('resize', updateSteps);
updateSteps();

/* ---------------- nav scroll spy ---------------- */
const navLinks = $$('.nav ul a[href^="#"]');
const spyTargets = navLinks
  .map((a) => ({ a, el: $(a.getAttribute('href')) }))
  .filter((x) => x.el);

const spy = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    navLinks.forEach((a) => a.classList.remove('on'));
    const match = spyTargets.find((x) => x.el === e.target);
    if (match) match.a.classList.add('on');
  });
}, { rootMargin: '-45% 0px -50% 0px' });
spyTargets.forEach((x) => spy.observe(x.el));

/* ---------------- stat count-up ---------------- */
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function countUp(el) {
  const to = Number(el.dataset.count || 0);
  if (reduced) { el.textContent = `${to}+`; return; }
  const dur = 1100;
  const start = performance.now();
  function tick(now) {
    const t = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = `${Math.round(to * eased)}+`;
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const statObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { countUp(e.target); obs.unobserve(e.target); }
  });
}, { threshold: 0.6 });
$$('.stat b[data-count]').forEach((b) => statObserver.observe(b));

/* ---------------- copy email ---------------- */
const copyBtn = $('#copyEmail');
if (copyBtn) {
  copyBtn.addEventListener('click', async () => {
    const email = $('#mail')?.textContent?.trim() || '';
    try {
      await navigator.clipboard.writeText(email);
      copyBtn.textContent = 'Copied ✓';
      setTimeout(() => { copyBtn.textContent = 'Copy email'; }, 1800);
    } catch {
      copyBtn.textContent = 'Copy failed';
    }
  });
}

/* ---------------- case study detail ---------------- */
const detail = $('#detail');
const dCover = $('#dCover');
const dMeta = $('#dMeta');
const dName = $('#dName');
const dBlurb = $('#dBlurb');
const dFacts = $('#dFacts');
const dSections = $('#dSections');
const dPrev = $('#dPrev');
const dNext = $('#dNext');
let activeIndex = -1;
let lastFocus = null;

function renderDetail(i) {
  const p = PROJECTS[i];
  activeIndex = i;
  dCover.innerHTML = '';
  fillSlot(dCover, p);
  dMeta.textContent = `${String(i + 1).padStart(2, '0')} / ${String(PROJECTS.length).padStart(2, '0')} · ${p.year}`;
  dName.textContent = p.name;
  dBlurb.textContent = p.blurb;

  dFacts.innerHTML = `
    <div><dt class="mono">Client</dt><dd>${p.client}</dd></div>
    <div><dt class="mono">Year</dt><dd>${p.year}</dd></div>
    <div><dt class="mono">Role</dt><dd>${p.role}</dd></div>
    <div><dt class="mono">Focus</dt><dd>${p.tags.join(', ')}</dd></div>`;

  dSections.innerHTML = `
    <section><h3>Overview</h3><p>${p.blurb}</p></section>
    <section><h3>Outcome</h3><p>${p.outcome}</p></section>
    <section><h3>Approach</h3><p>
      Started with the constraint, not the canvas — mapping the states the product actually
      needed before drawing a single screen. Tokens, components and responsive rules were
      authored alongside the interface so the design survived implementation across phone,
      tablet and web.
    </p></section>`;

  const prev = (i - 1 + PROJECTS.length) % PROJECTS.length;
  const next = (i + 1) % PROJECTS.length;
  dPrev.innerHTML = `<span class="arr">←</span><span class="d-pn-t"><span class="mono">Previous</span><span class="d-pn-name">${PROJECTS[prev].name}</span></span>`;
  dNext.innerHTML = `<span class="d-pn-t"><span class="mono">Next project</span><span class="d-pn-name">${PROJECTS[next].name}</span></span><span class="arr">→</span>`;
  dPrev.dataset.i = prev;
  dNext.dataset.i = next;
}

function openDetail(i) {
  lastFocus = document.activeElement;
  renderDetail(i);
  detail.classList.add('open');
  detail.setAttribute('aria-hidden', 'false');
  document.body.classList.add('lock');
  detail.scrollTop = 0;
  $('#dClose').focus();
}

function closeDetail() {
  detail.classList.remove('open');
  detail.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('lock');
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}

track.addEventListener('click', (e) => {
  const btn = e.target.closest('.proj-open');
  if (!btn || moved) return;
  openDetail(Number(btn.dataset.i));
});

$('#dClose').addEventListener('click', closeDetail);
dPrev.addEventListener('click', () => renderDetail(Number(dPrev.dataset.i)));
dNext.addEventListener('click', () => renderDetail(Number(dNext.dataset.i)));
detail.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeDetail();
  if (e.key === 'ArrowLeft') renderDetail(Number(dPrev.dataset.i));
  if (e.key === 'ArrowRight') renderDetail(Number(dNext.dataset.i));
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && detail.classList.contains('open')) closeDetail();
});

/* ---------------- misc ---------------- */
$('#year').textContent = new Date().getFullYear();

/* QA handle */
window.__folio = {
  projects: PROJECTS,
  open: openDetail,
  close: closeDetail,
  get active() { return activeIndex; },
};

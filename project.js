/* ==================================================================
   Nick Child — individual project page
   Reads ?id= from the URL and renders the project's visual area,
   case study and prev/next navigation.
================================================================== */

import {
  PROJECTS,
  projectCover,
  desktopScreen,
  mobileScreen,
  brandFor,
} from './projects.js';

const $ = (s, r = document) => r.querySelector(s);
const pad = (v) => String(v).padStart(2, '0');

const params = new URLSearchParams(location.search);
const wanted = params.get('id');
let index = PROJECTS.findIndex((p) => p.id === wanted);
if (index < 0) index = 0;

const p = PROJECTS[index];
const total = PROJECTS.length;
const prev = PROJECTS[(index - 1 + total) % total];
const next = PROJECTS[(index + 1) % total];

/* ---------------- document head ---------------- */
document.title = `${p.name} — Nick Child`;
const md = document.querySelector('meta[name="description"]');
if (md) md.setAttribute('content', `${p.name}: ${p.blurb}`);

/* ---------------- hero ---------------- */
$('#pjIndex').textContent = `${pad(index + 1)} / ${pad(total)}`;
$('#pjYear').textContent = p.year;
$('#pjName').textContent = p.name;
$('#pjBlurb').textContent = p.blurb;

$('#pjFacts').innerHTML = `
  <div><dt class="mono">Client</dt><dd>${p.client}</dd></div>
  <div><dt class="mono">Year</dt><dd>${p.year}</dd></div>
  <div><dt class="mono">Role</dt><dd>${p.role}</dd></div>
  <div><dt class="mono">Focus</dt><dd>${p.tags.join(', ')}</dd></div>`;

/* ---------------- visual area ---------------- */
const pjPh = document.querySelector('.pj-ph');
if (pjPh && p.image) {
  pjPh.src = p.image;
  pjPh.alt = `${p.name} thumbnail`;
}
function mount(el, canvas) {
  if (!el) return;
  canvas.style.width = '100%';
  canvas.style.height = 'auto';
  canvas.style.display = 'block';
  el.appendChild(canvas);
}

mount($('#pjDesktop'), desktopScreen(p));
mount($('#pjMobile'), mobileScreen(p));
mount($('#pjPoster'), projectCover(p, 1000));

const [c1, c2] = brandFor(p);
const swatches = [
  ['Primary', c1],
  ['Accent', c2],
  ['Ink', '#0c1114'],
  ['Bone', '#ece6dd'],
];
$('#pjColors').innerHTML = swatches
  .map(
    ([label, c]) =>
      `<span class="sw" style="background:${c}"><b class="mono" title="${label}">${c.toUpperCase()}</b></span>`
  )
  .join('');

/* ---------------- case study ---------------- */
$('#pjSections').innerHTML = `
  <section><h3>Overview</h3><p>${p.blurb}</p></section>
  <section><h3>Outcome</h3><p>${p.outcome}</p></section>
  <section><h3>Approach</h3><p>
    Started with the constraint, not the canvas — mapping the states the product actually
    needed before drawing a single screen. Tokens, components and responsive rules were
    authored alongside the interface so the design survived implementation across phone,
    tablet and web, and motion was designed as part of the interaction rather than added
    afterwards.
  </p></section>`;

/* ---------------- prev / next ---------------- */
const prevA = $('#pjPrev');
prevA.href = `project.html?id=${prev.id}`;
prevA.innerHTML = `<span class="arr">←</span><span class="d-pn-t"><span class="mono">Previous</span><span class="d-pn-name">${prev.name}</span></span>`;

const nextA = $('#pjNext');
nextA.href = `project.html?id=${next.id}`;
nextA.innerHTML = `<span class="d-pn-t"><span class="mono">Next project</span><span class="d-pn-name">${next.name}</span></span><span class="arr">→</span>`;

addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') location.href = prevA.href;
  if (e.key === 'ArrowRight') location.href = nextA.href;
});

/* ---------------- misc ---------------- */
$('#year').textContent = new Date().getFullYear();

/* QA handle */
window.__project = { projects: PROJECTS, index, project: p };

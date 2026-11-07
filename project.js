/* ==================================================================
   Nick Child — individual project page
   Reads ?id= from the URL. Unknown ids, including a removed
   Bupa project, render a not-found state with no project body.
================================================================== */

import { PROJECTS } from './projects.js';
import { armPageTransition } from './transition.js';

const $ = (s, r = document) => r.querySelector(s);
const pad = (v) => String(v).padStart(2, '0');

const params = new URLSearchParams(location.search);
const wanted = params.get('id');
const index = PROJECTS.findIndex((p) => p.id === wanted);

function setMeta(title, description) {
  document.title = title;
  const md = document.querySelector('meta[name="description"]');
  if (md) md.setAttribute('content', description);
}

function showNotFound() {
  setMeta(
    'Project not found — Nick Child',
    'This project is not in the Nick Child folio.'
  );
  $('#pjIndex').hidden = true;
  $('#pjYear').hidden = true;
  $('.pj-dot').hidden = true;
  $('#pjName').textContent = 'Not in the folio';
  $('#pjBlurb').textContent =
    'That project is not published here. The work in this folio is linked from the home page.';
  $('#pjFacts').hidden = true;
  $('#pjVisual').hidden = true;
  $('#pjGap').hidden = true;
  $('#pjSections').hidden = true;
  $('#pjPager').hidden = true;
}

function factRow(term, value) {
  const row = document.createElement('div');
  const dt = document.createElement('dt');
  dt.className = 'mono';
  dt.textContent = term;
  const dd = document.createElement('dd');
  dd.textContent = value;
  row.append(dt, dd);
  return row;
}

function renderProject(p) {
  const total = PROJECTS.length;
  const prev = PROJECTS[(index - 1 + total) % total];
  const next = PROJECTS[(index + 1) % total];

  setMeta(`${p.name} — Nick Child`, `${p.name}. ${p.blurb}`);

  $('#pjIndex').textContent = `${pad(index + 1)} / ${pad(total)}`;
  if (p.year) {
    $('#pjYear').textContent = p.year;
  } else {
    $('#pjYear').hidden = true;
    $('.pj-dot').hidden = true;
  }
  $('#pjName').textContent = p.name;
  $('#pjBlurb').textContent = p.blurb;

  const facts = $('#pjFacts');
  facts.replaceChildren();
  const rows = [
    ['Client', p.client],
    ['Year', p.year],
    ['Role', p.role],
    ['Focus', (p.tags || []).join(', ')],
  ].filter(([, value]) => value);
  rows.forEach(([term, value]) => facts.append(factRow(term, value)));

  const visual = $('#pjVisual');
  if (p.image) {
    const img = $('#pjHeroImg');
    img.src = p.image;
    img.alt = p.imageAlt || `${p.name} folio board`;
    if (p.width) img.width = p.width;
    if (p.height) img.height = p.height;
    img.addEventListener('error', () => {
      visual.hidden = true;
    });
    $('#pjHeroCap').textContent = p.caption || 'Folio board';
    visual.hidden = false;
  } else {
    visual.hidden = true;
  }

  const gap = $('#pjGap');
  if (p.gap) {
    gap.hidden = false;
    gap.textContent = p.gap;
  } else {
    gap.hidden = true;
  }

  const sections = $('#pjSections');
  sections.replaceChildren();
  (p.sections || []).forEach((section) => {
    const block = document.createElement('section');
    const heading = document.createElement('h3');
    heading.textContent = section.h;
    const para = document.createElement('p');
    para.textContent = section.p;
    block.append(heading, para);
    sections.append(block);
  });

  const prevA = $('#pjPrev');
  prevA.href = `project.html?id=${encodeURIComponent(prev.id)}`;
  prevA.replaceChildren();
  const prevArr = document.createElement('span');
  prevArr.className = 'arr';
  prevArr.setAttribute('aria-hidden', 'true');
  prevArr.textContent = '←';
  const prevText = document.createElement('span');
  prevText.className = 'd-pn-t';
  const prevLabel = document.createElement('span');
  prevLabel.className = 'mono';
  prevLabel.textContent = 'Previous';
  const prevName = document.createElement('span');
  prevName.className = 'd-pn-name';
  prevName.textContent = prev.name;
  prevText.append(prevLabel, prevName);
  prevA.append(prevArr, prevText);

  const nextA = $('#pjNext');
  nextA.href = `project.html?id=${encodeURIComponent(next.id)}`;
  nextA.replaceChildren();
  const nextText = document.createElement('span');
  nextText.className = 'd-pn-t';
  const nextLabel = document.createElement('span');
  nextLabel.className = 'mono';
  nextLabel.textContent = 'Next project';
  const nextName = document.createElement('span');
  nextName.className = 'd-pn-name';
  nextName.textContent = next.name;
  nextText.append(nextLabel, nextName);
  const nextArr = document.createElement('span');
  nextArr.className = 'arr';
  nextArr.setAttribute('aria-hidden', 'true');
  nextArr.textContent = '→';
  nextA.append(nextText, nextArr);
}

if (index < 0) showNotFound();
else renderProject(PROJECTS[index]);

$('#year').textContent = new Date().getFullYear();

/* Back link, logo, nav and prev/next glide behind the ink veil. */
armPageTransition('a[href^="project.html"], a[href^="index.html"]');

window.__project = {
  projects: PROJECTS,
  index,
  project: index >= 0 ? PROJECTS[index] : null,
};

/**
 * Static checks for the folio data and pages.
 * Run: node tests/content-check.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROJECTS } from '../projects.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
let failed = 0;

function assert(cond, message) {
  if (cond) {
    console.log(`ok  ${message}`);
    return;
  }
  failed += 1;
  console.error(`FAIL  ${message}`);
}

const ids = PROJECTS.map((p) => p.id);
assert(!ids.includes('bupa'), 'no bupa project id');
assert(ids[0] === 'rebel', 'rebel is the first project');
assert(new Set(ids).size === ids.length, 'project ids are unique');
assert(ids.length === 9, `nine projects (got ${ids.length})`);

const required = ['rebel', 'telstra', 'suzuki', 'flexiworks', 'langtons', 'cargocrew', 'tbwa', 'jwt', 'wcrs'];
required.forEach((id) => assert(ids.includes(id), `includes ${id}`));

const banned = [
  'session recording',
  'support inbox',
  'analytics',
  'conversion',
  'placeholder.png',
  'design system patterns',
  'claims overview',
];
for (const project of PROJECTS) {
  const blob = JSON.stringify(project).toLowerCase();
  assert(!blob.includes('bupa'), `${project.id} copy does not mention bupa`);
  banned.forEach((phrase) => {
    assert(!blob.includes(phrase), `${project.id} has no “${phrase}”`);
  });
  if (project.image) {
    const file = path.join(root, project.image);
    assert(fs.existsSync(file), `${project.image} exists`);
    assert(project.imageAlt && project.imageAlt.length > 20, `${project.id} has alt text`);
  } else {
    assert(project.gap, `${project.id} explains the missing screens`);
  }
}

const pages = ['index.html', 'project.html', 'main.js', 'project.js', 'projects.js', 'README.md'];
const sources = Object.fromEntries(pages.map((file) => [file, read(file)]));
const site = Object.values(sources).join('\n');
const siteLower = site.toLowerCase();

assert(!/id:\s*['"]bupa['"]/.test(site), 'no bupa id literal');
assert(!/project\.html\?id=bupa/.test(siteLower), 'no link to a bupa project');
assert(!site.includes('AI Engineer'), 'hero does not say AI Engineer');
assert(!site.includes('Brands & studios') && !site.includes('Brands &amp; studios'), 'no 50-brands stat');
assert(!site.includes('assets/placeholder.png'), 'pages do not use the placeholder image');
assert(sources['index.html'].includes('Propositions') === false, 'genomics detail stays in the experience list, not the intro html');
assert(sources['main.js'].includes('Propositions (genomics)'), 'experience names the current Bupa role');
assert(sources['main.js'].includes("projectById('rebel')"), 'about slot is rebel');
assert(sources['index.html'].includes('Rebel Sport'), 'about caption names Rebel');
assert(!sources['index.html'].includes('Bupa —'), 'about caption is not a Bupa case study');
assert(sources['index.html'].includes('nick.child@live.com'), 'existing email remains');
assert(sources['index.html'].includes('0466 407 107'), 'existing phone remains');
assert(fs.existsSync(path.join(root, '.nojekyll')), '.nojekyll is present for static hosting');
assert(!fs.existsSync(path.join(root, 'CNAME')), 'no custom domain file');
assert(!/pages-deploy|actions\/deploy-pages|peaceiris\/actions-gh-pages/.test(site), 'no pages deploy workflow in the site sources');

const bupaHits = [];
for (const [file, text] of Object.entries(sources)) {
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    if (/bupa/i.test(line)) bupaHits.push(`${file}:${i + 1}: ${line.trim()}`);
  });
}
assert(bupaHits.length > 0, 'current Bupa employment is still mentioned');
const bupaProjectish = bupaHits.filter((line) =>
  /case study|recent work|project\.html|id=bupa|claims|design system/i.test(line)
);
assert(bupaProjectish.length === 0, `bupa mentions are employment only (${bupaProjectish.join(' | ')})`);

if (failed) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}
console.log('\ncontent checks passed');

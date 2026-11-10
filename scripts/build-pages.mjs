/* ==================================================================
   Clean project URLs for GitHub Pages.
   Writes one page per project at the site root, <id>.html, from the
   project.html template, so each project is served at /<id> (Pages
   resolves /rebel to rebel.html without a redirect or trailing slash).
   Also writes 404.html (sends /rebel/ to /rebel and anything else
   home) and sitemap.xml.

   Run after editing project.html or the ids in projects.js:
     node scripts/build-pages.mjs
================================================================== */
import { readFile, writeFile, unlink, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://nickchild.co';
const RESERVED = new Set(['index', 'project', '404', 'assets', 'scripts']);

const src = await readFile(join(ROOT, 'projects.js'), 'utf8');
const { PROJECTS } = await import('data:text/javascript;base64,' + Buffer.from(src).toString('base64'));
const template = await readFile(join(ROOT, 'project.html'), 'utf8');
if (!template.includes('<!--pj-meta-->')) throw new Error('project.html is missing the <!--pj-meta--> marker');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const GENERATED = '<!-- Generated from project.html by scripts/build-pages.mjs. Edit project.html, then rebuild. -->';

/* remove pages left over from projects that no longer exist */
for (const f of await readdir(ROOT)) {
  if (!f.endsWith('.html') || f === 'index.html' || f === 'project.html' || f === '404.html') continue;
  const body = await readFile(join(ROOT, f), 'utf8');
  if (body.includes(GENERATED) && !PROJECTS.some((p) => `${p.id}.html` === f)) await unlink(join(ROOT, f));
}

for (const p of PROJECTS) {
  if (!/^[a-z0-9-]+$/.test(p.id) || RESERVED.has(p.id)) throw new Error(`Bad project id for a URL: "${p.id}"`);
  const url = `${SITE}/${p.id}`;
  const title = `${p.name} — Nick Child`;
  const desc = `${p.name}: ${p.blurb || ''}`.trim();
  const meta = [
    GENERATED,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(desc)}" />`,
  ].join('\n');
  const html = template
    .replace('<!--pj-meta-->', meta)
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${esc(desc)}" />`);
  await writeFile(join(ROOT, `${p.id}.html`), html);
}

const ids = PROJECTS.map((p) => p.id);
await writeFile(join(ROOT, '404.html'), `<!doctype html>
${GENERATED.replace('from project.html ', '')}
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Nick Child</title>
<meta name="robots" content="noindex" />
<meta name="theme-color" content="#0c1114" />
<style>html { background: #0c1114; }</style>
<script>
  /* /rebel/ or /Rebel → /rebel; anything else → home */
  (function () {
    var ids = ${JSON.stringify(ids)};
    var s = location.pathname.toLowerCase().replace(/^\\/+|\\/+$/g, '').replace(/\\.html$/, '');
    location.replace(ids.indexOf(s) >= 0 ? '/' + s + location.search + location.hash : '/');
  })();
</script>
</head>
<body></body>
</html>
`);

await writeFile(join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${['', ...ids].map((id) => `  <url><loc>${SITE}/${id}</loc></url>`).join('\n')}
</urlset>
`);

console.log(`Built ${ids.length} project pages (${ids.map((i) => '/' + i).join(', ')}), 404.html and sitemap.xml`);

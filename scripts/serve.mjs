/* ==================================================================
   Local preview server that behaves like GitHub Pages, so the clean
   URLs work on your machine too:
     /            → index.html
     /rebel       → rebel.html      (extensionless, no redirect)
     /dir/        → dir/index.html
     anything else that isn't a file → 404.html (status 404)
   A plain `python3 -m http.server` can't do the /rebel → rebel.html
   step, which is why project pages 404 there.

   Run from the repo:  node scripts/serve.mjs      (or: npm run dev)
   Then open http://localhost:8000   (PORT=xxxx to change the port)
   Zero dependencies; files are served uncached, for previewing.
================================================================== */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT) || 8000;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.pdf': 'application/pdf',
};

const isFile = async (p) => { try { return (await stat(p)).isFile(); } catch { return false; } };
const isDir = async (p) => { try { return (await stat(p)).isDirectory(); } catch { return false; } };

async function resolve(pathname) {
  let rel;
  try { rel = decodeURIComponent(pathname); } catch { return null; }
  const abs = normalize(join(ROOT, rel));
  if (abs !== ROOT && !abs.startsWith(ROOT + sep)) return null;      // no ../ escapes
  if (rel.split('/').some((s) => s.startsWith('.') && s.length > 1)) return null; // no dotfiles (.git etc.)
  if (rel.endsWith('/')) return (await isFile(join(abs, 'index.html'))) ? join(abs, 'index.html') : null;
  if (await isFile(abs)) return abs;
  if (await isDir(abs)) return { redirect: rel + '/' };
  if (await isFile(abs + '.html')) return abs + '.html';
  return null;
}

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  let file = await resolve(url.pathname);
  if (file && file.redirect) {
    res.writeHead(301, { Location: file.redirect + url.search });
    return res.end();
  }
  let status = 200;
  if (!file) { status = 404; file = join(ROOT, '404.html'); }
  try {
    const body = await readFile(file);
    res.writeHead(status, { 'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
  if (status !== 200) console.log(status, req.method, url.pathname);
}).listen(PORT, () => {
  console.log(`Previewing ${ROOT}\n  http://localhost:${PORT}/        home\n  http://localhost:${PORT}/rebel   a project\nCtrl+C to stop.`);
});

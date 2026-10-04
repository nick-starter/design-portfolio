# Nicholas Child — Design Folio

A single-page product & interface design folio with an editorial layout: a giant
wordmark hero, a horizontally-scrolling project gallery with case-study overlays,
experience list, a scroll-driven method section, and a contact card.

## Features

- Editorial, responsive layout (mobile → desktop) built on a bone-on-ink palette with a red accent
- Work gallery of 6 selected projects from a 20-year career (Bupa, Rebel Sport, Telstra, TBWA, JWT, WCRS), each opening a full case-study overlay (prev/next, keyboard nav)
- Project artwork generated procedurally with Canvas 2D — no image assets required
- Scroll-driven method steps, nav scroll-spy, animated stats and a horizontal drag/wheel gallery
- Custom type: Archivo (variable, wide), Instrument Serif and JetBrains Mono

## Tech Stack

- Vanilla JavaScript (ES modules) — no build step
- HTML5 + modern CSS (grid, `clamp()`, `svh`, container-free responsive rules)
- Canvas 2D for all generated cover art

## Project Structure

```
index.html      page markup + font/asset links
styles.css      layout + design tokens
main.js         gallery, case-study overlay, method scroll, nav spy
projects.js     placeholder project data + Canvas 2D mockups
assets/logo.png top-left wordmark
```

## Local Development

Open `index.html` directly, or serve the folder:

```bash
python3 -m http.server 8000
# http://localhost:8000
```

## Deploy to GitHub Pages

1. Create a repository (e.g. `design-portfolio`) and push this folder.
2. Settings → Pages → Deploy from a branch → `main` / `/ (root)`.
3. The site publishes at `https://<username>.github.io/design-portfolio/`.

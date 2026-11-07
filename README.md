# Nick Child — Design Folio

A product & interface design folio with an editorial layout: a giant wordmark
hero, a horizontally-scrolling project gallery, dedicated project pages with a
visual area, experience list, a scroll-driven method section, and a contact card.

## Features

- Editorial, responsive layout (mobile → desktop) built on a bone-on-ink palette with a red accent
- Work gallery of 8 selected projects from a 20-year career (Bupa, Rebel Sport, Telstra, TBWA, JWT, WCRS, Cargo Crew, Suzuki Motorcycles)
- Each project opens a dedicated page (`project.html?id=…`) with a visual area — web and mobile mockups, cover art and a colour/type system — plus overview, outcome, approach and prev/next navigation
- Project artwork generated procedurally with Canvas 2D — no image assets required
- Scroll-driven method steps, nav scroll-spy, animated stats and a horizontal drag/wheel gallery
- Custom type: Archivo (variable, wide), Instrument Serif and JetBrains Mono

## Tech Stack

- Vanilla JavaScript (ES modules) — no build step
- HTML5 + modern CSS (grid, `clamp()`, `svh`, container-free responsive rules)
- Canvas 2D for all generated cover art

## Project Structure

```
index.html      folio page markup
project.html    individual project page shell
styles.css      layout + design tokens (folio + project page)
main.js         gallery, method scroll, nav spy
project.js      project page renderer (reads ?id=)
projects.js     project data + Canvas 2D mockups
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

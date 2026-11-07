# Nick Child — Design Folio

A dark editorial folio: wordmark hero, horizontal project gallery, project pages, experience, method and contact. Visual direction is unchanged. Project pages show real folio boards instead of generated interface mockups.

## Projects

Nine pieces. Six have boards in `assets/work/`:

1. Rebel Sport
2. Telstra
3. Suzuki Motorcycles
4. Flexiworks
5. Langton's
6. Cargo Crew
7. TBWA \ Tequila (no screens in the source set)
8. JWT (no screens in the source set)
9. WCRS (no screens in the source set)

Bupa is current employment only, in About and Experience. There is no Bupa project page, card or prev/next link.

Copy is limited to the CV and what each board shows. Years and roles are omitted where the CV does not state them.

## Tech

- Vanilla JavaScript (ES modules), no build step
- HTML and CSS
- Relative URLs, so a static host can serve the repo root

## Local check

```bash
python3 -m http.server 8000
node tests/content-check.mjs
```

Open `http://localhost:8000`. `file://` will not load the ES modules.

## GitHub Pages

The site is static-root compatible: relative links, no Jekyll (`/.nojekyll`), no `CNAME`, and no deploy workflow. Pages is not enabled from this repo.

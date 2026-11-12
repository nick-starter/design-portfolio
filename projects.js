/* ------------------------------------------------------------------
   Project data + canvas-drawn UI mockups used as device/cover art
------------------------------------------------------------------- */

const INK = {
  bg: '#0b0f17',
  panel: '#141a26',
  panel2: '#1c2433',
  line: 'rgba(255,255,255,.09)',
  text: '#e8edf5',
  dim: '#93a0b5',
  faint: '#5f6b80',
};

const BRAND = {
  aurora: ['#6366f1', '#22d3ee'],
  verdant: ['#10b981', '#84cc16'],
  ember: ['#f97316', '#ef4444'],
  violet: ['#a855f7', '#ec4899'],
  ocean: ['#0ea5e9', '#3b82f6'],
  citrus: ['#eab308', '#f97316'],
  cargo: ['#0d9488', '#a3e635'],
  suzuki: ['#1d4ed8', '#facc15'],
};

/* Brand gradient for a project — used by the project page colour strip */
export function brandFor(p) {
  return BRAND[p.brand] || BRAND.aurora;
}

/* ---------- tiny canvas helpers ---------- */

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function txt(ctx, s, x, y, size, color, weight = 500, align = 'left') {
  ctx.font = `${weight} ${size}px "Archivo", "Helvetica Neue", Arial, sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(s, x, y);
  ctx.textAlign = 'left';
}

function pill(ctx, label, x, y, fg, bg) {
  ctx.font = '700 20px "Archivo", "Helvetica Neue", Arial, sans-serif';
  const w = ctx.measureText(label).width + 34;
  ctx.fillStyle = bg;
  rr(ctx, x, y, w, 40, 20);
  ctx.fill();
  txt(ctx, label, x + 17, y + 27, 20, fg, 700);
  return w;
}

/* Sparkline / area chart */
function chart(ctx, x, y, w, h, c1, c2, seed = 1) {
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, c1 + '55');
  g.addColorStop(1, c1 + '00');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  const n = 26;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const v =
      0.5 +
      0.34 * Math.sin(t * 5.2 + seed) +
      0.16 * Math.sin(t * 11 + seed * 2.3) +
      0.07 * Math.cos(t * 21 + seed);
    pts.push([x + t * w, y + h - v * h * 0.94]);
  }
  pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.lineTo(p[0], p[1])));
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = c1;
  ctx.lineWidth = 4;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  ctx.stroke();

  const last = pts[pts.length - 1];
  ctx.fillStyle = c2;
  ctx.beginPath();
  ctx.arc(last[0], last[1], 7, 0, 7);
  ctx.fill();
  ctx.strokeStyle = '#0b0f17';
  ctx.lineWidth = 3;
  ctx.stroke();
}

/* Donut progress ring */
function ring(ctx, cx, cy, r, pct, c1, c2, label, sub) {
  ctx.lineWidth = 14;
  ctx.strokeStyle = 'rgba(255,255,255,.08)';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  const g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  ctx.strokeStyle = g;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct);
  ctx.stroke();
  txt(ctx, label, cx, cy + 8, 46, INK.text, 800, 'center');
  if (sub) txt(ctx, sub, cx, cy + 34, 18, INK.faint, 600, 'center');
}

/* Bottom tab bar */
function tabbar(ctx, W, H, active, c1) {
  const h = 108;
  const y = H - h;
  ctx.fillStyle = 'rgba(10,14,21,.86)';
  ctx.fillRect(0, y, W, h);
  ctx.fillStyle = INK.line;
  ctx.fillRect(0, y, W, 2);
  const icons = ['home', 'chart', 'ring', 'user'];
  const iw = W / icons.length;
  icons.forEach((ic, i) => {
    const cx = iw * i + iw / 2;
    const cy = y + 46;
    const on = i === active;
    ctx.strokeStyle = on ? c1 : INK.faint;
    ctx.fillStyle = on ? c1 : INK.faint;
    ctx.lineWidth = on ? 3.4 : 2.6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    if (ic === 'home') {
      ctx.moveTo(cx - 13, cy - 2);
      ctx.lineTo(cx, cy - 14);
      ctx.lineTo(cx + 13, cy - 2);
      ctx.moveTo(cx - 9, cy - 4);
      ctx.lineTo(cx - 9, cy + 12);
      ctx.lineTo(cx + 9, cy + 12);
      ctx.lineTo(cx + 9, cy - 4);
    } else if (ic === 'chart') {
      ctx.moveTo(cx - 13, cy + 12);
      ctx.lineTo(cx - 4, cy - 2);
      ctx.lineTo(cx + 3, cy + 6);
      ctx.lineTo(cx + 13, cy - 12);
    } else if (ic === 'ring') {
      ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    } else {
      ctx.arc(cx, cy - 5, 7, 0, Math.PI * 2);
      ctx.moveTo(cx - 13, cy + 13);
      ctx.quadraticCurveTo(cx, cy + 1, cx + 13, cy + 13);
    }
    ctx.stroke();
  });
}

/* Mobile status bar + notch */
function statusbar(ctx, W) {
  txt(ctx, '9:41', 54, 60, 24, INK.text, 800);
  ctx.fillStyle = INK.text;
  rr(ctx, W - 132, 42, 34, 16, 5);
  ctx.fill();
  ctx.strokeStyle = INK.text;
  ctx.lineWidth = 2.5;
  rr(ctx, W - 90, 40, 46, 20, 6);
  ctx.stroke();
  ctx.fillStyle = INK.text;
  rr(ctx, W - 86, 44, 32, 12, 3);
  ctx.fill();
}

/* ---------- MOBILE mockup ---------- */

export function mobileScreen(p, W = 760, H = 1640) {
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext('2d');
  const [c1, c2] = BRAND[p.brand];

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0d1220');
  bg.addColorStop(1, '#141b2b');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // ambient glow
  const gl = ctx.createRadialGradient(W * 0.8, 180, 20, W * 0.8, 180, 620);
  gl.addColorStop(0, c1 + '3a');
  gl.addColorStop(1, c1 + '00');
  ctx.fillStyle = gl;
  ctx.fillRect(0, 0, W, 700);

  statusbar(ctx, W);

  // header
  txt(ctx, p.client, 54, 152, 22, INK.dim, 600);
  txt(ctx, p.mobileTitle, 54, 208, 46, INK.text, 800);
  pill(ctx, p.mobileKpi, W - 54 - 150, 168, c2, c1 + '26');

  // hero card
  ctx.fillStyle = INK.panel;
  rr(ctx, 54, 250, W - 108, 400, 44);
  ctx.fill();
  txt(ctx, p.mobileHeroLabel, 90, 314, 22, INK.dim, 600);
  txt(ctx, p.mobileHeroValue, 90, 396, 82, INK.text, 800);
  txt(ctx, p.mobileHeroUnit, 90, 436, 26, INK.faint, 600);
  chart(ctx, 90, 470, W - 180, 150, c1, c2, p.seed);

  // ring + list
  ctx.fillStyle = INK.panel;
  rr(ctx, 54, 686, W - 108, 300, 44);
  ctx.fill();
  txt(ctx, p.mobileRingLabel, 90, 748, 22, INK.dim, 600);
  ring(ctx, 200, 860, 92, p.ringPct, c1, c2, p.ringValue, p.ringSub);

  p.mobileRows.forEach((r, i) => {
    const y = 790 + i * 60;
    ctx.fillStyle = i % 2 ? 'rgba(255,255,255,.03)' : 'rgba(255,255,255,.055)';
    rr(ctx, 340, y - 30, W - 400, 48, 14);
    ctx.fill();
    txt(ctx, r.k, 362, y + 4, 24, INK.dim, 600);
    txt(ctx, r.v, W - 82, y + 4, 26, INK.text, 800, 'right');
  });

  // action list
  p.mobileActions.forEach((a, i) => {
    const y = 1022 + i * 148;
    ctx.fillStyle = INK.panel;
    rr(ctx, 54, y, W - 108, 128, 36);
    ctx.fill();
    ctx.fillStyle = c1 + '2e';
    rr(ctx, 78, y + 26, 76, 76, 24);
    ctx.fill();
    txt(ctx, a.t, 180, y + 58, 27, INK.text, 700);
    txt(ctx, a.s, 180, y + 92, 21, INK.faint, 500);
    ctx.strokeStyle = c2;
    ctx.lineWidth = 3.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(W - 122, y + 54);
    ctx.lineTo(W - 106, y + 70);
    ctx.lineTo(W - 88, y + 38);
    ctx.stroke();
  });

  // bottom card
  ctx.fillStyle = c1;
  rr(ctx, 54, 1466, W - 108, 96, 30);
  ctx.fill();
  txt(ctx, p.mobileCta, W / 2, 1526, 30, '#08111c', 800, 'center');

  tabbar(ctx, W, H, 0, c1);
  return cv;
}

/* ---------- TABLET / DESKTOP mockup ---------- */

export function desktopScreen(p, W = 1400, H = 1860) {
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext('2d');
  const [c1, c2] = BRAND[p.brand];

  ctx.fillStyle = '#0a0e17';
  ctx.fillRect(0, 0, W, H);

  // top bar
  ctx.fillStyle = 'rgba(255,255,255,.03)';
  ctx.fillRect(0, 0, W, 96);
  ctx.fillStyle = INK.line;
  ctx.fillRect(0, 94, W, 2);

  // logo
  const lg = ctx.createLinearGradient(60, 30, 116, 66);
  lg.addColorStop(0, c1);
  lg.addColorStop(1, c2);
  ctx.fillStyle = lg;
  rr(ctx, 60, 28, 40, 40, 13);
  ctx.fill();
  txt(ctx, p.client, 116, 58, 27, INK.text, 800);

  // search
  ctx.fillStyle = 'rgba(255,255,255,.05)';
  rr(ctx, 420, 26, 470, 46, 23);
  ctx.fill();
  txt(ctx, 'Search anything…', 448, 56, 21, INK.faint, 500);

  // avatar + button
  ctx.fillStyle = 'rgba(255,255,255,.05)';
  rr(ctx, W - 250, 26, 190, 46, 23);
  ctx.fill();
  txt(ctx, 'Export ▾', W - 155, 56, 21, INK.dim, 600, 'center');
  ctx.fillStyle = c1;
  ctx.beginPath();
  ctx.arc(W - 74, 49, 24, 0, 7);
  ctx.fill();

  // sidebar
  ctx.fillStyle = 'rgba(255,255,255,.025)';
  ctx.fillRect(0, 96, 300, H - 96);
  ctx.fillStyle = INK.line;
  ctx.fillRect(299, 96, 2, H - 96);

  txt(ctx, 'WORKSPACE', 40, 156, 17, INK.faint, 800);
  const nav = p.nav;
  nav.forEach((n, i) => {
    const y = 190 + i * 60;
    const on = i === 0;
    if (on) {
      ctx.fillStyle = c1 + '24';
      rr(ctx, 24, y - 34, 252, 52, 16);
      ctx.fill();
      ctx.fillStyle = c1;
      rr(ctx, 24, y - 34, 5, 52, 3);
      ctx.fill();
    }
    ctx.fillStyle = on ? INK.text : INK.dim;
    ctx.beginPath();
    ctx.arc(56, y - 8, 8, 0, 7);
    ctx.fill();
    txt(ctx, n, 82, y, 24, on ? INK.text : INK.dim, on ? 700 : 500);
  });

  ctx.fillStyle = INK.line;
  ctx.fillRect(40, 190 + nav.length * 60 + 10, 220, 2);
  txt(ctx, 'REPORTS', 40, 190 + nav.length * 60 + 62, 17, INK.faint, 800);
  p.navExtra.forEach((n, i) => {
    txt(ctx, n, 82, 190 + nav.length * 60 + 108 + i * 52, 22, INK.dim, 500);
  });

  // page title
  const py = 190;
  txt(ctx, 'Overview', 348, py, 24, INK.faint, 600);
  txt(ctx, p.desktopTitle, 348, py + 62, 54, INK.text, 800);
  txt(ctx, p.desktopSub, 348, py + 104, 24, INK.dim, 500);
  pill(ctx, 'Live', W - 348 - 130, py + 30, c2, c1 + '26');

  // KPI row
  p.kpis.forEach((k, i) => {
    const w = (W - 348 - 56 - 2 * 28) / 3;
    const x = 348 + i * (w + 28);
    const y = py + 150;
    ctx.fillStyle = INK.panel;
    rr(ctx, x, y, w, 210, 28);
    ctx.fill();
    ctx.fillStyle = c1;
    rr(ctx, x + 30, y + 30, 44, 6, 3);
    ctx.fill();
    txt(ctx, k.v, x + 30, y + 128, 60, INK.text, 800);
    txt(ctx, k.k, x + 30, y + 170, 21, INK.dim, 500);
    txt(ctx, k.d, x + w - 30, y + 52, 21, k.up ? '#34d399' : '#f87171', 700, 'right');
  });

  // big chart panel
  const cy2 = py + 388;
  ctx.fillStyle = INK.panel;
  rr(ctx, 348, cy2, W - 348 - 56, 560, 28);
  ctx.fill();
  txt(ctx, p.chartTitle, 386, cy2 + 56, 26, INK.text, 700);
  txt(ctx, 'Last 30 days', W - 394, cy2 + 56, 20, INK.faint, 500, 'right');
  ctx.strokeStyle = 'rgba(255,255,255,.06)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    const yy = cy2 + 120 + i * 96;
    ctx.beginPath();
    ctx.moveTo(386, yy);
    ctx.lineTo(W - 94, yy);
    ctx.stroke();
  }
  chart(ctx, 386, cy2 + 130, W - 386 - 142, 380, c1, c2, p.seed);

  // bottom left panel
  const by = cy2 + 588;
  ctx.fillStyle = INK.panel;
  rr(ctx, 348, by, (W - 348 - 56) * 0.56, 430, 28);
  ctx.fill();
  txt(ctx, p.listTitle, 386, by + 56, 26, INK.text, 700);
  p.table.forEach((r, i) => {
    const y = by + 108 + i * 66;
    ctx.fillStyle = i % 2 ? 'rgba(255,255,255,.028)' : 'rgba(255,255,255,.05)';
    rr(ctx, 376, y - 26, (W - 348 - 56) * 0.56 - 56, 54, 14);
    ctx.fill();
    txt(ctx, r.k, 400, y + 9, 22, INK.dim, 500);
    txt(ctx, r.v, 376 + (W - 348 - 56) * 0.56 - 84, y + 9, 23, INK.text, 700, 'right');
  });

  // bottom right panel
  const rx = 348 + (W - 348 - 56) * 0.56 + 28;
  const rw = W - 348 - 56 - (W - 348 - 56) * 0.56 - 28;
  ctx.fillStyle = INK.panel;
  rr(ctx, rx, by, rw, 430, 28);
  ctx.fill();
  txt(ctx, 'Distribution', rx + 38, by + 56, 26, INK.text, 700);
  ring(ctx, rx + rw / 2, by + 240, 112, p.ringPct, c1, c2, p.ringValue, p.ringSub);

  return cv;
}

/* ---------- projects ---------- */

export const PROJECTS = [
  {
    id: 'rebel',
    image: 'assets/rebel-hand-mockup-v5.jpg',
    gallery: [null, 'assets/placeholder-tall-1.jpg'],
    /* Before/after slider on the project page: `before` and `after`
       are image paths (same proportions work best). Add `compare` to
       any project to enable it; without it the page shows the
       generated web mockup tile instead. */
    compare: { before: 'assets/rebel-before.webp', after: 'assets/rebel-after.webp' },
    name: 'Rebel',
    logo: 'assets/logos/rebel.png',
    client: 'Super Retail Group',
    year: '2022 — 2023',
    role: 'UI Designer',
    tags: ['E-commerce', 'UI', 'Visual design', 'Conversion'],
    platform: 'Web',
    /* `headline` is the one line under the title (the blurb is used
       when there isn't one). `gallery` can list up to 8 image paths
       for the slots (pair, full, pair, …). */
    headline: 'Redesigned the Rebel website to feel premium, lifting click-through on every page tested and winning Adidas Originals onto the site.',
    blurb:
      "Redesigned Rebel's navigation, listing and product pages to match its upmarket Rebel X stores. Every change was A/B tested with real customers and click-through rose significantly on each page redesigned. Adidas, which had held lines like Originals back because of how the old site looked, put them online afterwards, and the design is still live.",
    outcome: 'Click-through up on every page tested · Adidas Originals won',
    /* Case study copy: shown as the body text in the project page's
       details row, as running paragraphs in this order. */
    story: {
      challenge: [
        "The old Rebel site was dated. It had got to the point where some suppliers, Adidas among them, didn't want lines like Originals sold on it because of how it looked. Rebel was also rebuilding its stores as more upmarket Rebel X concept stores, and the business wanted the website to feel the same way, closer to what Nike and Adidas do online.",
      ],
      approach: [
        "This was a contract at Super Retail Group, working through the navigation, the product listing page, the product page and even how images were displayed, and designed several options for each. We ran workshops with stakeholders most weeks to pick the strongest ones. Those went to the optimisation team, who switched each design on for a small number of customers, checked how it converted, and turned it up to everyone if it was doing better.",
        "Nothing radical changed. Rebel's brand guidelines are strict, so the premium feel had to come from a better header, better typography and layout, and a set of templates for editorial-style content.",
      ],
      outcome: [
        "Adidas Originals went onto the site after the project finished. In the tests, click-through went up significantly on each page we changed, and the design is still live. The UX was already solid before the project started. Making it look better got people using it more, which is the aesthetic-usability effect doing what it says.",
      ],
    },
    brand: 'ember',
    seed: 2.6,
    nav: ['Home', 'Shop', 'Categories', 'Deals', 'Account'],
    navExtra: ['Stores', 'Help'],
    mobileTitle: 'Fresh kicks',
    mobileKpi: 'New in',
    mobileHeroLabel: 'Your cart',
    mobileHeroValue: '$189',
    mobileHeroUnit: '3 items · free delivery',
    mobileRingLabel: 'Loyalty rewards',
    ringPct: 0.72,
    ringValue: '720',
    ringSub: 'points',
    mobileRows: [
      { k: 'Delivery', v: 'Free' },
      { k: 'Points', v: '720' },
      { k: 'Returns', v: '60 days' },
    ],
    mobileActions: [
      { t: 'Shop by sport', s: 'Running, gym, outdoor' },
      { t: 'Deals', s: 'Up to 40% off' },
      { t: 'Click & collect', s: 'Ready in 2 hours' },
    ],
    mobileCta: 'Checkout',
    desktopTitle: 'Storefront',
    desktopSub: 'Sports gear across 20+ categories',
    kpis: [
      { k: 'Products', v: '18k', d: '+1.2k', up: true },
      { k: 'Conversion', v: '4.1%', d: '+0.6%', up: true },
      { k: 'Avg. order', v: '$124', d: '+$9', up: true },
    ],
    chartTitle: 'Sales by category',
    listTitle: 'Top categories',
    table: [
      { k: 'Footwear', v: '$3.1M' },
      { k: 'Apparel', v: '$2.4M' },
      { k: 'Fitness', v: '$1.6M' },
      { k: 'Outdoor', v: '$1.1M' },
      { k: 'Team sport', v: '$0.9M' },
    ],
  },
  {
    id: 'telstra',
    image: 'assets/telstra-hero.jpg',
    gallery: [null, 'assets/placeholder-tall-1.jpg'],
    name: 'Telstra',
    logo: 'assets/logos/telstra.svg',
    client: 'Telstra',
    year: '2020 — 2022',
    role: 'Visual Designer',
    tags: ['Mobile', 'Accessibility', 'Design System'],
    blurb:
      "Designed the prepaid flows behind 2.5 million Telstra recharges a month, from activation, choosing a plan and verifying ID through to complex journeys like international roaming, so customers can get connected on their own, accessibly, on any device. Shipped in fast agile squads and helped define Able, the design system Telstra's digital teams build with. A Telstra Design Awards winner.",
    outcome: "2.5M prepaid recharges a month · Telstra Design Awards winner",
    brand: 'ocean',
    seed: 3.9,
    nav: ['Overview', 'Plans', 'Recharge', 'Usage', 'Support'],
    navExtra: ['Billing', 'Devices'],
    mobileTitle: 'Your plan',
    mobileKpi: 'Prepaid',
    mobileHeroLabel: 'Data remaining',
    mobileHeroValue: '38GB',
    mobileHeroUnit: 'of 60GB · resets in 9 days',
    mobileRingLabel: 'Plan used',
    ringPct: 0.37,
    ringValue: '37%',
    ringSub: 'this cycle',
    mobileRows: [
      { k: 'Data', v: '38GB' },
      { k: 'Calls', v: 'Unlimited' },
      { k: 'Credit', v: '$24.50' },
    ],
    mobileActions: [
      { t: 'Recharge now', s: 'Top up in seconds' },
      { t: 'Activate SIM', s: 'Guided setup' },
      { t: 'Usage alerts', s: '2 active' },
    ],
    mobileCta: 'Recharge',
    desktopTitle: 'Account overview',
    desktopSub: 'Prepaid services and usage at a glance',
    kpis: [
      { k: 'Services', v: '3', d: '+1', up: true },
      { k: 'Data used', v: '22GB', d: '−4GB', up: true },
      { k: 'Days left', v: '9', d: '−1', up: false },
    ],
    chartTitle: 'Data usage by day',
    listTitle: 'Active services',
    table: [
      { k: 'Mobile · 0400 000 000', v: 'Prepaid' },
      { k: 'Mobile · 0412 000 000', v: 'Prepaid' },
      { k: 'Data · Tablet', v: 'Shared' },
      { k: 'Broadband · Home', v: 'Active' },
      { k: 'Add-on · Intl calls', v: 'Active' },
    ],
  },
  {
    id: 'officeworks',
    image: 'assets/5.jpg',
    gallery: [null, 'assets/placeholder-tall-1.jpg'],
    name: 'Officeworks',
    logo: 'assets/logos/officeworks.png',
    logoScale: 0.85,
    client: 'Officeworks',
    /* TODO: role, year, tags, blurb and outcome below still describe
       the old TBWA \\ Tequila entry. Replace with Officeworks details. */
    year: '2015 — 2018',
    role: 'Senior Digital Designer',
    tags: ['Campaign', 'Digital', 'Motion'],
    blurb:
      'Digital experiences and engaging digital advertising across Nissan, ANZ and Medibank — concept, craft and motion for large-scale integrated campaigns.',
    outcome: 'Integrated campaigns · Nissan, ANZ & Medibank',
    brand: 'violet',
    seed: 5.1,
    nav: ['Campaigns', 'Nissan', 'ANZ', 'Medibank', 'Studio'],
    navExtra: ['Awards', 'Contact'],
    mobileTitle: 'Live campaign',
    mobileKpi: 'Running',
    mobileHeroLabel: 'Engagement',
    mobileHeroValue: '1.4M',
    mobileHeroUnit: 'interactions this flight',
    mobileRingLabel: 'Completion',
    ringPct: 0.78,
    ringValue: '78%',
    ringSub: 'of plays',
    mobileRows: [
      { k: 'Reach', v: '4.2M' },
      { k: 'CTR', v: '2.8%' },
      { k: 'VTR', v: '78%' },
    ],
    mobileActions: [
      { t: 'Nissan', s: 'Interactive film' },
      { t: 'ANZ', s: 'Mobile campaign' },
      { t: 'Medibank', s: 'Social series' },
    ],
    mobileCta: 'View campaign',
    desktopTitle: 'Campaign dashboard',
    desktopSub: 'Performance across active flights',
    kpis: [
      { k: 'Reach', v: '4.2M', d: '+12%', up: true },
      { k: 'Engagement', v: '1.4M', d: '+8%', up: true },
      { k: 'Cost / result', v: '$0.42', d: '−6%', up: true },
    ],
    chartTitle: 'Engagement by week',
    listTitle: 'Active flights',
    table: [
      { k: 'Nissan · Interactive film', v: 'Live' },
      { k: 'ANZ · Mobile campaign', v: 'Live' },
      { k: 'Medibank · Social series', v: 'Live' },
      { k: 'Nissan · Retail spots', v: 'Scheduled' },
      { k: 'Medibank · Search', v: 'Complete' },
    ],
  },
  {
    id: 'kitchenwarehouse',
    image: 'assets/kitchenwarehouse-hero.jpg',
    gallery: [null, 'assets/placeholder-tall-1.jpg'],
    name: 'Kitchen Warehouse',
    logo: 'assets/logos/kitchenwarehouse.png',
    client: 'Kitchen Warehouse',
    /* PLACEHOLDER: year, role, headline, blurb and outcome are waiting
       on Nick's copy; no story yet, so the page shows the standard
       approach paragraph. */
    year: 'Copy coming soon',
    role: 'Copy coming soon',
    tags: ['E-commerce', 'UI', 'Visual design'],
    platform: 'Web',
    headline: 'Copy coming soon.',
    blurb: 'Copy coming soon.',
    outcome: 'Copy coming soon',
    /* colour theme for the generated cover (not shown while there's an image) */
    brand: 'ember',
    seed: 3.4,
  },
  {
    id: 'cargocrew',
    image: 'assets/cargocrew-hero.jpg',
    gallery: [null, 'assets/placeholder-tall-1.jpg'],
    name: 'Cargo Crew',
    logo: 'assets/logos/cargocrew.png',
    client: 'Cargo Crew',
    year: '2024',
    role: 'UX / UI Design',
    tags: ['Web', 'E-commerce', 'Brand'],
    blurb:
      "Designed Cargo Crew's online store so teams can personalise uniforms right on the product page, adding name embroidery or their own logo, with wholesale pricing for corporate orders. Taken from research through to shipped UI for the Melbourne workwear brand.",    outcome: 'Customisation built into the product page',
    brand: 'cargo',
    seed: 8.6,
    nav: ['Shop', 'Men', 'Women', 'Custom', 'Corporate'],
    navExtra: ['Sizing', 'My account'],
    mobileTitle: 'The modern uniform',
    mobileKpi: 'New season',
    mobileHeroLabel: 'Your order',
    mobileHeroValue: '$246',
    mobileHeroUnit: '4 items · free returns',
    mobileRingLabel: 'Uniform set',
    ringPct: 0.6,
    ringValue: '60%',
    ringSub: 'complete',
    mobileRows: [
      { k: 'Delivery', v: 'Free' },
      { k: 'Returns', v: '30 days' },
      { k: 'Embroidery', v: 'Ready' },
    ],
    mobileActions: [
      { t: 'Shop by industry', s: 'Hospitality, health, trades' },
      { t: 'Build a uniform', s: 'Customise your set' },
      { t: 'Corporate orders', s: 'Bulk pricing' },
    ],
    mobileCta: 'Checkout',
    desktopTitle: 'The uniform shop',
    desktopSub: 'Design-led workwear for crews worldwide',
    kpis: [
      { k: 'Products', v: '1,200', d: '+80', up: true },
      { k: 'Conversion', v: '3.8%', d: '+0.4%', up: true },
      { k: 'Repeat orders', v: '46%', d: '+5%', up: true },
    ],
    chartTitle: 'Sales by industry',
    listTitle: 'Top categories',
    table: [
      { k: 'Hospitality', v: '$1.4M' },
      { k: 'Healthcare', v: '$0.9M' },
      { k: 'Trades & industrial', v: '$0.7M' },
      { k: 'Corporate', v: '$0.6M' },
      { k: 'Accessories', v: '$0.3M' },
    ],
  },
  {
    id: 'suzuki',
    image: 'assets/suzuki-hero.jpg',
    gallery: [null, 'assets/placeholder-tall-1.jpg'],
    name: 'Suzuki',
    logo: 'assets/logos/suzuki.svg',
    logoScale: 0.8,
    client: 'Suzuki Motorcycles',
    year: '2021',
    role: 'Digital Design',
    tags: ['Web', 'Automotive', 'Campaign'],
    blurb:
      "Designed a build-your-bike journey for Suzuki Motorcycles: choose a colour, add parts, accessories and servicing, and watch the ride-away price and weekly finance update as you go, then send the build straight to a dealer.",
    outcome: 'Build-your-bike configurator · straight to a dealer',
    brand: 'suzuki',
    seed: 9.3,
    nav: ['Range', 'Road', 'Off-road', 'Scooters', 'Dealers'],
    navExtra: ['Offers', 'Book a ride'],
    mobileTitle: 'The range',
    mobileKpi: 'MY25 sale',
    mobileHeroLabel: 'V-Strom 650XT',
    mobileHeroValue: '$9,799',
    mobileHeroUnit: 'ride away · LAMS approved',
    mobileRingLabel: 'Spec match',
    ringPct: 0.84,
    ringValue: '84%',
    ringSub: 'for your riding',
    mobileRows: [
      { k: 'Engine', v: '645cc' },
      { k: 'Licence', v: 'LAMS' },
      { k: 'Availability', v: 'In stock' },
    ],
    mobileActions: [
      { t: 'Book a test ride', s: 'At your local dealer' },
      { t: 'Compare models', s: '3 selected' },
      { t: 'Find a dealer', s: '120 nationwide' },
    ],
    mobileCta: 'Book a ride',
    desktopTitle: 'Motorcycle range',
    desktopSub: 'Adventure, road, off-road and scooters',
    kpis: [
      { k: 'Models', v: '24', d: '+4', up: true },
      { k: 'Test rides', v: '3.1k', d: '+18%', up: true },
      { k: 'Dealer leads', v: '9.4k', d: '+12%', up: true },
    ],
    chartTitle: 'Interest by model family',
    listTitle: 'Popular models',
    table: [
      { k: 'V-Strom 650XT', v: 'Adventure' },
      { k: 'V-Strom 250SX', v: 'Adventure' },
      { k: 'GSX-R1000R', v: 'Sport' },
      { k: 'DR-Z400', v: 'Off-road' },
      { k: 'Burgman 400', v: 'Scooter' },
    ],
  },
];

/* ---------- square cover art used for the gallery + feature slots ---------- */

function drawCard(ctx, src, x, y, w, h, r, stroke) {
  ctx.save();
  rr(ctx, x, y, w, h, r);
  ctx.clip();
  ctx.drawImage(src, x, y, w, h);
  ctx.restore();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    rr(ctx, x, y, w, h, r);
    ctx.stroke();
  }
}

export function projectCover(p, size = 1200) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const ctx = cv.getContext('2d');
  const [c1, c2] = BRAND[p.brand];

  ctx.fillStyle = '#080b11';
  ctx.fillRect(0, 0, size, size);

  const wash = ctx.createLinearGradient(0, 0, size, size);
  wash.addColorStop(0, c1 + '30');
  wash.addColorStop(0.55, '#0a0e17');
  wash.addColorStop(1, c2 + '26');
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, size, size);

  const glow = ctx.createRadialGradient(size * 0.26, size * 0.2, 10, size * 0.26, size * 0.2, size * 0.95);
  glow.addColorStop(0, c1 + '44');
  glow.addColorStop(1, c1 + '00');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  /* desktop / tablet screen */
  const dw = size * 0.7;
  const dh = dw * (1860 / 1400);
  drawCard(ctx, desktopScreen(p), size * 0.18, size * 0.13, dw, dh, size * 0.02, 'rgba(255,255,255,.14)');

  /* phone screen overlapping */
  const pw = size * 0.255;
  const ph = pw * (1640 / 760);
  const px = size * 0.07;
  const py = size * 0.48;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.6)';
  ctx.shadowBlur = size * 0.03;
  ctx.shadowOffsetY = size * 0.012;
  ctx.fillStyle = '#05070c';
  rr(ctx, px, py, pw, ph, size * 0.018);
  ctx.fill();
  ctx.restore();
  drawCard(ctx, mobileScreen(p), px, py, pw, ph, size * 0.018, 'rgba(255,255,255,.2)');

  /* vignette for depth */
  const vg = ctx.createRadialGradient(size / 2, size / 2, size * 0.2, size / 2, size / 2, size * 0.78);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,.55)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, size, size);

  return cv;
}
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
    id: 'bupa',
    image: 'assets/2.jpg',
    name: 'Bupa',
    client: 'Bupa',
    year: '2023 — Now',
    role: 'Senior Visual & Interaction Designer',
    tags: ['Digital', 'Design System', 'Accessibility'],
    blurb:
      "Senior visual and interaction design across Bupa's digital health experiences — cover, claims and care journeys — helping shape the components and patterns teams build with.",
    outcome: 'Design system patterns · accessible health journeys',
    brand: 'aurora',
    seed: 1.2,
    nav: ['Home', 'Cover', 'Claims', 'Find care', 'Account'],
    navExtra: ['Wellbeing', 'Support'],
    mobileTitle: 'Your cover',
    mobileKpi: 'Active',
    mobileHeroLabel: 'Claim progress',
    mobileHeroValue: '$412',
    mobileHeroUnit: 'of $680 processed',
    mobileRingLabel: 'Extras used',
    ringPct: 0.61,
    ringValue: '61%',
    ringSub: 'this year',
    mobileRows: [
      { k: 'Hospital', v: 'Active' },
      { k: 'Extras', v: '61% used' },
      { k: 'Next payment', v: '12d' },
    ],
    mobileActions: [
      { t: 'Make a claim', s: 'Snap a receipt' },
      { t: 'Find a provider', s: '2,400 near you' },
      { t: 'Digital card', s: 'Ready on your phone' },
    ],
    mobileCta: 'Make a claim',
    desktopTitle: 'Claims overview',
    desktopSub: 'Your hospital and extras at a glance',
    kpis: [
      { k: 'Claims this year', v: '14', d: '+3', up: true },
      { k: 'Amount back', v: '$2.4k', d: '+$420', up: true },
      { k: 'Days to process', v: '3', d: '−1d', up: true },
    ],
    chartTitle: 'Claim value over time',
    listTitle: 'Recent claims',
    table: [
      { k: 'Dental · Check-up', v: '$180' },
      { k: 'Optical · Lenses', v: '$240' },
      { k: 'Physio · Session', v: '$95' },
      { k: 'GP · Consult', v: '$85' },
      { k: 'Pharmacy', v: '$42' },
    ],
  },
  {
    id: 'rebel',
    image: 'assets/3.jpg',
    name: 'Rebel Sport',
    client: 'Super Retail Group',
    year: '2022 — 2023',
    role: 'UI Designer',
    tags: ['Web', 'E-commerce', 'UI'],
    blurb:
      'New design and UI for the Rebel Sport website — from research and concepts through to testing and speccing out the final product.',
    outcome: 'End-to-end e-commerce UI · research to spec',
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
    image: 'assets/4.jpg',
    name: 'Telstra',
    client: 'Telstra',
    year: '2020 — 2022',
    role: 'Visual Designer',
    tags: ['Mobile', 'Accessibility', 'Design System'],
    blurb:
      "Highly functional, accessible phone activation and recharge flows, designed in a fast-paced agile environment — plus a member of the guild defining the Telstra 'Able' design system.",
    outcome: "Telstra 'Able' design system · accessible activation",
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
    id: 'tbwa',
    image: 'assets/5.jpg',
    name: 'TBWA \\ Tequila',
    client: 'Nissan · ANZ · Medibank',
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
    id: 'jwt',
    image: 'assets/6.jpg',
    name: 'JWT',
    client: 'JWT',
    year: '2012 — 2015',
    role: 'Digital Creative Lead',
    tags: ['Creative', 'Digital', 'Direction'],
    blurb:
      'Led digital creative across brand and campaign work — directing concept, design and delivery with the wider creative team.',
    outcome: 'Creative direction · brand & campaign',
    brand: 'verdant',
    seed: 6.4,
    nav: ['Work', 'Clients', 'Team', 'Awards', 'Contact'],
    navExtra: ['Careers', 'News'],
    mobileTitle: 'Studio feed',
    mobileKpi: 'Live',
    mobileHeroLabel: 'Projects',
    mobileHeroValue: '32',
    mobileHeroUnit: 'in the studio this year',
    mobileRingLabel: 'Awarded',
    ringPct: 0.25,
    ringValue: '8',
    ringSub: 'recognitions',
    mobileRows: [
      { k: 'Clients', v: '14' },
      { k: 'Awards', v: '8' },
      { k: 'Team', v: '21' },
    ],
    mobileActions: [
      { t: 'Latest work', s: '6 new projects' },
      { t: 'Case studies', s: 'Full write-ups' },
      { t: 'Contact', s: 'Start a project' },
    ],
    mobileCta: 'View work',
    desktopTitle: 'Studio overview',
    desktopSub: 'Digital creative across brand and campaign',
    kpis: [
      { k: 'Projects', v: '32', d: '+6', up: true },
      { k: 'Awards', v: '8', d: '+2', up: true },
      { k: 'Clients', v: '14', d: '+3', up: true },
    ],
    chartTitle: 'Output by quarter',
    listTitle: 'Selected clients',
    table: [
      { k: 'Automotive', v: 'Kia' },
      { k: 'FMCG', v: 'Nestlé' },
      { k: 'Finance', v: 'Westpac' },
      { k: 'Telco', v: 'Optus' },
      { k: 'Retail', v: 'Woolworths' },
    ],
  },
  {
    id: 'wcrs',
    image: 'assets/7.jpg',
    name: 'WCRS',
    client: 'WCRS',
    year: '2008 — 2012',
    role: 'Senior Digital Designer',
    tags: ['Digital', 'Craft', 'Campaign'],
    blurb:
      'Senior digital design across integrated advertising campaigns — from first concepts through to shipped digital experiences.',
    outcome: 'Integrated digital craft · multi-channel campaigns',
    brand: 'citrus',
    seed: 7.8,
    nav: ['Work', 'Campaigns', 'Craft', 'Studio', 'Contact'],
    navExtra: ['Archive', 'News'],
    mobileTitle: 'Campaign',
    mobileKpi: 'Featured',
    mobileHeroLabel: 'Impressions',
    mobileHeroValue: '2.1M',
    mobileHeroUnit: 'across launch week',
    mobileRingLabel: 'Brand recall',
    ringPct: 0.64,
    ringValue: '64%',
    ringSub: 'post-launch',
    mobileRows: [
      { k: 'Impressions', v: '2.1M' },
      { k: 'Recall', v: '64%' },
      { k: 'Placements', v: '38' },
    ],
    mobileActions: [
      { t: 'Launch film', s: '60s hero spot' },
      { t: 'Social cutdowns', s: '9 formats' },
      { t: 'Microsite', s: 'Interactive build' },
    ],
    mobileCta: 'View case',
    desktopTitle: 'Campaign overview',
    desktopSub: 'Integrated launch across channels',
    kpis: [
      { k: 'Impressions', v: '2.1M', d: '+18%', up: true },
      { k: 'Recall', v: '64%', d: '+7%', up: true },
      { k: 'Placements', v: '38', d: '+9', up: true },
    ],
    chartTitle: 'Reach by channel',
    listTitle: 'Channel breakdown',
    table: [
      { k: 'Broadcast · TV', v: '1.1M' },
      { k: 'Out of home', v: '480k' },
      { k: 'Digital · Display', v: '320k' },
      { k: 'Social', v: '180k' },
      { k: 'Print · Press', v: '90k' },
    ],
  },
  {
    id: 'cargocrew',
    image: 'assets/2.jpg',
    name: 'Cargo Crew',
    client: 'Cargo Crew',
    year: '2024',
    role: 'UX / UI Design',
    tags: ['Web', 'E-commerce', 'Brand'],
    blurb:
      'Home of the modern uniform. A design-led e-commerce experience for a Melbourne workwear brand — browsing, bespoke uniform builds and corporate ordering, from research through to shipped UI.',
    outcome: 'Design-led uniform e-commerce · bespoke ordering',
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
    image: 'assets/3.jpg',
    name: 'Suzuki Motorcycles',
    client: 'Suzuki Motorcycles',
    year: '2021',
    role: 'Digital Design',
    tags: ['Web', 'Automotive', 'Campaign'],
    blurb:
      "Digital design for Suzuki's motorcycle range — model discovery, a test-ride booking flow and campaign landing pages for the V-Strom and GSX-R families.",
    outcome: 'Range discovery · test-ride booking flow',
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
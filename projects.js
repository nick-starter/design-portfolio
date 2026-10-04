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
};

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

function mobileScreen(p, W = 760, H = 1640) {
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

function desktopScreen(p, W = 1400, H = 1860) {
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
    id: 'aurora',
    name: 'Aurora Health',
    client: 'Aurora Health',
    year: '2026',
    role: 'Product Design · Design System',
    tags: ['Mobile', 'Web', 'Design System'],
    blurb:
      'A clinician-facing platform that turns raw patient telemetry into a single calm screen. Built a token-driven design system shared across iOS, iPadOS and web.',
    outcome: 'Cut onboarding from 9 steps to 3 · 41% faster triage',
    brand: 'aurora',
    seed: 1.2,
    nav: ['Overview', 'Patients', 'Analytics', 'Devices', 'Alerts'],
    navExtra: ['Cohort trends', 'Audit log'],
    mobileTitle: 'Shift overview',
    mobileKpi: 'On track',
    mobileHeroLabel: 'Active monitors',
    mobileHeroValue: '1,284',
    mobileHeroUnit: 'devices online',
    mobileRingLabel: 'Escalation rate',
    ringPct: 0.22,
    ringValue: '22%',
    ringSub: 'of 1,284',
    mobileRows: [
      { k: 'Acknowledged', v: '96%' },
      { k: 'Median response', v: '4m 12s' },
      { k: 'Open alerts', v: '37' },
    ],
    mobileActions: [
      { t: 'Escalations', s: '3 need review now' },
      { t: 'Shift handover', s: 'Due in 22 minutes' },
      { t: 'Device fleet', s: '2 offline in Ward 4' },
    ],
    mobileCta: 'Start handover',
    desktopTitle: 'Clinical operations',
    desktopSub: 'Live telemetry across 14 wards and 3 regions',
    kpis: [
      { k: 'Monitors online', v: '1,284', d: '+3.2%', up: true },
      { k: 'Median response', v: '4m', d: '-38s', up: true },
      { k: 'Escalation rate', v: '22%', d: '+1.4%', up: false },
    ],
    chartTitle: 'Alert volume vs. resolution',
    ringPct: 0.22,
    ringValue: '22%',
    ringSub: 'escalated',
    listTitle: 'Priority queue',
    table: [
      { k: 'Ward 4 · Bed 12', v: 'Critical' },
      { k: 'Ward 2 · Bed 07', v: 'Warning' },
      { k: 'ICU · Bed 03', v: 'Warning' },
      { k: 'Ward 7 · Bed 21', v: 'Review' },
      { k: 'Ward 1 · Bed 05', v: 'Nominal' },
    ],
  },
  {
    id: 'verdant',
    name: 'Verdant',
    client: 'Verdant',
    year: '2025',
    role: 'Brand · Product Design',
    tags: ['Mobile', 'Web', 'Motion'],
    blurb:
      'A carbon-accounting app for growers. Every screen is one tap deeper than it strictly needs to be — the whole product is designed to be used with muddy hands.',
    outcome: '48k installs in first quarter · 4.8★ store rating',
    brand: 'verdant',
    seed: 2.6,
    nav: ['Dashboard', 'Fields', 'Scrapbook', 'Reports', 'Team'],
    navExtra: ['Integrations', 'Billing'],
    mobileTitle: 'Spring audit',
    mobileKpi: 'On track',
    mobileHeroLabel: 'Soil carbon',
    mobileHeroValue: '4.8',
    mobileHeroUnit: 'tCO₂e / hectare',
    mobileRingLabel: 'Reduction vs. baseline',
    ringPct: 0.68,
    ringValue: '68%',
    ringSub: 'of target',
    mobileRows: [
      { k: 'Fields logged', v: '14 / 16' },
      { k: 'Avg. change', v: '+0.4' },
      { k: 'Next audit', v: '12d' },
    ],
    mobileActions: [
      { t: 'Log a field visit', s: 'GPS + photos, offline' },
      { t: 'Scrapbook', s: '32 observations' },
      { t: 'Share report', s: 'PDF, ready to send' },
    ],
    mobileCta: 'Log observation',
    desktopTitle: 'Portfolio overview',
    desktopSub: '1,240 hectares across 16 fields',
    kpis: [
      { k: 'Soil carbon', v: '4.8', d: '+0.4', up: true },
      { k: 'Fields verified', v: '14', d: '+3', up: true },
      { k: 'Est. credit value', v: '$212k', d: '+$31k', up: true },
    ],
    chartTitle: 'Carbon balance by field',
    ringPct: 0.68,
    ringValue: '68%',
    ringSub: 'of target',
    listTitle: 'Recent activity',
    table: [
      { k: 'North Paddock', v: '+0.6' },
      { k: 'River Flat', v: '+0.4' },
      { k: 'Old Orchard', v: '+0.3' },
      { k: 'South Slope', v: '−0.1' },
      { k: 'Kiln Field', v: '+0.2' },
    ],
  },
  {
    id: 'ember',
    name: 'Ember Transit',
    client: 'Ember Transit',
    year: '2025',
    role: 'UX Research · Interaction Design',
    tags: ['Mobile', 'Web', 'Wayfinding'],
    blurb:
      'Rebuilt the rider app around one question: where am I going next? Live disruption data, platform-level wayfinding, and a ticket wallet that works offline.',
    outcome: '1.9M monthly riders · 31% fewer support tickets',
    brand: 'ember',
    seed: 3.9,
    nav: ['Journey', 'Network', 'Timetable', 'Tickets', 'Alerts'],
    navExtra: ['Lost property', 'Report issue'],
    mobileTitle: 'Your journey',
    mobileKpi: 'On time',
    mobileHeroLabel: 'Next departure',
    mobileHeroValue: '4',
    mobileHeroUnit: 'min · Platform 3',
    mobileRingLabel: 'On-time reliability',
    ringPct: 0.91,
    ringValue: '91%',
    ringSub: 'last 30 days',
    mobileRows: [
      { k: 'Northern', v: '4 min' },
      { k: 'Airport loop', v: '11 min' },
      { k: 'Disruption', v: 'None' },
    ],
    mobileActions: [
      { t: 'Ticket wallet', s: '3 active passes' },
      { t: 'Network status', s: 'All lines running' },
      { t: 'Plan a trip', s: 'Step-free options' },
    ],
    mobileCta: 'Scan ticket',
    desktopTitle: 'Network overview',
    desktopSub: 'Live state for 186 stations and 14 lines',
    kpis: [
      { k: 'Riders today', v: '1.9M', d: '+8.1%', up: true },
      { k: 'On-time', v: '91%', d: '+2.0%', up: true },
      { k: 'Open faults', v: '3', d: '−11', up: true },
    ],
    chartTitle: 'Ridership by hour',
    ringPct: 0.91,
    ringValue: '91%',
    ringSub: 'on time',
    listTitle: 'Line status',
    table: [
      { k: 'Northern', v: 'Good service' },
      { k: 'Airport loop', v: 'Good service' },
      { k: 'Riverside', v: 'Minor delays' },
      { k: 'Harbour', v: 'Good service' },
      { k: 'Cross-city', v: 'Planned work' },
    ],
  },
  {
    id: 'violet',
    name: 'Violet Studio',
    client: 'Violet Studio',
    year: '2024',
    role: 'Art Direction · Web',
    tags: ['Web', 'Motion', 'Brand'],
    blurb:
      'A portfolio site for an architecture practice. The interface stays out of the way: type-led, scroll-driven, and rebuilt around the work rather than around the chrome.',
    outcome: 'Awwwards Site of the Day · 2× agency enquiries',
    brand: 'violet',
    seed: 5.1,
    nav: ['Work', 'Studio', 'Journal', 'Awards', 'Contact'],
    navExtra: ['Team', 'Opportunities'],
    mobileTitle: 'Selected work',
    mobileKpi: '2024',
    mobileHeroLabel: 'Built projects',
    mobileHeroValue: '24',
    mobileHeroUnit: 'across 6 countries',
    mobileRingLabel: 'Awards won',
    ringPct: 0.5,
    ringValue: '12',
    ringSub: 'since 2019',
    mobileRows: [
      { k: 'Cultural', v: '9' },
      { k: 'Residential', v: '8' },
      { k: 'Civic', v: '7' },
    ],
    mobileActions: [
      { t: 'Studio', s: '18 people, 2 studios' },
      { t: 'Journal', s: '6 new essays' },
      { t: 'Awards', s: '12 recognitions' },
    ],
    mobileCta: 'View journal',
    desktopTitle: 'Practice overview',
    desktopSub: 'Architecture and urban design, est. 2011',
    kpis: [
      { k: 'Built projects', v: '24', d: '+4', up: true },
      { k: 'Awards', v: '12', d: '+3', up: true },
      { k: 'People', v: '18', d: '+2', up: true },
    ],
    chartTitle: 'Project value over time',
    ringPct: 0.5,
    ringValue: '12',
    ringSub: 'awards',
    listTitle: 'Current projects',
    table: [
      { k: 'Riverside Library', v: '2026' },
      { k: 'Civic Hall', v: '2025' },
      { k: 'Harbour Pavilion', v: '2025' },
      { k: 'North Housing', v: '2024' },
      { k: 'Kiln Yard', v: '2024' },
    ],
  },
  {
    id: 'ocean',
    name: 'Ocean Freight',
    client: 'Ocean Freight',
    year: '2024',
    role: 'Product Design · Data Viz',
    tags: ['Web', 'Mobile', 'Data Viz'],
    blurb:
      'Container tracking for people who do not work in shipping. Progressive disclosure everywhere: the first screen answers one question, the tenth answers twelve.',
    outcome: 'Support contacts down 52% · 140k shipments tracked',
    brand: 'ocean',
    seed: 6.4,
    nav: ['Shipments', 'Tracking', 'Rates', 'Documents', 'Alerts'],
    navExtra: ['Accounts', 'Settings'],
    mobileTitle: 'In transit',
    mobileKpi: 'On schedule',
    mobileHeroLabel: 'Shipments',
    mobileHeroValue: '7',
    mobileHeroUnit: 'active consignments',
    mobileRingLabel: 'On schedule',
    ringPct: 0.86,
    ringValue: '86%',
    ringSub: 'of 7 active',
    mobileRows: [
      { k: 'Next arrival', v: '3d' },
      { k: 'In customs', v: '1' },
      { k: 'Delayed', v: '0' },
    ],
    mobileActions: [
      { t: 'Track a container', s: 'Enter any number' },
      { t: 'Documents', s: '12 ready to sign' },
      { t: 'Rate quote', s: '48h transit estimate' },
    ],
    mobileCta: 'Track container',
    desktopTitle: 'Freight control',
    desktopSub: 'Live status for 140 active consignments',
    kpis: [
      { k: 'Active shipments', v: '140', d: '+12', up: true },
      { k: 'On schedule', v: '86%', d: '+4.1%', up: true },
      { k: 'Customs holds', v: '4', d: '−7', up: true },
    ],
    chartTitle: 'Volume by lane',
    ringPct: 0.86,
    ringValue: '86%',
    ringSub: 'on time',
    listTitle: 'Exceptions',
    table: [
      { k: 'MSKU 774120', v: 'Customs' },
      { k: 'TCLU 339881', v: 'Weather' },
      { k: 'CMAU 551043', v: 'Review' },
      { k: 'HLXU 220914', v: 'On track' },
      { k: 'OOLU 998302', v: 'On track' },
    ],
  },
  {
    id: 'citrus',
    name: 'Citrus Pay',
    client: 'Citrus Pay',
    year: '2024',
    role: 'Product Design · Motion',
    tags: ['Mobile', 'Web', 'Fintech'],
    blurb:
      'A consumer payments app designed around one-tap repeat purchases, with an accessibility pass that shipped as a first-class constraint rather than a retrofit.',
    outcome: 'AA+ accessibility · 2.1M accounts opened',
    brand: 'citrus',
    seed: 7.8,
    nav: ['Home', 'Cards', 'Pay', 'Insights', 'Settings'],
    navExtra: ['Limits', 'Devices'],
    mobileTitle: 'Good afternoon',
    mobileKpi: 'Verified',
    mobileHeroLabel: 'Available to spend',
    mobileHeroValue: '$2,480',
    mobileHeroUnit: 'across 2 cards',
    mobileRingLabel: 'Monthly budget used',
    ringPct: 0.37,
    ringValue: '37%',
    ringSub: 'of $6,700',
    mobileRows: [
      { k: 'Groceries', v: '$412' },
      { k: 'Transport', v: '$86' },
      { k: 'Dining', v: '$149' },
    ],
    mobileActions: [
      { t: 'Pay a contact', s: 'Recent: Ana, Rob, Kit' },
      { t: 'Card controls', s: 'Freeze, limits, taps' },
      { t: 'Spending insights', s: 'This month' },
    ],
    mobileCta: 'Scan to pay',
    desktopTitle: 'Money overview',
    desktopSub: 'Accounts, cards and spending across your household',
    kpis: [
      { k: 'Net position', v: '+$4.2k', d: '+$860', up: true },
      { k: 'Spent this month', v: '$2,481', d: '−6.0%', up: true },
      { k: 'Cards active', v: '3', d: '+1', up: true },
    ],
    chartTitle: 'Spending by category',
    ringPct: 0.37,
    ringValue: '37%',
    ringSub: 'budget used',
    listTitle: 'Top merchants',
    table: [
      { k: 'Coles', v: '$248' },
      { k: 'Uber', v: '$96' },
      { k: 'BP', v: '$74' },
      { k: 'Blue Bottle', v: '$41' },
      { k: 'JB Hi-Fi', v: '$320' },
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
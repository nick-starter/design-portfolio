import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { PROJECTS, buildTextures } from './projects.js';
import { buildPhone, buildTablet } from './devices.js';

/* ================= DOM ================= */
const $ = (s) => document.querySelector(s);
const canvas = $('#stage-canvas');
const loader = $('#loader');
const flipBtn = $('#flipBtn');
const resetBtn = $('#resetBtn');
const autoBtn = $('#autoBtn');
const hint = $('#hint');
const metaName = $('#metaName');
const metaBlurb = $('#metaBlurb');
const metaRole = $('#metaRole');
const metaTags = $('#metaTags');
const metaOutcome = $('#metaOutcome');
const metaEl = $('#meta');
const nav = $('#projectNav');
const yearEl = $('#year');

yearEl.textContent = new Date().getFullYear();

/* ================= Project rail ================= */
let current = 0;

function paintNav() {
  nav.innerHTML = PROJECTS.map(
    (p, i) => `
    <button class="rail-item${i === current ? ' is-active' : ''}" data-i="${i}" aria-current="${i === current}">
      <span class="rail-thumb" data-i="${i}" aria-hidden="true"></span>
      <span class="rail-body">
        <span class="rail-name">${p.name}</span>
        <span class="rail-meta">${p.year} · ${p.tags.join(' · ')}</span>
      </span>
    </button>`
  ).join('');
  nav.querySelectorAll('.rail-item').forEach((b) => {
    b.onclick = () => select(+b.dataset.i);
  });
  paintThumbs();
}

/* Small rounded-rect path helper */
function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/* Render a project thumbnail: tablet screen behind, phone screen in front. */
function drawThumb(canvasEl, p) {
  const t = buildTextures(p);
  const W = 480;
  const H = 640;
  const c = canvasEl.ownerDocument.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d');

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0d1220');
  bg.addColorStop(1, '#0a0f1d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  /* soft top glow */
  const glow = ctx.createRadialGradient(W * 0.5, -40, 20, W * 0.5, -40, W * 0.9);
  glow.addColorStop(0, 'rgba(255,43,28,.22)');
  glow.addColorStop(1, 'rgba(255,43,28,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H * 0.7);

  /* tablet screen card */
  const tw = W * 0.6;
  const th = tw * (1860 / 1400);
  const tx = (W - tw) / 2;
  const ty = H * 0.06;
  ctx.save();
  roundRectPath(ctx, tx, ty, tw, th, 18);
  ctx.clip();
  ctx.drawImage(t.desktop.image, tx, ty, tw, th);
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,.14)';
  ctx.lineWidth = 2;
  roundRectPath(ctx, tx, ty, tw, th, 18);
  ctx.stroke();

  /* phone screen card, overlapping bottom-right */
  const pw = W * 0.3;
  const ph = pw * (1640 / 760);
  const px = W * 0.62;
  const py = H * 0.42;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.7)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = '#05070c';
  roundRectPath(ctx, px, py, pw, ph, 16);
  ctx.fill();
  ctx.restore();
  ctx.save();
  roundRectPath(ctx, px, py, pw, ph, 16);
  ctx.clip();
  ctx.drawImage(t.mobile.image, px, py, pw, ph);
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,.18)';
  ctx.lineWidth = 2;
  roundRectPath(ctx, px, py, pw, ph, 16);
  ctx.stroke();

  /* bottom fade so text on the card stays legible */
  const fade = ctx.createLinearGradient(0, H - 150, 0, H);
  fade.addColorStop(0, 'rgba(8,11,18,0)');
  fade.addColorStop(1, 'rgba(8,11,18,.85)');
  ctx.fillStyle = fade;
  ctx.fillRect(0, H - 150, W, 150);

  /* fill the actual thumb element */
  const box = canvasEl;
  box.innerHTML = '';
  c.style.width = '100%';
  c.style.height = '100%';
  c.style.objectFit = 'cover';
  box.appendChild(c);

  t.mobile.dispose();
  t.desktop.dispose();
}

function paintThumbs() {
  document.querySelectorAll('.rail-thumb').forEach((el) => {
    drawThumb(el, PROJECTS[+el.dataset.i]);
  });
}

function paintMeta(p) {
  metaEl.classList.add('swap');
  setTimeout(() => {
    metaName.textContent = p.name;
    metaBlurb.textContent = p.blurb;
    metaRole.textContent = p.role;
    metaOutcome.textContent = p.outcome;
    metaTags.innerHTML = p.tags.map((t) => `<span class="tag">${t}</span>`).join('');
    metaEl.classList.remove('swap');
  }, 120);
}

/* ================= Renderer ================= */
let renderer;
try {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
} catch (e) {
  loader.innerHTML = '<p class="loader-err">This showcase needs WebGL.</p>';
  throw e;
}

const DPR = Math.min(window.devicePixelRatio || 1, 2);
renderer.setPixelRatio(DPR);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0c1114, 0.11);

/* Environment for believable metal + glass */
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

/* ================= Camera ================= */
const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.01, 60);
camera.position.set(0.05, 0.035, 0.44);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.075;
controls.enablePan = false;
controls.minDistance = 0.2;
controls.maxDistance = 1.1;
controls.minPolarAngle = Math.PI * 0.16;
controls.maxPolarAngle = Math.PI * 0.84;
controls.rotateSpeed = 0.75;
controls.zoomSpeed = 0.7;
controls.target.set(0, 0, 0);
controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE };
controls.update();

/* Distance that frames a box of the given size in the current viewport. */
function distFor(w, h) {
  const vFov = (camera.fov * Math.PI) / 180;
  const dH = h / 2 / Math.tan(vFov / 2);
  const dW = w / 2 / (Math.tan(vFov / 2) * camera.aspect);
  return Math.max(dH, dW);
}
/* Phone frame is 0.072 x 0.147; tablet is 0.180 x 0.244. Add margin. */
const FIT_PHONE = distFor(0.115, 0.195);
const FIT_TABLET = distFor(0.235, 0.30);
const fitDistance = (k) => FIT_PHONE + (FIT_TABLET - FIT_PHONE) * k;

/* ================= Lighting ================= */
scene.add(new THREE.AmbientLight(0xd8d2c8, 0.35));

const key = new THREE.DirectionalLight(0xffffff, 2.6);
key.position.set(0.32, 0.55, 0.5);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.radius = 3;
key.shadow.bias = -0.0004;
key.shadow.normalBias = 0.002;
const sc = key.shadow.camera;
sc.near = 0.05;
sc.far = 3;
sc.left = -0.3;
sc.right = 0.3;
sc.top = 0.3;
sc.bottom = -0.3;
scene.add(key);

const fill = new THREE.DirectionalLight(0xffc4b0, 0.8);
fill.position.set(-0.45, 0.1, 0.3);
scene.add(fill);

const rim = new THREE.DirectionalLight(0xfff0e6, 1.5);
rim.position.set(-0.25, 0.4, -0.55);
scene.add(rim);

const under = new THREE.PointLight(0xff4a34, 0.4, 1.2);
under.position.set(0, -0.22, 0.12);
scene.add(under);

/* ================= Floor + soft contact shadow ================= */
const floorMat = new THREE.MeshStandardMaterial({
  color: 0x0e1417,
  roughness: 0.62,
  metalness: 0.18,
  envMapIntensity: 0.5,
});
const floor = new THREE.Mesh(new THREE.CircleGeometry(1.1, 96), floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.115;
floor.receiveShadow = true;
scene.add(floor);

const ringMat = new THREE.MeshBasicMaterial({
  color: 0xff2b1c,
  transparent: true,
  opacity: 0.14,
  side: THREE.DoubleSide,
});
[0.115, 0.135].forEach((r, i) => {
  const m = new THREE.Mesh(new THREE.RingGeometry(r, r + 0.0012, 128), ringMat);
  m.rotation.x = -Math.PI / 2;
  m.position.y = -0.1146 + i * 0.0002;
  scene.add(m);
});

/* Fake soft blob shadow, keeps the device grounded even on weak GPUs */
const blobTex = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(128, 128, 4, 128, 128, 126);
  g.addColorStop(0, 'rgba(0,0,0,.72)');
  g.addColorStop(0.45, 'rgba(0,0,0,.34)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
})();
const blob = new THREE.Mesh(
  new THREE.PlaneGeometry(0.24, 0.2),
  new THREE.MeshBasicMaterial({
    map: blobTex,
    transparent: true,
    depthWrite: false,
    opacity: 0.9,
  })
);
blob.rotation.x = -Math.PI / 2;
blob.position.y = -0.1142;
scene.add(blob);

/* ================= Devices ================= */
const stage = new THREE.Group();
scene.add(stage);

const PHONE_TINTS = [0x2a2c31, 0xb9bcc2, 0x3f4a5c, 0xcfc7bb, 0x1d1f24];
let tex = buildTextures(PROJECTS[0]);

const phone = buildPhone(tex.mobile, { bodyColor: PHONE_TINTS[0] });
const tablet = buildTablet(tex.desktop, { bodyColor: 0xdedfe3 });
tablet.visible = false;
stage.add(phone, tablet);

/* iPad stands upright next to the phone while the phone is showing */
const tabletHome = new THREE.Group();
tabletHome.position.set(0.135, -0.012, -0.03);
tabletHome.rotation.y = -0.42;
tabletHome.visible = false;
tabletHome.add(tablet);
stage.add(tabletHome);

/* ================= State machine ================= */
const STATE = { PHONE: 0, TABLET: 1 };
let state = STATE.PHONE;
let tween = 1;            // 0 = phone fully out, 1 = tablet fully out
let tweenTarget = 0;
let autoSpin = true;
let idle = 0;
let userTouched = false;

/* device tint cycles per project on the phone */
let tintIndex = 0;

function applyProject(i, { retint = true } = {}) {
  current = i;
  const p = PROJECTS[i];
  tex = buildTextures(p);

  const oldM = phone.userData.screen.material.map;
  phone.userData.screen.material.map = tex.mobile;
  phone.userData.screen.material.emissiveMap = tex.mobile;
  phone.userData.screen.material.needsUpdate = true;
  oldM.dispose();

  if (retint) {
    tintIndex = (tintIndex + 1) % PHONE_TINTS.length;
    const c = PHONE_TINTS[tintIndex];
    phone.traverse((o) => {
      if (o.isMesh && o.material && o.material.metalness === 1 && o.material.color) {
        // only retint the frame/bump/buttons, not the lens or screen
        if (o.geometry.type === 'RoundedBoxGeometry') o.material.color.setHex(c);
      }
    });
  }

  paintNav();
  paintMeta(p);
  idle = 0;
}

function setState(next) {
  if (state === next) return;
  state = next;
  tweenTarget = next === STATE.TABLET ? 1 : 0;
  flipBtn.querySelector('span').textContent =
    next === STATE.PHONE ? 'Show iPad' : 'Show iPhone';
  flipBtn.setAttribute('aria-pressed', next === STATE.TABLET ? 'true' : 'false');
  hint.textContent =
    next === STATE.PHONE
      ? 'Drag to orbit · scroll to zoom'
      : 'Drag to orbit · scroll to zoom';
}

flipBtn.onclick = () => setState(state === STATE.PHONE ? STATE.TABLET : STATE.PHONE);

resetBtn.onclick = () => {
  controls.target.set(0, 0, 0);
  camera.position.set(0.05, 0.035, 1);
  dollyTo(ease(tween), true);
  state = STATE.PHONE;
  tweenTarget = 0;
  flipBtn.querySelector('span').textContent = 'Show iPad';
  userTouched = false;
  idle = 0;
};

autoBtn.onclick = () => {
  autoSpin = !autoSpin;
  autoBtn.setAttribute('aria-pressed', String(autoSpin));
  autoBtn.classList.toggle('is-on', autoSpin);
  autoBtn.textContent = autoSpin ? 'Auto-orbit: on' : 'Auto-orbit: off';
};
autoBtn.classList.add('is-on');

renderer.domElement.addEventListener('pointerdown', () => {
  userTouched = true;
  idle = 0;
});
renderer.domElement.addEventListener('wheel', () => {
  userTouched = true;
  idle = 0;
}, { passive: true });

addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') select((current + 1) % PROJECTS.length);
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp')
    select((current - 1 + PROJECTS.length) % PROJECTS.length);
  if (e.key === 'f' || e.key === 'F')
    setState(state === STATE.PHONE ? STATE.TABLET : STATE.PHONE);
});

function select(i) {
  if (i === current) return;
  applyProject(i);
}

/* ================= Loop ================= */
const clock = new THREE.Clock();
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* Dolly the camera to whatever distance frames the active device. */
function dollyTo(k, snap = false) {
  const d = fitDistance(k);
  const dir = camera.position.clone().sub(controls.target);
  const len = dir.length() || 1;
  dir.multiplyScalar(1 / len);
  if (snap) camera.position.copy(controls.target).addScaledVector(dir, d);
  else {
    const next = THREE.MathUtils.lerp(len, d, 0.14);
    camera.position.copy(controls.target).addScaledVector(dir, next);
  }
  controls.maxDistance = Math.max(1.1, d * 1.9);
  controls.minDistance = d * 0.55;
}

function animate() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const time = clock.elapsedTime;

  /* morph */
  if (tween !== tweenTarget) {
    const speed = 1 / 0.62;
    const dir = tweenTarget > tween ? 1 : -1;
    tween = Math.min(1, Math.max(0, tween + dir * speed * dt));
  }
  const k = ease(tween);

  /* phone: slides forward, tips back, fades out */
  const pOut = k;
  phone.position.x = -pOut * 0.028;
  phone.position.y = pOut * 0.012;
  phone.position.z = pOut * 0.055;
  phone.rotation.y = pOut * 0.85;
  phone.rotation.x = -pOut * 0.22;
  phone.scale.setScalar(1 - pOut * 0.12);
  phone.visible = pOut < 0.995;

  /* tablet: rises from the floor and settles */
  const tIn = k;
  tabletHome.visible = tIn > 0.005;
  tabletHome.position.y = -0.012 + (1 - tIn) * -0.16;
  tabletHome.rotation.y = -0.42 + (1 - tIn) * 0.5;
  tabletHome.rotation.x = (1 - tIn) * 0.5;
  tabletHome.scale.setScalar(0.9 + tIn * 0.1);
  tablet.visible = true;

  /* screen brightness lifts slightly when centred */
  phone.userData.screen.material.emissiveIntensity = 0.85 * (1 - pOut * 0.8);
  tablet.userData.screen.material.emissiveIntensity = 0.85 * (0.35 + tIn * 0.65);

  /* contact shadow + floor rings track whichever device is in front */
  const spread = 1 + tIn * 0.55;
  blob.scale.set(spread, spread, 1);
  blob.material.opacity = 0.9 - tIn * 0.25;
  blob.position.x = -0.028 * (1 - tIn) + 0.135 * tIn;

  /* keep the active device framed as the morph changes */
  dollyTo(k);

  /* gentle idle float */
  stage.position.y = Math.sin(time * 0.75) * 0.0035;
  stage.rotation.z = Math.sin(time * 0.5) * 0.012;

  /* auto-orbit resumes after inactivity */
  idle += dt;
  if (autoSpin && idle > 3.5 && !userTouched) {
    const a = 0.16 * dt;
    const x = camera.position.x - controls.target.x;
    const z = camera.position.z - controls.target.z;
    camera.position.x = controls.target.x + x * Math.cos(a) + z * Math.sin(a);
    camera.position.z = controls.target.z - x * Math.sin(a) + z * Math.cos(a);
  }

  controls.target.lerp(new THREE.Vector3(0, 0, 0), 0.08);
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

/* ================= Resize ================= */
function resize() {
  const r = canvas.getBoundingClientRect();
  const w = Math.max(1, Math.round(r.width));
  const h = Math.max(1, Math.round(r.height));
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(w, h, false);
  dollyTo(ease(tween), true);
}
addEventListener('resize', resize);

/* ================= Go ================= */
paintNav();
paintMeta(PROJECTS[0]);
resize();
animate();

requestAnimationFrame(() => {
  loader.classList.add('is-done');
  setTimeout(() => loader.remove(), 700);
});

/* Preload remaining textures while idle so switching feels instant */
const idleWarm = () => {
  PROJECTS.forEach((p, i) => {
    if (i === 0) return;
    buildTextures(p);
  });
  removeEventListener('load', idleWarm);
};
addEventListener('load', idleWarm);

/* Small handle for QA/debugging from the console. */
window.__folio = {
  renderer,
  scene,
  camera,
  projects: PROJECTS,
  select,
  setState,
  flip: () => setState(state === STATE.PHONE ? STATE.TABLET : STATE.PHONE),
  get morph() {
    return tween;
  },
  get device() {
    return tween > 0.5 ? 'tablet' : 'phone';
  },
};
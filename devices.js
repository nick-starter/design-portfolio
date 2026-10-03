/* ------------------------------------------------------------------
   Realistic device construction (iPhone + portrait iPad)
   Units are metres-ish: phones ~0.071 x 0.146
------------------------------------------------------------------- */

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

/* Titanium / aluminium frame that reacts to the environment map */
function metal(color, roughness, metalness) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness,
    metalness,
    clearcoat: 0.35,
    clearcoatRoughness: 0.28,
    envMapIntensity: 1.5,
  });
}

/* Screen: emissive so it looks lit, with a faint glass sheen on top */
function screenMat(map) {
  return new THREE.MeshStandardMaterial({
    map,
    emissiveMap: map,
    emissive: 0xffffff,
    emissiveIntensity: 0.85,
    roughness: 0.16,
    metalness: 0,
  });
}

/* Thin transparent layer that catches the environment = glass reflection */
function glassMat() {
  return new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.045,
    roughness: 0.03,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    envMapIntensity: 2.4,
    depthWrite: false,
  });
}

function cameraLens(r = 0.0105) {
  return new THREE.MeshPhysicalMaterial({
    color: 0x0a0c12,
    roughness: 0.05,
    metalness: 0.4,
    clearcoat: 1,
    clearcoatRoughness: 0,
    envMapIntensity: 2.6,
  });
}

function flashMat() {
  return new THREE.MeshStandardMaterial({
    color: 0x3a3f4a,
    roughness: 0.35,
    metalness: 0.6,
    envMapIntensity: 1.6,
  });
}

/* ---------------- iPhone ---------------- */

export function buildPhone(screenTexture, { bodyColor = 0x2a2c31 } = {}) {
  const g = new THREE.Group();
  const W = 0.0715;
  const H = 0.1467;
  const D = 0.0079;
  const R = 0.0125;

  const frame = metal(bodyColor, 0.28, 1.0);
  const body = new THREE.Mesh(new RoundedBoxGeometry(W, H, D, 6, R), frame);
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);

  /* front glass + active area */
  const glass = new THREE.Mesh(
    new RoundedBoxGeometry(W - 0.0016, H - 0.0016, 0.0012, 4, R - 0.0006),
    glassMat()
  );
  glass.position.z = D / 2 + 0.0004;
  g.add(glass);

  const bezelW = 0.0021;
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(W - bezelW * 2, H - bezelW * 2),
    screenMat(screenTexture)
  );
  screen.position.z = D / 2 + 0.0009;
  g.add(screen);

  /* Dynamic Island */
  const island = new THREE.Mesh(
    new RoundedBoxGeometry(0.0245, 0.0068, 0.0008, 3, 0.0034),
    new THREE.MeshStandardMaterial({ color: 0x05070b, roughness: 0.5, metalness: 0.3 })
  );
  island.position.set(0, H / 2 - 0.0128, D / 2 + 0.0011);
  g.add(island);

  const islandLens = new THREE.Mesh(
    new THREE.CircleGeometry(0.0018, 20),
    cameraLens(0.002)
  );
  islandLens.position.set(-0.0072, H / 2 - 0.0128, D / 2 + 0.0017);
  g.add(islandLens);

  /* rear camera plateau */
  const bump = new THREE.Mesh(
    new RoundedBoxGeometry(0.0295, 0.0295, 0.0026, 4, 0.0092),
    metal(bodyColor, 0.26, 1.0)
  );
  bump.position.set(-W / 2 + 0.021, H / 2 - 0.021, -D / 2 - 0.0011);
  bump.castShadow = true;
  g.add(bump);

  const lensGeo = new THREE.CylinderGeometry(0.0062, 0.0062, 0.0016, 32);
  const ringGeo = new THREE.CylinderGeometry(0.0079, 0.0079, 0.0014, 32);
  const positions = [
    [-0.0062, 0.0062],
    [0.0062, 0.0062],
    [-0.0062, -0.0062],
  ];
  positions.forEach(([dx, dy]) => {
    const ring = new THREE.Mesh(ringGeo, metal(0x4a4d55, 0.2, 1));
    ring.rotation.x = Math.PI / 2;
    ring.position.set(bump.position.x + dx, bump.position.y + dy, -D / 2 - 0.0026);
    g.add(ring);

    const lens = new THREE.Mesh(lensGeo, cameraLens());
    lens.rotation.x = Math.PI / 2;
    lens.position.set(bump.position.x + dx, bump.position.y + dy, -D / 2 - 0.0032);
    g.add(lens);
  });

  const flash = new THREE.Mesh(new THREE.CircleGeometry(0.0026, 20), flashMat());
  flash.position.set(bump.position.x + 0.0062, bump.position.y - 0.0062, -D / 2 - 0.0027);
  flash.rotation.y = Math.PI;
  g.add(flash);

  const mic = new THREE.Mesh(
    new THREE.CircleGeometry(0.0009, 12),
    new THREE.MeshStandardMaterial({ color: 0x1a1c22, roughness: 0.8 })
  );
  mic.position.set(bump.position.x - 0.0062, bump.position.y - 0.0062, -D / 2 - 0.0027);
  mic.rotation.y = Math.PI;
  g.add(mic);

  /* side buttons */
  const btnMat = metal(bodyColor, 0.3, 1.0);
  const mkBtn = (w, h, x, y) => {
    const b = new THREE.Mesh(new RoundedBoxGeometry(w, h, D * 0.62, 3, w / 2), btnMat);
    b.position.set(x, y, 0);
    g.add(b);
  };
  mkBtn(0.0016, 0.0125, W / 2 + 0.0004, 0.028);
  mkBtn(0.0016, 0.0175, W / 2 + 0.0004, 0.008);
  mkBtn(0.0016, 0.0175, W / 2 + 0.0004, -0.010);
  mkBtn(0.0016, 0.0088, -W / 2 - 0.0004, 0.0285);

  /* antenna lines */
  const antMat = new THREE.MeshStandardMaterial({
    color: 0x0d0e11,
    roughness: 0.6,
    metalness: 0.3,
  });
  [
    [W / 2 + 0.0006, 0.0405, 0, 0.0016, 0.0007, 0, 'y'],
    [-W / 2 - 0.0006, 0.0405, 0, 0.0016, 0.0007, 0, 'y'],
    [W / 2 + 0.0006, -0.0325, 0, 0.0016, 0.0007, 0, 'y'],
  ].forEach(([, x, y, w, h, , axis]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(axis ? h : w, axis ? w : h), antMat);
    m.position.set(x, y, 0);
    m.rotation.y = Math.PI / 2;
    g.add(m);
  });

  g.userData.screen = screen;
  g.userData.kind = 'phone';
  return g;
}

/* ---------------- iPad (portrait) ---------------- */

export function buildTablet(screenTexture, { bodyColor = 0xd8d9dd } = {}) {
  const g = new THREE.Group();
  const W = 0.1795;
  const H = 0.2435;
  const D = 0.0061;
  const R = 0.0182;

  const frame = metal(bodyColor, 0.34, 0.92);
  const body = new THREE.Mesh(new RoundedBoxGeometry(W, H, D, 6, R), frame);
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);

  const glass = new THREE.Mesh(
    new RoundedBoxGeometry(W - 0.0016, H - 0.0016, 0.001, 4, R - 0.0006),
    glassMat()
  );
  glass.position.z = D / 2 + 0.0004;
  g.add(glass);

  const bezelW = 0.0092;
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(W - bezelW * 2, H - bezelW * 2),
    screenMat(screenTexture)
  );
  screen.position.z = D / 2 + 0.0008;
  g.add(screen);

  /* front camera */
  const cam = new THREE.Mesh(new THREE.CircleGeometry(0.0016, 20), cameraLens());
  cam.position.set(0, H / 2 - 0.0045, D / 2 + 0.0009);
  g.add(cam);

  /* rear camera */
  const rbump = new THREE.Mesh(
    new RoundedBoxGeometry(0.0145, 0.0145, 0.002, 4, 0.005),
    metal(bodyColor, 0.3, 0.95)
  );
  rbump.position.set(-W / 2 + 0.0125, H / 2 - 0.0125, -D / 2 - 0.0008);
  g.add(rbump);
  const rl = new THREE.Mesh(new THREE.SphereGeometry(0.0045, 24, 16), cameraLens());
  rl.position.set(rbump.position.x, rbump.position.y, -D / 2 - 0.0022);
  g.add(rl);

  /* side buttons */
  const btnMat = metal(bodyColor, 0.32, 0.92);
  const vol = new THREE.Mesh(new RoundedBoxGeometry(0.0014, 0.0235, D * 0.6, 3, 0.0007), btnMat);
  vol.position.set(-W / 2 - 0.0003, 0.031, 0);
  g.add(vol);
  const pw = new THREE.Mesh(new RoundedBoxGeometry(0.0014, 0.0148, D * 0.6, 3, 0.0007), btnMat);
  pw.position.set(W / 2 + 0.0003, 0.026, 0);
  g.add(pw);

  g.userData.screen = screen;
  g.userData.kind = 'tablet';
  return g;
}
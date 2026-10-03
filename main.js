import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas = document.getElementById('webgl-canvas');
const flipBtn = document.getElementById('flipBtn');
const resetViewBtn = document.getElementById('resetView');
const infoPanel = document.getElementById('infoPanel');
const deviceLabel = document.getElementById('deviceLabel');
const designTitle = document.getElementById('designTitle');
const designDesc = document.getElementById('designDesc');
const designTags = document.getElementById('designTags');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020617);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 0.5, 5);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 3;
controls.maxDistance = 8;
controls.enablePan = false;
controls.target.set(0, 0, 0);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
keyLight.position.set(3, 4, 5);
keyLight.castShadow = true;
keyLight.shadow.bias = -0.0001;
keyLight.shadow.mapSize.set(2048, 2048);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x818cf8, 0.3);
fillLight.position.set(-3, 2, 2);
scene.add(fillLight);

const rimLight = new THREE.PointLight(0x6366f1, 0.5);
rimLight.position.set(0, 2, -4);
scene.add(rimLight);

const floorGeometry = new THREE.PlaneGeometry(20, 20);
const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0x0f172a,
  roughness: 0.9,
  metalness: 0,
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1.8;
floor.receiveShadow = true;
scene.add(floor);

// Create screen textures
function createScreenTexture(isMobile) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (isMobile) {
    canvas.width = 680;
    canvas.height = 1480;
    // Mobile gradient design
    const gradient = ctx.createLinearGradient(0, 0, 0, 1480);
    gradient.addColorStop(0, '#4F46E5');
    gradient.addColorStop(1, '#818CF8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 680, 1480);
    
    // Header bar
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(0, 0, 680, 120);
    
    // App title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Plus Jakarta Sans';
    ctx.textAlign = 'center';
    ctx.fillText('Mobile App', 340, 80);
    
    // Content cards
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath();
    ctx.roundRect(60, 180, 560, 300, 40);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath();
    ctx.roundRect(60, 520, 560, 200, 40);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath();
    ctx.roundRect(60, 760, 560, 400, 40);
    ctx.fill();
  } else {
    canvas.width = 1650;
    canvas.height = 2200;
    // Desktop/iPad gradient design
    const gradient = ctx.createLinearGradient(0, 0, 1650, 2200);
    gradient.addColorStop(0, '#0F172A');
    gradient.addColorStop(1, '#1E293B');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1650, 2200);
    
    // Navbar
    ctx.fillStyle = 'rgba(79,70,229,0.9)';
    ctx.fillRect(0, 0, 1650, 120);
    
    // Logo
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px Plus Jakarta Sans';
    ctx.textAlign = 'left';
    ctx.fillText('Design System', 60, 75);
    
    // Sidebar
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(0, 120, 350, 2080);
    
    // Main content
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath();
    ctx.roundRect(400, 180, 1150, 400, 32);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath();
    ctx.roundRect(400, 620, 550, 350, 32);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath();
    ctx.roundRect(1000, 620, 550, 350, 32);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath();
    ctx.roundRect(400, 1010, 1150, 500, 32);
    ctx.fill();
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.flipY = false;
  texture.anisotropy = 4;
  return texture;
}

const mobileScreenTexture = createScreenTexture(true);
const desktopScreenTexture = createScreenTexture(false);

const deviceGroup = new THREE.Group();
scene.add(deviceGroup);

// Materials for device
const phoneFrameMat = new THREE.MeshStandardMaterial({
  color: 0x111111,
  roughness: 0.4,
  metalness: 0.2,
});

const phoneScreenMat = new THREE.MeshBasicMaterial({
  map: mobileScreenTexture,
});

const ipadFrameMat = new THREE.MeshStandardMaterial({
  color: 0xf5f5f7,
  roughness: 0.3,
  metalness: 0.05,
});

const ipadScreenMat = new THREE.MeshBasicMaterial({
  map: desktopScreenTexture,
});

// Phone
const phoneBody = new THREE.Mesh(
  new THREE.BoxGeometry(0.8, 1.6, 0.08),
  phoneFrameMat
);
phoneBody.castShadow = true;
phoneBody.position.set(0, 0, 0);
deviceGroup.add(phoneBody);

const phoneScreen = new THREE.Mesh(
  new THREE.PlaneGeometry(0.68, 1.48),
  phoneScreenMat
);
phoneScreen.position.z = 0.041;
phoneBody.add(phoneScreen);

const phoneBezel = new THREE.Mesh(
  new THREE.RingGeometry(0.1, 0.12, 32),
  phoneFrameMat
);
phoneBezel.position.z = 0.042;
phoneBody.add(phoneBezel);

// Camera cutout
const phoneCamera = new THREE.Mesh(
  new THREE.CylinderGeometry(0.015, 0.015, 0.002, 16),
  new THREE.MeshStandardMaterial({ color: 0x000000 })
);
phoneCamera.rotation.x = Math.PI / 2;
phoneCamera.position.set(0, 0.65, 0.042);
phoneBody.add(phoneCamera);

// iPad
const ipadBody = new THREE.Mesh(
  new THREE.BoxGeometry(1.8, 2.4, 0.08),
  ipadFrameMat
);
ipadBody.castShadow = true;
ipadBody.position.set(0, 0, 0);
ipadBody.rotation.z = Math.PI / 2;
ipadBody.visible = false;
deviceGroup.add(ipadBody);

const ipadScreen = new THREE.Mesh(
  new THREE.PlaneGeometry(1.65, 2.2),
  ipadScreenMat
);
ipadScreen.position.z = 0.041;
ipadBody.add(ipadScreen);

const ipadHomeButton = new THREE.Mesh(
  new THREE.CircleGeometry(0.05, 32),
  new THREE.MeshStandardMaterial({ color: 0xe5e5e7 })
);
ipadHomeButton.position.set(0, -1.1, 0.042);
ipadBody.add(ipadHomeButton);

let isFlipped = false;
let flipProgress = 0;
const flipSpeed = 0.08;

const designData = {
  phone: {
    label: 'iPhone',
    title: 'Mobile App Design',
    desc: 'A clean, modern mobile interface designed for seamless user experiences. Features intuitive navigation, micro-interactions, and responsive layouts.',
    tags: ['Mobile UI', 'iOS Design', 'UX Design'],
  },
  ipad: {
    label: 'iPad',
    title: 'Desktop/Web App Design',
    desc: 'Expanded layout showcasing the full desktop experience. Optimized for larger screens with enhanced information density and spatial organization.',
    tags: ['Web Design', 'Responsive', 'Product Design'],
  },
};

let infoTimeout;

function updateInfo() {
  const data = isFlipped ? designData.ipad : designData.phone;
  deviceLabel.textContent = data.label;
  designTitle.textContent = data.title;
  designDesc.textContent = data.desc;
  designTags.innerHTML = data.tags
    .map((tag) => `<span class="tag">${tag}</span>`)
    .join('');

  infoPanel.classList.add('visible');
  clearTimeout(infoTimeout);
  infoTimeout = setTimeout(() => {
    infoPanel.classList.remove('visible');
  }, 4000);
}

function flip() {
  isFlipped = !isFlipped;
  updateInfo();
}

flipBtn.addEventListener('click', flip);
resetViewBtn.addEventListener('click', () => {
  camera.position.set(0, 0.5, 5);
  controls.target.set(0, 0, 0);
  controls.update();
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();

function animate() {
  const elapsedTime = clock.getElapsedTime();

  flipProgress += (isFlipped ? flipSpeed : -flipSpeed);
  flipProgress = Math.max(0, Math.min(1, flipProgress));

  const flipRotation = flipProgress * Math.PI;

  deviceGroup.rotation.y = flipRotation;
  deviceGroup.rotation.x = Math.sin(elapsedTime * 0.1) * 0.05;

  phoneBody.visible = flipProgress < 0.5;
  ipadBody.visible = flipProgress > 0.5;

  if (flipProgress < 0.5) {
    const scale = 1 - flipProgress * 0.2;
    phoneBody.scale.set(scale, scale, scale);
  } else {
    const scale = 0.8 + (flipProgress - 0.5) * 0.4;
    ipadBody.scale.set(scale, scale, scale);
  }

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

updateInfo();
animate();

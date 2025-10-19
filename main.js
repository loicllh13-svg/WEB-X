import * as THREE from 'three';

// --- Scene setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0.8, 4.5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
document.querySelector('#app').appendChild(renderer.domElement);

// Soft vignette/fog
scene.fog = new THREE.FogExp2(0x0b0d12, 0.14);

// --- Particles ---
const COUNT = 22000;
const positionsA = new Float32Array(COUNT * 3);
const positionsB = new Float32Array(COUNT * 3);

// Random cloud A
for (let i = 0; i < COUNT; i++) {
  const r = Math.cbrt(Math.random()) * 1.9; // denser center
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.cos(phi);
  const z = r * Math.sin(phi) * Math.sin(theta);
  positionsA[3*i] = x;
  positionsA[3*i+1] = y;
  positionsA[3*i+2] = z;
}

// Humanoid-ish parametric volume (head + torso + arms + legs)
function insideHumanoid(x, y, z) {
  // scale to 1m torso
  // Head
  const dxh = x, dyh = y - 1.6, dzh = z;
  if (dxh*dxh + dyh*dyh + dzh*dzh < 0.19*0.19) return true;

  // Torso cylinder
  if (y > 0.2 && y < 1.4 && (x*x + z*z) < 0.35*0.35) return true;

  // Neck
  if (y > 1.45 && y < 1.6 && (x*x + z*z) < 0.18*0.18) return true;

  // Arms
  if (y > 0.8 && y < 1.3 && ((x+0.6)*(x+0.6) + z*z) < 0.12*0.12) return true;
  if (y > 0.8 && y < 1.3 && ((x-0.6)*(x-0.6) + z*z) < 0.12*0.12) return true;

  // Legs
  if (y > -1.2 && y < 0.2 && ((x+0.18)*(x+0.18) + z*z) < 0.12*0.12) return true;
  if (y > -1.2 && y < 0.2 && ((x-0.18)*(x-0.18) + z*z) < 0.12*0.12) return true;

  return false;
}

// Fill B by rejection sampling within a bounding box
let filled = 0;
while (filled < COUNT) {
  const x = (Math.random()*2 - 1) * 0.9;
  const y = (Math.random()*2 - 1) * 1.8;
  const z = (Math.random()*2 - 1) * 0.6;
  if (insideHumanoid(x, y, z)) {
    positionsB[3*filled] = x;
    positionsB[3*filled+1] = y;
    positionsB[3*filled+2] = z;
    filled++;
  }
}

// Geometry with morph attributes
const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positionsA, 3));
geometry.setAttribute('target', new THREE.BufferAttribute(positionsB, 3));

// Points material: round glowing particles via shader hook
const material = new THREE.PointsMaterial({
  size: 0.045,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  color: new THREE.Color(0xffe9a8)
});

// Make them round & with radial falloff
material.onBeforeCompile = (shader) => {
  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <clipping_planes_fragment>',
    '#include <clipping_planes_fragment>\n' +
    'float d = length(gl_PointCoord - vec2(0.5));\n' +
    'float alpha = smoothstep(0.5, 0.45, d);\n'
  ).replace(
    'gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
    'gl_FragColor = vec4( outgoingLight, alpha * diffuseColor.a );'
  );
  material.userData.shader = shader;
};

const points = new THREE.Points(geometry, material);
scene.add(points);

// Low-key backlights
const light1 = new THREE.PointLight(0xffcc88, 6, 20);
light1.position.set(2, 2, 3);
scene.add(light1);

const light2 = new THREE.PointLight(0x88caff, 3, 20);
light2.position.set(-2.5, 1, -2);
scene.add(light2);

// Scroll-driven morph
let t = 0; // 0 cloud -> 1 humanoid
function updateMorph(progress) {
  const pos = geometry.getAttribute('position');
  const target = geometry.getAttribute('target');
  for (let i = 0; i < pos.count; i++) {
    pos.array[3*i]   = (1-progress) * positionsA[3*i]   + progress * positionsB[3*i];
    pos.array[3*i+1] = (1-progress) * positionsA[3*i+1] + progress * positionsB[3*i+1];
    pos.array[3*i+2] = (1-progress) * positionsA[3*i+2] + progress * positionsB[3*i+2];
  }
  pos.needsUpdate = true;
}

function onScroll() {
  const max = document.body.scrollHeight - innerHeight;
  const p = max > 0 ? window.scrollY / max : 0;
  // stronger morph (appear quickly)
  t = Math.min(1, Math.max(0, Math.pow(p, 0.65)));
  updateMorph(t);
  document.body.style.setProperty('--p', t.toFixed(2));
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Resize
function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onResize);

// Animate
let time = 0;
function tick() {
  time += 0.016;
  // Subtle floating and rotation
  points.rotation.y += 0.0009;
  points.position.y = Math.sin(time * 0.7) * 0.05;

  // Flicker: pulse alpha a bit
  const shader = material.userData.shader;
  if (shader) {
    const base = 0.85 + Math.sin(time*3.0)*0.12 + Math.sin(time*7.5)*0.06;
    material.opacity = base;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();

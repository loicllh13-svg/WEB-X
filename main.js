import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

// --- Basic renderer setup ---
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
camera.position.set(0, 0.2, 2.2);

function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (canvas.width !== w || canvas.height !== h) renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);

// --- Particles Geometry ---
const COUNT = /iPhone|Android/i.test(navigator.userAgent) ? 5500 : 9000;
const positions = new Float32Array(COUNT * 3);
const targetEnergy = new Float32Array(COUNT * 3);
const targetHuman  = new Float32Array(COUNT * 3);

// Sample helpers
function rand(){ return Math.random()*2-1; }
function sampleSphere(i){
  // energy cloud: noisy sphere shell
  const r = 0.85 + Math.random()*0.15;
  let x, y, z, l;
  do { x = rand(); y = rand(); z = rand(); l = Math.hypot(x,y,z); } while (l < 0.001);
  x/=l; y/=l; z/=l;
  targetEnergy[i*3+0] = x*r;
  targetEnergy[i*3+1] = y*r*1.05;
  targetEnergy[i*3+2] = z*r;
}

// SDF helpers for humanoid: head (sphere) + body (capsule)
function sdCapsule(p, a, b, r){
  // distance from segment ab with radius r
  const pa = new THREE.Vector3().subVectors(p, a);
  const ba = new THREE.Vector3().subVectors(b, a);
  let h = Math.max(0, Math.min(1, pa.dot(ba)/ba.lengthSq()));
  const s = new THREE.Vector3().copy(ba).multiplyScalar(h).add(a);
  return new THREE.Vector3().subVectors(p, s).length() - r;
}

function sampleHuman(i){
  // volume sampling via rejection in a bounding box
  let p = new THREE.Vector3(), d = 0, tries = 0;
  while(true){
    tries++;
    p.set(rand()*0.7, (Math.random()*1.8-0.7), rand()*0.35); // lozenge bounding
    // head
    const head = p.clone().sub(new THREE.Vector3(0,0.65,0)).length() - 0.18;
    // body capsule
    const body = sdCapsule(p, new THREE.Vector3(0,-0.4,0), new THREE.Vector3(0,0.45,0), 0.22);
    // arms (hint volumes at sides)
    const armL = sdCapsule(p, new THREE.Vector3(-0.32,0.2,0), new THREE.Vector3(-0.55,-0.2,0), 0.09);
    const armR = sdCapsule(p, new THREE.Vector3(0.32,0.2,0), new THREE.Vector3(0.55,-0.2,0), 0.09);
    d = Math.min(Math.min(head, body), Math.min(armL, armR));
    if (d < 0 || tries>80) break;
  }
  targetHuman[i*3+0] = p.x;
  targetHuman[i*3+1] = p.y*0.95;
  targetHuman[i*3+2] = p.z;
}

for (let i=0; i<COUNT; i++){ sampleSphere(i); sampleHuman(i); positions.set(targetEnergy, 0); }

const geom = new THREE.BufferGeometry();
geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

// color gradient (blue→violet)
const colors = new Float32Array(COUNT*3);
for (let i=0;i<COUNT;i++){
  const t = Math.random();
  const r = 0.35 + 0.45*t;
  const g = 0.58 - 0.25*t;
  const b = 1.00;
  colors[i*3+0]=r; colors[i*3+1]=g; colors[i*3+2]=b;
}
geom.setAttribute('color', new THREE.BufferAttribute(colors,3));

const mat = new THREE.PointsMaterial({ size: 0.012, vertexColors: true, transparent:true, opacity:0.95, depthWrite:false, blending:THREE.AdditiveBlending });
const points = new THREE.Points(geom, mat);
scene.add(points);

// Soft backlight
const light = new THREE.PointLight(0x88aaff, 2.2, 10); light.position.set(0.7,0.8,1.6);
scene.add(light);

let tMorph = 0;     // 0 energy → 1 human
let auto = 0;       // auto shimmer phase

// Map scroll progress to tMorph
function updateScroll(){
  const docH = document.body.scrollHeight - innerHeight;
  const p = docH>0 ? window.scrollY / docH : 0;
  tMorph = Math.max(0, Math.min(1, p));
}
document.addEventListener('scroll', updateScroll, { passive:true });
updateScroll();

// Animation loop
function tick(ms){
  auto += 0.0016;
  const pos = geom.attributes.position.array;
  for (let i=0;i<COUNT;i++){
    const i3 = i*3;
    // morph LERP with slight per-point noise
    const n = Math.sin(i*12.9898 + auto*6.283) * 0.5 + 0.5;
    const w = tMorph*0.9 + n*0.1;
    pos[i3+0] = targetEnergy[i3+0]*(1-w) + targetHuman[i3+0]*w;
    pos[i3+1] = targetEnergy[i3+1]*(1-w) + targetHuman[i3+1]*w;
    pos[i3+2] = targetEnergy[i3+2]*(1-w) + targetHuman[i3+2]*w;
  }
  geom.attributes.position.needsUpdate = true;

  // subtle orbit/tilt
  points.rotation.y = auto*0.5;
  points.rotation.x = Math.sin(auto*0.7)*0.08;
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
resize();
requestAnimationFrame(tick);

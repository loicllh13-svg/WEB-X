// Simple particle field + scroll-controlled morph intensity (no bundling needed)
(function(){
  const canvas = document.getElementById('hero-canvas');
  const renderer = new THREE.WebGLRenderer({canvas, antialias: true, alpha: true});
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1000);
  camera.position.set(0, 0, 85);

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  window.addEventListener('resize', resize, {passive:true});
  resize();

  // Particles
  const COUNT = 16000;
  const positions = new Float32Array(COUNT * 3);
  const base = new Float32Array(COUNT * 3);
  for (let i=0; i<COUNT; i++) {
    // Start cloud (energy): sphere distribution
    const r = 28 * Math.cbrt(Math.random());
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2*Math.random()-1);
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);
    base[i*3+0] = x;
    base[i*3+1] = y;
    base[i*3+2] = z;

    positions[i*3+0] = x;
    positions[i*3+1] = y;
    positions[i*3+2] = z;
  }

  // Target "humanoid-like" volume: an elongated ellipsoid + shoulders.
  const target = new Float32Array(COUNT * 3);
  for (let i=0; i<COUNT; i++) {
    // ellipsoid body
    const rx = 10, ry = 22, rz = 8;
    const u = Math.random() * Math.PI * 2;
    const v = Math.acos(2*Math.random()-1);
    let x = rx * Math.sin(v) * Math.cos(u);
    let y = ry * Math.cos(v);
    let z = rz * Math.sin(v) * Math.sin(u);
    // shoulders widening
    if (Math.abs(y) < 6) x *= 1.4;
    // head bulge
    if (y > 12) {
      x *= 0.6; z *= 0.6; y += 3;
    }
    target[i*3+0] = x;
    target[i*3+1] = y;
    target[i*3+2] = z;
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    size: 0.9,
    color: 0xffffff,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const points = new THREE.Points(geom, material);
  scene.add(points);

  // Glow tint with fragment animation using shader-like trick (twinkle)
  let t = 0;
  const animate = () => {
    t += 0.015;
    material.color.setHSL(0.12 + 0.02*Math.sin(t*0.7), 0.9, 0.6 + 0.1*Math.sin(t));
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  // Scroll morph 0..1
  const lerp = (a,b,t) => a + (b-a)*t;
  const tmp = positions;
  const updateMorph = () => {
    const docH = Math.max(document.body.scrollHeight - window.innerHeight, 1);
    const s = Math.min(Math.max(window.scrollY / docH, 0), 1); // 0..1
    const morph = Math.sin(s * Math.PI); // 0→1→0 across the page
    for (let i=0; i<COUNT; i++) {
      tmp[i*3+0] = lerp(base[i*3+0], target[i*3+0], morph);
      tmp[i*3+1] = lerp(base[i*3+1], target[i*3+1], morph);
      tmp[i*3+2] = lerp(base[i*3+2], target[i*3+2], morph);
    }
    geom.attributes.position.needsUpdate = true;
    material.size = 0.7 + morph*0.6; // larger near humanoid
  };
  window.addEventListener('scroll', updateMorph, {passive:true});
  updateMorph();

  animate();
})();
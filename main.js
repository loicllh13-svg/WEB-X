/* global THREE */
(function () {
  const W = window;
  const canvas = document.getElementById('scene');
  if (!canvas || !('THREE' in window)) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer:false });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  const DPR = Math.min(2, W.devicePixelRatio || 1);
  camera.position.set(0, 0, 6);

  // Resize
  function onResize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width !== w * DPR || canvas.height !== h * DPR) {
      renderer.setPixelRatio(DPR);
      renderer.setSize(w, h, false);
    }
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  onResize();
  window.addEventListener('resize', onResize, { passive: true });

  // ---------- PARTICLES
  const COUNT = (W.innerWidth < 540 ? 4500 : 9000);
  const positions = new Float32Array(COUNT * 3);
  const targetsEnergy = new Float32Array(COUNT * 3);
  const targetsHuman  = new Float32Array(COUNT * 3);

  // Utility: random point in sphere
  function randInSphere(r=1) {
    let u = Math.random(), v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2*v - 1);
    const rr = Math.cbrt(Math.random()) * r;
    return new THREE.Vector3(
      rr * Math.sin(phi) * Math.cos(theta),
      rr * Math.sin(phi) * Math.sin(theta),
      rr * Math.cos(phi)
    );
  }

  // SDF-like composite for humanoid: head(sphere), torso(capsule), arms/legs(capsules)
  function humanSample(i) {
    // Base proportions
    const t = i / COUNT;
    // Choose limb region by t ranges for variety
    const choice = Math.floor(Math.random()*7);
    let p = new THREE.Vector3();

    // Torso (capsule)
    if (choice === 0) {
      const y = THREE.MathUtils.lerp(-0.6, 0.9, Math.random());
      const angle = Math.random()*Math.PI*2;
      const r = 0.45 + (Math.sin((y+0.6)*2.0)*0.08);
      p.set(Math.cos(angle)*r, y, Math.sin(angle)*r);
    }
    // Head
    else if (choice === 1) {
      const v = randInSphere(0.35); v.y += 1.35; p.copy(v);
    }
    // Left arm
    else if (choice === 2) {
      const u = Math.random();
      const y = THREE.MathUtils.lerp(0.5, 0.9, u);
      const angle = Math.PI * 0.65;
      const r = 0.6;
      p.set(-Math.cos(angle)*r + (Math.random()*0.14-0.07), y + (Math.random()*0.1-0.05), Math.sin(angle)*r);
    }
    // Right arm
    else if (choice === 3) {
      const u = Math.random();
      const y = THREE.MathUtils.lerp(0.5, 0.9, u);
      const angle = Math.PI * 0.65;
      const r = 0.6;
      p.set(Math.cos(angle)*r + (Math.random()*0.14-0.07), y + (Math.random()*0.1-0.05), Math.sin(angle)*r);
    }
    // Left leg
    else if (choice === 4) {
      const u = Math.random();
      const y = THREE.MathUtils.lerp(-1.4, -0.65, u);
      const r = 0.28;
      p.set(-0.25 + (Math.random()*0.12-0.06), y, (Math.random()*0.2-0.1));
    }
    // Right leg
    else if (choice === 5) {
      const u = Math.random();
      const y = THREE.MathUtils.lerp(-1.4, -0.65, u);
      const r = 0.28;
      p.set(0.25 + (Math.random()*0.12-0.06), y, (Math.random()*0.2-0.1));
    }
    // Chest glow
    else {
      const v = randInSphere(0.2); v.y += 0.4; p.copy(v);
    }
    // Slight taper to make silhouette nicer
    p.multiply(new THREE.Vector3(0.9, 1.0, 0.6));
    return p;
  }

  // Build target arrays
  for (let i=0; i<COUNT; i++) {
    const e = randInSphere(2.2);
    targetsEnergy[i*3] = e.x; targetsEnergy[i*3+1] = e.y; targetsEnergy[i*3+2] = e.z;

    const h = humanSample(i);
    targetsHuman[i*3] = h.x; targetsHuman[i*3+1] = h.y; targetsHuman[i*3+2] = h.z;

    // start near energy state
    positions[i*3] = e.x; positions[i*3+1] = e.y; positions[i*3+2] = e.z;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.028,
    map: dotTexture(),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    color: new THREE.Color(0xffe29a),
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  // Soft ambient energy
  const fogColor = new THREE.Color(0x0b0f14);
  scene.fog = new THREE.Fog(fogColor, 10, 18);

  // Procedural sprite for points (small glow)
  function dotTexture(size=64) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    const grd = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    grd.addColorStop(0, 'rgba(255,225,120,1)');
    grd.addColorStop(0.5, 'rgba(255,176,64,0.65)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0,0,size,size);
    const tex = new THREE.CanvasTexture(c);
    return tex;
  }

  // Scroll progress (0..1..0 loop across page height*2 for a fuller interaction)
  function getScrollProgress() {
    const total = document.body.scrollHeight - window.innerHeight;
    const y = Math.max(0, window.scrollY || window.pageYOffset || 0);
    return Math.min(1, y / Math.max(1, total));
  }

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    // progress
    const s = getScrollProgress();
    // ease for nicer morph
    const k = s < 0.5 ? (s*2) : (1.0 - (s-0.5)*2);
    // target morph value (0 energy → 1 human → 0 energy)
    const m = k;

    const pos = geo.attributes.position.array;
    for (let i=0; i<COUNT; i++) {
      const i3 = i*3;
      const ex = targetsEnergy[i3], ey = targetsEnergy[i3+1], ez = targetsEnergy[i3+2];
      const hx = targetsHuman[i3],  hy = targetsHuman[i3+1],  hz = targetsHuman[i3+2];
      // Lerp between states
      pos[i3]   = ex*(1-m) + hx*m;
      pos[i3+1] = ey*(1-m) + hy*m;
      pos[i3+2] = ez*(1-m) + hz*m;
      // small breathing noise
      const n = (Math.sin((t*0.9) + i*0.013)*0.003);
      pos[i3] += n; pos[i3+2] -= n;
    }
    geo.attributes.position.needsUpdate = true;

    // Slow orbit
    points.rotation.y += 0.0007;
    renderer.setClearColor(0x000000, 0);
    renderer.render(scene, camera);
    t += 0.016;
  }
  animate();

  // Ensure canvas fills hero
  const hero = document.getElementById('hero');
  const ro = new ResizeObserver(onResize);
  ro.observe(hero);
})();

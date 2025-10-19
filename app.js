// WEB X — Particle Energy ⇄ Humanoid (no build, Safari friendly)
(() => {
  const hero = document.getElementById('hero');
  const wrap = document.getElementById('webgl-wrap');
  const canvas = document.getElementById('stage');

  // Early exit if WebGL not available
  try {
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) throw new Error('webgl not supported');
  } catch (e) {
    console.warn('WebGL non-disponible :', e);
    wrap.classList.add('hidden');
    return;
  }

  // THREE setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setClearColor(0x0b0c11, 1);
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));

  function resize() {
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Camera
  camera.position.set(0, 0, 52);

  // Round sprite texture generated from canvas for circular particles
  function makeCircleSprite(size = 128) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    g.clearRect(0,0,size,size);
    const r = size / 2;
    const grd = g.createRadialGradient(r, r, 0, r, r, r);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.4, 'rgba(255,255,255,0.95)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.beginPath();
    g.arc(r, r, r, 0, Math.PI * 2);
    g.fill();
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }
  const circleTex = makeCircleSprite(128);

  // Geometry
  const COUNT = 18000; // enough for dense look on mobile/desktop
  const positions = new Float32Array(COUNT * 3);
  const startPos = new Float32Array(COUNT * 3);
  const targetPos = new Float32Array(COUNT * 3);
  const phase = new Float32Array(COUNT); // individual flicker phase

  function rand(min, max){ return Math.random()*(max-min)+min }
  function randSign(){ return Math.random()<.5?-1:1 }

  // Random energy cloud (start)
  function fillEnergyCloud() {
    for (let i=0;i<COUNT;i++) {
      // random in sphere radius 22
      let r = Math.cbrt(Math.random()) * 22;
      let theta = Math.random()*Math.PI*2;
      let phi = Math.acos(rand(-1,1));
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);
      startPos[i*3+0] = x;
      startPos[i*3+1] = y;
      startPos[i*3+2] = z;
      // init current positions as start
      positions[i*3+0] = x;
      positions[i*3+1] = y;
      positions[i*3+2] = z;
      phase[i] = Math.random()*Math.PI*2;
    }
  }

  // Procedural "humanoid" built from simple primitives
  function fillHumanoid() {
    const pts = [];
    function pushSphere(cx,cy,cz, rx,ry,rz, density){
      const n = Math.floor(COUNT * density);
      for (let k=0;k<n;k++){
        const u = Math.random()*Math.PI*2;
        const v = Math.acos(rand(-1,1));
        const x = cx + Math.sin(v)*Math.cos(u)*rx + rand(-.8,.8);
        const y = cy + Math.cos(v)*ry + rand(-.8,.8);
        const z = cz + Math.sin(v)*Math.sin(u)*rz + rand(-.8,.8);
        pts.push(x,y,z);
      }
    }
    function pushCylinder(x0,y0,z0, x1,y1,z1, r, density){
      const dir = new THREE.Vector3(x1-x0,y1-y0,z1-z0);
      const len = dir.length();
      dir.normalize();
      const n = Math.floor(COUNT * density);
      for (let k=0;k<n;k++){
        const t = Math.random()*len;
        const angle = Math.random()*Math.PI*2;
        const rad = r*Math.sqrt(Math.random());
        // orthonormal basis
        const up = Math.abs(dir.y) < .9 ? new THREE.Vector3(0,1,0) : new THREE.Vector3(1,0,0);
        const side = new THREE.Vector3().crossVectors(dir, up).normalize();
        const up2 = new THREE.Vector3().crossVectors(side, dir).normalize();
        const cx = x0 + dir.x*t + side.x*Math.cos(angle)*rad + up2.x*Math.sin(angle)*rad;
        const cy = y0 + dir.y*t + side.y*Math.cos(angle)*rad + up2.y*Math.sin(angle)*rad;
        const cz = z0 + dir.z*t + side.z*Math.cos(angle)*rad + up2.z*Math.sin(angle)*rad;
        pts.push(cx,cy,cz);
      }
    }

    // Torso (ellipsoid)
    pushSphere(0, 2.5, 0, 6.2, 8.0, 4.2, 0.22);
    // Head
    pushSphere(0, 12.5, 0, 3.2, 4.0, 3.2, 0.08);
    // Shoulders
    pushCylinder(-6.5, 8.5, 0, 6.5, 8.5, 0, 1.7, 0.07);
    // Arms
    pushCylinder(-6.5, 8.5, 0, -10, 3.5, 0, 1.3, 0.08);
    pushCylinder(6.5, 8.5, 0, 10, 3.5, 0, 1.3, 0.08);
    // Forearms
    pushCylinder(-10, 3.5, 0, -9.5, -2.5, 0, 1.0, 0.06);
    pushCylinder(10, 3.5, 0, 9.5, -2.5, 0, 1.0, 0.06);
    // Hips
    pushCylinder(-3.4, 0, 0, 3.4, 0, 0, 1.8, 0.06);
    // Thighs
    pushCylinder(-2.2, 0, 0, -2.2, -7.5, 0, 1.6, 0.1);
    pushCylinder(2.2, 0, 0, 2.2, -7.5, 0, 1.6, 0.1);
    // Calves
    pushCylinder(-2.2, -7.5, 0, -2.2, -14.5, 0, 1.2, 0.08);
    pushCylinder(2.2, -7.5, 0, 2.2, -14.5, 0, 1.2, 0.08);
    // Depth noise for 3D feel
    for (let i=0;i<pts.length;i+=3){
      pts[i+2] += rand(-3.5, 3.5);
    }

    while (pts.length < targetPos.length){
      pts.push(rand(-2,2), rand(0,2), rand(-2,2));
    }
    for (let i=0;i<targetPos.length;i++){
      targetPos[i] = pts[i];
    }
  }

  fillEnergyCloud();
  fillHumanoid();

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('phase', new THREE.BufferAttribute(new Float32Array(phase), 1));

  const mat = new THREE.PointsMaterial({
    size: 1.8,
    map: circleTex,
    transparent: true,
    alphaTest: 0.01,
    opacity: 0.95,
    color: 0xffffff,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);

  // rotation
  let rotY = 0;

  // Scroll-driven morph (0..1)
  let morph = 0;
  const heroHeight = () => hero.getBoundingClientRect().height;

  function updateMorphFromScroll() {
    const y = window.scrollY || window.pageYOffset || 0;
    const h = heroHeight();
    const t = Math.min(1, Math.max(0, y / (h * 0.55)));
    morph = t<0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
    wrap.style.opacity = (y > h) ? '0' : '1';
  }
  updateMorphFromScroll();
  window.addEventListener('scroll', updateMorphFromScroll, { passive: true });

  // Animate
  let rafId;
  function animate(time){
    rafId = requestAnimationFrame(animate);
    rotY += 0.0025;
    points.rotation.y = rotY;

    const pos = geo.attributes.position.array;
    // Interpolate & noise
    for (let i=0;i<COUNT;i++){
      const i3 = i*3;
      const s0 = startPos[i3+0], s1 = startPos[i3+1], s2 = startPos[i3+2];
      const t0 = targetPos[i3+0], t1 = targetPos[i3+1], t2 = targetPos[i3+2];
      const k = morph;
      const noise = (1-k) * 0.9;
      pos[i3+0] = s0 + (t0 - s0)*k + noise*Math.sin(i*0.007 + time*0.001);
      pos[i3+1] = s1 + (t1 - s1)*k + noise*Math.cos(i*0.006 + time*0.0013);
      pos[i3+2] = s2 + (t2 - s2)*k + noise*Math.sin(i*0.004 + time*0.0011);
    }
    geo.attributes.position.needsUpdate = true;

    // Flicker + warm tint
    const t = (time || 0) * 0.0015;
    const flicker = 0.85 + 0.15*Math.sin(t*4.0);
    mat.opacity = flicker;
    const warm = (Math.sin(t*2.2)+1)/2;
    const col = new THREE.Color().setHSL(0.12*warm, 0.7*warm, 0.6 + 0.2*warm);
    mat.color = col;

    renderer.render(scene, camera);
  }
  setTimeout(() => animate(0), 40);
})();

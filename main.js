
(() => {
  const canvas = document.getElementById('webgl');
  const renderer = new THREE.WebGLRenderer({canvas, antialias: true, alpha: true});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0f1116, 12, 42);

  const camera = new THREE.PerspectiveCamera(55, innerWidth/innerHeight, 0.1, 100);
  camera.position.set(0, 1.1, 9);
  scene.add(camera);

  // Lights / glow-ish
  const amb = new THREE.AmbientLight(0xffe0b3, 0.4);
  const key = new THREE.PointLight(0xffb84d, 2.0, 50);
  key.position.set(-2, 3, 4);
  scene.add(amb, key);

  // Particles
  const COUNT = 18000;
  const positions = new Float32Array(COUNT * 3);
  const target = new Float32Array(COUNT * 3);
  const temp = new Float32Array(COUNT * 3);

  // Energy cloud initial positions (sphere)
  for (let i=0; i<COUNT; i++) {
    const r = 4 * Math.cbrt(Math.random()); // denser core
    const t = Math.acos(2*Math.random()-1);
    const p = 2*Math.PI*Math.random();
    positions[3*i]   = r*Math.sin(t)*Math.cos(p);
    positions[3*i+1] = r*Math.cos(t);
    positions[3*i+2] = r*Math.sin(t)*Math.sin(p);
  }

  // Stylized humanoid target using simple volumes (head/torso/arms/legs)
  function pushEllipsoid(arr, cx, cy, cz, rx, ry, rz, n) {
    for (let k=0; k<n; k++) {
      const u = Math.acos(2*Math.random()-1);
      const v = 2*Math.PI*Math.random();
      const x = rx*Math.sin(u)*Math.cos(v) + cx;
      const y = ry*Math.cos(u) + cy;
      const z = rz*Math.sin(u)*Math.sin(v) + cz;
      arr.push(x,y,z);
    }
  }
  const human = [];
  // torso
  pushEllipsoid(human, 0, 0.8, 0, 1.1, 1.6, 0.7, Math.floor(COUNT*0.35));
  // head
  pushEllipsoid(human, 0, 2.4, 0, 0.45, 0.55, 0.45, Math.floor(COUNT*0.08));
  // shoulders
  pushEllipsoid(human, 0.85, 1.6, 0, 0.35, 0.25, 0.35, Math.floor(COUNT*0.06));
  pushEllipsoid(human,-0.85, 1.6, 0, 0.35, 0.25, 0.35, Math.floor(COUNT*0.06));
  // arms (two capsules approximated by stacked ellipsoids)
  for (let y=1.2; y>0.2; y-=0.2) pushEllipsoid(human, 1.2, y, 0, 0.22, 0.22, 0.22, Math.floor(COUNT*0.012));
  for (let y=1.2; y>0.2; y-=0.2) pushEllipsoid(human,-1.2, y, 0, 0.22, 0.22, 0.22, Math.floor(COUNT*0.012));
  // hips
  pushEllipsoid(human, 0, 0.1, 0, 0.9, 0.5, 0.6, Math.floor(COUNT*0.12));
  // legs (stacks)
  for (let y=0; y>-2.1; y-=0.25) pushEllipsoid(human, 0.45, y, 0, 0.35, 0.28, 0.35, Math.floor(COUNT*0.02));
  for (let y=0; y>-2.1; y-=0.25) pushEllipsoid(human,-0.45, y, 0, 0.35, 0.28, 0.35, Math.floor(COUNT*0.02));

  // Fill target buffer (if not enough, wrap around)
  for (let i=0; i<COUNT; i++) {
    const j = (i*3) % human.length;
    target[3*i]   = human[j];
    target[3*i+1] = human[j+1];
    target[3*i+2] = human[j+2];
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const sizes = new Float32Array(COUNT);
  for (let i=0; i<COUNT; i++) sizes[i] = 1 + Math.random()*1.8;
  geom.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

  const mat = new THREE.PointsMaterial({
    color: 0xffc266,
    size: 0.06,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const points = new THREE.Points(geom, mat);
  scene.add(points);

  // Responsive
  addEventListener('resize', () => {
    camera.aspect = innerWidth/innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  // Scroll -> progress [0..1]
  const bar = document.querySelector('#progress span');
  function getProgress() {
    const max = document.body.scrollHeight - innerHeight;
    const p = Math.min(1, Math.max(0, scrollY / Math.max(1, max)));
    bar.style.width = (p*100).toFixed(1)+'%';
    return p;
  }

  // Animate
  let t = 0;
  function tick() {
    requestAnimationFrame(tick);
    t += 0.01;

    const p = getProgress();
    // wobble energy
    for (let i=0; i<COUNT; i++) {
      const i3 = i*3;
      // start: positions[] (energy sphere), target: human[]
      const sx = positions[i3], sy = positions[i3+1], sz = positions[i3+2];
      const hx = target[i3],    hy = target[i3+1],    hz = target[i3+2];

      // mix according to scroll (smoothstep)
      const s = p*p*(3-2*p);
      let x = sx*(1-s) + hx*s;
      let y = sy*(1-s) + hy*s;
      let z = sz*(1-s) + hz*s;

      // jitter (energy pulsing)
      const jitter = (1 - s) * 0.12;
      x += (Math.sin(i*12.9898+t*1.7)*43758.5453 % 1 - 0.5) * jitter;
      y += (Math.sin(i*78.233 +t*1.3)*12515.873 % 1 - 0.5) * jitter;
      z += (Math.sin(i*39.425 +t*1.9)*7314.723 % 1 - 0.5) * jitter;

      temp[i3] = x; temp[i3+1] = y; temp[i3+2] = z;
    }
    geom.attributes.position.array.set(temp);
    geom.attributes.position.needsUpdate = true;

    // subtle camera drift
    camera.position.x = Math.sin(t*0.2)*0.6;
    camera.lookAt(0,0.6,0);

    renderer.render(scene, camera);
  }
  tick();
})();


(() => {
  const canvas = document.getElementById('hero3d');
  const width = canvas.clientWidth || window.innerWidth;
  const height = canvas.clientHeight || Math.max(520, window.innerHeight * 0.8);
  canvas.width = width; canvas.height = height;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width/height, 0.1, 1000);
  camera.position.set(0, 0, 300);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  // lights
  const amb = new THREE.AmbientLight(0x5577aa, 0.6);
  scene.add(amb);
  const d1 = new THREE.DirectionalLight(0x88aaff, 0.6);
  d1.position.set(1,2,3); scene.add(d1);

  // sample silhouette image to points
  const texImg = new Image();
  texImg.src = './assets/silhouette.png';
  texImg.onload = () => {
    const c = document.createElement('canvas');
    const w = texImg.width, h = texImg.height;
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.drawImage(texImg, 0, 0);
    const data = ctx.getImageData(0, 0, w, h).data;

    const positions = [];
    const colors = [];
    const scales = [];
    const centerX = 0, centerY = 60; // shift a bit up
    const step = 3; // sampling step: smaller = more points

    function gradientColor(t) {
      // electric blue -> violet
      const c1 = [0x58,0xc9,0xff];
      const c2 = [0x8b,0x5c,0xf6];
      const r = Math.round(c1[0]*(1-t) + c2[0]*t);
      const g = Math.round(c1[1]*(1-t) + c2[1]*t);
      const b = Math.round(c1[2]*(1-t) + c2[2]*t);
      return [r/255, g/255, b/255];
    }

    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const i = (y*w + x) * 4;
        const alpha = data[i+3];
        if (alpha > 10) {
          // map to world coords
          const px = (x - w/2) * 0.6;
          const py = (h/2 - y) * 0.6;
          const pz = (Math.random()-0.5)*4;
          positions.push(px, py, pz);
          const t = (y / h);
          const [r,g,b] = gradientColor(t);
          colors.push(r,g,b);
          scales.push(0.9 + Math.random()*1.6);
        }
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('aScale', new THREE.Float32BufferAttribute(scales, 1));

    const vertex = `
      attribute float aScale;
      varying float vAlpha;
      varying vec3 vColor;
      uniform float uTime;
      void main() {
        vColor = color;
        float energy = sin(uTime*0.8 + position.y*0.03) * 0.5 + 0.5;
        vec3 p = position;
        p.x += sin(uTime*0.6 + position.y*0.05)*2.0;
        p.y += cos(uTime*0.7 + position.x*0.04)*1.5;
        p.z += sin(uTime*1.1 + position.x*0.02 + position.y*0.02)*1.2;
        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = (1.8 + energy*2.0) * aScale * (300.0 / -mvPosition.z);
        vAlpha = 0.55 + energy*0.4;
        gl_Position = projectionMatrix * mvPosition;
      }
    `;
    const fragment = `
      varying float vAlpha;
      varying vec3 vColor;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        float soft = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(vColor, vAlpha * soft);
      }
    `;

    const material = new THREE.ShaderMaterial({
      vertexColors: true,
      transparent: True,
      depthWrite: false,
      uniforms: { uTime: { value: 0 } },
      vertexShader: vertex,
      fragmentShader: fragment
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // slight float animation
    let t = 0;
    function animate(){
      requestAnimationFrame(animate);
      t += 0.016;
      material.uniforms.uTime.value = t;
      points.rotation.y = Math.sin(t*0.25)*0.15;
      points.rotation.z = Math.sin(t*0.18)*0.07;
      renderer.render(scene, camera);
    }
    animate();
  };

  // resize
  window.addEventListener('resize', () => {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || Math.max(520, window.innerHeight * 0.8);
    canvas.width = w; canvas.height = h;
    camera.aspect = w/h;
    camera.updateProjectionMatrix();
    renderer.setSize(w,h);
  });
})();

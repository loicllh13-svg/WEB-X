const canvas = document.getElementById('fx');
const ctx = canvas.getContext('2d');
let w, h, dpr;
const COUNT = 1200;           // number of particles
const RADIUS = 140;           // humanoid approximate radius
const particles = [];

function resize(){
  dpr = Math.min(2, window.devicePixelRatio || 1);
  w = canvas.width = Math.floor(innerWidth * dpr);
  h = canvas.height = Math.floor(innerHeight * dpr);
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
}
addEventListener('resize', resize);
resize();

// build "energy cloud" points
function randRange(a,b){ return a + Math.random()*(b-a); }
for(let i=0;i<COUNT;i++){
  particles.push({
    // spherical coordinates for a "humanoid-shaped" blob (torso-like ellipsoid)
    // start randomized cloud
    x0: randRange(-w*0.4, w*0.4),
    y0: randRange(-h*0.35, h*0.35),
    // target "humanoid" silhouette using parametric ellipsoid with taper
    u: Math.random()*Math.PI*2,
    v: Math.random()*Math.PI,
    jitter: Math.random(),
    hue: 44 + Math.random()*16 // warm yellow
  });
}

function lerp(a,b,t){ return a + (b-a)*t; }
let scrollT = 0;

function updateScroll(){
  // map scroll position 0..1 for first 120vh of page
  const max = Math.max(1, document.body.scrollHeight - innerHeight);
  const raw = Math.min(1, scrollY / (innerHeight*1.2));
  scrollT = raw; // 0 energy cloud -> 1 humanoid
}
addEventListener('scroll', updateScroll);
updateScroll();

function draw(){
  // smooth trail
  ctx.fillStyle = 'rgba(11,15,20,0.30)';
  ctx.fillRect(0,0,w,h);

  const cx = w*0.5, cy = h*0.55;

  for(const p of particles){
    // energy cloud pos
    const ex = p.x0;
    const ey = p.y0;

    // humanoid-ish target: ellipsoid with vertical taper
    const r = RADIUS * (0.6 + 0.55*Math.sin(p.v)); // thickness
    const taper = 0.45 + 0.55 * Math.sin(p.v);     // shoulders vs hips
    const hx = Math.cos(p.u) * r * taper;
    const hy = (Math.cos(p.v)*RADIUS*1.6);

    // morph
    const x = lerp(ex, hx, scrollT);
    const y = lerp(ey, hy, scrollT);

    // glowing circles
    const size = 1.2 + 2.2*Math.pow(p.jitter,2);
    const grad = ctx.createRadialGradient(cx+x, cy+y, 0, cx+x, cy+y, size*6);
    grad.addColorStop(0, `hsla(${p.hue}, 100%, 70%, 0.9)`);
    grad.addColorStop(1, `hsla(${p.hue}, 100%, 50%, 0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx+x, cy+y, size*6, 0, Math.PI*2);
    ctx.fill();

    // occasional spark
    if(Math.random()<0.003){
      ctx.fillStyle = 'rgba(255, 255, 210, 0.85)';
      ctx.beginPath();
      ctx.arc(cx+x + randRange(-8,8), cy+y + randRange(-8,8), 1.5, 0, Math.PI*2);
      ctx.fill();
    }
  }
  requestAnimationFrame(draw);
}
draw();

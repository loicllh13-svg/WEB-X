import React, { useMemo, useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'

const N = 6000 // number of particles

function rand(min, max){ return min + Math.random()*(max-min) }

// Build two shapes: A) energy cloud, B) humanoid-ish made of simple primitives
function buildPositions(){
  // Energy cloud: sphere-ish with noise
  const cloud = new Float32Array(N*3)
  for(let i=0;i<N;i++){
    // sample inside sphere radius 1.2
    const r = Math.cbrt(Math.random())*1.2
    const theta = Math.random()*Math.PI*2
    const phi = Math.acos(2*Math.random()-1)
    const x = r*Math.sin(phi)*Math.cos(theta)
    const y = r*Math.cos(phi)
    const z = r*Math.sin(phi)*Math.sin(theta)
    cloud[i*3]=x; cloud[i*3+1]=y; cloud[i*3+2]=z
  }

  // Humanoid approximated: torso cylinder + head sphere + arms cylinders + legs
  const human = new Float32Array(N*3)
  for(let i=0;i<N;i++){
    let x=0,y=0,z=0
    const pick = Math.random()
    if(pick<0.35){ // torso
      const r = 0.28 + Math.random()*0.08
      const ang = Math.random()*Math.PI*2
      x = Math.cos(ang)*r
      z = Math.sin(ang)*r
      y = rand(-0.2, 0.6)
    }else if(pick<0.55){ // head
      const r = 0.18
      const u = Math.random(), v = Math.random()
      const theta = 2*Math.PI*u, phi = Math.acos(2*v-1)
      x = r*Math.sin(phi)*Math.cos(theta)
      z = r*Math.sin(phi)*Math.sin(theta)
      y = 0.85 + r*Math.cos(phi)
    }else if(pick<0.7){ // left arm
      const ang = Math.random()*Math.PI*2
      const r = 0.07 + Math.random()*0.04
      x = -0.38 + Math.cos(ang)*r
      z = Math.sin(ang)*r
      y = rand(0.15,0.55)
    }else if(pick<0.85){ // right arm
      const ang = Math.random()*Math.PI*2
      const r = 0.07 + Math.random()*0.04
      x = 0.38 + Math.cos(ang)*r
      z = Math.sin(ang)*r
      y = rand(0.15,0.55)
    }else{ // legs
      const left = Math.random()<0.5
      const ang = Math.random()*Math.PI*2
      const r = 0.1 + Math.random()*0.05
      x = (left?-0.15:0.15) + Math.cos(ang)*r*0.5
      z = Math.sin(ang)*r*0.5
      y = rand(-0.75,-0.15)
    }
    // slight noise
    x += rand(-0.015,0.015)
    y += rand(-0.02,0.02)
    z += rand(-0.015,0.015)
    human[i*3]=x; human[i*3+1]=y; human[i*3+2]=z
  }
  return { cloud, human }
}

function Particles({progress}){
  const geom = useRef()
  const { cloud, human } = useMemo(buildPositions, [])
  const pos = useMemo(()=>cloud.slice(), []) // start at cloud
  const vel = useMemo(()=>new Float32Array(N*3), [])

  // Colors: golden white with slight flicker
  const colors = useMemo(()=>{
    const arr = new Float32Array(N*3)
    for(let i=0;i<N;i++){
      const t = Math.random()
      const col = new THREE.Color().setHSL(0.12 + 0.03*Math.random(), 1.0, 0.6 + 0.2*t) // warm
      arr[i*3]=col.r; arr[i*3+1]=col.g; arr[i*3+2]=col.b
    }
    return arr
  }, [])

  useEffect(()=>{
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geom.current = g
  }, [])

  useFrame((state, dt)=>{
    if(!geom.current) return
    const p = THREE.MathUtils.clamp(progress.current, 0, 1)
    // springy morph towards target
    for(let i=0;i<N;i++){
      const i3 = i*3
      const tx = THREE.MathUtils.lerp(cloud[i3],   human[i3],   p)
      const ty = THREE.MathUtils.lerp(cloud[i3+1], human[i3+1], p)
      const tz = THREE.MathUtils.lerp(cloud[i3+2], human[i3+2], p)
      const x = pos[i3], y = pos[i3+1], z = pos[i3+2]
      // spring
      const ax = (tx - x)*4.0
      const ay = (ty - y)*4.0
      const az = (tz - z)*4.0
      vel[i3]   = (vel[i3]   + ax)*0.92
      vel[i3+1] = (vel[i3+1] + ay)*0.92
      vel[i3+2] = (vel[i3+2] + az)*0.92
      pos[i3]   = x + vel[i3]*dt
      pos[i3+1] = y + vel[i3+1]*dt
      pos[i3+2] = z + vel[i3+2]*dt
    }
    geom.current.attributes.position.needsUpdate = true
  })

  return (
    <points geometry={geom.current}>
      <pointsMaterial size={0.025} vertexColors transparent opacity={0.92} sizeAttenuation />
    </points>
  )
}

function ParticleCanvas(){
  const progress = useRef(0)
  // map scroll to 0..1
  useEffect(()=>{
    const onScroll = ()=>{
      const h = document.body.scrollHeight - window.innerHeight
      progress.current = h>0 ? window.scrollY / h : 0
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return ()=>window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="canvas-wrap" aria-hidden>
      <Canvas camera={{ position:[0,0,2.8], fov:50 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[3,2,5]} intensity={1.1} />
        <Particles progress={progress} />
      </Canvas>
    </div>
  )
}

export default function App(){
  return (
    <>
      <div className="container">
        <nav className="nav">
          <div className="badge">WX</div>
          <a className="hint" href="#">WEB X — <strong>Studios</strong></a>
          <div style={{flex:1}} />
          <a className="hint" href="#services">Services</a>
          <a className="hint" href="#process">Méthode</a>
          <a className="hint" href="#work">Projets</a>
          <a className="hint" href="#cta">Devis rapide</a>
        </nav>
      </div>

      <header className="hero">
        <ParticleCanvas />
        <div className="container">
          <div className="hint" style={{opacity:.9, marginBottom:16}}>Défilez pour morph <strong>Énergie</strong> ⇄ <strong>Humanoïde</strong></div>
          <h1>Créons votre <span className="g1">univers web</span> <span className="g2">immersif</span></h1>
          <p className="p">Sites vitrines modernes ou expériences <strong>3D/WebGL</strong> avec interactions. Design soigné & performances au rendez‑vous.</p>
          <div className="cta">
            <a className="btn primary" href="#demos">Voir des démos</a>
            <a className="btn" href="#contact">Parler de votre projet</a>
          </div>
          <div className="tags">
            <span className="tag">Performant</span>
            <span className="tag">Sécurisé</span>
            <span className="tag">Responsive</span>
          </div>
        </div>
      </header>

      <section id="services" className="section container">
        <h2>Nos services</h2>
        <p className="p">3D temps réel, expériences interactives, portfolio immersif, sites haut de gamme optimisés Core Web Vitals.</p>
      </section>

      <section id="process" className="section container">
        <h2>Méthode</h2>
        <p className="p">Atelier d'idées, prototypage rapide, itérations courtes, intégration & déploiement continu.</p>
      </section>

      <footer className="container">
        © WEB X — Studios
      </footer>
    </>
  )
}

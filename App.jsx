import React from 'react'
import { Canvas } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

function Stars() {
  const count = 2000
  const positions = React.useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i += 3) {
      arr[i] = (Math.random() - 0.5) * 12
      arr[i + 1] = (Math.random() - 0.5) * 12
      arr[i + 2] = (Math.random() - 0.5) * 12
    }
    return arr
  }, [])
  const geom = React.useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [positions])

  return (
    <Points geometry={geom}>
      <PointMaterial size={0.025} sizeAttenuation transparent color="#ffffff" opacity={0.75} />
    </Points>
  )
}

export default function App() {
  return (
    <div style={{minHeight:'100vh', position:'relative', overflow:'hidden'}}>
      <div style={{position:'absolute', inset:0, pointerEvents:'none'}}>
        <Canvas camera={{ position: [0,0,4] }}>
          <ambientLight intensity={0.4} />
          <Stars />
        </Canvas>
      </div>
      <header style={{padding:'24px 20px', position:'relative', zIndex:1}}>
        <div style={{fontWeight:700, letterSpacing:1}}>WEB X</div>
      </header>
      <main style={{position:'relative', zIndex:1, padding:'72px 20px 120px 20px', maxWidth:960}}>
        <h1 style={{fontSize:'40px', lineHeight:1.1, margin:'0 0 16px'}}>
          Créons votre <span style={{background: 'linear-gradient(90deg,#74aaff,#c084fc)', WebkitBackgroundClip:'text', color:'transparent'}}>univers web</span> immersif
        </h1>
        <p style={{opacity:0.85, fontSize:18, maxWidth:760}}>
          Sites vitrines modernes ou expériences 3D/WebGL avec interactions. Design soigné et performances au rendez‑vous.
        </p>
        <div style={{display:'flex', gap:12, marginTop:24}}>
          <a href="#" style={{background:'linear-gradient(90deg,#74aaff,#c084fc)', padding:'12px 16px', borderRadius:'12px', color:'#0b0e13', textDecoration:'none', fontWeight:700}}>Voir des démos</a>
          <a href="#" style={{padding:'12px 16px', borderRadius:'12px', color:'#e6e9f2', textDecoration:'none', border:'1px solid #2a2f3a'}}>Parler de votre projet</a>
        </div>
      </main>
    </div>
  )
}
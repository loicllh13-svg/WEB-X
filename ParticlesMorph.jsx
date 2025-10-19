
import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

// Make a small circle texture (for round glowing particles)
function makeCircleTexture(){
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size; canvas.height = size
  const ctx = canvas.getContext('2d')
  const grd = ctx.createRadialGradient(size/2,size/2,2,size/2,size/2,size/2)
  grd.addColorStop(0,'rgba(255,255,255,1)')
  grd.addColorStop(0.35,'rgba(255,255,180,0.9)')
  grd.addColorStop(0.7,'rgba(255,200,0,0.25)')
  grd.addColorStop(1,'rgba(255,200,0,0)')
  ctx.fillStyle = grd
  ctx.beginPath()
  ctx.arc(size/2, size/2, size/2, 0, Math.PI*2)
  ctx.fill()
  const tex = new THREE.Texture(canvas)
  tex.needsUpdate = true
  return tex
}

export default function ParticlesMorph({ progress }){
  const COUNT = 12000
  const radius = 2.2
  const pointsRef = useRef()

  const tex = useMemo(()=>makeCircleTexture(), [])

  // two shapes: energy cloud (sphere noise) and humanoid-ish (capsule)
  const { from, to } = useMemo(()=>{
    const from = new Float32Array(COUNT*3)
    const to = new Float32Array(COUNT*3)

    // energy cloud positions (random in sphere)
    for(let i=0;i<COUNT;i++){
      const r = radius * Math.cbrt(Math.random())
      const theta = Math.random()*Math.PI*2
      const phi = Math.acos(2*Math.random()-1)
      const x = r * Math.sin(phi)*Math.cos(theta)
      const y = r * Math.cos(phi)
      const z = r * Math.sin(phi)*Math.sin(theta)
      from.set([x,y,z], i*3)
    }

    // humanoid approx: a capsule + shoulders + head (procedural)
    let idx = 0
    function push(x,y,z){
      if(idx<COUNT*3){ to.set([x,y,z], idx); idx+=3 }
    }
    const bodyH=3.3, bodyR=0.7
    for(let i=0;i<COUNT*0.75;i++){
      const h = (Math.random()*bodyH) - bodyH*0.5   // -H/2..H/2
      const ang = Math.random()*Math.PI*2
      const r = bodyR * Math.sqrt(Math.random())
      const x = r*Math.cos(ang)
      const z = r*Math.sin(ang)
      let y = h*0.9
      // shoulders widening near top part
      if(y>0.6) { const f = (y-0.6)/1.0; const rw = bodyR + f*0.35; const rr = rw*Math.sqrt(Math.random()); const a2 = Math.random()*Math.PI*2; push(rr*Math.cos(a2), y, rr*Math.sin(a2)); continue }
      push(x,y,z)
    }
    // head (sphere)
    const headR=0.55, headY=bodyH*0.5+0.2
    for(let i=0;i<COUNT*0.25;i++){
      const r = headR * Math.cbrt(Math.random())
      const th = Math.random()*Math.PI*2
      const ph = Math.acos(2*Math.random()-1)
      const x = r*Math.sin(ph)*Math.cos(th)
      const y = headY + r*Math.cos(ph)
      const z = r*Math.sin(ph)*Math.sin(th)
      push(x,y,z)
    }
    return { from, to }
  }, [])

  const positions = useMemo(()=>from.slice(0), [from])

  const material = useMemo(()=> new THREE.PointsMaterial({
    size: 0.04,
    map: tex,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    opacity: 0.95
  }), [tex])

  useFrame((state)=>{
    const p = Math.min(1, Math.max(0, progress))
    // ease both ways (sharper morph in the middle)
    const t = Math.pow(p<0.5 ? p*2 : (1-p)*2, 0.65)
    const arr = pointsRef.current.geometry.attributes.position.array
    for(let i=0;i<arr.length;i+=3){
      const a0 = from[i], a1 = from[i+1], a2 = from[i+2]
      const b0 = to[i],   b1 = to[i+1],   b2 = to[i+2]
      arr[i]   = a0 + (b0 - a0) * t
      arr[i+1] = a1 + (b1 - a1) * t
      arr[i+2] = a2 + (b2 - a2) * t
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true
    // subtle breathing
    const s = 1 + Math.sin(state.clock.elapsedTime*0.8)*0.02
    pointsRef.current.scale.setScalar(s)
  })

  const geom = useMemo(()=>{
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [positions])

  return <points ref={pointsRef} geometry={geom} material={material} />
}

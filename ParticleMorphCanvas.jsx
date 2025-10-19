import React, { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'

function useScrollMorph(total=1){
  const { gl } = useThree()
  const progress = useRef(0)
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      progress.current = h > 0 ? window.scrollY / h : 0
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive:true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return progress
}

// Generate two point clouds: energy sphere → humanoid silhouette (very low poly)
function generatePositions(count=6000){
  // Energy: spherical shell
  const energy = new Float32Array(count*3)
  for(let i=0;i<count;i++){
    const r = 1.6 + Math.random()*0.2
    const theta = Math.acos(THREE.MathUtils.randFloatSpread(2)) // 0..pi
    const phi = Math.random()*Math.PI*2
    const x = r*Math.sin(theta)*Math.cos(phi)
    const y = r*Math.cos(theta)
    const z = r*Math.sin(theta)*Math.sin(phi)
    energy.set([x,y,z], i*3)
  }
  // Humanoid: stacked capsules (head, torso, arms, legs) — procedural & light
  const human = new Float32Array(count*3)
  for(let i=0;i<count;i++){
    const t = Math.random()
    let x=0,y=0,z=0
    if(t<0.18){ // head
      const u = Math.random()*Math.PI*2
      const v = Math.acos(THREE.MathUtils.randFloatSpread(2))
      const r = 0.38 + Math.random()*0.04
      x = r*Math.sin(v)*Math.cos(u)
      y = 1.35 + r*Math.cos(v)
      z = r*Math.sin(v)*Math.sin(u)
    }else if(t<0.58){ // torso
      const u = Math.random()*Math.PI*2
      const r = 0.55 + (Math.random()-0.5)*0.1
      const h = THREE.MathUtils.lerp(-0.2, 1.2, Math.random())
      x = Math.cos(u)*r*0.6
      z = Math.sin(u)*r*0.35
      y = h
    }else if(t<0.74){ // arms
      const side = Math.random()<0.5?-1:1
      const u = Math.random()*Math.PI*2
      const r = 0.18 + Math.random()*0.08
      const h = THREE.MathUtils.lerp(0.7, 1.1, Math.random())
      x = side*(0.75 + Math.cos(u)*r)
      y = h + Math.sin(u)*r*0.6
      z = Math.sin(u)*r*0.4
    }else{ // legs
      const side = Math.random()<0.5?-1:1
      const u = Math.random()*Math.PI*2
      const r = 0.22 + Math.random()*0.06
      const h = THREE.MathUtils.lerp(-1.1, -0.2, Math.random())
      x = side*(0.28 + Math.cos(u)*r*0.35)
      y = h
      z = Math.sin(u)*r*0.35
    }
    human.set([x,y,z], i*3)
  }
  return { energy, human }
}

function MorphingPoints(){
  const count = 7000
  const { energy, human } = useMemo(() => generatePositions(count), [])
  const progressRef = useScrollMorph()
  const points = useRef()

  // sparkly material
  const texture = useMemo(() => {
    // create a small round sprite
    const size = 128
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = size
    const ctx = canvas.getContext('2d')
    const grd = ctx.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2)
    grd.addColorStop(0,'rgba(255,255,255,1)')
    grd.addColorStop(0.3,'rgba(255,240,180,0.9)')
    grd.addColorStop(0.7,'rgba(255,200,40,0.35)')
    grd.addColorStop(1,'rgba(255,200,40,0.0)')
    ctx.fillStyle = grd
    ctx.beginPath()
    ctx.arc(size/2,size/2,size/2,0,Math.PI*2)
    ctx.fill()
    const tex = new THREE.CanvasTexture(canvas)
    tex.anisotropy = 8
    tex.needsUpdate = true
    return tex
  }, [])

  const positions = useMemo(()=>new Float32Array(count*3),[])
  const start = useMemo(()=>energy,[])
  const end = useMemo(()=>human,[])

  useFrame((state,delta)=>{
    const p = THREE.MathUtils.clamp(progressRef.current,0,1)
    // Make morph steeper so the human silhouette becomes readable faster
    const eased = THREE.MathUtils.smootherstep(p, 0.15, 0.55)
    for(let i=0;i<count*3;i++){
      positions[i] = THREE.MathUtils.lerp(start[i], end[i], eased)
    }
    points.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions,3))
    points.current.geometry.attributes.position.needsUpdate = true
    // gentle rotation
    points.current.rotation.y += delta*0.12
  })

  return (
    <Points ref={points} frustumCulled={false}>
      <bufferGeometry />
      <PointMaterial
        transparent
        vertexColors={false}
        size={0.02}
        map={texture}
        alphaTest={0.01}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color={'#ffd580'}
        />
    </Points>
  )
}

export default function ParticleMorphCanvas(){
  return (
    <Canvas camera={{ position: [0,0,4.2], fov: 50 }} dpr={[1,2]}>
      <color attach="background" args={['#0b0f14']} />
      <ambientLight intensity={0.8} />
      <MorphingPoints />
    </Canvas>
  )
}

import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef, useEffect, useState } from 'react'
import ParticleMaterial from './ParticleMaterial'

// Generate a procedural "humanoid" made of simple primitives sampled as points
function sampleCylinder(count, radius, y0, y1){
  const pts=[]
  for(let i=0;i<count;i++){
    const ang=Math.random()*Math.PI*2
    const r=radius*(0.8+0.2*Math.random())
    const y=y0+(y1-y0)*Math.random()
    pts.push(new THREE.Vector3(Math.cos(ang)*r, y, Math.sin(ang)*r))
  }
  return pts
}
function sampleSphere(count, radius, centerY){
  const pts=[]
  for(let i=0;i<count;i++){
    const u=Math.random()*2-1, v=Math.random()*2*Math.PI
    const r=radius*(0.7+0.3*Math.random())
    const x=Math.sqrt(1-u*u)*Math.cos(v)*r
    const z=Math.sqrt(1-u*u)*Math.sin(v)*r
    const y=u*r + centerY
    pts.push(new THREE.Vector3(x,y,z))
  }
  return pts
}
function makeHumanoidPoints(total=8000){
  const pts=[]
  // torso (capsule approximé)
  pts.push(...sampleCylinder(Math.floor(total*0.35), 0.35, 0.2, 1.4))
  // hips
  pts.push(...sampleCylinder(Math.floor(total*0.12), 0.38, 0.0, 0.2))
  // head
  pts.push(...sampleSphere(Math.floor(total*0.14), 0.28, 1.7))
  // arms
  pts.push(...sampleCylinder(Math.floor(total*0.13), 0.13, 0.9, 1.2).map(p=>p.add(new THREE.Vector3(0.55,0,0))))
  pts.push(...sampleCylinder(Math.floor(total*0.13), 0.13, 0.9, 1.2).map(p=>p.add(new THREE.Vector3(-0.55,0,0))))
  // legs
  pts.push(...sampleCylinder(Math.floor(total*0.13), 0.18, 0.0, 0.9).map(p=>p.add(new THREE.Vector3(0.2,0,0))))
  pts.push(...sampleCylinder(Math.floor(total*0.13), 0.18, 0.0, 0.9).map(p=>p.add(new THREE.Vector3(-0.2,0,0))))
  return pts
}
function makeEnergyCloud(total=8000){
  const pts=[]
  for(let i=0;i<total;i++){
    const r = 1.4 * Math.pow(Math.random(), 0.7)
    const th = Math.random()*Math.PI*2
    const ph = Math.acos(2*Math.random()-1)
    const x = r*Math.sin(ph)*Math.cos(th)
    const y = r*Math.cos(ph)+0.5
    const z = r*Math.sin(ph)*Math.sin(th)
    pts.push(new THREE.Vector3(x,y,z))
  }
  return pts
}

function ParticlesMorph(){
  const count = 9000
  const geom = useMemo(()=>new THREE.BufferGeometry(),[])
  const pos = useMemo(()=>new Float32Array(count*3),[count])
  const ref = useRef()
  const [target,setTarget] = useState(0) // 0 = energy, 1 = humanoid

  // build two sets
  const energy = useMemo(()=> makeEnergyCloud(count), [count])
  const human  = useMemo(()=> makeHumanoidPoints(count), [count])

  useEffect(()=>{
    // initial positions = energy
    for(let i=0;i<count;i++){
      pos[i*3+0]=energy[i].x
      pos[i*3+1]=energy[i].y
      pos[i*3+2]=energy[i].z
    }
    geom.setAttribute('position', new THREE.BufferAttribute(pos,3))
  },[geom,pos,energy,count])

  useEffect(()=>{
    const onScroll = ()=>{
      const max = Math.max(1, document.body.scrollHeight - innerHeight)
      const s = window.scrollY / max
      // courbe pour rendre la silhouette nette au milieu
      let t = s < 0.5 ? Math.pow(s/0.5, 0.7) : 1 - Math.pow((s-0.5)/0.5, 1.4)
      t = Math.min(1, Math.max(0, t))
      // plateau plus lisible autour du centre
      const bandCenter = 0.58, bandWidth = 0.28
      const inBand = Math.abs(s - bandCenter) < bandWidth/2
      setTarget(inBand ? 1 : t)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive:true })
    return ()=> window.removeEventListener('scroll', onScroll)
  },[])

  useFrame((state, dt)=>{
    // damping vers target
    if(ref.current){
      ref.current.userData.morph = ref.current.userData.morph ?? 0
      const m = ref.current.userData.morph
      const next = m + (target - m) * Math.min(1, dt*6) // plus rapide
      ref.current.userData.morph = next

      const arr = geom.attributes.position.array
      for(let i=0;i<count;i++){
        arr[i*3+0] = energy[i].x + (human[i].x - energy[i].x) * next
        arr[i*3+1] = energy[i].y + (human[i].y - energy[i].y) * next
        arr[i*3+2] = energy[i].z + (human[i].z - energy[i].z) * next
      }
      geom.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={ref} geometry={geom}>
      <ParticleMaterial size={4}/>
    </points>
  )
}

export default function ThreeScene(){
  return (
    <div className="canvas-wrap">
      <Canvas camera={{ position:[0,0.9,3.2], fov:50 }} dpr={[1,2]}>
        <color attach="background" args={['#0b0f14']} />
        <ambientLight intensity={0.4}/>
        <directionalLight position={[2,3,2]} intensity={1.6} />
        <ParticlesMorph/>
      </Canvas>
      <div className="note container">Défilez pour morph <b>Énergie ⇄ Humanoïde</b></div>
    </div>
  )
}

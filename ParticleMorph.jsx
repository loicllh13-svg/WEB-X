
import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

// Generate circular sprite for round particles
function makeCircleTexture(size=128){
  const c = document.createElement('canvas'); c.width=c.height=size
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(size/2,size/2,1,size/2,size/2,size/2)
  g.addColorStop(0,'rgba(255,255,220,1)')
  g.addColorStop(.4,'rgba(255,240,120,.9)')
  g.addColorStop(1,'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0,0,size,size)
  const tex = new THREE.CanvasTexture(c); tex.needsUpdate=true
  return tex
}

// Simple humanoid SDF-like sampler (proxy made of spheres/cylinders)
function insideHumanoid(p){
  const v = p.clone()
  // scale to approx human 1.8m tall inside [-1,1] y range
  v.multiply(new THREE.Vector3(0.45,0.9,0.45)) // squash x/z a bit
  // Head
  const head = v.clone().sub(new THREE.Vector3(0,0.9,0)).length() - 0.18
  // Torso (ellipsoid)
  const torso = Math.hypot(v.x/0.3, (v.y-0.3)/0.5, v.z/0.2) - 1.0
  // Arms (two capsules)
  const armR = capsuleDist(v, new THREE.Vector3(0.32,0.35,0), new THREE.Vector3(0.6,0.05,0), 0.08)
  const armL = capsuleDist(v, new THREE.Vector3(-0.32,0.35,0), new THREE.Vector3(-0.6,0.05,0), 0.08)
  // Legs
  const legR = capsuleDist(v, new THREE.Vector3(0.12,-0.2,0), new THREE.Vector3(0.12,-0.9,0), 0.09)
  const legL = capsuleDist(v, new THREE.Vector3(-0.12,-0.2,0), new THREE.Vector3(-0.12,-0.9,0), 0.09)
  const d = Math.min(head,torso,armR,armL,legR,legL)
  return d < 0.0
}

function capsuleDist(p,a,b,r){
  const pa = p.clone().sub(a)
  const ba = b.clone().sub(a)
  const h = THREE.MathUtils.clamp(pa.dot(ba)/ba.lengthSq(),0,1)
  return pa.sub(ba.multiplyScalar(h)).length() - r
}

function sampleHumanoidPoints(count){
  const pts = []
  const tmp = new THREE.Vector3()
  let i=0, tries=0, maxTries=count*50
  while(i<count && tries<maxTries){
    // sample inside a bounding box
    tmp.set((Math.random()*2-1),(Math.random()*2-1),(Math.random()*2-1))
    if(insideHumanoid(tmp)){
      // jitter for thickness
      tmp.addScaledVector(new THREE.Vector3(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1), 0.02)
      pts.push(tmp.clone()); i++
    }
    tries++
  }
  return pts
}

function sampleEnergyCloud(count){
  const pts = []
  const v = new THREE.Vector3()
  for(let i=0;i<count;i++){
    // point in sphere
    v.set(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1)
    v.normalize().multiplyScalar(Math.cbrt(Math.random())) // bias to center
    v.multiplyScalar(0.9)
    pts.push(v.clone())
  }
  return pts
}

export default function ParticleMorph(){
  const ref = useRef()
  useEffect(()=>{
    const container = ref.current
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth/container.clientHeight, 0.1, 100)
    camera.position.set(0,0,3.2)
    const renderer = new THREE.WebGLRenderer({antialias:true,alpha:true})
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.domElement.className = 'webgl'
    container.appendChild(renderer.domElement)

    // Particles
    const COUNT = 4500
    const from = sampleEnergyCloud(COUNT)
    const to = sampleHumanoidPoints(COUNT)

    const positions = new Float32Array(COUNT*3)
    const targets   = new Float32Array(COUNT*3)
    for(let i=0;i<COUNT;i++){
      positions[i*3+0]=from[i]?.x ?? 0
      positions[i*3+1]=from[i]?.y ?? 0
      positions[i*3+2]=from[i]?.z ?? 0
      targets[i*3+0]=to[i]?.x ?? 0
      targets[i*3+1]=to[i]?.y ?? 0
      targets[i*3+2]=to[i]?.z ?? 0
    }
    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.BufferAttribute(positions,3))
    geom.setAttribute('target',   new THREE.BufferAttribute(targets,3))

    const material = new THREE.PointsMaterial({
      size: 0.028, sizeAttenuation: true,
      color: new THREE.Color(1.0,0.92,0.55),
      map: makeCircleTexture(),
      transparent: true, depthWrite:false
    })
    const points = new THREE.Points(geom, material)
    scene.add(points)

    // subtle moving light
    const light = new THREE.PointLight(0xffffff, 1.2, 10); light.position.set(2,2,2); scene.add(light)
    const amb = new THREE.AmbientLight(0x404040, 1.4); scene.add(amb)

    // scroll morph
    let t = 0 // 0..1
    const onScroll = ()=>{
      const y = window.scrollY
      const h = document.body.scrollHeight - window.innerHeight
      t = h>0 ? y/h : 0
    }
    window.addEventListener('scroll', onScroll, {passive:true})

    const tmpFrom = new THREE.Vector3(), tmpTo = new THREE.Vector3()
    function updateMorph(alpha){
      const pos = geom.getAttribute('position')
      const trg = geom.getAttribute('target')
      for(let i=0;i<COUNT;i++){
        tmpFrom.set(pos.getX(i), pos.getY(i), pos.getZ(i))
        tmpTo.set(trg.getX(i), trg.getY(i), trg.getZ(i))
        tmpFrom.lerp(tmpTo, alpha)
        pos.setXYZ(i, tmpFrom.x, tmpFrom.y, tmpFrom.z)
      }
      pos.needsUpdate = true
    }

    let clock = new THREE.Clock()
    function animate(){
      const dt = clock.getDelta()
      // ease morph
      const eased = THREE.MathUtils.smoothstep(t, 0, 1)
      updateMorph(eased)
      // drift rotation
      points.rotation.y += dt*0.08
      renderer.render(scene, camera)
      requestAnimationFrame(animate)
    }
    animate()

    function onResize(){
      renderer.setSize(container.clientWidth, container.clientHeight)
      camera.aspect = container.clientWidth/container.clientHeight
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(onResize); ro.observe(container)

    return ()=>{
      window.removeEventListener('scroll', onScroll)
      ro.disconnect()
      container.removeChild(renderer.domElement)
      renderer.dispose(); geom.dispose(); material.dispose()
    }
  },[])

  return <div ref={ref} style={{position:'absolute', inset:0}}/>
}

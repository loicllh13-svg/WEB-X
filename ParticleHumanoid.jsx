import * as THREE from 'three'
import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

function discTexture(size=64){
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  const g = ctx.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2)
  g.addColorStop(0,'rgba(255,255,255,1)')
  g.addColorStop(0.35,'rgba(255,240,200,0.9)')
  g.addColorStop(0.7,'rgba(255,210,80,0.35)')
  g.addColorStop(1,'rgba(255,210,80,0)')
  ctx.fillStyle = g
  ctx.fillRect(0,0,size,size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.anisotropy = 8
  return tex
}

function samplePointsOnGeometry(geom, n){
  const pos = geom.attributes.position.array
  const faces = []
  for(let i=0;i<pos.length;i+=9) faces.push([i,i+3,i+6])
  const areas = []
  let total = 0
  const A=new THREE.Vector3(),B=new THREE.Vector3(),C=new THREE.Vector3()
  for(const f of faces){
    A.set(pos[f[0]],pos[f[0]+1],pos[f[0]+2])
    B.set(pos[f[1]],pos[f[1]+1],pos[f[1]+2])
    C.set(pos[f[2]],pos[f[2]+1],pos[f[2]+2])
    total += THREE.Triangle.getArea(A,B,C)
    areas.push(total)
  }
  function pick(){
    const r = Math.random()*total
    let lo=0, hi=areas.length-1
    while(lo<hi){ const m=(lo+hi)>>1; if(r<=areas[m]) hi=m; else lo=m+1 }
    return faces[lo]
  }
  function bary(){ let a=Math.random(), b=Math.random(); if(a+b>1){a=1-a; b=1-b} return [a,b,1-a-b] }
  const out = new Float32Array(n*3)
  for(let i=0;i<n;i++){
    const f = pick(), bc=bary()
    A.set(pos[f[0]],pos[f[0]+1],pos[f[0]+2])
    B.set(pos[f[1]],pos[f[1]+1],pos[f[1]+2])
    C.set(pos[f[2]],pos[f[2]+1],pos[f[2]+2])
    const p = new THREE.Vector3().addScaledVector(A,bc[0]).addScaledVector(B,bc[1]).addScaledVector(C,bc[2])
    out[i*3]=p.x; out[i*3+1]=p.y; out[i*3+2]=p.z
  }
  return out
}

export default function ParticleHumanoid({ morph=0, count=9000 }){
  const ref = useRef()
  const { sphere, human, colA, colB } = useMemo(()=>{
    // A — energy cloud (sphere)
    const s = new Float32Array(count*3)
    const a = new Float32Array(count*3)
    for(let i=0;i<count;i++){
      const r = Math.cbrt(Math.random())*1.25
      const u = Math.random(), v = Math.random()
      const theta = 2*Math.PI*u, phi = Math.acos(2*v-1)
      s[i*3]   = r*Math.sin(phi)*Math.cos(theta)
      s[i*3+1] = r*Math.sin(phi)*Math.sin(theta)
      s[i*3+2] = r*Math.cos(phi)
      a[i*3]=1.0; a[i*3+1]=0.95; a[i*3+2]=0.7
    }
    // B — humanoid by merged primitives
    const geos = []
    geos.push(new THREE.CapsuleGeometry(0.5,1.2,8,16))                  // torso
    geos.push(new THREE.SphereGeometry(0.35,16,16).translate(0,1.1,0))  // head
    geos.push(new THREE.CapsuleGeometry(0.15,0.9,6,12).rotateZ(Math.PI/2).translate(0.7,0.2,0))   // right arm
    geos.push(new THREE.CapsuleGeometry(0.15,0.9,6,12).rotateZ(-Math.PI/2).translate(-0.7,0.2,0)) // left arm
    geos.push(new THREE.CapsuleGeometry(0.22,1.1,8,12).translate(0.25,-1.2,0)) // legs
    geos.push(new THREE.CapsuleGeometry(0.22,1.1,8,12).translate(-0.25,-1.2,0))
    const merged = mergeGeometries(geos)
    merged.scale(0.9,0.9,0.9)
    const h = samplePointsOnGeometry(merged, count)

    const b = new Float32Array(count*3)
    for(let i=0;i<count;i++){ b[i*3]=1.0; b[i*3+1]=0.98; b[i*3+2]=0.9 }
    return { sphere:s, human:h, colA:a, colB:b }
  },[count])

  const geom = useMemo(()=>{
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(sphere.slice(),3))
    g.setAttribute('color', new THREE.BufferAttribute(colA.slice(),3))
    return g
  },[])

  const mat = useMemo(()=> new THREE.PointsMaterial({
    size: 0.02,
    map: discTexture(128),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    opacity: 0.95,
    sizeAttenuation: true
  }),[])

  useFrame(({ clock })=>{
    const t = morph
    const pos = geom.attributes.position.array
    const col = geom.attributes.color.array
    for(let i=0;i<pos.length;i+=3){
      pos[i]   = sphere[i]*(1-t) + human[i]*t
      pos[i+1] = sphere[i+1]*(1-t) + human[i+1]*t
      pos[i+2] = sphere[i+2]*(1-t) + human[i+2]*t
      const sp = (Math.sin(clock.elapsedTime*8 + i*0.005)*0.5+0.5)*0.08
      col[i]   = Math.min(1.0, colA[i]*(1-t) + colB[i]*t + sp)
      col[i+1] = Math.min(1.0, colA[i+1]*(1-t) + colB[i+1]*t + sp*0.6)
      col[i+2] = Math.min(1.0, colA[i+2]*(1-t) + colB[i+2]*t)
    }
    geom.attributes.position.needsUpdate = true
    geom.attributes.color.needsUpdate = true
    if(ref.current){
      ref.current.rotation.y = Math.sin(clock.elapsedTime*0.3)*0.15
      ref.current.rotation.x = Math.cos(clock.elapsedTime*0.2)*0.08
    }
  })

  return <points ref={ref} geometry={geom} material={mat} />
}

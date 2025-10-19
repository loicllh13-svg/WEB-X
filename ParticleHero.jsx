
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef, useEffect, useState } from 'react'

function makeCircleTexture(size=128){
  const cvs = document.createElement('canvas'); cvs.width=cvs.height=size
  const g=cvs.getContext('2d'), r=size/2
  const grd=g.createRadialGradient(r,r,0,r,r,r)
  grd.addColorStop(0,'rgba(255,255,255,1)')
  grd.addColorStop(.35,'rgba(255,255,210,.85)')
  grd.addColorStop(1,'rgba(255,255,255,0)')
  g.fillStyle=grd; g.beginPath(); g.arc(r,r,r,0,Math.PI*2); g.fill()
  const tex=new THREE.Texture(cvs); tex.needsUpdate=true; return tex
}
function humanoidPositions(count){
  const pts = new Float32Array(count*3); let i=0
  const push=(x,y,z)=>{pts[i++]=x;pts[i++]=y;pts[i++]=z}
  function ellip(cx,cy,cz, rx,ry,rz, n){
    for(let k=0;k<n;k++){ const u=Math.random()*Math.PI*2, v=Math.acos(2*Math.random()-1), rr=Math.cbrt(Math.random())
      const x=rx*rr*Math.sin(v)*Math.cos(u), y=ry*rr*Math.cos(v), z=rz*rr*Math.sin(v)*Math.sin(u); push(cx+x,cy+y,cz+z)}
  }
  const N=count
  ellip(0,0.9,0,.22,.28,.22,Math.floor(N*.10))
  ellip(0,0.3,0,.28,.5,.2,Math.floor(N*.28))
  ellip(0,-0.2,0,.26,.38,.18,Math.floor(N*.22))
  ellip(-.42,.25,0,.12,.45,.12,Math.floor(N*.14))
  ellip(.42,.25,0,.12,.45,.12,Math.floor(N*.14))
  ellip(-.16,-.9,0,.13,.7,.13,Math.floor(N*.06))
  ellip(.16,-.9,0,.13,.7,.13,Math.floor(N*.06))
  return pts
}
function useScroll(){ const [p,setP]=useState(0); useEffect(()=>{ const on=()=>{
  const h=document.documentElement.scrollHeight-window.innerHeight; const v=h>0?window.scrollY/h:0; setP(Math.min(1,Math.max(0,v)));
}; on(); window.addEventListener('scroll',on,{passive:true}); return ()=>window.removeEventListener('scroll',on)},[]); return p }
function Particles({count=45000}){
  const tex=useMemo(()=>makeCircleTexture(128),[])
  const start=useMemo(()=>{ const a=new Float32Array(count*3); for(let i=0;i<count;i++){
    const r=Math.random()*1.8+.2, t=Math.random()*Math.PI*2, p=Math.acos(2*Math.random()-1)
    a[i*3+0]=r*Math.sin(p)*Math.cos(t); a[i*3+1]=r*Math.cos(p); a[i*3+2]=r*Math.sin(p)*Math.sin(t)
  } return a },[count])
  const target=useMemo(()=>humanoidPositions(count),[count])
  const geom=useMemo(()=>new THREE.BufferGeometry(),[])
  useEffect(()=>{ geom.setAttribute('position', new THREE.BufferAttribute(start.slice(),3)) },[geom,start])
  const prog=useScroll()
  useFrame((state)=>{
    const arr=geom.getAttribute('position').array
    const k=Math.min(1, Math.pow(prog, .7))
    for(let i=0;i<count;i++){ const si=i*3
      const sp=.08 + k*.22
      arr[si+0]=THREE.MathUtils.lerp(arr[si+0],target[si+0],sp)
      arr[si+1]=THREE.MathUtils.lerp(arr[si+1],target[si+1],sp)
      arr[si+2]=THREE.MathUtils.lerp(arr[si+2],target[si+2],sp)
      const j=(Math.sin((i%997)*.01 + state.clock.elapsedTime*1.5)+1)*.0008
      arr[si+0]+= (Math.random()-.5)*j; arr[si+1]+= (Math.random()-.5)*j; arr[si+2]+= (Math.random()-.5)*j
    }
    geom.attributes.position.needsUpdate=true
  })
  const cols=useMemo(()=>{ const c=new Float32Array(count*3); for(let i=0;i<count;i++){
    const t=Math.random(); const r=1, g=.92+.08*(1-t), b=.75+.25*(1-t); c[i*3]=r; c[i*3+1]=g; c[i*3+2]=b } return c },[count])
  useEffect(()=>{ geom.setAttribute('color', new THREE.BufferAttribute(cols,3)) },[geom,cols])
  return (<points geometry={geom}><pointsMaterial size={.02} transparent depthWrite={false} blending={THREE.AdditiveBlending} vertexColors sizeAttenuation map={tex}/></points>)
}
function Rig(){ const {camera}=useThree(); useFrame(({clock})=>{ const t=clock.getElapsedTime(); camera.position.set(Math.sin(t*.2)*.8,.2+Math.sin(t*.4)*.05,3.4); camera.lookAt(0,-.2,0) }); return null }
export default function ParticleHero(){ return (<Canvas dpr={[1,2]} camera={{position:[0,0,3.4], fov:60}}><color attach="background" args={['#0b0f14']} /><ambientLight intensity={.6}/><directionalLight position={[2,3,2]} intensity={1.2} color={'#ffd87a'}/><Particles count={38000}/><Rig/></Canvas>) }

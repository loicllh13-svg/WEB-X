import * as THREE from 'three'
import { useMemo, useRef, useEffect } from 'react'

export default function ParticleMaterial({ size=4 }){
  const mat = useRef()
  const map = useMemo(()=>{
    const s=64, c=document.createElement('canvas'); c.width=c.height=s
    const g=c.getContext('2d')
    const grad=g.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2)
    grad.addColorStop(0,'rgba(255,255,255,1)')
    grad.addColorStop(.5,'rgba(255,255,255,.6)')
    grad.addColorStop(1,'rgba(255,255,255,0)')
    g.fillStyle=grad; g.beginPath(); g.arc(s/2,s/2,s/2,0,Math.PI*2); g.fill()
    const t=new THREE.CanvasTexture(c); t.minFilter=THREE.LinearFilter; t.magFilter=THREE.LinearFilter; return t
  },[])

  useEffect(()=>{
    let id=0
    const tick=(t)=>{
      if(mat.current){
        const k=(Math.sin(t*0.004)+1)*.5
        const color=new THREE.Color('#fff8cc').lerp(new THREE.Color('#ffd84d'), .35+.35*k)
        mat.current.color.copy(color)
        mat.current.opacity=0.7+0.3*k
      }
      id=requestAnimationFrame(tick)
    }
    id=requestAnimationFrame(tick)
    return ()=> cancelAnimationFrame(id)
  },[])

  return <pointsMaterial ref={mat} size={size} map={map} transparent depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation/>
}

import React, { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import ParticleHumanoid from './components/ParticleHumanoid'

export default function App(){
  const [morph, setMorph] = useState(0)
  useEffect(()=>{
    const onScroll = () => {
      const h = document.body.scrollHeight - innerHeight
      const t = Math.max(0, Math.min(1, window.scrollY / (h*0.6)))
      setMorph(t)
    }
    window.addEventListener('scroll', onScroll, {passive:true})
    onScroll()
    return ()=>window.removeEventListener('scroll', onScroll)
  },[])

  return (
    <Canvas className="webgl" camera={{ position:[0,0,5], fov:50 }}>
      <color attach="background" args={[0x0b0e14]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[5,5,5]} intensity={1.2} />
      <ParticleHumanoid morph={morph} count={9000} />
    </Canvas>
  )
}

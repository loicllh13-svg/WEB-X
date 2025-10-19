
import React, { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import ParticlesMorph from './ParticlesMorph.jsx'

export default function App(){
  const [progress, setProgress] = useState(0) // 0 -> 1

  useEffect(()=>{
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      setProgress(p)
    }
    window.addEventListener('scroll', onScroll, {passive:true})
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <div className='canvas-wrap'>
        <Canvas camera={{ position: [0,0,6], fov: 45 }} dpr={[1,2]}>
          <ambientLight intensity={0.4} />
          <pointLight position={[5,5,5]} intensity={1.2} />
          <ParticlesMorph progress={progress} />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      <header className='header'>
        <div className='brand'><div className='badge'>WX</div> WEB X <span style={{opacity:.5}}>— Studios</span></div>
      </header>

      <div className='container' style={{position:'relative', zIndex:1}}>
        <p className='callout'>Défilez pour morph <b>Énergie</b> ⇄ <b>Humanoïde</b></p>
        <h1 className='h1'>Créons votre <span className='gradient'>univers web</span> immersif</h1>
        <p className='lead'>Sites vitrines modernes ou expériences <b>3D/WebGL</b> avec interactions. Design soigné et performances au rendez-vous.</p>
        <div className='row'>
          <a className='btn primary' href='#'>Voir des démos</a>
          <a className='btn' href='#'>Parler de votre projet</a>
        </div>
        <div className='pills'>
          <span className='pill'>Performant</span>
          <span className='pill'>Sécurisé</span>
          <span className='pill'>Responsive</span>
        </div>

        <div style={{height:'180vh'}}></div>
        <footer>© WEB X — Studios</footer>
      </div>
    </>
  )
}

import React, { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import ParticleHumanoid from './components/ParticleHumanoid.jsx'

export default function App(){
  const [morph, setMorph] = useState(0)
  useEffect(()=>{
    const onScroll = () => {
      const h = document.body.scrollHeight - window.innerHeight
      const t = Math.max(0, Math.min(1, window.scrollY / (h*0.6))) // morph sur ~60% du scroll
      setMorph(t)
    }
    window.addEventListener('scroll', onScroll, { passive:true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  },[])

  return (
    <>
      <header>
        <strong>WEB X — Studios</strong>
        <span style={{opacity:.7}}>•</span>
        <a href="#services">Services</a>
        <a href="#method">Méthode</a>
        <a href="#projects">Projets</a>
        <a href="#contact">Contact</a>
      </header>

      <section className="hero">
        <Canvas className="webgl" camera={{ position:[0,0,5], fov:50 }}>
          <color attach="background" args={['#0b0f14']} />
          <ambientLight intensity={0.6} />
          <pointLight position={[5,5,5]} intensity={1.2} />
          <ParticleHumanoid morph={morph} count={9000} />
        </Canvas>

        <div className="copy">
          <div className="hint">Défilez : <b>Énergie</b> ⇄ <b>Humanoïde</b></div>
          <h1>Créons votre <span className="grad">univers web</span> immersif</h1>
          <p className="lead">Sites vitrines modernes ou expériences <b>3D/WebGL</b> avec interactions. Design soigné et performances au rendez-vous.</p>
          <div className="cta">
            <a className="btn primary" href="#demos">Voir des démos</a>
            <a className="btn" href="#contact">Parler de votre projet</a>
          </div>
          <div className="chips">
            <span className="chip">Performant</span>
            <span className="chip">Sécurisé</span>
            <span className="chip">Responsive</span>
          </div>
        </div>
      </section>

      <section id="services" className="section">
        <h2>Nos services</h2>
        <p>3D temps réel (WebGL), expériences interactives, landing pages premium, SEO technique.</p>
      </section>

      <section id="method" className="section">
        <h2>Méthode</h2>
        <p>Atelier → Maquettes → Dev agile → Recette & performance → Mise en ligne.</p>
      </section>

      <section id="projects" className="section">
        <h2>Projets</h2>
        <p>À venir : études de cas et démonstrations.</p>
      </section>

      <section id="contact" className="section">
        <h2>Contact</h2>
        <p>Écrivez-nous : contact@webx.studio</p>
      </section>

      <footer>© WEB X — Studios</footer>
    </>
  )
}

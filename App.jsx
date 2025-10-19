
import React, { useEffect } from 'react'
import ParticleMorph from './particle/ParticleMorph.jsx'

export default function App(){
  useEffect(()=>{window.scrollTo(0,0)},[])
  return (
    <>
      <div className="container">
        <header>
          <div className="logo">WX</div>
          <strong>WEB X</strong>
          <span style={{opacity:.55,marginLeft:6}}>— Studios</span>
          <nav>
            <a href="#s">Services</a>
            <a href="#m">Méthode</a>
            <a href="#p">Projets</a>
            <a href="#q">Devis rapide</a>
          </nav>
        </header>
      </div>

      <div className="hero">
        <ParticleMorph />
        <div className="container hero-content">
          <div className="hint">Défilez pour morph <strong>Énergie</strong> ⇄ <strong>Humanoïde</strong></div>
          <h1 className="title">Créons votre <span style={{background:'linear-gradient(135deg,#6ec1ff,#b388ff)',WebkitBackgroundClip:'text',color:'transparent'}}>univers web</span> immersif</h1>
          <p className="subtitle">Sites vitrines modernes ou expériences <strong>3D/WebGL</strong> avec interactions. Design soigné et performances au rendez-vous.</p>
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
      </div>

      <section id="s">
        <div className="container">
          <h2>Nos services</h2>
          <p>Sites 3D/WebGL, intégrations React, animations sur-mesure, optimisation Lighthouse, et plus encore.</p>
        </div>
      </section>

      <section id="m">
        <div className="container">
          <h2>Méthode</h2>
          <p>Atelier, prototype, itérations rapides. Livraison continue et suivi complet après mise en ligne.</p>
        </div>
      </section>

      <section id="p">
        <div className="container">
          <h2>Projets</h2>
          <p>Une sélection d’expériences interactives, sites immersifs, et interfaces élégantes.</p>
        </div>
      </section>

      <footer>
        <div className="container">© WEB X — Studios</div>
      </footer>
    </>
  )
}

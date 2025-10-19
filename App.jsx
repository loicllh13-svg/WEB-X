import React from 'react'
import ParticleHero from './components/ParticleHero.jsx'

export default function App(){
  return (<>
    <header>
      <div className="nav">
        <div className="brand"><div className="badge">WX</div><div><div style={{fontWeight:900}}>WEB X</div><div style={{opacity:.7, marginTop:-2}}>— Studios</div></div></div>
        <a href="#">Services</a><a href="#">Méthode</a><a href="#">Projets</a><a href="#" className="btn">Devis rapide</a>
      </div>
    </header>

    {/* HERO FULLSCREEN: only the particle cloud + hint */}
    <section className="hero">
      <div className="canvas-wrap"><ParticleHero/></div>
      <div className="hint">Défilez pour morph <b>Énergie ⇄ Humanoïde</b></div>
    </section>

    {/* CONTENT appears AFTER the morph section */}
    <section>
      <div className="container">
        <h1>Créons votre <span className="gradient">univers web</span> immersif</h1>
        <p className="lead">Sites vitrines modernes ou expériences <b>3D/WebGL</b> avec interactions. Design soigné et performances au rendez-vous.</p>
        <div style={{display:'flex', gap:14, marginTop:18, flexWrap:'wrap'}}>
          <a className="btn primary" href="#">Voir des démos</a>
          <a className="btn" href="#">Parler de votre projet</a>
        </div>
      </div>
    </section>

    <section>
      <div className="container">
        <h2>Nos services</h2>
        <p className="lead">3D/WebGL, sites vitrines premium, animations sur mesure, intégration e‑commerce, etc.</p>
      </div>
    </section>

    <div className="footer"><div className="container">© WEB X — Studios</div></div>
  </>)
}
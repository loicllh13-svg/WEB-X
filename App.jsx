import React, { useMemo } from 'react'
import ParticleMorphCanvas from './components/ParticleMorphCanvas.jsx'

export default function App(){
  return (
    <>
      <div className="canvas-wrap" aria-hidden="true">
        <ParticleMorphCanvas />
      </div>

      <header className="header">
        <div className="brand">
          <div className="logo">WX</div>
          <div>WEB X — <span style={{opacity:.85}}>Studios</span></div>
        </div>
        <nav className="nav">
          <a href="#services">Services</a>
          <a href="#method">Méthode</a>
          <a href="#projects">Projets</a>
          <a href="#contact">Devis rapide</a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div>
            <div className="note">Défilez : <b>Énergie ⇄ Humanoïde</b></div>
            <h1>Créons votre univers<br/><span style={{color:'var(--accent1)'}}>web</span> <span style={{color:'var(--accent2)'}}>immersif</span></h1>
            <p className="lead">
              Sites vitrines modernes ou expériences <b>3D/WebGL</b> avec interactions. Design soigné et performances au rendez‑vous.
            </p>
            <div className="cta">
              <a className="btn primary" href="#projects">Voir des démos</a>
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
          <p>Sites 3D/WebGL, animations scroll, intégrations e‑commerce, SEO technique.</p>
        </section>

        <section id="method" className="section">
          <h2>Méthode</h2>
          <p>Découverte → Maquettes → Dev agile → Recette → Mise en ligne. On s’occupe aussi de l’optimisation continue.</p>
        </section>

        <section id="projects" className="section">
          <h2>Projets</h2>
          <p>Quelques cas à venir… (on branchera bientôt ton portfolio).</p>
        </section>

        <section id="contact" className="section">
          <h2>Contact / Devis</h2>
          <p>Parlez‑nous de votre projet : hello@webx.studio</p>
        </section>
      </main>

      <footer>© WEB X — Studios</footer>
    </>
  )
}

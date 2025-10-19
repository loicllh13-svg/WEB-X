import React from 'react'

export default function App(){
  return (
    <>
      <header className="header">
        <div className="logo">
          <span className="logo-badge" />
          <span>GenZ — Studios</span>
        </div>
        <a className="cta" href="#contact">Devis rapide</a>
      </header>

      <main className="hero">
        <h1>
          Créons votre <span className="gradient">univers web immersif</span>
        </h1>
        <p className="lead">
          Sites vitrines modernes ou expériences <strong>3D/WebGL</strong> avec interactions.
        </p>
        <div className="btns">
          <a className="btn primary" href="#demos">Voir des démos</a>
          <a className="btn secondary" href="#contact">Parler de votre projet</a>
        </div>

        <div className="badges">
          <span className="badge"><i className="icon" /> Performant</span>
          <span className="badge"><i className="icon" /> Sécurisé</span>
          <span className="badge"><i className="icon" /> Responsive</span>
        </div>

        <section className="card" id="demos">
          <b>Section démo</b>
          <p style={{marginTop:8,color:'#9aa3b2'}}>Remplace ce bloc par tes composants ou images quand tu voudras.</p>
        </section>
      </main>

      <footer className="footer" id="contact">
        © {new Date().getFullYear()} GenZ — Studios · Contact : contact@exemple.com
      </footer>
    </>
  )
}

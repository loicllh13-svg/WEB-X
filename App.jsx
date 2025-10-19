import React from 'react'
import '../public/styles.css'

const IconBolt = () => (
  <svg className="icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="grad" x1="0" y1="0" x2="1" y2="1"><stop/><stop offset="1"/></linearGradient></defs>
    <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/>
  </svg>
)
const IconShield = () => (
  <svg className="icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="grad" x1="0" y1="0" x2="1" y2="1"><stop/><stop offset="1"/></linearGradient></defs>
    <path d="M12 2l8 3v6c0 5.25-3.5 9.74-8 11-4.5-1.26-8-5.75-8-11V5l8-3z"/>
  </svg>
)
const IconGrid = () => (
  <svg className="icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="grad" x1="0" y1="0" x2="1" y2="1"><stop/><stop offset="1"/></linearGradient></defs>
    <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"/>
  </svg>
)

export default function App(){
  return (
    <div className="wrap">
      <nav className="nav">
        <a className="logo" href="#">
          <span className="logoBadge">GZ</span>
          GenZ — Studios
        </a>
        <a className="cta" href="#contact">Devis rapide</a>
      </nav>

      <header>
        <h1>
          Créons votre<br/>
          <span className="grad">univers web</span><br/>
          <span className="grad">immersif</span>
        </h1>
        <p className="lead">
          Sites vitrines modernes ou expériences <strong>3D/WebGL</strong> avec interactions.
        </p>
        <div className="btnRow">
          <a className="btn" href="#demos">Voir des démos</a>
          <a className="btn outline" href="#projet">Parler de votre projet</a>
        </div>

        <div className="features">
          <span className="badge"><IconBolt/> Performant</span>
          <span className="badge"><IconShield/> Sécurisé</span>
          <span className="badge"><IconGrid/> Responsive</span>
        </div>

        <div className="card" aria-hidden="true"></div>
      </header>
    </div>
  )
}

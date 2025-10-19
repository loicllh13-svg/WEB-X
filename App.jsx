import ThreeScene from './ThreeScene'

export default function App(){
  return (
    <>
      <header className="header">
        <div className="container logo">
          <div className="badge">WX</div>
          <div>WEB X — <span style={{opacity:.8}}>Studios</span></div>
        </div>
      </header>

      <main className="container" style={{paddingTop:30}}>
        <section className="grid">
          <div>
            <h1>Créons votre <span className="a">univers web</span> <span className="b">immersif</span></h1>
            <p>Sites vitrines modernes ou expériences <b>3D/WebGL</b> avec interactions. Design soigné et performances au rendez‑vous.</p>
            <div className="cta">
              <a className="btn primary" href="#">Voir des démos</a>
              <a className="btn" href="#">Parler de votre projet</a>
            </div>
            <div className="pills">
              <div className="pill">Performant</div>
              <div className="pill">Sécurisé</div>
              <div className="pill">Responsive</div>
            </div>
          </div>
          <ThreeScene/>
        </section>

        <section style={{height:'120vh'}} />
      </main>

      <div className="footer">© WEB X — Studios</div>
    </>
  )
}

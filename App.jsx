import React from 'react'

export default function App() {
  return (
    <main style={{minHeight:'100dvh',display:'grid',placeItems:'center'}}>
      <div style={{maxWidth:820,padding:24,borderRadius:16,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)'}}>
        <h1 style={{margin:0,fontSize:48,lineHeight:1.1}}>Pipeline OK ✅</h1>
        <p style={{opacity:.8}}>Si vous voyez cette page sur Vercel, la build est <strong>bonne</strong>. On remplacera ensuite ce contenu par votre site.</p>
      </div>
    </main>
  )
}

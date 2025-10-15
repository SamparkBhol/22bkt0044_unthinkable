import React from 'react'

export default function Home({onStart}){
  return (
    <section className="hero fade-in">
      <div className="left">
        <h1>Smart Recipe Generator</h1>
        <p className="small">Snap or list your available ingredients and get recipe suggestions tailored to your diet and time. Fast, privacy-friendly, and mobile-ready.</p>
        <div style={{marginTop:16}}>
          <button className="cta" onClick={onStart}>Get started</button>
        </div>
      </div>
      <div className="right small">
        <strong>Features</strong>
        <ul>
          <li>Image-based ingredient recognition</li>
          <li>Smart matching (TF-IDF fallback)</li>
          <li>Dietary filters & serving scaling</li>
          <li>Persisted favorites & ratings</li>
        </ul>
      </div>
    </section>
  )
}

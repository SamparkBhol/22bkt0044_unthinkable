import React, {useState, useRef, useEffect} from 'react'
import { useToast } from './Toast'

// Small vibing feature implemented with WebAudio synth presets + file upload and canvas visualizer
const PRESETS = [
  {id:'warm', title: 'Warm Pad', config: {freq: 110, type: 'sine'}},
  {id:'pulse', title: 'Soft Pulse', config: {freq: 220, type: 'sine'}},
  {id:'bell', title: 'Tinkly Bell', config: {freq: 440, type: 'triangle'}}
]

export default function Extras({setIngredients}){
  const [active, setActive] = useState(null) // {type:'preset'|'file', id}
  const [timeLeft, setTimeLeft] = useState(0)
  const timerRef = useRef(null)

  // audio refs
  const audioCtxRef = useRef(null)
  const analyserRef = useRef(null)
  const masterGainRef = useRef(null)
  const sourceRef = useRef(null) // holds stop() function or media element
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const [volume, setVolume] = useState(0.6)
  const toast = useToast()

  // initialize audio context & analyser lazily on first user interaction
  function ensureAudio(){
    if(!audioCtxRef.current){
      const C = window.AudioContext || window.webkitAudioContext
      if(!C) return null
      const ctx = new C()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      const master = ctx.createGain()
      master.gain.value = volume
      master.connect(ctx.destination)
      analyser.connect(master)
      audioCtxRef.current = ctx
      analyserRef.current = analyser
      masterGainRef.current = master
    }
    return audioCtxRef.current
  }

  function startPreset(preset){
    const ctx = ensureAudio()
  if(!ctx) { toast.show('Audio not supported', {kind:'error'}); return }
    // stop existing
    stopAudio()
    try{ ctx.resume && ctx.resume() }catch(e){}

    const p = PRESETS.find(x=>x.id===preset)
    if(!p) return

    // create two detuned oscillators for a warm texture
    const o1 = ctx.createOscillator(); o1.type = p.config.type; o1.frequency.value = p.config.freq
    const o2 = ctx.createOscillator(); o2.type = p.config.type; o2.frequency.value = p.config.freq * 1.01
    const g = ctx.createGain(); g.gain.value = 0
    const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 1200

    o1.connect(g); o2.connect(g); g.connect(analyserRef.current)
    g.connect(filter); filter.connect(analyserRef.current)
    // gentle fade-in
    const now = ctx.currentTime
    g.gain.cancelScheduledValues(now)
    g.gain.setValueAtTime(0.0001, now)
    g.gain.exponentialRampToValueAtTime(0.6 * volume, now + 1.2)

    o1.start(); o2.start()

    sourceRef.current = {
      type: 'synth',
      stop(){ try{ const t = ctx.currentTime; g.gain.cancelScheduledValues(t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6); setTimeout(()=>{ try{o1.stop(); o2.stop(); }catch(e){} }, 700) }catch(e){}
    }
    }
    setActive({type:'preset', id:preset})
    drawVisualizer()
  }

  function stopAudio(){
    if(sourceRef.current){
      if(sourceRef.current.type === 'file' && sourceRef.current.el){ try{ sourceRef.current.el.pause(); sourceRef.current.el.src=''; sourceRef.current.el.remove(); }catch(e){} }
      if(typeof sourceRef.current.stop === 'function'){
        try{ sourceRef.current.stop() }catch(e){}
      }
    }
    sourceRef.current = null
    setActive(null)
    cancelAnimationFrame(rafRef.current)
  }

  function drawVisualizer(){
    const canvas = canvasRef.current; const analyser = analyserRef.current; const ctx = canvas && canvas.getContext && canvas.getContext('2d')
    if(!canvas || !analyser || !ctx) return
    const bufferLength = analyser.frequencyBinCount
    const data = new Uint8Array(bufferLength)
    function loop(){
      rafRef.current = requestAnimationFrame(loop)
      analyser.getByteFrequencyData(data)
      ctx.clearRect(0,0,canvas.width,canvas.height)
      const barWidth = (canvas.width / bufferLength) * 1.6
      let x = 0
      for(let i=0;i<bufferLength;i++){
        const v = data[i]
        const h = (v / 255) * canvas.height
        ctx.fillStyle = `rgba(${120 + (i%5)*20}, ${180 - i%20*6}, ${220 - i%10*6}, 0.9)`
        ctx.fillRect(x, canvas.height - h, barWidth, h)
        x += barWidth + 1
      }
    }
    loop()
  }

  async function handleFileUpload(e){
    const f = e.target.files && e.target.files[0]
    if(!f) return
    stopAudio()
    const ctx = ensureAudio()
  if(!ctx) { toast.show('Audio not supported', {kind:'error'}); return }
    const url = URL.createObjectURL(f)
    const audioEl = document.createElement('audio')
    audioEl.src = url; audioEl.loop = true; audioEl.crossOrigin = 'anonymous'
    try{ await audioEl.play() }catch(e){ /* user gesture may be required */ }
    const srcNode = ctx.createMediaElementSource(audioEl)
    srcNode.connect(analyserRef.current)
    audioEl.volume = volume
    sourceRef.current = { type:'file', el: audioEl, srcNode }
    try{ audioEl.play().catch(()=>{}) }catch(e){}
    setActive({type:'file', id: f.name})
    drawVisualizer()
  }

  function startTimer(sec){
    clearInterval(timerRef.current)
    setTimeLeft(sec)
    timerRef.current = setInterval(()=>{
      setTimeLeft(t=>{
        if(t<=1){ clearInterval(timerRef.current); return 0 }
        return t-1
      })
    },1000)
  }

  function addShortcut(ing){ setIngredients(prev=> Array.from(new Set([...(prev||[]), ing]))) }

  useEffect(()=>{
    // sync master volume
    if(masterGainRef.current) masterGainRef.current.gain.value = volume
    if(sourceRef.current && sourceRef.current.el) sourceRef.current.el.volume = volume
  },[volume])

  useEffect(()=>{
    return ()=>{ stopAudio(); if(audioCtxRef.current){ try{ audioCtxRef.current.close() }catch(e){} } }
  },[])

  return (
    <div style={{padding:12}}>
      <h3>Extras — Cooking Vibe</h3>
      <div style={{marginTop:8}}>
        <strong>Vibe (synth presets + upload)</strong>
        <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:8}}>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {PRESETS.map(p=> (
              <button key={p.id} className={`btn ${active && active.type==='preset' && active.id===p.id ? 'btn-primary' : 'btn-ghost'}`} onClick={()=>{
                if(active && active.type==='preset' && active.id===p.id){ stopAudio(); return }
                startPreset(p.id)
              }}>{active && active.type==='preset' && active.id===p.id ? 'Stop' : 'Play'} {p.title}</button>
            ))}
            <label className="btn btn-ghost" style={{display:'inline-flex',alignItems:'center'}}>
              Upload audio
              <input type="file" accept="audio/*" onChange={handleFileUpload} style={{display:'none'}} />
            </label>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <label className="small">Volume</label>
            <input type="range" min="0" max="1" step="0.01" value={volume} onChange={e=>setVolume(parseFloat(e.target.value))} />
            <div style={{flex:1}}>
              <canvas ref={canvasRef} width={260} height={60} style={{width:'100%',height:60,borderRadius:8,background:'linear-gradient(90deg, rgba(255,255,255,0.01), rgba(255,255,255,0.02))'}} />
            </div>
          </div>
          
        </div>
      </div>

      <div style={{marginTop:16}}>
        <strong>Quick timer</strong>
        <div style={{display:'flex',gap:8,marginTop:8}}>
          <button className="btn btn-ghost" onClick={()=>startTimer(60)}>1 min</button>
          <button className="btn btn-ghost" onClick={()=>startTimer(180)}>3 min</button>
          <button className="btn btn-ghost" onClick={()=>startTimer(300)}>5 min</button>
        </div>
        <div style={{marginTop:8}}>{timeLeft>0 ? `Time left: ${Math.floor(timeLeft/60)}:${String(timeLeft%60).padStart(2,'0')}` : 'Timer stopped'}</div>
      </div>

      <div style={{marginTop:16}}>
        <strong>Pantry shortcuts</strong>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:8}}>
          {['salt','pepper','olive oil','garlic','onion','tomato','rice'].map(p=> <button key={p} className="btn btn-ghost" onClick={()=>addShortcut(p)}>{p}</button>)}
        </div>
      </div>
    </div>
  )
}

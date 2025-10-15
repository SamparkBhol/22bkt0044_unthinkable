import React, {useState, useEffect} from 'react'

export default function GuidedCook({recipe, onClose}){
  const [step, setStep] = useState(0)
  const total = recipe.steps.length

  useEffect(()=>{
    // speak current step using Web Speech API if available
    const speak = (text)=>{
      try{ if(window.speechSynthesis){ const u=new SpeechSynthesisUtterance(text); window.speechSynthesis.speak(u) }}catch(e){console.warn('speak failed',e)}
    }
    speak(recipe.steps[step])
  },[step,recipe])

  function next(){ if(step<total-1) setStep(s=>s+1); else onClose() }
  function prev(){ if(step>0) setStep(s=>s-1) }

  return (
    <div className="guided-modal">
      <div className="guided-card">
        <h3>{recipe.title} — Step {step+1} / {total}</h3>
        <div className="guided-progress"><div className="guided-bar" style={{width: `${(step+1)/total*100}%`}}></div></div>
        <div className="guided-step">{recipe.steps[step]}</div>
        <div className="guided-controls">
          <button onClick={prev} disabled={step===0}>Back</button>
          <button onClick={next}>{step<total-1? 'Next' : 'Finish'}</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

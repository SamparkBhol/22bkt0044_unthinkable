import React, {useMemo, useState} from 'react'
import { useToast } from './Toast'

function normalize(s){ return (s||'').toLowerCase().replace(/[^a-z0-9 ]/g,'').trim() }

export default function UseItUp({recipes=[], ingredients=[], onSelect}){
  const toast = useToast()
  const [loadingCopy, setLoadingCopy] = useState(false)
  const [minMatch, setMinMatch] = useState(0)

  const normalizedPantry = useMemo(()=> ingredients.map(normalize).filter(Boolean),[ingredients])

  const scored = useMemo(()=>{
    return recipes.map(r=>{
      const recipeNames = (r.ingredients||[]).map(i=> normalize(i.name||i||''))
      const overlap = recipeNames.filter(n => normalizedPantry.some(p => n.includes(p) || p.includes(n))).length
      const missing = recipeNames.filter(n => !normalizedPantry.some(p => n.includes(p) || p.includes(n)))
      const score = recipeNames.length>0 ? Math.round((overlap / recipeNames.length)*100) : 0
      return {...r, matchScore: score, overlap, missing}
    }).sort((a,b)=> b.matchScore - a.matchScore).slice(0,6)
  },[recipes, normalizedPantry])

  const filtered = useMemo(()=> scored.filter(r=> r.matchScore >= minMatch), [scored, minMatch])

  async function copyMissing(list){
    if(!list || list.length===0){ toast.show('No missing items to copy', {kind:'info'}); return }
    setLoadingCopy(true)
    try{
      await navigator.clipboard.writeText(list.join('\n'))
      toast.show('Missing items copied to clipboard', {kind:'success'})
    }catch(e){
      toast.show('Copy failed: '+(e && e.message || String(e)), {kind:'error'})
    }finally{ setLoadingCopy(false) }
  }

  return (
    <div className="use-it-up extras-card">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h4 style={{margin:0}}>Use-It-Up — Quick Picks</h4>
        <div className="badge">{normalizedPantry.length} items</div>
      </div>
      <p className="small" style={{marginTop:6}}>Recipes that best use what you already have. Picks update as you add ingredients.</p>
      <div style={{display:'flex',alignItems:'center',gap:8,marginTop:8}}>
        <label className="small">Min match: {minMatch}%</label>
        <input type="range" min={0} max={100} value={minMatch} onChange={e=>setMinMatch(parseInt(e.target.value||0))} />
      </div>
      <ul style={{listStyle:'none',padding:0,marginTop:8}}>
        {filtered.map(r=> (
          <li key={r.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px dashed rgba(255,255,255,0.02)'}}>
            <div style={{flex:1}}>
              <div style={{fontWeight:700}}>{r.title}</div>
              <div className="small" style={{color:'var(--muted)'}}>Match: {r.matchScore}% — Missing: {r.missing.length}</div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8,marginLeft:12}}>
              <button className="btn btn-ghost" onClick={()=>onSelect && onSelect(r)}>Select</button>
              <button className="btn btn-primary" disabled={loadingCopy} onClick={()=>copyMissing(r.missing)}>{loadingCopy ? 'Copying...' : 'Copy missing'}</button>
            </div>
          </li>
        ))}
      </ul>
      
    </div>
  )
}

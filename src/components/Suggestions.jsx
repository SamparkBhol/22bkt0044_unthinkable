import React, {useMemo, useState, useEffect} from 'react'

export default function Suggestions({recipes, favorites, ratings, detectedIngredients, onSelect}){
  // simple scoring: ingredient overlap + rating bonus + favorite boost
  const favIds = new Set((favorites||[]).map(f=>f.id))
  const scoredAll = useMemo(()=>{
    return (recipes||[]).map(r=>{
      const lowerIngredients = (r.ingredients||[]).map(i=> (i.name||i).toString().toLowerCase())
      const overlap = (detectedIngredients||[]).reduce((acc,d)=> acc + (lowerIngredients.includes(((d||'')+'').toLowerCase())?1:0),0)
      const rating = (ratings||{})[r.id] || 0
      const fav = favIds.has(r.id)? 1:0
      const score = overlap * 2 + rating * 1.5 + fav * 2
      return {...r, score, overlap}
    }).sort((a,b)=>b.score-a.score)
  },[recipes,favorites,ratings,detectedIngredients])

  const topSix = scoredAll.slice(0,6)

  // daily suggestion: deterministic per-day selection among top candidates
  const [daily, setDaily] = useState(null)
  useEffect(()=>{
    try{
      const today = new Date().toISOString().slice(0,10)
      const storedDate = localStorage.getItem('dailySuggestionDate')
      const storedId = localStorage.getItem('dailySuggestionId')
      if(storedDate===today && storedId){
        const r = recipes.find(x=>x.id===storedId)
        if(r){ setDaily(r); return }
      }

      // pick candidate deterministically: hash of date -> index
      const candidates = topSix.length? topSix : scoredAll
      if(!candidates || candidates.length===0) return
      const s = today.split('-').join('')
      let h = 0
      for(let i=0;i<s.length;i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
      const idx = h % candidates.length
      const pick = candidates[idx]
      if(pick){
        localStorage.setItem('dailySuggestionDate', today)
        localStorage.setItem('dailySuggestionId', pick.id)
        setDaily(pick)
      }
    }catch(e){/* ignore */}
  },[scoredAll])

  return (
    <div className="suggestions">
      <h4>Suggestions</h4>
      {daily && (
        <div style={{marginBottom:8,background:'rgba(255,255,255,0.02)',padding:8,borderRadius:8}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <small className="badge">Today's suggestion</small>
              <div style={{fontWeight:700}}>{daily.title}</div>
              <div style={{fontSize:12,color:'var(--muted)'}}>{daily.cuisine} • {daily.time} mins</div>
            </div>
            <div>
              <button className="btn btn-primary" onClick={()=>onSelect(daily)}>Open</button>
            </div>
          </div>
        </div>
      )}

      <ul>
        {topSix.map(r=> (
          <li key={r.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <button className="fav-link" onClick={()=>onSelect(r)}>{r.title}</button>
            <small style={{color:'#9aa4b2'}}>{Math.round(r.score)}</small>
          </li>
        ))}
      </ul>
    </div>
  )
}

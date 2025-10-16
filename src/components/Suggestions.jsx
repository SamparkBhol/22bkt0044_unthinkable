import React, {useMemo} from 'react'

export default function Suggestions({recipes, favorites, ratings, detectedIngredients, onSelect}){
  // simple scoring: ingredient overlap + rating bonus + favorite boost
  const favIds = new Set((favorites||[]).map(f=>f.id))
  const scored = useMemo(()=>{
    return (recipes||[]).map(r=>{
      const lowerIngredients = (r.ingredients||[]).map(i=>i.name.toLowerCase())
      const overlap = (detectedIngredients||[]).reduce((acc,d)=> acc + (lowerIngredients.includes((d||'').toLowerCase())?1:0),0)
      const rating = (ratings||{})[r.id] || 0
      const fav = favIds.has(r.id)? 1:0
      const score = overlap * 2 + rating * 1.5 + fav * 2
      return {...r, score}
    }).sort((a,b)=>b.score-a.score).slice(0,6)
  },[recipes,favorites,ratings,detectedIngredients])

  return (
    <div className="suggestions">
      <h4>Suggestions</h4>
      <ul>
        {scored.map(r=> (
          <li key={r.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <button className="fav-link" onClick={()=>onSelect(r)}>{r.title}</button>
            <small style={{color:'#9aa4b2'}}>{Math.round(r.score)}</small>
          </li>
        ))}
      </ul>
    </div>
  )
}

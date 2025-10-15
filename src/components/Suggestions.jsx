import React, {useMemo} from 'react'

export default function Suggestions({recipes, ratings, preferences, onSelect}){
  const suggested = useMemo(()=>{
    // prioritize rated favorites, then recipes matching diet
    const ratedIds = Object.entries(ratings).filter(([k,v])=>v>0).sort((a,b)=>b[1]-a[1]).map(r=>r[0])
    const byRating = ratedIds.map(id=>recipes.find(r=>r.id===id)).filter(Boolean)
    const dietMatches = recipes.filter(r=>{
      if(preferences.diet && preferences.diet!=='any') return r.diet.includes(preferences.diet)
      return true
    }).slice(0,6)
    const merged = [...byRating, ...dietMatches].filter((v,i,a)=>a.indexOf(v)===i)
    return merged
  },[recipes,ratings,preferences])

  return (
    <div>
      <h3>Suggestions</h3>
      <div>
        {suggested.map(s=> (
          <div key={s.id} className="recipe-card">
            <div style={{display:'flex',justifyContent:'space-between'}}>
              <div>
                <strong>{s.title}</strong>
                <div className="small">{s.cuisine} • {s.time} mins</div>
              </div>
              <div>
                <button onClick={()=>onSelect(s)}>Open</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

import React, {useState, useEffect} from 'react'

export default function PantryGame({ingredients, onUseIngredient}){
  const [target, setTarget] = useState('omelette')
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState([])
  const [player, setPlayer] = useState('Player')
  const [leaderboard, setLeaderboard] = useState([])

  useEffect(()=>{
    const list = ['omelette','salad','sandwich','pancake']
    setTarget(list[Math.floor(Math.random()*list.length)])

    try{
      const raw = localStorage.getItem('pantryLeaderboard')
      if(raw) setLeaderboard(JSON.parse(raw))
    }catch(e){ console.warn('Could not load leaderboard', e) }
  },[])

  useEffect(()=>{
    // persist leaderboard whenever it changes
    try{ localStorage.setItem('pantryLeaderboard', JSON.stringify(leaderboard)) }catch(e){/* ignore */}
  },[leaderboard])

  function tryMake(){
    // naive rule: check common ingredient presence
    const good = ingredients.length>0 && selected.length>0
    if(good){ setScore(s=>s+1); setSelected([]); setTarget(t=>t+'') }
    else setScore(s=>Math.max(0,s-1))
  }

  function saveScore(){
    const entry = { name: player || 'Player', score, date: new Date().toISOString() }
    const next = [...leaderboard, entry].sort((a,b)=>b.score-a.score).slice(0,20)
    setLeaderboard(next)
  }

  function clearLeaderboard(){
    setLeaderboard([])
  }

  return (
    <div className="pantry-game">
      <h4>Pantry Game</h4>
      <div>Target: <strong>{target}</strong></div>
      <div style={{marginTop:6}} className="ingredient-pills">
        {ingredients.length===0 ? <small>No ingredients yet</small> : ingredients.map(i=> (
          <button
            key={i}
            className="ingredient-pill"
            onClick={()=>{
              setSelected(prev=> prev.includes(i)? prev.filter(x=>x!==i) : [...prev,i])
              if(typeof onUseIngredient === 'function') onUseIngredient(i)
            }}
            style={{opacity: selected.includes(i)?1:0.7}}
          >{i}</button>
        ))}
      </div>

      <div style={{marginTop:8}}>
        <button onClick={tryMake}>Try make</button>
        <div style={{marginTop:8}}>Score: {score}</div>
      </div>

      <div style={{marginTop:10}}>
        <label style={{display:'block',fontSize:12,marginBottom:6}}>Save your score</label>
        <input value={player} onChange={e=>setPlayer(e.target.value)} placeholder="Your name" style={{padding:'6px',width:'120px'}} />
        <button onClick={saveScore} style={{marginLeft:8}}>Save</button>
        <button onClick={clearLeaderboard} style={{marginLeft:8}}>Clear</button>
      </div>

      <div style={{marginTop:12}}>
        <strong>Leaderboard</strong>
        {leaderboard.length===0 ? <div style={{fontSize:12,color:'#666'}}>No scores yet</div> : (
          <ol style={{paddingLeft:18,marginTop:6}}>
            {leaderboard.map((row,idx)=> (
              <li key={idx} style={{fontSize:13,marginBottom:4}}>
                <strong>{row.name}</strong> — {row.score} <small style={{color:'#666',marginLeft:6}}>{new Date(row.date).toLocaleString()}</small>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}

import React, {useState} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaMedal, FaTrashAlt, FaClipboard } from 'react-icons/fa'
import { useToast } from './Toast'

function isValidRecipe(r){
  return r && r.id && r.title && Array.isArray(r.ingredients) && Array.isArray(r.steps)
}

export default function ManageRecipes({recipes, onDeleteCustom, onImport}){
  const custom = recipes.filter(r=>r.id && r.id.startsWith('c_'))
  const [paste, setPaste] = useState('')
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  function show(msgText, kind='info'){ toast.show(msgText, {kind}) }

  async function handleFile(e){
    const f = e.target.files && e.target.files[0]
    if(!f) return
    setLoading(true)
    try{
      const txt = await f.text()
      await processImportText(txt)
    }catch(err){ show('Failed to read file: '+(err && err.message) || String(err),'error') }
    finally{ setLoading(false) }
  }

  async function processImportText(txt){
    if(!txt || String(txt).trim().length===0){ show('No JSON provided to import','error'); return }
    let parsed
    try{ parsed = JSON.parse(txt) }catch(e){ show('Invalid JSON: '+(e && e.message) || String(e),'error'); return }
    const arr = Array.isArray(parsed)? parsed : (parsed.recipes || parsed.items || [parsed])
    const valid = arr.filter(isValidRecipe)
    if(valid.length===0){ show('No valid recipes found in JSON','error'); return }

    // normalize ids for custom recipes
    const normalized = valid.map(r=> ({...r, id: r.id && r.id.startsWith('c_')? r.id : `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`}))

    setLoading(true)
    try{
      if(typeof onImport === 'function'){
        await onImport(normalized)
        show(`Imported ${normalized.length} recipes`,'success')
      }else{
        const existing = JSON.parse(localStorage.getItem('customRecipes')||'[]')
        const merged = [...existing, ...normalized]
        localStorage.setItem('customRecipes', JSON.stringify(merged))
        // dispatch a small event so App can refresh if it listens
        window.dispatchEvent(new CustomEvent('customRecipesUpdated',{detail:merged}))
        show(`Imported ${normalized.length} recipes`,'success')
      }
    }catch(e){ show('Failed to save recipes: '+((e && e.message) || String(e)),'error') }
    finally{ setLoading(false) }
  }

  return (
    <div className="manage-recipes manage-card" aria-busy={loading}>
      {/* accessible live region for messages */}
      <div aria-live="polite" style={{minHeight:28}} />
      <div className="manage-header">
        <h4>Manage Recipes</h4>
        <div className="badge">Custom: {custom.length}</div>
      </div>

      <ul className="manage-list">
        {custom.map(r=> (
          <li key={r.id} className="manage-list-item">
            <div className="manage-item-title">{r.title}</div>
            <div className="manage-item-actions">
              <button className="btn btn-ghost" disabled={loading} onClick={async ()=>{
                try{ await navigator.clipboard.writeText(JSON.stringify(r)); show('Copied recipe JSON','success') }catch(e){ show('Copy failed: '+(e && e.message),'error') }
              }} title="Copy"><FaClipboard /></button>
              <button className="btn btn-ghost" disabled={loading} onClick={()=>{
                  try{
                    if(typeof onDeleteCustom === 'function') onDeleteCustom(r.id)
                    else{
                      // local fallback
                      const existing = JSON.parse(localStorage.getItem('customRecipes')||'[]')
                      const kept = existing.filter(x=>x.id!==r.id)
                      localStorage.setItem('customRecipes', JSON.stringify(kept))
                      window.dispatchEvent(new CustomEvent('customRecipesUpdated',{detail:kept}))
                    }
                    show('Deleted recipe','success')
                  }catch(e){ show('Failed to delete: '+(e && e.message),'error') }
              }} title="Delete"><FaTrashAlt /></button>
            </div>
          </li>
        ))}
      </ul>

        <div style={{marginTop:8}}>
        <button className="btn btn-primary" disabled={loading} onClick={async ()=>{
          try{ const data=JSON.stringify(custom||[]); await navigator.clipboard.writeText(data); show('Copied all custom recipes','success') }
          catch(e){ show('Copy failed: '+(e && e.message),'error') }
        }} title="Copy JSON"><FaClipboard /> <span style={{marginLeft:8}}>Copy JSON</span></button>
        {loading && <span style={{marginLeft:10}} className="spinner" aria-hidden/>}
      </div>

      <div style={{marginTop:10}}>
        <label className="small">Import recipes (paste JSON)</label>
        <textarea className="manage-textarea" value={paste} onChange={e=>setPaste(e.target.value)} rows={4} />
        <div style={{display:'flex',gap:8,marginTop:8}}>
          <button className="btn btn-primary" disabled={loading} onClick={()=>processImportText(paste)}>Import pasted JSON</button>
          <label className="btn btn-ghost" style={{display:'inline-flex',alignItems:'center'}}>
            <input type="file" accept="application/json" onChange={handleFile} style={{display:'none'}} />
            Upload file
          </label>
        </div>
        {/* message shown in the global toast */}
      </div>

      <div style={{marginTop:14}}>
        <h5>Pantry Game Leaderboard</h5>
        <Leaderboard show={show} />
      </div>
    </div>
  )
}

function Leaderboard({show}){
  const [data,setData] = React.useState(()=>{
    try{ return JSON.parse(localStorage.getItem('pantryLeaderboard')||'[]') }catch(e){return []}
  })

  function clear(){
    if(!confirm('Clear leaderboard?')) return
    try{
      localStorage.removeItem('pantryLeaderboard')
      setData([])
      show && show('Leaderboard cleared','success')
    }catch(e){ show && show('Failed to clear leaderboard: '+(e && e.message),'error') }
  }

  return (
    <div style={{marginTop:8}}>
      {data.length===0 ? <div style={{color:'var(--muted)'}}>No scores yet</div> : (
        <ol className="leaderboard-list" style={{paddingLeft:0,marginTop:8}}>
          <AnimatePresence>
            {data.slice(0,20).map((r,i)=> (
              <motion.li
                key={r.date || i}
                initial={{opacity:0,y:6}}
                animate={{opacity:1,y:0}}
                exit={{opacity:0,y:4}}
                className="leaderboard-item"
              >
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span className={`medal ${i<3? 'top':''}`}>{i<3 ? <FaMedal /> : <span style={{fontWeight:700,color:'var(--muted)'}}>{i+1}</span>}</span>
                  <div>
                    <div className="leader-name">{r.name}</div>
                    <div className="leader-meta">Score: {r.score} • {new Date(r.date).toLocaleDateString()}</div>
                  </div>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button className="btn btn-ghost" onClick={async ()=>{ try{ await navigator.clipboard.writeText(JSON.stringify(r)); show && show('Copied entry','success') }catch(e){ show && show('Copy failed: '+(e && e.message),'error') } }}>Copy</button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>
      )}
      <div style={{marginTop:8}}>
        <button className="btn btn-ghost" onClick={clear}>Clear leaderboard</button>
      </div>
    </div>
  )
}

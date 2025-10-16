import React, {useState, useEffect, useRef} from 'react'

export default function SubstituteModal({open, onClose, ingredient, suggestions=[], onApply}){
  const [choice, setChoice] = useState('')
  const backdropRef = useRef()
  const selectRef = useRef()

  useEffect(()=>{
    // initialize choice when suggestions change
    setChoice(suggestions && suggestions.length>0 ? suggestions[0] : '')
  },[suggestions])

  useEffect(()=>{
    function onKey(e){ if(e.key === 'Escape') onClose && onClose() }
    if(open){ window.addEventListener('keydown', onKey) }
    return ()=> window.removeEventListener('keydown', onKey)
  },[open,onClose])

  if(!open) return null

  function onBackdropClick(e){
    if(e.target === backdropRef.current){ onClose && onClose() }
  }

  return (
    <div ref={backdropRef} className="modal-backdrop" role="dialog" aria-modal="true" onMouseDown={onBackdropClick}>
      <div className="modal" onMouseDown={e=>e.stopPropagation()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h3 style={{margin:0}}>Substitutes for {ingredient}</h3>
          <button aria-label="Close substitute dialog" className="btn btn-ghost" onClick={()=>onClose && onClose()}>✕</button>
        </div>
        {suggestions.length===0 ? <p>No automatic substitutes found.</p> : (
          <div>
            <select ref={selectRef} value={choice} onChange={e=>setChoice(e.target.value)} style={{width:'100%',padding:8,borderRadius:8,marginTop:8}}>
              <option value="">-- choose --</option>
              {suggestions.map(s=> <option key={s} value={s}>{s}</option>)}
            </select>
            <div style={{marginTop:12,display:'flex',gap:8}}>
              <button className="btn btn-primary" onClick={()=>{ onApply && onApply(choice); onClose && onClose() }} disabled={!choice}>Apply substitute</button>
              <button className="btn btn-ghost" onClick={()=>onClose && onClose()}>Cancel</button>
            </div>
          </div>
        )}
        <div style={{marginTop:8}}>
          <small>You can apply this substitution to the ingredient list; to keep changes for future use save the recipe as a custom recipe.</small>
        </div>
      </div>
    </div>
  )
}

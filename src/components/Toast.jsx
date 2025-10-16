import React, {createContext, useContext, useState, useCallback} from 'react'

const ToastContext = createContext(null)

export function ToastProvider({children}){
  const [toasts, setToasts] = useState([])

  const show = useCallback((text, opts={})=>{
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2,6)
    const t = {id, text, kind: opts.kind || 'info'}
    setToasts(s=>[...s, t])
    if(!opts.stay){ setTimeout(()=> setToasts(s=>s.filter(x=>x.id!==id)), opts.duration || 3500) }
    return id
  },[])

  const remove = useCallback((id)=> setToasts(s=>s.filter(t=>t.id!==id)), [])

  return (
    <ToastContext.Provider value={{show, remove}}>
      {children}
      <div style={{position:'fixed',right:16,top:16,zIndex:2000,display:'flex',flexDirection:'column',gap:8}}>
        {toasts.map(t=> (
          <div key={t.id} className={`toast ${t.kind||'info'}`} role={t.kind==='error'?'alert':'status'}>
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(){
  const ctx = useContext(ToastContext)
  if(!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}

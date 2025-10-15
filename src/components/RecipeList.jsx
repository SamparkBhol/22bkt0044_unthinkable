import React, {useMemo, useState, useEffect} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createMatcher } from '../utils/matching'

function Skeleton(){
  return <div style={{padding:12,borderBottom:'1px solid rgba(255,255,255,0.03)'}}>
    <div style={{background:'rgba(255,255,255,0.03)',height:14,width:'60%',marginBottom:6,borderRadius:4}}></div>
    <div style={{background:'rgba(255,255,255,0.02)',height:10,width:'40%',borderRadius:4}}></div>
  </div>
}

export default function RecipeList({recipes,ingredients,filters,onSelect,favorites,setFavorites}){
  const [sort,setSort]=useState('score')
  const [loading,setLoading]=useState(false)
  const [ratings,setRatings]=useState(()=> JSON.parse(localStorage.getItem('ratings')||'{}'))

  useEffect(()=>{localStorage.setItem('ratings', JSON.stringify(ratings))},[ratings])

  const matcher = useMemo(()=> createMatcher(recipes),[recipes])

  useEffect(()=>{
    setLoading(true)
    const t = setTimeout(()=>setLoading(false),200)
    return ()=>clearTimeout(t)
  },[ingredients])

  const scored = useMemo(()=>{
    if(!ingredients || ingredients.length===0) return recipes.map(r=>({...r,score:0}))
    const results = matcher(ingredients)
    return results.map(s=>({ ...s.recipe, score: s.score }))
  },[recipes,ingredients,matcher])

  const filtered = scored.filter(r=>{
    if(filters.diet!=='any' && !r.diet.includes(filters.diet)) return false
    if(filters.difficulty!=='any' && r.difficulty!==filters.difficulty) return false
    if(r.time>filters.maxTime) return false
    return true
  }).sort((a,b)=> sort==='score' ? b.score-a.score : a.time-b.time)

  function toggleFav(r){
    if(favorites.find(f=>f.id===r.id)) setFavorites(favorites.filter(f=>f.id!==r.id))
    else setFavorites([...favorites,{id:r.id,title:r.title}])
  }

  function setRating(id, val){
    const next = {...ratings, [id]:val}
    setRatings(next)
  }

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h2>Recipes <small style={{color:'#9aa4b2',marginLeft:8}}>tf-idf</small></h2>
        <div>
          <label>Sort: <select value={sort} onChange={e=>setSort(e.target.value)}><option value="score">Match</option><option value="time">Time</option></select></label>
        </div>
      </div>
      <div>
        {loading && Array.from({length:6}).map((_,i)=><Skeleton key={i} />)}
        {!loading && (
          <AnimatePresence>
            <motion.div
              layout
              initial="hidden"
              animate="show"
              exit="hidden"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.06 } }
              }}
            >
              {filtered.map(r => (
                <motion.div
                  layout
                  key={r.id}
                  className="recipe-card"
                  initial={{opacity:0,y:8}}
                  animate={{opacity:1,y:0}}
                  exit={{opacity:0,y:6}}
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div>
                      <strong>{r.title}</strong> <small>({r.cuisine})</small>
                      <div><small>{r.time} mins • {r.difficulty} • Score {Math.round(r.score)}</small></div>
                    </div>
                    <div style={{display:'flex',gap:8,alignItems:'center'}}>
                      <button onClick={()=>onSelect(r)}>Open</button>
                      <button onClick={()=>toggleFav(r)} aria-label="toggle favorite">{favorites.find(f=>f.id===r.id)?'★':'☆'}</button>
                    </div>
                  </div>
                  <div style={{marginTop:8}}>
                    <label>Rate: </label>
                    {[1,2,3,4,5].map(n=> (
                      <button key={n} onClick={()=>setRating(r.id,n)} style={{color: (ratings[r.id]||0)>=n ? '#f59e0b' : '#999'}}>{'★'}</button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

import React, {useState, useEffect} from 'react'
import { motion } from 'framer-motion'
import GuidedCook from './GuidedCook'

function scaleQty(q, fromServings, toServings){
  const n = parseFloat(q)
  if(isNaN(n)) return q
  const scaled = (n * toServings / fromServings)
  return q.replace(n.toString(), Math.round(scaled*100)/100)
}

const SUBSTITUTIONS = {
  'milk':['soy milk','almond milk'],
  'egg':['flax egg','banana (mashed)'],
  'butter':['olive oil','coconut oil'],
  'chicken':['tofu','chickpeas']
}

export default function RecipeDetail({recipe, favorites, setFavorites}){
  const [servings, setServings] = useState(recipe.servings)
  const [ratings, setRatings] = useState(()=> JSON.parse(localStorage.getItem('ratings')||'{}'))
  const [showGuided, setShowGuided] = useState(false)

  useEffect(()=>{localStorage.setItem('ratings', JSON.stringify(ratings))},[ratings])

  function substituteFor(name){
    const key = Object.keys(SUBSTITUTIONS).find(k=>name.toLowerCase().includes(k))
    return key ? SUBSTITUTIONS[key] : []
  }

  function toggleFav(){
    if(favorites.find(f=>f.id===recipe.id)) setFavorites(favorites.filter(f=>f.id!==recipe.id))
    else setFavorites([...favorites,{id:recipe.id,title:recipe.title}])
  }

  function setRating(val){
    const next = {...ratings, [recipe.id]:val}
    setRatings(next)
  }

  return (
  <motion.article aria-labelledby={`rec-${recipe.id}`} initial={{opacity:0,x:8}} animate={{opacity:1,x:0}} exit={{opacity:0,x:6}}>
      <h2 id={`rec-${recipe.id}`}>{recipe.title} <button onClick={toggleFav} aria-pressed={favorites.find(f=>f.id===recipe.id)?'true':'false'}>{favorites.find(f=>f.id===recipe.id)?'★':'☆'}</button></h2>
      <div><small>{recipe.cuisine} • {recipe.time} mins • {recipe.difficulty}</small></div>
      <div style={{marginTop:8}}>
        <label htmlFor="servings-input">Servings: </label>
        <input id="servings-input" type="number" min="1" value={servings} onChange={e=>setServings(Math.max(1,parseInt(e.target.value||1)))} />
      </div>
      <div style={{display:'flex',gap:16,alignItems:'center',marginTop:8}}>
        <div>
          <strong>Rate this recipe</strong>
          <div>
            {[1,2,3,4,5].map(n=> <button key={n} onClick={()=>setRating(n)} style={{color: (ratings[recipe.id]||0) >= n ? '#f59e0b' : '#999'}} aria-pressed={(ratings[recipe.id]||0) >= n}>{'★'}</button>)}
          </div>
        </div>
        <div>
          <strong>Nutrition (per adjusted serving)</strong>
          <div>Calories: {Math.round(recipe.nutrition.calories * servings / recipe.servings)} kcal</div>
          <div>Protein: {Math.round(recipe.nutrition.protein * servings / recipe.servings)} g</div>
        </div>
      </div>

      <h3>Ingredients</h3>
      <ul>
        {recipe.ingredients.map(ing=> (
          <li key={ing.name}>
            {scaleQty(ing.qty, recipe.servings, servings)} {ing.name}
            <div style={{fontSize:'0.9em',color:'#666'}}>
              Substitutes: {substituteFor(ing.name).join(', ') || '—'}
            </div>
          </li>
        ))}
      </ul>

      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <h3>Steps</h3>
        <div><button onClick={()=>setShowGuided(true)}>Start guided cook</button></div>
      </div>
      <ol className="steps-list">{recipe.steps.map((s,i)=> <li key={i}><div className="step-index">{i+1}</div><div className="step-text">{s}</div></li>)}</ol>
    {showGuided && <GuidedCook recipe={recipe} onClose={()=>setShowGuided(false)} />}
    </motion.article>
  )
}

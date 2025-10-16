import React, {useState, useEffect} from 'react'
import { useToast } from './Toast'
import { motion } from 'framer-motion'
import GuidedCook from './GuidedCook'
import SubstituteModal from './SubstituteModal'

function scaleQty(q, fromServings, toServings){
  // try to scale numeric leading values, otherwise return original text
  const m = q.match(/^\s*([0-9]+(?:\.[0-9]+)?)(.*)$/)
  if(!m) return q
  const n = parseFloat(m[1])
  if(isNaN(n)) return q
  const scaled = (n * toServings / fromServings)
  const rounded = Math.round(scaled*100)/100
  return `${rounded}${m[2]}`
}

const SUBSTITUTIONS = {
  'milk':['soy milk','almond milk'],
  'egg':['flax egg','banana (mashed)'],
  'butter':['olive oil','coconut oil'],
  'chicken':['tofu','chickpeas']
}

export default function RecipeDetail({recipe, favorites, setFavorites, detectedIngredients=[]}){
  const [servings, setServings] = useState(recipe.servings)
  const [ratings, setRatings] = useState(()=> JSON.parse(localStorage.getItem('ratings')||'{}'))
  const [showGuided, setShowGuided] = useState(false)
  const [subOpen, setSubOpen] = useState(false)
  const [subFor, setSubFor] = useState('')
  const [subSuggestions, setSubSuggestions] = useState([])
  const [localRecipe, setLocalRecipe] = useState(() => ({...recipe}))
  const toast = useToast()

  useEffect(()=>{localStorage.setItem('ratings', JSON.stringify(ratings))},[ratings])

  useEffect(()=>{
    // keep a local editable copy for substitutions
    setLocalRecipe({...recipe})
    setServings(recipe.servings)
  },[recipe])

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

  function openSub(ing){
    const s = substituteFor(ing.name)
    setSubSuggestions(s)
    setSubFor(ing.name)
    setSubOpen(true)
  }

  function applySubstitute(choice){
    if(!choice) return
    const next = {...localRecipe}
    next.ingredients = next.ingredients.map(i=> i.name===subFor ? {...i, name: choice} : i)
    setLocalRecipe(next)
    // also update recipe reference so UI shows new name
  }

  function exportJSON(){
    const blob = new Blob([JSON.stringify(localRecipe, null, 2)], {type:'application/json'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${localRecipe.id || 'recipe'}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  function saveAsCustom(){
    const customs = JSON.parse(localStorage.getItem('customRecipes')||'[]')
    customs.push(localRecipe)
    localStorage.setItem('customRecipes', JSON.stringify(customs))
    // fire event for ManageRecipes to pick up
    window.dispatchEvent(new Event('customRecipesUpdated'))
    toast.show('Saved as a custom recipe', {kind:'success'})
  }

  return (
  <motion.article aria-labelledby={`rec-${recipe.id}`} initial={{opacity:0,x:8}} animate={{opacity:1,x:0}} exit={{opacity:0,x:6}}>
  <h2 id={`rec-${recipe.id}`}>{recipe.title} <button className="btn btn-ghost" onClick={toggleFav} aria-pressed={favorites.find(f=>f.id===recipe.id)?'true':'false'}>{favorites.find(f=>f.id===recipe.id)?'★':'☆'}</button></h2>
      <div><small>{recipe.cuisine} • {recipe.time} mins • {recipe.difficulty}</small></div>
      <div style={{marginTop:8}}>
        <label htmlFor="servings-input">Servings: </label>
        <input id="servings-input" type="number" min="1" value={servings} onChange={e=>setServings(Math.max(1,parseInt(e.target.value||1)))} />
      </div>
      <div style={{display:'flex',gap:16,alignItems:'center',marginTop:8}}>
        <div>
          <strong>Rate this recipe</strong>
          <div>
            {[1,2,3,4,5].map(n=> <button key={n} className="btn btn-ghost" onClick={()=>setRating(n)} style={{color: (ratings[recipe.id]||0) >= n ? '#f59e0b' : '#999'}} aria-pressed={(ratings[recipe.id]||0) >= n}>{'★'}</button>)}
          </div>
        </div>
        <div>
          <strong>Nutrition (per adjusted serving)</strong>
          <div>Calories: {Math.round((recipe.nutrition?.calories||0) * servings / recipe.servings)} kcal</div>
          <div>Protein: {Math.round((recipe.nutrition?.protein||0) * servings / recipe.servings)} g</div>
        </div>
      </div>

      <h3>Ingredients</h3>
      <ul>
        {localRecipe.ingredients.map(ing=> (
          <li key={ing.name+ing.qty}>
            {scaleQty(ing.qty, recipe.servings, servings)} {ing.name}
            <div style={{fontSize:'0.9em',color:'#666',display:'flex',alignItems:'center',gap:8}}>
              <span>Substitutes: {substituteFor(ing.name).join(', ') || '—'}</span>
              <button className="btn btn-ghost" onClick={()=>openSub(ing)}>Substitute</button>
            </div>
          </li>
        ))}
      </ul>

      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <h3>Steps</h3>
  <div><button className="btn btn-primary" onClick={()=>setShowGuided(true)}>Start guided cook</button></div>
      </div>
        <div style={{marginTop:12,display:'flex',gap:8}}>
        <button className="btn btn-ghost" onClick={exportJSON}>Export JSON</button>
        <button className="btn btn-primary" onClick={saveAsCustom}>Save as custom</button>
      </div>
      <ol className="steps-list">{recipe.steps.map((s,i)=>{
        const lower = s.toLowerCase()
        const uses = detectedIngredients.filter(d=> lower.includes(d.toLowerCase())).slice(0,3)
        return (<li key={i}><div className="step-index">{i+1}</div><div className="step-text">{s}{uses.length>0 && <div className="step-uses">Uses: {uses.join(', ')}</div>}</div></li>)
      })}</ol>
    {showGuided && <GuidedCook recipe={recipe} onClose={()=>setShowGuided(false)} />}
    {subOpen && <SubstituteModal open={subOpen} onClose={()=>setSubOpen(false)} ingredient={subFor} suggestions={subSuggestions} onApply={applySubstitute} />}
    </motion.article>
  )
}

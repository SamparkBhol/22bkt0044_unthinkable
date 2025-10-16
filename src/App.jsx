import React, { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { GiCookingPot } from 'react-icons/gi'
import recipesData from './data/recipes.json'
import AddRecipeForm from './components/AddRecipeForm'
import IngredientInput from './components/IngredientInput'
import RecipeList from './components/RecipeList'
import RecipeDetail from './components/RecipeDetail'
import ImageRecognizer from './components/ImageRecognizer'
import PantryGame from './components/PantryGame'
import ManageRecipes from './components/ManageRecipes'
import Suggestions from './components/Suggestions'
import UseItUp from './components/UseItUp'
import Extras from './components/Extras'
import { ToastProvider } from './components/Toast'
const HeroLottie = React.lazy(()=>import('./components/HeroLottie'))

export default function App() {
  const [ingredients, setIngredients] = useState([])
  const [filters, setFilters] = useState({ diet: 'any', difficulty: 'any', maxTime: 120, cuisine: 'any', minRating: 0 })
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('favorites') || '[]') } catch { return [] }
  })
  const [recipes, setRecipes] = useState(() => {
    try{
      const custom = JSON.parse(localStorage.getItem('customRecipes')||'[]')
      return [...recipesData, ...custom]
    }catch(e){return recipesData}
  })

  const [tab, setTab] = useState('browse')
  const contentRef = React.useRef(null)

  useEffect(() => { localStorage.setItem('favorites', JSON.stringify(favorites)) }, [favorites])

  function clearIngredients() { setIngredients([]) }
  function clearFavorites() { setFavorites([]) }

  function addCustomRecipe(r){
    const next = [...recipes, r]
    setRecipes(next)
    // persist only the custom ones (filter out originals by id)
    const custom = next.filter(x=>!recipesData.find(y=>y.id===x.id))
    localStorage.setItem('customRecipes', JSON.stringify(custom))
  }

  // listen for external imports (file paste via ManageRecipes when App didn't provide onImport)
  useEffect(()=>{
    function onCustom(e){
      try{
        const merged = [...recipes, ...(e.detail||[])]
        setRecipes(merged)
      }catch(e){/* ignore */}
    }
    window.addEventListener('customRecipesUpdated', onCustom)
    return ()=> window.removeEventListener('customRecipesUpdated', onCustom)
  },[recipes])

  return (
  <ToastProvider>
  <div className="app">
      <header className="app-header">
        <div className="brand"><div className="logo"><GiCookingPot size={20} /></div><h1>Smart Recipe</h1></div>
      </header>
      {/* tabs removed — Extras will live in the right column */}

      <div className="hero">
        <motion.div className="left" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.45}}>
          <h2>Find recipes from what's in your kitchen</h2>
          <p className="small">Snap or type ingredients and we'll suggest recipes, substitutions, and step-by-step cooking guidance.</p>
          <button className="cta" onClick={()=>{ setTab('browse'); setTimeout(()=>{ contentRef.current?.scrollIntoView({behavior:'smooth', block:'start'}) }, 50) }}>Get started</button>
        </motion.div>
        <motion.div className="right" initial={{opacity:0,scale:0.98}} animate={{opacity:1,scale:1}} transition={{duration:0.45}}>
          <div className="hero-preview">
            <Suspense fallback={<div style={{fontSize:40}}>🍳</div>}>
              <HeroLottie />
            </Suspense>
          </div>
        </motion.div>
      </div>
      <main className="app-grid">
        <aside className="sidebar">
          <IngredientInput ingredients={ingredients} setIngredients={setIngredients} />
          <ImageRecognizer addIngredient={(i) => setIngredients(prev => Array.from(new Set([...prev, i])))} />

          <div className="controls">
            <button onClick={clearIngredients}>Clear ingredients</button>
            <button onClick={clearFavorites} className="ml">Clear favorites</button>
          </div>

          <div className="filters">
            <label>Dietary:
              <select value={filters.diet} onChange={e => setFilters({ ...filters, diet: e.target.value })}>
                <option value="any">Any</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="gluten-free">Gluten-free</option>
              </select>
            </label>
            <label>Difficulty:
              <select value={filters.difficulty} onChange={e => setFilters({ ...filters, difficulty: e.target.value })}>
                <option value="any">Any</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </label>
            <label>Max time (mins):
              <input type="number" value={filters.maxTime} onChange={e => setFilters({ ...filters, maxTime: parseInt(e.target.value || '0') })} />
            </label>
            <label>Cuisine:
              <select value={filters.cuisine} onChange={e => setFilters({ ...filters, cuisine: e.target.value })}>
                <option value="any">Any</option>
                <option value="Italian">Italian</option>
                <option value="Chinese">Chinese</option>
                <option value="Indian">Indian</option>
                <option value="Mexican">Mexican</option>
                <option value="American">American</option>
              </select>
            </label>
            <label>Min rating:
              <select value={filters.minRating} onChange={e=>setFilters({...filters,minRating:parseInt(e.target.value||0)})}>
                <option value={0}>Any</option>
                <option value={3}>3+</option>
                <option value={4}>4+</option>
                <option value={5}>5</option>
              </select>
            </label>
          </div>

          <div className="favorites">
            <h3>Favorites</h3>
            <ul>
              {favorites.map(f => (
                <li key={f.id}><button className="fav-link" onClick={()=>{
                  const r = recipes.find(r=>r.id===f.id)
                  if(r) setSelectedRecipe(r)
                }}>{f.title}</button></li>
              ))}
            </ul>
          </div>

          <div style={{marginTop:12}}>
            <h3>Add a custom recipe</h3>
            <AddRecipeForm onAdd={addCustomRecipe} />
          </div>
        </aside>

        <section className="content">
          <RecipeList
            recipes={recipes}
            ingredients={ingredients}
            filters={filters}
            onSelect={setSelectedRecipe}
            favorites={favorites}
            setFavorites={setFavorites}
          />
        </section>

        <section className="detail">
          {selectedRecipe ? (
            <RecipeDetail recipe={selectedRecipe} favorites={favorites} setFavorites={setFavorites} detectedIngredients={ingredients} />
          ) : (
            <div className="placeholder">Select a recipe to see details</div>
          )}
        </section>
        <aside className="rightside">
          <Suggestions recipes={recipes} favorites={favorites} ratings={JSON.parse(localStorage.getItem('ratings')||'{}')} detectedIngredients={ingredients} onSelect={setSelectedRecipe} />
          <UseItUp recipes={recipes} ingredients={ingredients} onSelect={setSelectedRecipe} />
          <PantryGame ingredients={ingredients} />
          <div className="extras-card"><Extras setIngredients={setIngredients} /></div>
          <ManageRecipes recipes={recipes} onDeleteCustom={(id)=>{
            const next = recipes.filter(r=>r.id!==id)
            setRecipes(next)
            const custom = next.filter(x=>!recipesData.find(y=>y.id===x.id))
            localStorage.setItem('customRecipes', JSON.stringify(custom))
          }} onImport={(items)=>{
            // merge incoming items into recipes and persist customs
            const next = [...recipes, ...items]
            setRecipes(next)
            const custom = next.filter(x=>!recipesData.find(y=>y.id===x.id))
            localStorage.setItem('customRecipes', JSON.stringify(custom))
          }} />
        </aside>
      </main>
    </div>
    </ToastProvider>
  )
}

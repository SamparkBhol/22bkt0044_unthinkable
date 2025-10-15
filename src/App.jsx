import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GiCookingPot } from 'react-icons/gi'
import recipesData from './data/recipes.json'
import IngredientInput from './components/IngredientInput'
import RecipeList from './components/RecipeList'
import RecipeDetail from './components/RecipeDetail'
import ImageRecognizer from './components/ImageRecognizer'

export default function App() {
  const [ingredients, setIngredients] = useState([])
  const [filters, setFilters] = useState({ diet: 'any', difficulty: 'any', maxTime: 120 })
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('favorites') || '[]') } catch { return [] }
  })

  useEffect(() => { localStorage.setItem('favorites', JSON.stringify(favorites)) }, [favorites])

  function clearIngredients() { setIngredients([]) }
  function clearFavorites() { setFavorites([]) }

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand"><div className="logo"><GiCookingPot size={20} /></div><h1>Smart Recipe</h1></div>
      </header>
      <div className="hero">
        <motion.div className="left" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.45}}>
          <h2>Find recipes from what's in your kitchen</h2>
          <p className="small">Snap or type ingredients and we'll suggest recipes, substitutions, and step-by-step cooking guidance.</p>
          <button className="cta">Get started</button>
        </motion.div>
        <motion.div className="right" initial={{opacity:0,scale:0.98}} animate={{opacity:1,scale:1}} transition={{duration:0.45}}>
          <div className="hero-preview">🍳</div>
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
          </div>

          <div className="favorites">
            <h3>Favorites</h3>
            <ul>{favorites.map(f => <li key={f.id}>{f.title}</li>)}</ul>
          </div>
        </aside>

        <section className="content">
          <RecipeList
            recipes={recipesData}
            ingredients={ingredients}
            filters={filters}
            onSelect={setSelectedRecipe}
            favorites={favorites}
            setFavorites={setFavorites}
          />
        </section>

        <section className="detail">
          {selectedRecipe ? (
            <RecipeDetail recipe={selectedRecipe} favorites={favorites} setFavorites={setFavorites} />
          ) : (
            <div className="placeholder">Select a recipe to see details</div>
          )}
        </section>
      </main>
    </div>
  )
}

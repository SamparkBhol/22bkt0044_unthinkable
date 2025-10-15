import React, {useState} from 'react'

export default function IngredientInput({ingredients,setIngredients}){
  const [text,setText]=useState('')
  function add(){
    const val=text.trim().toLowerCase()
    if(val){setIngredients(prev=>Array.from(new Set([...prev,val])));setText('')}
  }
  return (
    <div>
      <h3>Ingredients</h3>
      <div className="ingredient-list">
        {ingredients.map(i=> <span className="ingredient-pill" key={i}>{i}</span>)}
      </div>
      <input value={text} onChange={e=>setText(e.target.value)} placeholder="e.g., tomato, chicken" />
      <button onClick={add}>Add</button>
    </div>
  )
}

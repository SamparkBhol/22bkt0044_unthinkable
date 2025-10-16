import React, {useState} from 'react'

export default function AddRecipeForm({onAdd}){
  const [title,setTitle]=useState('')
  const [time,setTime]=useState(20)
  const [servings,setServings]=useState(2)
  const [ingredients,setIngredients]=useState('')
  const [steps,setSteps]=useState('')

  function submit(e){
    e.preventDefault()
    if(!title) return
    const id = 'c_' + Date.now()
    const recipe = {id,title,time:parseInt(time||0),servings:parseInt(servings||1),ingredients:ingredients.split(',').map(s=>({name:s.trim(),qty:''})),steps:steps.split('\n').map(s=>s.trim()).filter(Boolean),c:true}
    onAdd(recipe)
    setTitle(''); setTime(20); setServings(2); setIngredients(''); setSteps('')
  }

  return (
    <form onSubmit={submit} className="add-recipe-form">
      <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
      <div style={{display:'flex',gap:8}}>
        <input placeholder="Time (mins)" value={time} onChange={e=>setTime(e.target.value)} />
        <input placeholder="Servings" value={servings} onChange={e=>setServings(e.target.value)} />
      </div>
      <input placeholder="Ingredients (comma separated)" value={ingredients} onChange={e=>setIngredients(e.target.value)} />
      <textarea placeholder="Steps (one per line)" value={steps} onChange={e=>setSteps(e.target.value)} />
      <div style={{display:'flex',justifyContent:'flex-end'}}><button type="submit">Add recipe</button></div>
    </form>
  )
}

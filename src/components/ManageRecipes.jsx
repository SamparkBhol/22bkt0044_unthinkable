import React from 'react'

export default function ManageRecipes({recipes, onDeleteCustom}){
  const custom = recipes.filter(r=>r.id && r.id.startsWith('c_'))
  return (
    <div className="manage-recipes">
      <h4>Manage Recipes</h4>
      <div>Custom recipes: {custom.length}</div>
      <ul>
        {custom.map(r=> (
          <li key={r.id}>{r.title} <button onClick={()=>onDeleteCustom(r.id)}>Delete</button></li>
        ))}
      </ul>
      <div style={{marginTop:8}}>
        <button onClick={()=>{ const data=JSON.stringify(custom); navigator.clipboard.writeText(data)}}>Copy custom JSON</button>
      </div>
    </div>
  )
}

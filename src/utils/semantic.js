import { createMatcher } from './matching'

async function embedText(text){
  try{
    const url = (typeof window !== 'undefined' && window.__EMBED_SERVER_URL__) || 'http://localhost:7777'
    const r = await fetch(url + '/api/embed',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text})})
    if(!r.ok) throw new Error('embed failed')
    const j = await r.json()
    // expects OpenAI style response
    if(j.data && j.data[0] && j.data[0].embedding) return j.data[0].embedding
    return null
  }catch(err){
    console.warn('embedding call failed',err)
    return null
  }
}

export async function createSemanticMatcher(recipes){
  // attempt to fetch embeddings for recipes, otherwise fall back to TF-IDF matcher
  try{
    const promises = recipes.map(r=> embedText(r.ingredients.map(i=>i.name).join(' ')))
    const embeds = await Promise.all(promises)
    if(embeds.every(e=>e && e.length>0)){
      const mats = recipes.map((r,i)=>({id:r.id,embedding:embeds[i]}))
      return function match(queryTokens){
        // naive: embed query and compute cosine with recipe embeddings
        return (async (q)=>{
          const qEmb = await embedText(q.join(' '))
          if(!qEmb) return createMatcher(recipes)(q)
          function cosine(a,b){
            let dot=0, an=0, bn=0
            for(let i=0;i<a.length;i++){dot += a[i]*b[i]; an+=a[i]*a[i]; bn+=b[i]*b[i]}
            return dot/ (Math.sqrt(an)*Math.sqrt(bn)+1e-9)
          }
          const scored = mats.map(m=>({recipe:recipes.find(r=>r.id===m.id),score:cosine(qEmb,m.embedding)}))
          scored.sort((a,b)=>b.score-a.score)
          return scored
        })(queryTokens)
      }
    }
  }catch(err){
    console.warn('semantic matcher failed',err)
  }
  // fallback
  return createMatcher(recipes)
}

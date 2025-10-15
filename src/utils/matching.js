// Simple TF-IDF style matcher for small recipe corpus
function tokenize(text){
  return text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
}

function buildIndex(recipes){
  const df = {}
  const docs = recipes.map(r=>{
    const tokens = r.ingredients.map(i=>i.name).join(' ').toLowerCase()
    const tks = tokenize(tokens)
    const tf = {}
    tks.forEach(t=>tf[t]=(tf[t]||0)+1)
    Object.keys(tf).forEach(t=>df[t]=(df[t]||0)+1)
    return {id:r.id,tf}
  })
  return {docs,df,N:recipes.length}
}

function scoreDoc(queryTokens, doc, df, N){
  // compute simple TF-IDF cosine-like score
  let score=0
  queryTokens.forEach(qt=>{
    const tf = doc.tf[qt]||0
    if(tf>0){
      const idf = Math.log(1+N/(df[qt]||1))
      score += tf * idf
    }
  })
  return score
}

export function createMatcher(recipes){
  const index = buildIndex(recipes)
  const mapById = Object.fromEntries(recipes.map(r=>[r.id,r]))
  return function match(query){
    const qt = tokenize(query.join(' '))
    const scored = index.docs.map(d=>({id:d.id,score:scoreDoc(qt,d,index.df,index.N)}))
    scored.sort((a,b)=>b.score-a.score)
    return scored.map(s=>({recipe:mapById[s.id],score:s.score}))
  }
}

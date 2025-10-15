require('dotenv').config()
const express = require('express')
let fetch = global.fetch
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

const GEMINI_KEY = process.env.GEMINI_API_KEY
const OPENAI_KEY = process.env.OPENAI_API_KEY

app.post('/api/embed', async (req, res) => {
  const {text} = req.body
  if(!text) return res.status(400).json({error:'no text'})
  try{
    if(!fetch){
      // dynamic import for node-fetch in CJS
      const mod = await import('node-fetch')
      fetch = mod.default
    }
    if(GEMINI_KEY){
      // Attempt to call Google/Vertex AI Generative Embeddings (Gemini) endpoint.
      // Note: GEMINI_KEY may be an OAuth Bearer token or an API key depending on setup.
      try{
        // prefer Bearer token in Authorization header
        const geminiUrl = 'https://api.generative.googleapis.com/v1/models/textembedding-gecko-001:embed'
        const headers = {'Content-Type':'application/json'}
        // if GEMINI_KEY looks like an API key (no spaces), send as ?key=...
        let url = geminiUrl
        if(/^[A-Za-z0-9-_=.]+$/.test(GEMINI_KEY)) url = geminiUrl + `?key=${GEMINI_KEY}`
        else headers['Authorization'] = `Bearer ${GEMINI_KEY}`

        const r2 = await fetch(url, {method:'POST', headers, body: JSON.stringify({instances:[{content:text}]})})
        const j2 = await r2.json()
        // normalize common shapes: look for embeddings in j2.predictions or j2.data
        if(j2 && j2.predictions && j2.predictions[0] && j2.predictions[0].embedding) return res.json({data:[{embedding: j2.predictions[0].embedding}]})
        if(j2 && j2.data && j2.data[0] && j2.data[0].embedding) return res.json(j2)
        // some Gemini responses include embeddings under 'instances'[0].embedding
        if(j2 && j2.instances && j2.instances[0] && j2.instances[0].embedding) return res.json({data:[{embedding: j2.instances[0].embedding}]})
        // fallback: return raw response for debugging
        return res.status(502).json({error:'unexpected gemini response', body:j2})
      }catch(err){
        console.error('gemini error',err)
        return res.status(502).json({error:'gemini request failed', message:err.message})
      }
    }
    if(OPENAI_KEY){
      const r = await fetch('https://api.openai.com/v1/embeddings',{
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':`Bearer ${OPENAI_KEY}`},
        body: JSON.stringify({model:'text-embedding-3-small',input:text})
      })
      const j = await r.json()
      return res.json(j)
    }
    return res.status(501).json({error:'no embedding provider configured'})
  }catch(err){
    console.error(err); return res.status(500).json({error:err.message})
  }
})

app.listen(7777, ()=>console.log('Embedding proxy listening on http://localhost:7777'))

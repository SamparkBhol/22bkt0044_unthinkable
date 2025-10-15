import React, {useRef, useState} from 'react'
import * as mobilenet from '@tensorflow-models/mobilenet'
import * as tf from '@tensorflow/tfjs'

export default function ImageRecognizer({addIngredient}){
  const inputRef = useRef()
  const [loading,setLoading] = useState(false)
  const [msg,setMsg] = useState('')
  const [preview,setPreview] = useState(null)
  const [labels,setLabels] = useState([])

  async function handleFile(e){
    const file = e.target.files[0]
    if(!file) return
    setLoading(true); setMsg('Preparing...'); setLabels([])
    try{
      await tf.ready()
      setMsg('Loading model...')
      const model = await mobilenet.load()
      setMsg('Classifying...')
      const img = document.createElement('img')
      img.src = URL.createObjectURL(file)
      setPreview(img.src)
      await new Promise(res=>{img.onload=res})
      const predictions = await model.classify(img)
      setLabels(predictions.slice(0,5).map(p=>p.className))
      // add best few labels as ingredients
      predictions.slice(0,3).forEach(p=>{
        const label = p.className.split(',')[0].toLowerCase()
        addIngredient(label)
      })
      setMsg('Done')
    }catch(err){
      console.error(err); setMsg('Error recognizing image')
    }finally{setLoading(false)}
  }

  return (
    <div>
      <h3>Image Ingredient Recognition</h3>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} aria-label="Upload an image of ingredients" />
      {loading && <div>Processing... {msg}</div>}
      {preview && <img src={preview} alt="preview" style={{maxWidth:200,display:'block',marginTop:8}} />}
      {labels.length>0 && <div style={{fontSize:'0.9em',color:'#333'}}>Detected: {labels.join(', ')}</div>}
      {!loading && msg && <div>{msg}</div>}
    </div>
  )
}

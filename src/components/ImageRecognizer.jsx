import React, {useRef, useState} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
      const detected = predictions.slice(0,5).map(p=>p.className.split(',')[0].toLowerCase())
      setLabels(detected)
      // don't auto-add here; show toast and allow user to add all
      setDetectedLabels(detected)
      setMsg('Done')
    }catch(err){
      console.error(err); setMsg('Error recognizing image')
    }finally{setLoading(false)}
  }

  const [detectedLabels, setDetectedLabels] = useState([])

  function addAll(){
    detectedLabels.forEach(l=>addIngredient(l))
    setDetectedLabels([])
  }

  return (
    <div>
      <h3>Image Ingredient Recognition</h3>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} aria-label="Upload an image of ingredients" />
      {loading && <div>Processing... {msg}</div>}
      {preview && <img src={preview} alt="preview" style={{maxWidth:200,display:'block',marginTop:8}} />}
      <AnimatePresence>
        {detectedLabels.length>0 && (
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:6}} className="scan-toast">
            <div><strong>Scan complete</strong></div>
            <div style={{fontSize:'0.9em',marginTop:6}}>Detected: {detectedLabels.join(', ')}</div>
            <div style={{marginTop:8}}><button className="btn btn-ghost" onClick={addAll}>Add all</button> <button className="btn btn-ghost" onClick={()=>setDetectedLabels([])} style={{marginLeft:8}}>Dismiss</button></div>
          </motion.div>
        )}
      </AnimatePresence>
      {!loading && msg && <div>{msg}</div>}
    </div>
  )
}

import React, {useEffect, useState} from 'react'
import Lottie from 'lottie-react'

export default function HeroLottie({url}){
  const [data,setData] = useState(null)
  useEffect(()=>{
    let mounted=true
    const fetchAnim = async ()=>{
      try{
        const res = await fetch(url || 'https://assets10.lottiefiles.com/packages/lf20_iwmd6pyr.json')
        const j = await res.json()
        if(mounted) setData(j)
      }catch(e){console.warn('lottie load failed',e)}
    }
    fetchAnim()
    return ()=>{mounted=false}
  },[url])

  if(!data) return <div style={{fontSize:48,textAlign:'center'}}>🍳</div>
  return <div className="hero-lottie"><Lottie animationData={data} loop={true} /></div>
}

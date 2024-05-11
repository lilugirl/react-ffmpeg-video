import { useState,useEffect } from 'react'
import {createFFmpeg,fetchFile} from '@ffmpeg/ffmpeg'
import './App.css'

function App() {
  const [loaded, setLoaded] = useState(false)
  const load=async ()=>{
    const ffmpeg=createFFmpeg({log:true})
    if(!ffmpeg.isLoaded()){
       await ffmpeg.load()
       setLoaded(true)
       console.log('loaded')
    } else {
      setLoaded(true)
      console.log(
        'already loaded'
      )
    }
  }

  useEffect(()=>{
     load()
  },[])

  return (
    <>
     {!loaded && <div>加载中...</div>}
     {loaded && <div>已加载</div>}
     <input type="file"  id="image" />
     <input type="file"  id="sound" />
     <button>生成视频</button>
    </>
  )
}

export default App

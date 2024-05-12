import { useState,useEffect,useRef } from 'react'
import {createFFmpeg,fetchFile} from '@ffmpeg/ffmpeg'
import './App.css'

function App() {
  const [videoSrc,setVidoSrc]=useState('')
  // Upload file functionality
  const [loaded, setLoaded] = useState(false)
  const [imageFile,setImageFile]=useState()
  const [soundFile,setSoundFile]=useState()
  const  ffmpegRef=useRef()
  
  const load=async ()=>{
    ffmpegRef.current=createFFmpeg({log:true})
    const ffmpeg=ffmpegRef.current
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


  const handleChangeImage=(e)=>{
    const file=e.target.files[0]
    setImageFile(file)
  }
  const handleChangeSound=(e)=>{
    const  file=e.target.files[0]
    setSoundFile(file)
  }

  const createVideo=async()=>{
     const ffmpeg=ffmpegRef.current
     ffmpeg.FS('writeFile','image.png',await fetchFile(imageFile))
     ffmpeg.FS('writeFile','sound.mp3',await fetchFile(soundFile))
     await ffmpeg.run("-framerate","1/10","-i","image.png","-i","sound.mp3","-c:v","libx264","-t","10","-pix_fmt","yuv420p","-vf","scale=1920:1080","test.mp4")
     const data=ffmpeg.FS('readFile','test.mp4')
     setVidoSrc(URL.createObjectURL(new Blob([data.buffer],{type:'video/mp4'})))
  }

 
  useEffect(()=>{
     load()
  },[])

  console.log({loaded,ffmpegRef,videoSrc,imageFile,soundFile})

  return (
    <>
     {!loaded && <div>加载中...</div>}
     {loaded && <div>已加载</div>}
     <video src={videoSrc} controls ></video> <br/>
     <input type="file"  id="image" accept="image/*" onChange={handleChangeImage} />
     <input type="file"  id="sound" accept="sound/*" onChange={handleChangeSound} />
     <button disabled={!loaded ||  !imageFile ||  !soundFile} onClick={createVideo}>生成视频</button>
    </>
  )
}

export default App

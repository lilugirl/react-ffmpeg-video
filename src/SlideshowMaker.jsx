import {useState,useRef,useEffect} from 'react'
import { createFFmpeg,fetchFile } from '@ffmpeg/ffmpeg'
export const SlideshowMaker=()=>{
    const [images,setImages]=useState([])
    const [sound,setSound]=useState()
    const [videoSrc,setVideoSrc]=useState('')
    const [ffmpegLoaded,setFfmpegLoaded]=useState(false);
    const ffmpegRef=useRef()

    

    const loadFfmpeg=async ()=>{
        ffmpegRef.current=createFFmpeg({log:true})
        if(!ffmpegRef.current.isLoaded()){
            await ffmpegRef.current.load();
            setFfmpegLoaded(true)
        } else {
            setFfmpegLoaded(true)
        }
       
    }

    useEffect(()=>{
      loadFfmpeg()
    },[])

    const handleChangeImage=(e)=>{
        setImages(e.target.files)
    }

    const handleChangeSound=(e)=>{
        setSound(e.target.files[0])
    }

    const convertToVideo=async ()=>{
        const ffmpeg=ffmpegRef.current
        // Ensure ffmpeg is loaded before converting
        if(!ffmpegLoaded){
            await loadFfmpeg()
        }

        // Write each image file
        for(let i=0;i<images.length;i++){
            await ffmpeg.FS('writeFile',`image${i}.png`,await fetchFile(images[i]));
        }

        await ffmpeg.FS('writeFile','sound.mp3',await fetchFile(sound))

        // Concatenate images into a slideshow video
        await ffmpeg.run(
            '-framerate', '1',       // Frame rate (1 image per second)
            '-i', 'image%d.png',    // Input images (numbered)
            '-i', 'sound.mp3',      // Input sound file
            '-c:v', 'libx264',      // Video codec
            '-c:a', 'aac',          // Audio codec
            '-strict', 'experimental',
            '-pix_fmt', 'yuv420p',  // Pixel format
            'slideshow.mp4'         // Output file name
          );

        console.log('ffmpeg',ffmpeg)

        // Read the created video file
        const data=ffmpeg.FS('readFile','slideshow.mp4');
        console.log('data',data)
        setVideoSrc(URL.createObjectURL(new Blob([data.buffer],{type:'video/mp4'})))
    }

    const handleDownload=()=>{
        const link=document.createElement('a');
        link.href=videoSrc;
        link.download='slideshow.mp4';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    console.log({images,videoSrc})
    return <div>
        {ffmpegLoaded && 'loaded'}
        <input multiple id="image" type="file" accept='image/*' onChange={handleChangeImage} />
        <input id="sound" type="file" accept='sound/*' onChange={handleChangeSound} />
        <button onClick={convertToVideo} disabled={!images.length || !sound}>创建视频</button>
        {videoSrc && <button onClick={handleDownload}>下载视频</button>}
        {videoSrc && <video controls src={videoSrc} />}
    </div>
}
import {useEffect,useState} from 'react';
import {proceduralMusic,type MusicTheme} from '../music';
import {voiceEngine} from '../voice';
import BackgroundMusic, {type AudioLoopRegion} from '../utils/BackgroundMusic';
import {scoreGain} from '../utils/music-state';

/** One music bed. A supplied recording replaces the synthesized score. */
export function GameMusic({theme,isPlaying,volume,trackUrl,loopRegion}:{theme:MusicTheme;isPlaying:boolean;volume:number;trackUrl?:string;loopRegion?:AudioLoopRegion}) {
  const [hidden,setHidden]=useState(()=>typeof document!=='undefined'&&document.hidden);
  const [platformMuted,setPlatformMuted]=useState(false);
  const [ducked,setDucked]=useState(false);
  const enabled=isPlaying&&!hidden&&!platformMuted&&volume>0;

  useEffect(()=>{
    const visibility=()=>setHidden(document.hidden);
    const mute=(event:Event)=>{
      const value=(event as CustomEvent<{muted:boolean}>).detail?.muted;
      if(typeof value==='boolean')setPlatformMuted(value);
    };
    document.addEventListener('visibilitychange',visibility);
    window.addEventListener('playground-mute',mute);
    return ()=>{document.removeEventListener('visibilitychange',visibility);window.removeEventListener('playground-mute',mute);};
  },[]);

  useEffect(()=>{
    if(!enabled){setDucked(false);return;}
    let lastVoice=-Infinity;
    const update=()=>{
      const speaking=voiceEngine.isPlaying()&&!voiceEngine.getMuted()&&voiceEngine.getVolume()>0;
      if(speaking)lastVoice=performance.now();
      setDucked(speaking||performance.now()-lastVoice<350);
    };
    update();const timer=window.setInterval(update,80);
    return ()=>window.clearInterval(timer);
  },[enabled]);

  const gain=scoreGain(volume,ducked);
  useEffect(()=>{
    proceduralMusic.setTheme(theme);
    proceduralMusic.setVolume(gain);
    if(enabled&&!trackUrl)proceduralMusic.start();
    else proceduralMusic.stop(!!trackUrl);
  },[theme,gain,enabled,trackUrl]);
  useEffect(()=>()=>proceduralMusic.stop(true),[]);

  return trackUrl?<BackgroundMusic url={trackUrl} loopRegion={loopRegion} isPlaying={enabled} isMuted={!enabled} volume={gain*.32}/>:null;
}

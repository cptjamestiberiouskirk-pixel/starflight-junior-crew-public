/** Accepted fixed-ship clips are restricted to the matching bare configuration. */
export interface BayVideoConfiguration {
  engineClass:number; cargoPods:number; armorClass:number;
  shieldClass:number; laserClass:number; missileClass:number;
}
export function matchesBayVideo(c:BayVideoConfiguration){
  return c.engineClass===1&&c.cargoPods===0&&c.armorClass===0&&
    c.shieldClass===0&&c.laserClass===0&&c.missileClass===0;
}
type Shot='launch'|'dock';
type Entry={video:HTMLVideoElement;failed:boolean;ready:boolean;playing:boolean};
export const bayVideoURLs={
  launch:new URL('../assets/video/undocking.mp4',import.meta.url).href,
  dock:new URL('../assets/video/docking.mp4',import.meta.url).href,
};
/** Two bounded media elements. Game time owns progress, pause, restore and completion. */
export class BayVideoPlayer {
  private entries=new Map<Shot,Entry>();
  private current:Entry|null=null;
  private epoch:unknown;
  constructor(private urls=bayVideoURLs,private makeVideo=()=>document.createElement('video')){}
  private entry(shot:Shot){
    let e=this.entries.get(shot);if(e)return e;
    const video=this.makeVideo();e={video,failed:false,ready:false,playing:false};
    const entry=e;
    video.muted=true;video.defaultMuted=true;video.volume=0;video.playsInline=true;
    video.preload='auto';video.loop=false;
    video.onloadeddata=()=>{
      entry.ready=video.videoWidth===1280&&video.videoHeight===720&&
        Number.isFinite(video.duration)&&video.duration>=4.9&&video.duration<=5.2;
      if(!entry.ready){entry.failed=true;video.pause();}
    };
    video.onerror=()=>{entry.failed=true;entry.ready=false;entry.playing=false;video.pause();};
    video.src=this.urls[shot];this.entries.set(shot,e);return e;
  }
  pause(){for(const e of this.entries.values()){e.video.pause();e.playing=false;}}
  stop(){this.pause();this.current=null;}
  draw(ctx:CanvasRenderingContext2D,width:number,height:number,shot:Shot,
    remaining:number,duration:number,config:BayVideoConfiguration,active:boolean,epoch:unknown){
    if(!matchesBayVideo(config)||!Number.isFinite(remaining)||!Number.isFinite(duration)||duration<=0){this.stop();return false;}
    const e=this.entry(shot),v=e.video;
    if(this.current!==e){this.pause();this.current=e;}
    const restored=this.epoch!==epoch;this.epoch=epoch;
    if(e.failed||!e.ready){v.pause();e.playing=false;return false;}
    // Seeking can temporarily drop readyState; pausing here aborts play() and
    // would incorrectly turn an ordinary clock correction into missing media.
    if(v.seeking||v.readyState<2){if(!active){v.pause();e.playing=false;}return false;}
    // Never inherit an audio state from media defaults, a restore, or a browser control.
    v.muted=true;v.defaultMuted=true;v.volume=0;
    const progress=Math.max(0,Math.min(1,1-remaining/duration));
    const target=Math.min(v.duration-.001,progress*v.duration);
    const rate=v.duration/duration;
    const shouldPlay=active&&progress<1&&rate>=.25&&rate<=4;
    try{
      if(restored||Math.abs(v.currentTime-target)>(shouldPlay?.12:.025))v.currentTime=target;
      if(v.seeking)return false;
      if(shouldPlay){
        v.playbackRate=rate;
        if(!e.playing){e.playing=true;void v.play().catch(error=>{e.playing=false;if(error?.name!=='AbortError'){e.failed=true;e.ready=false;}v.pause();});}
      }else{v.pause();e.playing=false;}
      // Keep the configured live renderer visible until a seek has a decoded frame.
      if(v.seeking)return false;
      const scale=Math.min(width/v.videoWidth,height/v.videoHeight);
      ctx.save();ctx.fillStyle='#050711';ctx.fillRect(0,0,width,height);
      ctx.drawImage(v,(width-v.videoWidth*scale)/2,(height-v.videoHeight*scale)/2,v.videoWidth*scale,v.videoHeight*scale);ctx.restore();
      if(ctx.canvas?.dataset)ctx.canvas.dataset.cinematicSource='accepted-video-'+shot;
      return true;
    }catch{e.failed=true;e.ready=false;v.pause();return false;}
  }
  dispose(){
    this.stop();for(const e of this.entries.values()){
      e.video.onloadeddata=null;e.video.onerror=null;e.video.removeAttribute('src');e.video.load();
    }this.entries.clear();
  }
}

/** A seekable, game-clock-driven Mirelo stem on the existing SFX bus. */
const url=new URL('../assets/audio/docking-bay-mirelo.wav',import.meta.url).href;
export class BayLaunchSound {
  private buffer:AudioBuffer|null=null;
  private loading:Promise<void>|null=null;
  private source:AudioBufferSourceNode|null=null;
  private gain:GainNode;
  private offset=0;private startedAt=0;private rate=1;private wanted=false;
  private lastProgress=0;private lastDuration=8;
  constructor(private ctx:AudioContext,output:AudioNode,private audioURL=url){this.gain=ctx.createGain();this.gain.gain.value=.72;this.gain.connect(output);}
  prepare(){
    return this.loading??=(async()=>{
      try{const response=await fetch(this.audioURL);if(!response.ok)throw new Error('Launch SFX HTTP '+response.status);this.buffer=await this.ctx.decodeAudioData(await response.arrayBuffer());}
      catch(error){console.warn('[launch audio]',error);}
    })();
  }
  sync(active:boolean,progress:number,duration:number){
    this.wanted=active;this.lastProgress=progress;this.lastDuration=duration;
    if(!active){this.stop();return;}
    if(!this.buffer){void this.prepare().then(()=>{if(this.wanted)this.sync(this.wanted,this.lastProgress,this.lastDuration);});return;}
    if(this.ctx.state!=='running')return;
    const offset=Math.max(0,Math.min(8,progress*8)),rate=8/Math.max(.001,duration);
    if(offset>=this.buffer.duration){this.stop();return;}
    if(this.source&&Math.abs(this.offset+(this.ctx.currentTime-this.startedAt)*this.rate-offset)<.15&&rate===this.rate)return;
    this.stop();const source=this.ctx.createBufferSource();source.buffer=this.buffer;source.playbackRate.value=rate;source.connect(this.gain);
    this.source=source;this.offset=offset;this.startedAt=this.ctx.currentTime;this.rate=rate;
    source.onended=()=>{source.disconnect();if(this.source===source)this.source=null;};
    source.start(0,offset);
  }
  duck(speaking:boolean){this.gain.gain.setTargetAtTime(speaking?.35:.72,this.ctx.currentTime,.04);}
  stop(){if(this.source){const source=this.source;this.source=null;try{source.stop();}catch{}source.disconnect();}}
}

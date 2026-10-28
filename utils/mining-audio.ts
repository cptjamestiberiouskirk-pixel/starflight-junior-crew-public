import {createSeamlessLoopBuffer,scanAudioBoundaries} from './BackgroundMusic';
const url=new URL('../assets/audio/mining-plasma-mirelo.wav',import.meta.url).href;
const buffers=new WeakMap<AudioContext,Promise<{buffer:AudioBuffer;loopStartSec:number;loopEndSec:number}|null>>();
export function prepareMiningAudio(ctx:AudioContext){let job=buffers.get(ctx);if(!job){job=(async()=>{try{const response=await fetch(url);if(!response.ok)throw new Error('Mining SFX HTTP '+response.status);const raw=await ctx.decodeAudioData(await response.arrayBuffer());return createSeamlessLoopBuffer(ctx,raw,scanAudioBoundaries(raw),.16);}catch(error){console.warn('[mining audio]',error);return null;}})();buffers.set(ctx,job);}return job;}
/** The original generated industrial-plasma loop uses the existing SFX bus.
 * Asynchronous preparation observes stop/mute, so a delayed load cannot restart it. */
export function createMiningLaserSound(ctx:AudioContext,out:AudioNode){
 const gain=ctx.createGain();gain.gain.value=0;gain.connect(out);let source:AudioBufferSourceNode|null=null,stopped=false;
 void prepareMiningAudio(ctx).then(buffer=>{if(!buffer||stopped)return;source=ctx.createBufferSource();source.buffer=buffer.buffer;source.loop=true;source.loopStart=buffer.loopStartSec;source.loopEnd=buffer.loopEndSec;source.connect(gain);const now=ctx.currentTime;gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.48,now+.12);source.start(now);});
 return{stop(){if(stopped)return;stopped=true;const playing=source;source=null;if(playing){gain.gain.cancelScheduledValues(ctx.currentTime);gain.gain.setTargetAtTime(0,ctx.currentTime,.025);playing.addEventListener('ended',()=>{playing.disconnect();gain.disconnect();},{once:true});playing.stop(ctx.currentTime+.15);}else gain.disconnect();}};
}

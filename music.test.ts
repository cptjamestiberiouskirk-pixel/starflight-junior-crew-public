import assert from 'node:assert/strict';
import {recordedScoreForTheme} from './utils/soundtrack';
import {ProceduralMusicEngine} from './music';
import {selectMusicTheme,scoreGain} from './utils/music-state';
import {scanAudioBoundaries,createSeamlessLoopBuffer,resolveLoopBoundaries} from './utils/BackgroundMusic';

class Param {
  value=0;events:{kind:string;value:number;at:number}[]=[];
  setValueAtTime(value:number,at:number){this.value=value;this.events.push({kind:'value',value,at});}
  setTargetAtTime(value:number,at:number){this.value=value;this.events.push({kind:'target',value,at});}
  linearRampToValueAtTime(value:number,at:number){this.value=value;this.events.push({kind:'ramp',value,at});}
  exponentialRampToValueAtTime(value:number,at:number){this.value=value;this.events.push({kind:'exponential',value,at});}
  cancelScheduledValues(_at:number){}
}
class Node {
  gain=new Param();frequency=new Param();type='';buffer:any;onended:(()=>void)|null=null;
  connections:unknown[]=[];starts:number[]=[];stops:number[]=[];
  connect(node:unknown){this.connections.push(node);}
  disconnect(){this.connections=[];}
  start(time=0){this.starts.push(time);}
  stop(time=0){this.stops.push(time);}
}
class Buffer {
  data:Float32Array[];duration:number;
  constructor(public numberOfChannels:number,public length:number,public sampleRate:number){this.data=Array.from({length:numberOfChannels},()=>new Float32Array(length));this.duration=length/sampleRate;}
  getChannelData(channel:number){return this.data[channel];}
}
class Context {
  currentTime=0;sampleRate=16000;state='running';destination={};gains:Node[]=[];sources:Node[]=[];filters:Node[]=[];
  createGain(){const node=new Node();this.gains.push(node);return node;}
  createOscillator(){const node=new Node();this.sources.push(node);return node;}
  createBufferSource(){return this.createOscillator();}
  createBiquadFilter(){const node=new Node();this.filters.push(node);return node;}
  createBuffer(channels:number,length:number,rate:number){return new Buffer(channels,length,rate);}
  async suspend(){this.state='suspended';}
  async resume(){this.state='running';}
}

export async function runMusicTests() {
  let passed=0;const check=(condition:boolean,label:string)=>{assert(condition,label);passed++;};
  for(const [location,expected] of [['Starport','starport'],['Docking Bay','starport'],['Hyperspace','space'],['Star System','space'],['In Orbit','space'],['Landing','surface'],['On Planet','surface'],['Terrain Vehicle','surface']] as const)check(selectMusicTheme({location})===expected,`${location} selects the appropriate score`);
  check(selectMusicTheme({location:'Encounter'})==='space'&&selectMusicTheme({location:'Encounter',inCombat:true})==='combat','Peaceful alien talk does not trigger combat music');
  check(selectMusicTheme({location:'In Orbit',victory:true})==='starport'&&selectMusicTheme({location:'In Orbit',defeat:true})==='solemn','Victory is optimistic; defeat uses the memorial theme');
  check(selectMusicTheme({location:'Encounter',inCombat:true,defeat:true,title:true})==='starport','Returning to title selects the accepted title score regardless of the previous scene');
  check(scoreGain(.5,false)===.5&&scoreGain(.5,true)===.14,'Audible dialogue lowers the music by about eleven decibels');
  check(scoreGain(-1,false)===0&&scoreGain(2,false)===1&&scoreGain(NaN,false)===0,'Invalid score volume cannot reach the audio graph');
  check(recordedScoreForTheme('space')?.url.includes('neon-starfield-voyage')===true && !!recordedScoreForTheme('surface'),'Exploration and surface select the local Sonilo score');
  check(recordedScoreForTheme('starport')?.url===recordedScoreForTheme('space')?.url,'Title and ordinary port select the accepted local recording');
  check(['combat','solemn'].every(theme=>!recordedScoreForTheme(theme as any))&&!recordedScoreForTheme('starport',{victory:true}),'Combat, victory and memorial retain their dedicated cues');
  const previous=globalThis.window;
  let timerId=0;const timers=new Map<number,{callback:()=>void;delay:number}>(),contexts:Context[]=[];
  const mockWindow:any={AudioContext:class extends Context{constructor(){super();contexts.push(this);}},addEventListener(){},setTimeout(callback:()=>void,delay:number){const id=++timerId;timers.set(id,{callback,delay});return id;},clearTimeout(id:number){timers.delete(id);}};
  globalThis.window=mockWindow;
  try {
    const engine=new ProceduralMusicEngine();engine.setVolume(.4);engine.start();
    const ctx=contexts[0],master=ctx.gains[0];
    check(contexts.length===1&&ctx.sources.length>0&&master.gain.value===.4,'Starting the score creates one graph at the selected volume');
    const before=ctx.sources.length;engine.start();check(contexts.length===1&&ctx.sources.length===before,'Repeated start calls do not duplicate the score');
    engine.stop();check(master.gain.value===0,'Pause silences sustained notes through the master gain');
    engine.setVolume(.8);check(master.gain.value===0,'Changing volume while paused cannot resurrect note tails');
    const pause=[...timers.entries()].find(([,t])=>t.delay===100)!;timers.delete(pause[0]);pause[1].callback();await Promise.resolve();
    check(ctx.state==='suspended','The paused score suspends its audio clock after fading');
    engine.start();check(ctx.state==='running'&&master.gain.value===.8,'Resume restores the current volume and resumes the same context');
    engine.stop();engine.start();check(![...timers.values()].some(t=>t.delay===100),'A quick resume cancels the pending context suspension');
    const old=ctx.sources.slice();engine.setTheme('space');
    check(old.every(s=>s.stops.at(-1)!<=ctx.currentTime+.04),'Theme changes release old-theme voices instead of mixing their long tails');
    for(const source of old)source.onended?.();
    check(old.every(s=>s.connections.length===0),'Finished oscillators and their effect nodes are disconnected');
    ctx.currentTime=10;
    const schedule=[...timers.entries()].find(([,t])=>t.delay===25)!;timers.delete(schedule[0]);
    const count=ctx.sources.length;schedule[1].callback();
    const newSources=ctx.sources.slice(count);
    check(newSources.length>0&&newSources.length<8&&newSources.every(s=>s.starts.every(t=>t>=10&&t<10.2)),'A delayed scheduler does not burst a backlog of expired notes');
    engine.setMuted(true);check(master.gain.value===0,'Platform mute closes the music gain');
    engine.setMuted(false);check(master.gain.value===.8,'Unmuting restores the selected level');
    engine.stop(true);check(master.gain.value===0,'Changing to a recording releases the procedural bed');
    const fallback=new ProceduralMusicEngine();mockWindow.AudioContext=undefined;fallback.start();
    const previousCount=contexts.length;
    mockWindow.AudioContext=class extends Context{constructor(){super();contexts.push(this);}};fallback.start();
    check(contexts.length===previousCount+1&&contexts.at(-1)!.sources.length>0,'A context unavailable on the first attempt can be retried');fallback.stop(true);
    const raw=ctx.createBuffer(2,20000,16000);
    for(let channel=0;channel<2;channel++)for(let i=1000;i<19000;i++)raw.data[channel][i]=.4*Math.sin(2*Math.PI*200*(i-1000)/16000);
    const authored=resolveLoopBoundaries(raw as any,{startSec:.1,endSec:1,crossfadeSec:.1});
    check(authored.startSample===1600&&authored.endSample===16000,'Authored loop region resolves to exact samples');
    const invalid=resolveLoopBoundaries(raw as any,{startSec:2,endSec:1,crossfadeSec:.1});
    check(invalid.endSample>invalid.startSample,'Invalid loop region safely uses detected boundaries');
    const bounds=scanAudioBoundaries(raw as any);
    check(bounds.startSample>650&&bounds.startSample<1001&&bounds.endSample>18900&&bounds.endSample<19300,'Boundary scanning removes long silence while retaining its zero-crossing safety margin');
    const loop=createSeamlessLoopBuffer(ctx as any,raw as any,bounds,.2);
    check(loop.loopStartSec>0&&loop.loopEndSec===loop.buffer.duration&&loop.buffer.numberOfChannels===2,'The synthesized loop retains stereo and the sample-accurate return point');
    const data=loop.buffer.getChannelData(0),returnSample=Math.round(loop.loopStartSec*16000);
    check(Math.abs(data.at(-1)!-data[returnSample])<.04,'The loop turnaround stays within a normal adjacent-sample change');
    const loud=ctx.createBuffer(1,16000,16000);loud.data[0].fill(.95);
    const loudLoop=createSeamlessLoopBuffer(ctx as any,loud as any,{startSample:0,endSample:16000},.2);
    const peak=Math.max(...loudLoop.buffer.getChannelData(0));
    check(peak>1.3&&peak*.32<1,'Float headroom preserves an equal-power seam without hard-clipping a quiet final mix');
  }finally{if(previous===undefined)delete (globalThis as any).window;else globalThis.window=previous;}
  return {passed,failed:0,results:[] as string[]};
}

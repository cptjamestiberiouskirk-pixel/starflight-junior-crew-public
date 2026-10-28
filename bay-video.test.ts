import {BayVideoPlayer,matchesBayVideo} from './utils/bay-video';
export async function runBayVideoTests(){
 const results:string[]=[];let passed=0,failed=0;
 const test=async(name:string,fn:()=>unknown)=>{try{await fn();passed++;results.push('PASS '+name);}catch(e){failed++;results.push('FAIL '+name+': '+e);}};
 const assert=(ok:unknown,message='assertion failed')=>{if(!ok)throw new Error(message);};
 const bare={engineClass:1,cargoPods:0,armorClass:0,shieldClass:0,laserClass:0,missileClass:0};
 await test('only one matching bare configuration across all equipment combinations',()=>{
  let matches=0,total=0;for(let engineClass=0;engineClass<=5;engineClass++)for(let cargoPods=0;cargoPods<=16;cargoPods++)for(let armorClass=0;armorClass<=5;armorClass++)for(let shieldClass=0;shieldClass<=5;shieldClass++)for(let laserClass=0;laserClass<=5;laserClass++)for(let missileClass=0;missileClass<=5;missileClass++){
   const c={engineClass,cargoPods,armorClass,shieldClass,laserClass,missileClass};matches+=Number(matchesBayVideo(c));total++;
  }assert(matches===1&&total===132192);
 });
 await test('malformed, missing, fractional or unknown classes fail closed',()=>{
  for(const key of Object.keys(bare))for(const value of [undefined,null,NaN,Infinity,-1,.1,'0','1',6,99])assert(!matchesBayVideo({...bare,[key]:value} as any));
 });
 function setup(){
  const videos:any[]=[];const draws:any[]=[];
  const make=()=>{const v:any={videoWidth:1280,videoHeight:720,duration:5.041667,readyState:4,seeking:false,currentTime:0,playbackRate:1,plays:0,pauses:0,muted:false,defaultMuted:false,volume:1,play(){this.plays++;return Promise.resolve();},pause(){this.pauses++;},removeAttribute(){this.removed=true;},load(){this.released=true;}};videos.push(v);return v;};
  const player=new BayVideoPlayer({launch:'undocking.mp4',dock:'docking.mp4'},make);
  const ctx:any={canvas:{dataset:{}},save(){},restore(){},fillRect(){},drawImage(...args:any[]){draws.push(args);}};
  const draw=(shot:'launch'|'dock'='launch',remaining=3,duration=3,config=bare,active=true,epoch=1)=>player.draw(ctx,800,600,shot,remaining,duration,config,active,epoch);
  return{player,videos,draws,ctx,draw};
 }
 await test('loading falls back without starting playback or delaying game time',()=>{const h=setup();assert(!h.draw());assert(h.videos.length===1&&h.videos[0].plays===0);});
 await test('ready clip is silent, fits without cropping and follows game duration',()=>{
  const h=setup();h.draw();h.videos[0].onloadeddata();assert(h.draw());const v=h.videos[0];assert(v.muted&&v.defaultMuted&&v.volume===0&&v.playsInline&&!v.loop);assert(v.plays===1&&Math.abs(v.playbackRate-5.041667/3)<1e-8);assert(h.draws[0][1]===0&&h.draws[0][2]===75&&h.draws[0][3]===800&&h.draws[0][4]===450);
 });
 await test('pause and hidden-state sync freeze and resume at saved game progress',()=>{
  const h=setup();h.draw();h.videos[0].onloadeddata();h.draw('launch',1.5,3,bare,false);const v=h.videos[0];assert(v.plays===0&&Math.abs(v.currentTime-v.duration*.5)<1e-7);h.draw('launch',1.5);assert(v.plays===1);h.player.pause();assert(v.pauses>0);
 });
 await test('restore epoch reseeks even with a small clock difference',()=>{const h=setup();h.draw();h.videos[0].onloadeddata();h.draw('launch',1.5);h.videos[0].currentTime+=.01;h.draw('launch',1.5,3,bare,false,2);assert(h.videos[0].currentTime===h.videos[0].duration*.5);});
 await test('equipping any visible module stops playback and selects live fallback',()=>{const h=setup();h.draw();h.videos[0].onloadeddata();h.draw();assert(!h.draw('launch',1,3,{...bare,armorClass:1}));assert(h.videos.length===1&&h.videos[0].pauses>0);});
 await test('switching shots pauses old media and creates at most two elements',()=>{const h=setup();h.draw();h.videos[0].onloadeddata();h.draw();h.draw('dock');h.videos[1].onloadeddata();h.draw('dock');h.draw('launch');assert(h.videos.length===2&&h.videos[0].pauses>0&&h.videos[1].pauses>0);});
 await test('missing or unexpected media fails closed',()=>{for(const change of [{videoWidth:640},{videoHeight:1080},{duration:60},{duration:NaN}]){const h=setup();h.draw();Object.assign(h.videos[0],change);h.videos[0].onloadeddata();assert(!h.draw());}const h=setup();h.draw();h.videos[0].onerror();assert(!h.draw());});
 await test('rejected playback remains a live fallback',async()=>{const h=setup();h.draw();h.videos[0].onloadeddata();h.videos[0].play=()=>Promise.reject(new Error('autoplay rejected'));h.draw();await Promise.resolve();assert(!h.draw());});
 await test('seek in progress never paints a stale decoded frame',()=>{const h=setup();h.draw();h.videos[0].onloadeddata();h.videos[0].seeking=true;assert(!h.draw());assert(h.draws.length===0);});
 await test('temporary seeking readiness drop does not abort active media or disable later playback',()=>{const h=setup();h.draw();h.videos[0].onloadeddata();h.draw();const v=h.videos[0],pauses=v.pauses;v.seeking=true;v.readyState=1;assert(!h.draw());assert(v.pauses===pauses);v.seeking=false;v.readyState=4;assert(h.draw());});
 await test('ordinary pause AbortError is recoverable on resume',async()=>{const h=setup();h.draw();h.videos[0].onloadeddata();const v=h.videos[0];v.play=()=>Promise.reject(Object.assign(new Error('paused'),{name:'AbortError'}));h.draw();h.player.pause();await Promise.resolve();v.play=()=>Promise.resolve();assert(h.draw());});
 await test('invalid timeline stops media; completed timeline never loops',()=>{const h=setup();h.draw();h.videos[0].onloadeddata();assert(!h.draw('launch',NaN));assert(!h.draw('launch',1,0));h.draw('launch',0);assert(h.videos[0].plays===0&&h.videos[0].currentTime<h.videos[0].duration);});
 await test('skip/unmount releases source handlers and bounded media elements',()=>{const h=setup();h.draw();h.videos[0].onloadeddata();h.draw();h.player.stop();assert(h.videos[0].pauses>0);h.player.dispose();assert(h.videos[0].removed&&h.videos[0].released&&!h.videos[0].onloadeddata&&!h.videos[0].onerror);});
 return {passed,failed,results};
}

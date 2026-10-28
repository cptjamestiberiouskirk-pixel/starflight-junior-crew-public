import assert from 'node:assert/strict';
import {recordingFollowTarget, RECORDING_RANGE, RECORDING_SECONDS, RECORDING_ENERGY, recordLifeform, emptySurveyKnowledge, type SurfaceRecording} from './utils/wildlife';
import {advanceLifeform} from './utils/surface-rules';
import type {LifeformSpecimen} from './surface';

export function runLifeformRecordingTests() {
  let passed=0;
  const check=(condition:boolean,label:string)=>{assert(condition,label);passed++;};
  const specimen=():LifeformSpecimen=>({id:'crawler',speciesName:'Survey Crawler',size:'Small',volume:1,bountyValue:40,temperament:'fleeing',color:'#fff',x:2.5,y:0,vx:0,vy:0,stunned:false,dead:false,recorded:false,captured:false});
  const recording:SurfaceRecording={lifeformId:'crawler',planetKey:'125-100-0',remaining:3,interruptedFor:0};
  const follow=(target:LifeformSpecimen,patch:Partial<SurfaceRecording>={},fuel=100,manual=false,available=true,key='125-100-0')=>recordingFollowTarget({...recording,...patch},key,[target],0,0,fuel,manual,available);
  check(RECORDING_SECONDS===3&&RECORDING_RANGE===2.5&&RECORDING_ENERGY===200/999,'Original scan time, range and charge remain unchanged');
  check(follow(specimen())?.x===1.3,'Assist accepts the exact original range boundary');
  check(follow({...specimen(),x:2.50001})===null,'Assist cannot acquire a specimen outside recording range');
  check(follow({...specimen(),x:1.2})===null,'Assist holds a standoff rather than driving through a specimen');
  check(follow(specimen(),{},100,true)===null,'Manual input takes priority');
  check(follow(specimen(),{},0)===null,'An empty rover battery cannot auto-drive');
  check(follow(specimen(),{},100,false,false)===null,'Destroyed, boarded or otherwise unavailable rover cannot pursue');
  check(follow(specimen(),{},100,false,true,'other-planet')===null,'A legacy recording cannot drive on the wrong planet');
  check(follow(specimen(),{remaining:0})===null,'Completed recording cannot pursue');
  check(follow(specimen(),{interruptedFor:1})===null,'Wildlife attack interruption also suspends pursuit');
  for(const flag of ['stunned','dead','captured','recorded'] as const)check(follow({...specimen(),[flag]:true})===null,`${flag} specimen cannot trigger pursuit`);
  check(follow({...specimen(),x:NaN})===null,'Invalid coordinates cannot poison rover navigation');
  check(recordingFollowTarget(null,recording.planetKey,[specimen()],0,0,100,false,true)===null,'Cancel removes all pursuit without extra saved state');
  check(recordingFollowTarget(recording,recording.planetKey,[],0,0,100,false,true)===null,'Missing specimen cannot drive the rover');
  for(const dt of [1/30,1/60,1/120]) {
    const lf=specimen();let x=0,y=0,fuel=100-RECORDING_ENERGY,minimum=Infinity,maximum=0;
    for(let elapsed=0;elapsed<RECORDING_SECONDS-1e-8;elapsed+=dt) {
      const target=recordingFollowTarget({...recording,remaining:RECORDING_SECONDS-elapsed},recording.planetKey,[lf],x,y,fuel,false,true);
      if(target){const dx=target.x-x,dy=target.y-y,d=Math.hypot(dx,dy),step=Math.min(d,2.4*dt);x+=dx/d*step;y+=dy/d*step;fuel-=.01*dt;}
      advanceLifeform(lf,x,y,dt,()=>1);
      const range=Math.hypot(lf.x-x,lf.y-y);minimum=Math.min(minimum,range);maximum=Math.max(maximum,range);
    }
    check(maximum<=RECORDING_RANGE+1e-8,`${dt}s steps retain moving specimens inside the original scan radius`);
    check(minimum>1&&x>4,`${dt}s steps use ordinary rover speed and a safe standoff`);
    check(Math.abs(lf.x-(2.5+1.6*3))<1e-8,`${dt}s steps preserve fleeing animal speed and behavior`);
    check(fuel>99.76&&fuel<99.8,`${dt}s steps charge the scan once plus ordinary travel energy`);
  }
  const lf=specimen(),learned=recordLifeform(emptySurveyKnowledge(),lf,recording.planetKey);
  check(learned.earned>0&&recordLifeform(learned.knowledge,lf,recording.planetKey).earned===0,'Original first-record reward and duplicate prevention remain intact');
  check(recordLifeform(emptySurveyKnowledge(),{...lf,dead:true},recording.planetKey).earned===Math.floor(learned.earned/2),'Dead specimen records still have the original half-value reward');
  const restored=JSON.parse(JSON.stringify(recording));
  check(follow(specimen(),restored)?.x===1.3,'Existing recording saves resume without new schema fields or a second charge');
  return {passed,failed:0,results:[]};
}

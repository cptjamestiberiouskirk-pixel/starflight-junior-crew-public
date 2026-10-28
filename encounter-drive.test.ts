import assert from 'node:assert/strict';
import {encounterDriveStep,stoppedEncounterDrive,enginesAvailable} from './utils/encounter-drive';
export function runEncounterDriveTests(){
 let passed=0;const check=(ok:boolean,label:string)=>{assert(ok,label);passed++;};
 for(const mass of [100,110,150,250,400])for(let cls=1;cls<=5;cls++)for(const hp of [1,25,50,100])for(const count of [0,1,2,3,6,20]){
  let state=stoppedEncounterDrive();let speed=0,counter=0;
  const g=Math.max(2,Math.trunc(Math.trunc(cls*500/mass)*hp/100));const maximum=Math.max(2,Math.trunc(6/Math.max(1,count)));
  let identical=true;
  for(let n=0;n<120;n++){
   // Independent Forth integer transition, compared over long command streams.
   if(counter<1){speed=Math.min(speed+1,maximum);counter=Math.trunc(96/g);}else counter--;
   const step=encounterDriveStep(state,cls,mass,hp,count);state=step;
   identical&&=step.cells===speed&&step.counter===counter;
  }
  check(identical,'120 original acceleration transitions for each class/mass/health/fleet sequence');
 }
 let slow=stoppedEncounterDrive(),fast=stoppedEncounterDrive();let slowDistance=0,fastDistance=0;
 for(let n=0;n<30;n++){const a=encounterDriveStep(slow,1,110,100,1),b=encounterDriveStep(fast,5,110,100,1);slow=a;fast=b;slowDistance+=a.cells;fastDistance+=b.cells;}
 check(fastDistance>slowDistance*2,'Better engines accelerate substantially sooner with the same hull and fleet');
 for(const [cls,hp,inop,fuel] of [[0,100,false,1],[5,0,false,1],[5,100,true,1],[5,100,false,0]] as const){check(encounterDriveStep(fast,cls,110,hp,1,inop,fuel).cells===0,'Unavailable engines or fuel cannot maneuver even with held momentum');}
 check(encounterDriveStep(fast,5,110,100,1,false,1,false).cells===1,'A discrete combat keypress remains exactly one cell');
 check(encounterDriveStep(stoppedEncounterDrive(),1,110,100,1).cells===1,'Releasing/restarting resets the repeat ramp');
 for(const [cls,hp,inop,fuel,expected] of [[1,100,false,20,true],[5,1,false,.1,true],[0,100,false,20,false],[5,0,false,20,false],[5,100,true,20,false],[5,100,false,0,false],[NaN,100,false,20,false],[5,NaN,false,20,false],[5,100,false,Infinity,false]] as const)check(enginesAvailable(cls,hp,inop,fuel)===expected,'Propulsion and exhaust share finite, installed, healthy, operative and fueled availability');
 return {passed,failed:0,results:[] as string[]};
}

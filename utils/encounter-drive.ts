export type EncounterDriveState={keyIncrement:number;counter:number};
export const stoppedEncounterDrive=():EncounterDriveState=>({keyIncrement:0,counter:0});
/** Shared availability for flight commands and their visible engine exhaust. */
export function enginesAvailable(engineClass:number,health:number,inoperative:boolean,fuel:number){
 return Number.isFinite(engineClass)&&Math.floor(engineClass)>0&&Number.isFinite(health)&&health>0&&!inoperative&&Number.isFinite(fuel)&&fuel>0;
}

/** SHIPGRPH (.ACC), HYPER !S/A, #VES-SPEED and ACCELERATE. Counter units
 * are repeated maneuver commands; Junior schedules these on its existing
 * player passes rather than tying acceleration to monitor/OS key-repeat rate.
 * COMBAT WF208 still moves one cell for a discrete press and WEA63 rejects
 * absent/inoperative engines. No save schema or encounter turn clock changes. */
export function encounterDriveStep(previous:EncounterDriveState,engineClass:number,mass:number,health:number,vessels:number,inoperative=false,fuel=1,repeated=true){
 const cls=Number.isFinite(engineClass)?Math.max(0,Math.min(5,Math.floor(engineClass))):0;
 const hp=Number.isFinite(health)?Math.max(0,Math.min(100,Math.floor(health))):0;
 const acceleration=Number.isFinite(mass)&&mass>0?Math.floor(cls*500/mass):0;
 const effectiveAcceleration=Math.max(2,Math.floor(acceleration*hp/100));
 const cap=Math.max(2,Math.floor(6/Math.max(1,Number.isFinite(vessels)?Math.floor(vessels):1)));
 if(!enginesAvailable(cls,hp,inoperative,fuel)||!Number.isFinite(mass)||mass<=0)return {...stoppedEncounterDrive(),cells:0,acceleration,effectiveAcceleration,cap};
 let keyIncrement=Number.isFinite(previous.keyIncrement)?Math.max(0,Math.min(cap,Math.floor(previous.keyIncrement))):0;
 let counter=Number.isFinite(previous.counter)?Math.max(0,Math.floor(previous.counter)):0;
 if(!repeated){keyIncrement=1;counter=Math.floor(96/effectiveAcceleration);}
 else if(counter<1){keyIncrement=Math.min(cap,keyIncrement+1);counter=Math.floor(96/effectiveAcceleration);}
 else counter--;
 return {keyIncrement,counter,cells:keyIncrement,acceleration,effectiveAcceleration,cap};
}

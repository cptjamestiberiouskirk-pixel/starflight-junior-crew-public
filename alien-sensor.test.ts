import assert from 'node:assert/strict';
import {createAlienShip,generateAlienGroups,type AlienGroup,type AlienShip} from './alien';
import {captureAlienScan,alienSensorText,alienAnalysis} from './utils/science-sensors';
import profiles from './src/vesselSensors.json';
import {getVesselSensorProfile} from './utils/vessel-sensors';
import {decodeSaveFromBase64} from './utils/save-codec';
import fixture from './test-fixtures/commissioned-mission.json';
export function runAlienSensorTests(){
 let passed=0;const check=(value:unknown,label:string)=>{assert(value,label);passed++;};
 const group=(ship:AlienShip)=>({id:'qa',race:ship.race,ships:[ship],x:0,y:0,homeX:0,homeY:0,territoryRadius:1,shipsCount:1,spawnedTotal:1,baseMood:0,currentMood:0,posture:'Friendly'} as AlienGroup);
 const scan=(ship:AlienShip,skill=100,sensors=100,roll=.5)=>captureAlienScan(group(ship),0,{x:0,y:0},false,false,{scienceSkill:skill,sensorHealth:sensors},()=>roll)!;
 for(const p of profiles){
  const ship=createAlienShip(p.race as any,p.type as any,'profile-'+p.id);
  const result=scan(ship),text=alienSensorText(result);
  check(getVesselSensorProfile(ship)?.id===p.id,`Exact race/type mapping ${p.id}`);
  check(text.includes(`Mass: ${p.massTons.toLocaleString('en-US')} tons`),`Original mass ${p.id}`);
  check(text.includes(`Bio: ${p.biological?100:0}%`),`Original biology ${p.id}`);
  check(text.includes(`Energy: ${p.powered?100:0}%`),`Original energy ${p.id}`);
  check(p.constituents.length?p.constituents.every(c=>text.includes(c)):text.includes('None detected'),`Constituents or explicit none ${p.id}`);
  ship.hullIntegrity=0;ship.isWreck=true;
  const wreck=alienSensorText(scan(ship));
  check(wreck.includes('Bio: 0%')&&wreck.includes('Energy: 0%')&&wreck.includes(`Mass: ${p.massTons.toLocaleString('en-US')} tons`),`Wreck endpoints ${p.id}`);
 }
 const ship=createAlienShip('Veloxi','Scout','one');ship.shields=0;
 const damaged=scan(ship); // 100 armor / (100 armor + 600 shields) = floor(14.28) = 14; energy floor(14 * .8) = 11.
 check(damaged.bioPercent===14&&damaged.energyPercent===11&&damaged.hullCondition===100,'Shield damage affects scan while intact hull stays 100');
 check(scan(ship,100,100,0).energyPercent===10&&scan(ship,100,100,.999).energyPercent===11,'Original 75 through 85 percent energy jitter bounds');
 ship.hullIntegrity=50;
 const half=scan(ship);check(half.bioPercent===7&&half.energyPercent===5&&half.hullCondition===50,'Combined damage is separate from raw hull condition');
 check(damaged.bioPercent===14&&Object.isFrozen(damaged),'Snapshots are detached and frozen');
 const constituents=half.constituents;ship.loot=[{name:'FAKE CARGO',volume:999,value:999,type:'mineral'}];ship.looted=true;
 check(scan(ship).constituents===constituents&&!alienSensorText(scan(ship)).includes('FAKE CARGO'),'Cargo rolls and looting cannot forge vessel composition');
 const low=scan(ship,0);check(low.bioPercent===null&&alienSensorText(low).includes('science/sensor quality'),'Low skill reports uncertainty, not no life');
 check(alienSensorText(low).includes('225–375 tons')&&alienSensorText(low).includes('0–25%'),'Low skill shows bounded mass and energy intervals');
 const medium=alienSensorText(scan(ship,40));check(medium.includes('270–330 tons')&&medium.includes('Bio: 0–10%')&&medium.includes('Cobalt'),'Skill 40 narrows intervals and resolves constituents');
 check(alienSensorText(scan(ship,75)).includes('Mass: 300 tons'),'Skill 75 resolves exact mass');
 check(alienSensorText(scan(ship,100,39)).includes('science/sensor quality'),'Damaged sensors limit a skilled officer');
 const broken=alienSensorText(scan(ship,100,0));check(!broken.includes('Mass: 300')&&broken.includes('Sensors offline'),'Offline sensors cannot expose values');
 check(alienSensorText(scan(ship,NaN,NaN)).includes('Sensors offline'),'Nonfinite quality fails closed');
 const unknown={...ship,race:'UNKNOWN' as any};check(alienSensorText(scan(unknown)).includes('no vessel data'),'Unknown model remains distinct from poor resolution');
 check(getVesselSensorProfile({...ship,vesselType:'Transport'})?.massTons===700,'Vessel type, not cosmetic name determines canonical identity');
 check(getVesselSensorProfile({...ship,vesselType:'Probe'})===null,'Unsupported race/type cannot silently use a different model');
 const mech=createAlienShip('Mechans','Scout','mech');mech.shields=0;
 check(scan(mech).bioPercent===0&&scan(mech).energyPercent===20,'Robotic vessel has zero bio and independently powered condition');
 const minstrel=scan(createAlienShip('Minstrels','Minstrel','min'));
 check(minstrel.bioPercent===100&&minstrel.energyPercent===0,'Living unpowered Minstrel is not inferred robotic');
 const surrendered=captureAlienScan({...group(ship),hasSurrendered:true},0,{x:0,y:0},true,false,{scienceSkill:100,sensorHealth:100},()=>.5)!;
 check(surrendered.bioPercent===half.bioPercent&&surrendered.energyPercent===half.energyPercent&&!surrendered.weaponsArmed,'Surrender disarms without inventing repairs');
 const nebula=captureAlienScan(group(ship),0,{x:0,y:0},true,true,{scienceSkill:100,sensorHealth:100},()=>.5)!;
 check(nebula.energyPercent===half.energyPercent&&nebula.shieldState.includes('nebula'),'Suppression does not destroy stored shield points');
 check(alienAnalysis(half,{...group(ship),ships:[{...ship,id:'other'}]},0,100).includes('Scan the selected'),'New target cannot reuse telemetry');
 const json=structuredClone(fixture) as any;json.data.location=json.data.snapshot.location='Encounter';json.data.snapshot.activeEncounterGroup=group(ship);json.data.snapshot.combatActive=false;
 const decoded=decodeSaveFromBase64(JSON.stringify(json)) as any;
 check(!!decoded,'Older fleet saves require no new fields');
 const restored=decoded.data.snapshot.activeEncounterGroup.ships[0];
 check(alienSensorText(scan(restored))===alienSensorText(scan(ship)),'Save decoder round trip preserves deterministic source-backed scan (fixed random sample)');
 for(const fleet of generateAlienGroups())for(const vessel of fleet.ships)check(!!getVesselSensorProfile(vessel),'Every generated vessel has an exact telemetry model');
 for(const value of [NaN,Infinity,-1]){const malformed={...ship,hullIntegrity:value};check(scan(malformed).energyPercent===null,'Invalid damage does not fabricate energy');}
 check(getVesselSensorProfile({...ship,race:'__proto__' as any})===null,'Hostile race names cannot access catalog object prototypes');
 return {passed,failed:0,results:[]};
}

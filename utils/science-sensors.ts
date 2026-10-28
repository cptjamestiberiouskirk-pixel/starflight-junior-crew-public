import type {AlienGroup} from '../alien';
import {getVesselSensorProfile,vesselConditionReading} from './vessel-sensors';
export interface ScienceReading {context:string;text:string}
export function scienceContext(location:string,star:string|number,planet:number|null,group:AlienGroup|null,index:number,epoch=0){
 return JSON.stringify(location==='Encounter'?[epoch,location,group?.id,group?.ships[index]?.id]:[epoch,location,star,planet]);
}
export function visibleScienceReading(reading:ScienceReading|null,context:string){return reading?.context===context?reading.text:null;}
export interface AlienScanQuality {scienceSkill:number;sensorHealth:number}
export interface AlienSensorScan {
 readonly groupId:string;readonly shipId:string;readonly race:string;readonly type:string;readonly size:string;readonly hullCondition:number;readonly range:number;
 readonly shields:number;readonly maxShields:number;readonly shieldState:string;readonly weaponsArmed:boolean;readonly constituents:string;
 readonly massTons:number|null;readonly bioPercent:number|null;readonly energyPercent:number|null;
 readonly massReading:string;readonly bioReading:string;readonly energyReading:string;readonly quality:number;
 readonly modelAvailable:boolean;readonly sensorsOnline:boolean;
}
const qualityBound=(n:number)=>Number.isFinite(n)?Math.max(0,Math.min(100,n)):0;
function percentReading(n:number|null,quality:number){
 if(n===null)return 'Unresolved (invalid vessel condition)';
 if(quality>=75||n===0||n===100)return `${n}%`;
 const step=quality>=40?10:25,lower=Math.floor(n/step)*step;
 return `${lower}–${Math.min(100,lower+step)}% (estimated)`;
}
export function captureAlienScan(group:AlienGroup|null,index:number,position:{x:number;y:number},fighting:boolean,inNebula:boolean,
 options:AlienScanQuality={scienceSkill:100,sensorHealth:100},random:()=>number=Math.random):AlienSensorScan|null {
 const ship=group?.ships[index];if(!group||!ship)return null;
 const quality=Math.min(qualityBound(options.scienceSkill),qualityBound(options.sensorHealth));
 const sensorsOnline=qualityBound(options.sensorHealth)>0,profile=getVesselSensorProfile(ship);
 const wreck=!!ship.isWreck||ship.hullIntegrity<=0;
 const condition=profile&&sensorsOnline?vesselConditionReading(ship,profile,random):null;
 const missing='Unresolved (no vessel data)',limited='Unresolved (science/sensor quality)',offline='Unresolved (Sensors offline)';
 let massReading=missing,bioReading=missing,energyReading=missing,constituents=missing;
 let massTons:number|null=null,bioPercent:number|null=null,energyPercent:number|null=null;
 if(profile&&sensorsOnline){
  if(quality>=75){massTons=profile.massTons;massReading=`${massTons.toLocaleString('en-US')} tons`;}
  else{const uncertainty=quality>=40?.1:.25;massReading=`${Math.floor(profile.massTons*(1-uncertainty)).toLocaleString('en-US')}–${Math.ceil(profile.massTons*(1+uncertainty)).toLocaleString('en-US')} tons (estimated)`;}
  bioPercent=quality>=40?condition?.bioPercent??null:null;
  energyPercent=quality>=75?condition?.energyPercent??null:null;
  bioReading=quality>=40?percentReading(condition?.bioPercent??null,quality):limited;
  energyReading=percentReading(condition?.energyPercent??null,quality);
  constituents=quality>=40?(profile.constituents.length?profile.constituents.join(', '):'None detected (no catalogued constituents)'):limited;
 }
 if(!sensorsOnline)massReading=bioReading=energyReading=constituents=offline;
 return Object.freeze({groupId:group.id,shipId:ship.id,race:ship.race,type:wreck?'Wreck':ship.vesselType,size:ship.size,
  hullCondition:Number.isFinite(ship.hullIntegrity)&&Number.isFinite(ship.maxHull)&&ship.maxHull>0?Math.round(Math.max(0,Math.min(100,ship.hullIntegrity/ship.maxHull*100))):0,
  range:Math.hypot(ship.x-position.x,ship.y-position.y),shields:ship.shields,maxShields:ship.maxShields,
  shieldState:inNebula?'suppressed by nebula':ship.shields<=0?'depleted':group.hasSurrendered||wreck?'lowered':'raised',
  weaponsArmed:!wreck&&!group.hasSurrendered&&fighting&&(ship.laserClass>0||ship.missileClass>0||!!ship.hasPlasmaBolts),
  massTons,bioPercent,energyPercent,massReading,bioReading,energyReading,constituents,quality,modelAvailable:!!profile,sensorsOnline,
 });
}
export function alienSensorText(scan:AlienSensorScan|null){
 if(!scan)return 'ALIEN SENSORS: No selected vessel. Select a target first.';
 if(!scan.sensorsOnline)return 'ALIEN SENSORS: Sensors offline. Repair sensors before scanning; Mass, Bio, Energy and Object Constituents are Unresolved (Sensors offline).';
 return `ALIEN SENSOR READING: ${scan.race} ${scan.type} • Range: ${scan.range.toFixed(1)} cells • Mass: ${scan.massReading} • Bio: ${scan.bioReading} • Energy: ${scan.energyReading} (original-style vessel condition) • Hull condition: ${scan.hullCondition}% • Object Constituents: ${scan.constituents}. Resolution: ${scan.quality>=75?'High':scan.quality>=40?'Moderate':'Limited'} (${scan.quality}). Bio follows the original damage-based life-sign model; Energy is not fuel. Reading captured for this vessel; rescan after damage.`;
}
export function alienAnalysis(scan:AlienSensorScan|null,group:AlienGroup|null,index:number,scienceSkill:number){
 const target=group?.ships[index];
 if(!scan||!group||scan.groupId!==group.id||scan.shipId!==target?.id)return 'ALIEN ANALYSIS: Scan the selected alien vessel first.';
 if(!scan.sensorsOnline)return 'ALIEN ANALYSIS: Sensors offline. Repair sensors and scan the selected vessel again.';
 const detail=scienceSkill>=40&&scan.quality>=40&&scan.modelAvailable;
 // Original encounter shielding classes use 200-point bands, with Class 1 below 400.
 const shieldClass=scan.maxShields>0?Math.max(1,Math.floor(scan.maxShields/200)):0;
 return `ALIEN ANALYSIS: Object: ${scan.type==='Wreck'?'Wreck':'Ship'} • Type: ${detail?scan.type:'Unresolved'} • Size: ${detail?scan.size:'Unresolved'} • Shields: ${detail?(shieldClass?'Equivalent of Class '+shieldClass:'None apparent'):'Unresolved'}, ${scan.shieldState} • Weapons Status: ${scan.weaponsArmed?'Armed':'Disarmed'} • Science confidence: ${detail?'High':'Limited'}. Based on the selected vessel’s last sensor reading; rescan for current damage/status.`;
}

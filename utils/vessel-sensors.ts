import type {AlienShip} from '../alien';
import records from '../src/vesselSensors.json';

/** Original vessel records, cfaab977; fixed composition, never the randomized cargo roll. */
export interface VesselSensorProfile {
 readonly id:number;readonly race:string;readonly type:string;readonly massTons:number;
 readonly biological:boolean;readonly powered:boolean;readonly constituents:readonly string[];
}
const profiles:readonly VesselSensorProfile[]=Object.freeze(records.map(record=>Object.freeze({...record,constituents:Object.freeze([...record.constituents])})));
export function getVesselSensorProfile(ship:Pick<AlienShip,'race'|'vesselType'>):VesselSensorProfile|null {
 return profiles.find(profile=>profile.race===ship.race&&profile.type===ship.vesselType)??null;
}

/** SCIENCE WF39C/WF239, as recovered in the original-game port's Encounter.StartScanning.
 * Bio is the original damage-based life-sign proxy, not a simulated headcount.
 * Nebula suppression and surrender do not themselves remove remaining shield points.
 */
export function vesselConditionReading(ship:AlienShip,profile:VesselSensorProfile,random:()=>number=Math.random){
 if(![ship.hullIntegrity,ship.maxHull,ship.shields,ship.maxShields].every(Number.isFinite)
   ||ship.hullIntegrity<0||ship.maxHull<=0||ship.shields<0||ship.maxShields<0)return null;
 if(ship.isWreck||ship.hullIntegrity===0)return {bioPercent:0,energyPercent:0};
 const share=Math.floor(100*(Math.min(ship.maxHull,ship.hullIntegrity)+Math.min(ship.maxShields,ship.shields))/(ship.maxHull+ship.maxShields));
 const bioPercent=profile.biological?share:0;
 let energyPercent=profile.powered?share:0;
 if(bioPercent>0&&share<100){
  const sample=random();if(!Number.isFinite(sample)||sample<0||sample>=1)return null;
  energyPercent=Math.floor(energyPercent*(75+Math.floor(sample*11))/100);
 }
 return {bioPercent,energyPercent};
}

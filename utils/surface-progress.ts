import {CANONICAL_ARTIFACTS,generatePlanetSurface,preparePlanetSurface,type PlanetSurfaceState,type DroppedCargoItem} from '../surface';
import type {StarPlanet} from '../galaxy';

export const specialArtifactIds=new Set(CANONICAL_ARTIFACTS.filter(a=>a.specialEffectDesc).map(a=>a.id));
const canonicalArtifactId=(id:string)=>id.replace(/^art-(?=[a-z])/,'').replaceAll('_','-');

/** Giving the Crystal Orb away reopens its fixed recovery site, not other ruins. */
export function returnArtifactToSite(surfaces:Record<string,PlanetSurfaceState>,artifactId:string,destroyedPlanetKeys:string[]=[]) {
  let count=0;
  for(const [key,surface] of Object.entries(surfaces)) {
    if(destroyedPlanetKeys.includes(key)) continue;
    for(const ruin of surface.ruins) if(ruin.artifactId && canonicalArtifactId(ruin.artifactId)===canonicalArtifactId(artifactId)) {
      ruin.artifactRecovered=false;
      count++;
    }
  }
  return count;
}

function retainDroppedCargo(item:DroppedCargoItem,gameWon:boolean) {
  if((item as DroppedCargoItem & {isVehicleWreck?:boolean}).isVehicleWreck || /terrain vehicle wreck/i.test(item.name)) return true;
  if(item.type!=='artifact') return false;
  const id=canonicalArtifactId(item.artifactRef?.id??'');
  if(id==='black-egg') return !gameWon;
  return specialArtifactIds.has(id);
}

/** DPART-OV discards ordinary surface resources on orbit departure while
 * preserving fixed sites, special dropped artifacts and vehicle wrecks. */
export function refillPlanetSurface(previous:PlanetSurfaceState,starX:number,starY:number,planet:StarPlanet,gameWon=false) {
  const latitude=previous.originLat??0,longitude=previous.originLong??0;
  let fresh=generatePlanetSurface(starX,starY,planet,{lat:latitude,lon:longitude});
  for(const region of previous.generatedRegions??[]) {
    const match=/^(\d{1,2}):(\d{1,2})$/.exec(region);
    if(!match) continue;
    const latBand=Number(match[1]),lonBand=Number(match[2]);
    if(latBand>35 || lonBand>71) continue;
    fresh=preparePlanetSurface(fresh,starX,starY,planet,latBand*5-87.5,lonBand*5-177.5);
  }
  fresh=preparePlanetSurface(fresh,starX,starY,planet,latitude,longitude);
  const fixed=previous.ruins.filter(r=>r.id.startsWith('ruin-canonical-') || r.lat!==undefined || r.isControlNexus);
  const fixedIds=new Set(fixed.map(r=>r.id));
  // DPART refills ordinary resources, but a retained fixed structure may be far
  // from the new generation origin. Keep its new cache beside that structure.
  for(const cache of fresh.minerals){
    if(!cache.id.startsWith('fuel-cache:'))continue;
    const id=cache.id.slice('fuel-cache:'.length),retained=fixed.find(r=>r.id===id),generated=fresh.ruins.find(r=>r.id===id);
    if(retained&&generated){cache.x+=retained.x-generated.x;cache.y+=retained.y-generated.y;}
  }
  fresh.ruins=[...fresh.ruins.filter(r=>!fixedIds.has(r.id)),...structuredClone(fixed)];
  fresh.droppedCargo=structuredClone(previous.droppedCargo.filter(item=>retainDroppedCargo(item,gameWon)));
  if(previous.survey)fresh.survey={...previous.survey,contacts:previous.survey.contacts.filter(c=>(c.kind==='ruin'||c.kind==='installation'||c.kind==='artifact')&&fixedIds.has(c.id.replace(/^artifact:/,'')))};
  fresh.scannedTimer=0;
  return fresh;
}

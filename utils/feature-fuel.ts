import type {PlanetSurfaceState, SurfaceRuin} from '../surface';

/** SEED-OV WF492: generated class41/species2 gets fuel; retained ?EXIST
 * calls WF19B for class41/species4. This maps the existing Junior sites,
 * rather than treating every installation, Empire ruin or artifact as fuel.
 * Fixed species4 worlds verified against pristine GOG instance records. */
export function fuelBearingRuin(ruin:SurfaceRuin,starX:number,starY:number,order:number) {
 if(ruin.id.startsWith('ruin-proc-')&&ruin.name==='Ancient Precursor Obelisk')return true;
 return ruin.id===`ruin-canonical-${starX}-${starY}-${order}`&&[
  [145,107,3],[56,144,0],[132,165,0],[154,62,1],
 ].some(([x,y,p])=>x===starX&&y===starY&&p===order);
}

/** Separate deterministic stream leaves existing minerals, wildlife and lore
 * unchanged. Stable mineral IDs preserve partial depletion across save/revisit.
 * WF189 offsets both coordinates by +/-1 original surface cell. MOVE-OV
 * WE724 maps cells to 10/64 longitude and 10/53 latitude degrees; Junior's
 * existing local coordinates use 0.2 degrees/km and screen-down Y. */
export function ensureFeatureFuelCaches(surface:PlanetSurfaceState,starX:number,starY:number,order:number) {
 const ids=new Set(surface.minerals.map(m=>m.id));
 for(const ruin of surface.ruins) {
  const id=`fuel-cache:${ruin.id}`;
  if(!fuelBearingRuin(ruin,starX,starY,order)||ids.has(id))continue;
  let seed=2166136261;
  for(const char of id)seed=Math.imul(seed^char.charCodeAt(0),16777619)>>>0;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const x=ruin.x+(random()<.5?-1:1)*10/64/.2;
  const y=ruin.y+(random()<.5?-1:1)*10/53/.2;
  const volume=(10+Math.floor(random()*90))/10; // WF163 RRND(10,100), tenth-units
  surface.minerals.push({id,name:'Endurium',volume,x,y,taken:false});ids.add(id);
 }
 return surface;
}

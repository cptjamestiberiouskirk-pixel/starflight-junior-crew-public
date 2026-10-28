import assert from 'node:assert/strict';
import {UNIVERSE} from './galaxy';
import {generatePlanetSurface,preparePlanetSurface} from './surface';
import {fuelBearingRuin} from './utils/feature-fuel';
import {surfaceCoordinates} from './utils/planet-coordinates';
import {refillPlanetSurface} from './utils/surface-progress';
export function runFeatureFuelTests(){
 let passed=0;const check=(ok:boolean,label:string)=>{assert(ok,label);passed++;};
 let withCaches=0,withoutCaches=0;
 for(const star of UNIVERSE.stars)for(const planet of star.planets){
  const surface=generatePlanetSurface(star.x,star.y,planet,{lat:0,lon:0});
  const eligible=surface.ruins.filter(r=>fuelBearingRuin(r,star.x,star.y,planet.orderIndex));
  const caches=surface.minerals.filter(m=>m.id.startsWith('fuel-cache:'));
  check(caches.length===eligible.length,'Only mapped precursor features receive one cache each');
  for(const cache of caches){
   withCaches++;
   const ruin=eligible.find(r=>cache.id==='fuel-cache:'+r.id)!;
   check(cache.name==='Endurium'&&cache.volume>=1&&cache.volume<=9.9&&Math.abs(cache.volume*10-Math.round(cache.volume*10))<1e-9,'Original 10..99 tenth-units');
   check(Math.abs(Math.abs(cache.x-ruin.x)-10/64/.2)<1e-8&&Math.abs(Math.abs(cache.y-ruin.y)-10/53/.2)<1e-8,'Both axes offset exactly one original cell');
   cache.volume=0;cache.taken=true;
   const world=surfaceCoordinates(0,0,cache.x,cache.y);
   const reloaded=JSON.parse(JSON.stringify(surface));
   const revisited=preparePlanetSurface(reloaded,star.x,star.y,planet,6,179.9);
   const saved=revisited.minerals.filter(m=>m.id===cache.id);
   check(saved.length===1&&saved[0].taken&&saved[0].volume===0,'No resurrection after JSON restore, relocation or region merge');
   const moved=surfaceCoordinates(6,179.9,saved[0].x,saved[0].y);
   check(Math.abs(moved.lat-world.lat)<1e-8&&Math.abs(moved.lon-world.lon)<1e-8,'Cache world position survives seam-crossing landing changes');
  }
  if(!eligible.length){withoutCaches++;check(caches.length===0,'Non-precursor sites do not acquire fuel');}
 }
 check(withCaches>50&&withoutCaches>500,'Positive and negative galaxy-wide paths are reachable');
 const s=UNIVERSE.stars.find(s=>s.x===132&&s.y===165)!,p=s.planets.find(p=>p.orderIndex===0)!;
 const legacy=generatePlanetSurface(s.x,s.y,p,{lat:46,lon:14});legacy.minerals=legacy.minerals.filter(m=>!m.id.startsWith('fuel-cache:'));
 const before=JSON.stringify(legacy.minerals),life=JSON.stringify(legacy.lifeforms),ruins=JSON.stringify(legacy.ruins);
 preparePlanetSurface(legacy,s.x,s.y,p,46,14);
 check(legacy.minerals.filter(m=>m.id.startsWith('fuel-cache:')).length===1,'Legacy surface receives missing mapped cache once');
 check(JSON.stringify(legacy.minerals.filter(m=>!m.id.startsWith('fuel-cache:')))===before&&JSON.stringify(legacy.lifeforms)===life&&JSON.stringify(legacy.ruins)===ruins,'Legacy ore, wildlife and artifacts retain their state');
 const heaven=UNIVERSE.stars.find(s=>s.x===145&&s.y===107)!,world=heaven.planets.find(p=>p.orderIndex===3)!;
 const old=generatePlanetSurface(145,107,world,{lat:0,lon:0});const moved=preparePlanetSurface(old,145,107,world,10,20);
 const depleted=moved.minerals.find(m=>m.id.startsWith('fuel-cache:'))!;depleted.taken=true;depleted.volume=0;
 const refreshed=refillPlanetSurface(moved,145,107,world),cache=refreshed.minerals.find(m=>m.id===depleted.id)!,fixed=refreshed.ruins.find(r=>cache.id==='fuel-cache:'+r.id)!;
 check(!cache.taken&&cache.volume>=1,'Original orbit-departure resource refill remains in force');
 check(Math.abs(Math.abs(cache.x-fixed.x)-10/64/.2)<1e-8&&Math.abs(Math.abs(cache.y-fixed.y)-10/53/.2)<1e-8,'Refilled fuel stays beside a retained fixed structure after changing landing origin');
 return {passed,failed:0,results:[] as string[]};
}

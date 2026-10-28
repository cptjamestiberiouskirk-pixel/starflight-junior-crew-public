import assert from 'node:assert/strict';
import {advanceSystemFlight,systemFlightLimits,systemPlanetPosition,orbitShipAttitude,groundShipLabelPosition,hyperspaceArrival} from './utils/system-flight';
import {scienceContacts} from './utils/science-visibility';
import {beginPlanetScan,advancePlanetScan,analyzePlanetScan} from './utils/planet-scans';
import {surveyPlanet,visibleSurveyContacts,validPlanetSurvey,surfaceSiteKind} from './utils/planet-survey';
import {generatePlanetSurface,CANONICAL_ARTIFACTS} from './surface';
import {UNIVERSE} from './galaxy';
import {decodeSaveFromBase64,encodeSaveToBase64} from './utils/save-codec';
import fixture from './test-fixtures/commissioned-mission.json';
export function runScienceRuntimeTests(){
 let passed=0;const check=(v:unknown,m:string)=>{assert(v,m);passed++;};
 const caps=Array.from({length:6},(_,i)=>systemFlightLimits(i,100).topSpeed);
 check(caps[0]===0,'No engine cannot fly');
 for(let i=2;i<=5;i++)check(caps[i]>caps[i-1],'Each installed engine class is faster');
 check(Math.abs(caps[1]/caps[5]-1/3)<1e-10,'Documented remake D8 class-one pacing');
 check(systemFlightLimits(3,120).accelerationG===12,'Recovered class/mass integer acceleration');
 check(systemFlightLimits(3,300).rampSeconds>systemFlightLimits(3,100).rampSeconds,'Heavier fitted ship accelerates more slowly');
 for(const cls of [0,1,2,3,4,5])for(const mass of [60,300,1000]){
  const direct=advanceSystemFlight(0,2,true,cls,mass);let speed=0,distance=0;
  for(let n=0;n<120;n++){const step=advanceSystemFlight(speed,1/60,true,cls,mass);speed=step.speed;distance+=step.distance;}
  check(Math.abs(direct.distance-distance)<1e-7&&Math.abs(direct.speed-speed)<1e-7,'Distance and ramp independent of frame subdivision');
  check(advanceSystemFlight(speed,1,false,cls,mass).distance===0,'Releasing input stops system travel');
 }
 for(const h of [0,10,50,100])check(systemFlightLimits(4,100,h).topSpeed===caps[4]*h/100,'Engine damage scales actual attainable speed');
 for(const cls of [-4,NaN,0,5])check(advanceSystemFlight(100,1,true,cls,100,100,true).distance===0,'Inoperative engines never move');
 for(const dt of [NaN,Infinity,-1,0])check(advanceSystemFlight(50,dt,true,3,100).distance===0,'Invalid time cannot teleport a ship');
 const p={initialAngle:.7,orbitSpeed:.1,orbitRadius:100};
 const start=systemPlanetPosition(p,0),later=systemPlanetPosition(p,2);
 check(Math.hypot(start.currentX-later.currentX,start.currentY-later.currentY)>0,'Planets move along their orbits');
 for(const t of [0,1,20,100000]){const v=systemPlanetPosition(p,t);check(Math.abs(Math.hypot(v.currentX,v.currentY)-100)<1e-9,'Planet animation preserves physical orbital radius');}
 check(JSON.stringify(systemPlanetPosition(p,8))===JSON.stringify(systemPlanetPosition(p,8)),'Saved orbital clock reproduces location');
 const front=orbitShipAttitude(0),side=orbitShipAttitude(Math.PI/2);
 check(front.heading!==side.heading&&front.bank!==side.bank,'Actual model heading and bank follow orbital phase');
 check(front.cameraElevation>0&&front.cameraElevation<Math.PI/2,'Orbit camera is angled, not top-down');
 for(const h of [0,Math.PI/2,Math.PI,Math.PI*1.5]){const l=groundShipLabelPosition(10,20,100,200,h);check(l.x===10&&l.y>20,'Screen-space ship label stays below the complete rotated hull');}
 const stars=[{id:1,x:0,y:0},{id:2,x:5,y:0}];
 check(hyperspaceArrival(stars,{x:0,y:0},1).star===null,'Departing system cannot immediately reenter itself');
 check(hyperspaceArrival(stars,{x:5.5,y:0},1).star?.id===2,'Natural approach automatically enters destination');
 check(hyperspaceArrival(stars,{x:2,y:0},1).departedId===null,'Departure guard clears after leaving proximity');
 check(hyperspaceArrival(stars,{x:0,y:0},null).star?.id===1,'Returning after clearance can reenter origin');
 check(hyperspaceArrival(stars,{x:4.3,y:0},null).star===null,'Outside arrival threshold remains hyperspace');
 const star=UNIVERSE.stars[0],planet=star.planets[0];
 const surveyed=surveyPlanet(undefined,star.x,star.y,planet,0,0,200,false,false,()=>0);
 const scan=beginPlanetScan(`${star.id}:${planet.slot}`),raw=advancePlanetScan(scan,3),done=analyzePlanetScan(raw,{alive:true,vitality:100,skills:{science:200}},()=>0)!;
 for(const reading of [null,scan,advancePlanetScan(scan,2),raw])check(scienceContacts(surveyed,reading).length===0,'Existing saved discoveries do not leak before complete current scan and analysis');
 check(scienceContacts(surveyed,done).length>0,'Analyzed current reading exposes retained discoveries');
 const s=generatePlanetSurface(star.x,star.y,planet,{lat:0,lon:0});
 const artifact=CANONICAL_ARTIFACTS[0];
 const site:any={id:'fixture-site',name:'Ancient Observatory',x:0,y:0,lat:0,long:0,explored:false,artifactId:artifact.id,artifactRecovered:false};
 s.ruins=[site];
 check(surfaceSiteKind(site)==='installation','Existing Observatory classified as installation');
 check(surfaceSiteKind({...site,name:'Ancient City'})==='ruin','Ancient city remains ruin');
 const expert=surveyPlanet(s,star.x,star.y,planet,0,0,200,false,false,()=>0);
 check(expert.survey!.contacts.some(c=>c.id===site.id&&c.kind==='installation'),'Expert detects physical facility');
 check(!expert.survey!.contacts.some(c=>c.id==='artifact:'+site.id),'Expert skill does not disclose unexplored hidden relic');
 const cylinder=surveyPlanet(s,star.x,star.y,planet,0,0,0,true,false,()=>.99);
 check(cylinder.survey!.contacts.some(c=>c.id==='artifact:'+site.id&&c.uncertaintyKm===0),'Red Cylinder reveals artifact presence at zero skill');
 site.explored=true;
 const explored=surveyPlanet(s,star.x,star.y,planet,0,0,200,false,false,()=>0);
 check(explored.survey!.contacts.find(c=>c.id==='artifact:'+site.id)?.label===artifact.codeName,'Recovered-site knowledge uses artifact code name without invented identification');
 explored.ruins.find(r=>r.id===site.id)!.artifactRecovered=true;
 check(!visibleSurveyContacts(explored).some(c=>c.id==='artifact:'+site.id),'Recovered artifact disappears from active map');
 check(validPlanetSurvey(explored.survey),'New supported contact kinds remain version-one save compatible');
 for(const value of [undefined,0,12000]){const f:any=structuredClone(fixture);f.data.snapshot.orbitAnimPhase=value;f.data.snapshot.hyperspaceDepartureStarId=star.id;check(!!decodeSaveFromBase64(encodeSaveToBase64(f)),'Legacy and new flight-clock snapshots decode');}
 for(const patch of [{orbitAnimPhase:-1},{orbitAnimPhase:Infinity},{hyperspaceDepartureStarId:-123},{hyperspaceDepartureStarId:'1'}]){const f:any=structuredClone(fixture);Object.assign(f.data.snapshot,patch);check(!decodeSaveFromBase64(encodeSaveToBase64(f)),'Malformed new navigation fields rejected safely');}
 return {passed,failed:0,results:[]};
}

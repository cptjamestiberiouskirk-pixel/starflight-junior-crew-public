import terrainBaseline from './test-fixtures/terrain-baseline.json';
import assert from 'node:assert/strict';
import {starmapView} from './utils/starmap-view';
import {planetWeatherStyle} from './utils/planet-weather';
import {bayDockPose,bayLaunchPose,bayCameraFov} from './utils/bay-flight';
import {clampGroundZoom,groundShipAnchor,returnToShipAvailable,miningPulse,surfacePickupAvailable,miningActionAvailable} from './utils/surface-presentation';
import {getSurfaceElevation,surfaceElevationValue} from './surface';
import {scanSweepPosition} from './utils/scan-effects';
export async function runFeedbackRound2Tests(){
 let passed=0;const check=(ok:boolean,label:string)=>{assert(ok,label);passed++;};
 for(const zoom of [NaN,-4,1,1.5,4,8,99])for(const p of [{x:0,y:0},{x:125,y:100},{x:250,y:220}]){
  const v=starmapView(zoom,p),q=v.unproject(v.project(p));check(Math.abs(p.x-q.x)<1e-9&&Math.abs(p.y-q.y)<1e-9,'Zoomed chart pointer is the inverse of drawing');check(v.zoom>=1&&v.zoom<=8,'Chart zoom bounded even for invalid input');
 }
 for(const a of ['None','Very Thin','Thin','Moderate','Thick','Very Thick'] as const){
  const calm=planetWeatherStyle({type:'Rock',gases:[],atmosphereDensity:a,weather:'None'}),storm=planetWeatherStyle({type:'Rock',gases:[],atmosphereDensity:a,weather:'Very Violent'});
  check(Number.isFinite(calm.cloudOpacity)&&calm.cloudOpacity>=0&&storm.cloudOpacity>=calm.cloudOpacity,'Cloud opacity follows density and weather, including empty gas lists');if(a==='None')check(storm.cloudOpacity===0&&storm.rimOpacity===0,'No invented atmosphere on airless worlds');
 }
 for(const progress of [0,.25,.5,.75,1])for(const pose of [bayLaunchPose(progress),bayDockPose(progress)]){
  const dx=pose.camera[0]-pose.target[0],dy=pose.camera[1]-pose.target[1],dz=pose.camera[2]-pose.target[2],horizontal=Math.hypot(dx,dy);
  check(Math.abs(dx)/horizontal>=.08&&Math.abs(dz)/horizontal>=.04&&Math.abs(dz)/horizontal<=.45,'Bay ship remains elevated and off-axis rather than head-on or top-down throughout launch and docking');
 }
 let last=Infinity;
 for(let n=0;n<=80;n++){
  const p=bayDockPose(n/80);check(p.distance<=last+1e-9&&p.worldAltitude===6&&p.mainThrust===0,'Docking approaches smoothly at fixed altitude without reversed main thrust');last=p.distance;
  if(p.distance>47)check(p.clampOpen===1,'Clamps stay open until ship reaches the berth');
 }
 check(bayDockPose(1).distance===0&&bayDockPose(1).clampOpen===0&&bayDockPose(1).doorOpen===0,'Arrival ends docked, clamped and sealed');
 check(bayDockPose(0).camera[1]>76.1,'Arrival camera starts outside the actual closed blast-door plane rather than hiding the incoming ship');
 check(Math.abs(bayCameraFov(16/9)-60)<1e-9&&bayCameraFov(390/844)>100,'Wide and phone views retain the oblique hull in frame');
 check(Math.abs(bayCameraFov(NaN)-60)<1e-9&&Math.abs(bayCameraFov(0)-60)<1e-9,'Invalid aspect ratios use finite baseline framing');
 check(Math.abs(bayCameraFov(1920/500)-48)<1e-9,'Very wide bays retain legible hull scale while leaving vertical room for exhaust');
 for(const heading of [0,Math.PI/2,Math.PI,Math.PI*1.5])for(const z of [.4,1,1.4]){const a=groundShipAnchor(200,200,208*z,208*602/1087*z,heading,z);const half=(Math.abs(Math.sin(heading))*208+Math.abs(Math.cos(heading))*208*602/1087)*z/2;check(a.y+half<=200-34*z+.001,'Visual hull clears legacy boarding apron at every cardinal heading and zoom');}
 check(!returnToShipAvailable(0,.6,100)&&!returnToShipAvailable(8,8,0)&&!returnToShipAvailable(8,8,100,true)&&returnToShipAvailable(8,8,100),'Return action reflects boarding range, fuel and rover health');
 check(clampGroundZoom(NaN)===1&&clampGroundZoom(-3)===.4&&clampGroundZoom(10)===1.4,'Ground zoom clamps corrupt presentation values');
 const pulse=Array.from({length:100},(_,i)=>miningPulse(i/100));check(Math.min(...pulse)>=.35&&Math.max(...pulse)<=1&&Math.max(...pulse)-Math.min(...pulse)>.6,'Mining beam pulses without turning fully off');
 for(const row of terrainBaseline.samples){
  const h=surfaceElevationValue(row.lon,row.lat,row.seed);
  check(h===row.height&&row.expected.every(e=>getSurfaceElevation(row.lon,row.lat,row.seed,e.water,e.type as any)===e.elevation),'Detailed maps preserve frozen original heights and every planet/water classification');
  check(surfaceElevationValue(row.lon+360,row.lat,row.seed)===h,'Height remains identical across longitude wrap');
 }
 check(scanSweepPosition(-1)===0&&scanSweepPosition(2)===1,'Sensor sweep stays inside the map');
 const pickup={minerals:[{x:1,y:0,id:'big',taken:false,volume:10},{x:2,y:0,id:'small',taken:false,volume:1}],ruins:[],lifeforms:[],droppedCargo:[]} as any;
 check(!surfacePickupAvailable(pickup,0,0,45),'Full hold disables pickup when the closest deposit does not fit');
 pickup.minerals[0].taken=true;check(surfacePickupAvailable(pickup,0,0,45),'A reachable deposit that fits enables pickup');
 pickup.minerals=[];pickup.ruins=[{x:1,y:0,explored:true}];check(surfacePickupAvailable(pickup,0,0,50),'Explored ruin inspection remains usable with a full hold');
 check(!surfacePickupAvailable(null,0,0,0),'Missing surface cannot enable pickup');
 const selected={minerals:[{id:'near',x:2,y:0,volume:15,taken:false},{id:'far',x:20,y:0,volume:15,taken:false}]} as any;
 check(!miningActionAvailable(selected,0,0,0,100,'far'),'A far selected deposit cannot enable the laser because another deposit is near');
 check(miningActionAvailable(selected,0,0,0,100,'missing'),'Missing selected deposit falls back to the nearest live deposit, matching the existing handler');
 return {passed,failed:0,results:[] as string[]};
}

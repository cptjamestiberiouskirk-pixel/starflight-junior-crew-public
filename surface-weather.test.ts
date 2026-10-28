import assert from 'node:assert/strict';
import {advanceSurfaceWeather,surfaceWeatherKind,type SurfaceWeatherKind} from './utils/surface-weather';

export function runSurfaceWeatherTests(){
  let passed=0;const check=(condition:boolean,label:string)=>{assert(condition,label);passed++;};
  check(surfaceWeatherKind(null)==='none','No weather without a planet');
  check(surfaceWeatherKind({weather:'None',temperature:'Arctic'})==='none','A cold calm planet does not acquire invented snowfall');
  check(surfaceWeatherKind({weather:'Moderate',temperature:'Arctic'})==='snow','Original freezing precipitation retained');
  check(surfaceWeatherKind({weather:'Violent',temperature:'Temperate',tempMin:'Sub-Arctic'})==='snow','Original minimum-temperature freezing rule retained');
  check(surfaceWeatherKind({weather:'Moderate',hydrosphereCompound:'Water',hydrospherePercent:20})==='rain','Original liquid-water rainfall rule retained');
  check(surfaceWeatherKind({weather:'Violent',hydrosphereCompound:'Methane',hydrospherePercent:20})==='dust','Violent nonwater weather retains storm dust');
  check(surfaceWeatherKind({weather:'Moderate',hydrosphereCompound:'Methane',hydrospherePercent:20})==='none','No new ordinary methane precipitation invented');
  for(const kind of ['snow','rain','dust'] as SurfaceWeatherKind[])for(const [width,height] of [[1200,1400],[2400,550],[390,844]]){
    let pool=advanceSurfaceWeather([],kind,width,height,0,()=>.1);
    check(pool.length>=32&&pool.length<=240,`${kind} ${width}x${height}: pool bounded`);
    check([0,1,2,3].every(q=>pool.some(p=>p.y/height>=q/4&&p.y/height<(q+1)/4)),`${kind} ${width}x${height}: every vertical quarter visible immediately with constant random`);
    check(Math.max(...pool.map(p=>p.x))/width>.8&&Math.max(...pool.map(p=>p.y))/height>.8,`${kind} ${width}x${height}: actual viewport extents filled`);
    const paused=advanceSurfaceWeather(pool,kind,width,height,0,()=>.1);check(paused===pool,`${kind}: pause does not move particles`);
    let gaps=0;
    for(let i=0;i<1800;i++){
      pool=advanceSurfaceWeather(pool,kind,width,height,1/60,()=>.1);
      if(![0,1,2,3].every(q=>pool.some(p=>p.y/height>=q/4&&p.y/height<(q+1)/4)))gaps++;
    }
    check(gaps===0,`${kind}: no empty vertical quarter during thirty seconds of edge recycling`);
    check(pool.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=-30&&p.x<=width+30&&p.y>=-30&&p.y<=height+30),`${kind}: thirty seconds of recycling stays in padded bounds`);
    check(pool.every(p=>p.kind===kind&&p.viewportHeight===height),`${kind}: recycling retains weather type and actual dimensions`);
  }
  const snow=advanceSurfaceWeather([],'snow',1280,720,0,()=>.5);
  check(snow.every(p=>p.vy>=60&&p.vy<=100&&p.vx>=-40&&p.vx<=0),'Snow retains original speed ranges');
  const resized=advanceSurfaceWeather(snow,'snow',700,1600,0,()=>.5);
  check(resized.every(p=>p.viewportWidth===700&&p.viewportHeight===1600)&&resized.some(p=>p.y>1400),'Resize repopulates the full new view');
  const rain=advanceSurfaceWeather(resized,'rain',700,1600,0,()=>.5);
  check(rain.every(p=>p.kind==='rain'&&p.vy>=380&&p.vy<=500&&p.length!==undefined),'Weather changes replace all stale particles, retaining original rainfall speed');
  check(advanceSurfaceWeather(rain,'none',700,1600,.1).length===0,'Clear weather removes all precipitation immediately');
  check(advanceSurfaceWeather(snow,'snow',0,0,.1).length===0,'Zero-sized view cannot create invalid coordinates');
  check(advanceSurfaceWeather(snow,'snow',NaN,100,.1).length===0,'Invalid dimensions cannot create an unbounded pool');
  return {passed,failed:0,results:[]};
}

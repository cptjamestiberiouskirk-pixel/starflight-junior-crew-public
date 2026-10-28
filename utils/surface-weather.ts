export type SurfaceWeatherKind='none'|'snow'|'rain'|'dust';
export interface SurfaceWeatherParticle {
  x:number;y:number;vx:number;vy:number;size:number;length?:number;alpha:number;
  kind:SurfaceWeatherKind;viewportWidth:number;viewportHeight:number;
}
interface WeatherPlanet {weather?:string;temperature?:string;tempMin?:string;hydrosphereCompound?:string;hydrospherePercent?:number}

/** Retain the existing weather/temperature/composition rules. This module is
 * presentation only: storm hazards, fuel, injuries and planetary data are separate. */
export function surfaceWeatherKind(planet:WeatherPlanet|null):SurfaceWeatherKind {
  if(!planet || !planet.weather || planet.weather==='None')return 'none';
  if(['Arctic','Sub-Arctic'].includes(planet.temperature??'')||['Arctic','Sub-Arctic'].includes(planet.tempMin??''))return 'snow';
  if(planet.hydrosphereCompound==='Water'&&(planet.hydrospherePercent??0)>0)return 'rain';
  return ['Violent','Very Violent'].includes(planet.weather)?'dust':'none';
}

const wrap=(value:number,extent:number)=>(value%extent+extent)%extent;

/** A stratified, viewport-sized field is visible immediately, even with a fixed
 * random source. Recycle at the edges; never evict still-visible falling snow. */
export function advanceSurfaceWeather(previous:SurfaceWeatherParticle[],kind:SurfaceWeatherKind,width:number,height:number,seconds:number,random=Math.random):SurfaceWeatherParticle[] {
  if(kind==='none'||!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)return [];
  const targetCount=Math.max(64,Math.min(240,Math.round(width*height/16000)));
  // Complete rows avoid an empty corner; at least eight per axis keep short
  // maps covered even under deterministic wind and random-number fixtures.
  const columns=Math.max(8,Math.min(Math.floor(targetCount/8),Math.round(Math.sqrt(targetCount*width/height))));
  const rows=Math.min(Math.floor(240/columns),Math.ceil(targetCount/columns));
  const count=columns*rows;
  let pool=previous;
  if(pool.length!==count||pool[0]?.kind!==kind||pool[0]?.viewportWidth!==width||pool[0]?.viewportHeight!==height){
    pool=Array.from({length:count},(_,index)=>{
      const base={x:(index%columns+.15+random()*.7)/columns*width,y:(Math.floor(index/columns)+.15+random()*.7)/rows*height,kind,viewportWidth:width,viewportHeight:height};
      if(kind==='snow')return {...base,vx:random()*40-40,vy:60+random()*40,size:2+random()*2.5,alpha:.7+random()*.3};
      if(kind==='rain')return {...base,vx:60+random()*40,vy:380+random()*120,size:1.5,length:12+random()*14,alpha:.6+random()*.4};
      return {...base,vx:240+random()*160,vy:(random()-.5)*60,size:2+random()*3,length:8+random()*12,alpha:.5+random()*.4};
    });
  }
  if(!Number.isFinite(seconds)||seconds<=0)return pool;
  return pool.map(p=>({...p,x:wrap(p.x+p.vx*seconds,width),y:wrap(p.y+p.vy*seconds,height)}));
}

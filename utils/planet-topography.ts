import {getSurfaceElevation,surfaceElevationValue,type TerrainElevation} from '../surface';
import type {PlanetType} from '../galaxy';
import {wrapLongitude} from './planet-coordinates';
export const ELEVATION_COLORS:Record<TerrainElevation,string>={Liquid:'#103858',Lowland:'#275d4b',Highland:'#81704c',Mountains:'#a3acba'};
type Extent={lon:number;lat:number;spanLon:number;spanLat:number;width?:number;height?:number};
const urls=[new URL('../assets/ui/terrain/rock.webp',import.meta.url),new URL('../assets/ui/terrain/ice.webp',import.meta.url),new URL('../assets/ui/terrain/lowland.webp',import.meta.url),new URL('../assets/ui/terrain/lava.webp',import.meta.url),new URL('../assets/ui/terrain/ocean.webp',import.meta.url),new URL('../assets/ui/terrain/mountain.webp',import.meta.url)];
const materials:Uint8ClampedArray[]=[];let ready:Promise<void>|null=null,revision=0;
const cache=new Map<string,HTMLCanvasElement>();
export function prepareTerrainArt(){return ready??=(async()=>{if(typeof Image==='undefined')return;await Promise.all(urls.map(async(url,index)=>{try{const image=new Image();image.src=url.href;await image.decode();const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d')!;ctx.drawImage(image,0,0,256,256);materials[index]=ctx.getImageData(0,0,256,256).data;}catch{}}));revision++;cache.clear();window.dispatchEvent(new Event('terrain-art-ready'));})();}
export function terrainMaterial(type:PlanetType,elevation:TerrainElevation){return type==='Molten'?3:type==='Frozen'?1:type==='Crystal'?5:elevation==='Liquid'?4:elevation==='Mountains'?5:type==='Liquid'?2:0;}
/** Artistic detail comes from Meshy; all shorelines, heights and coordinates
 * come from the existing planet generator, including regional resampling. */
export function planetTopography(seed:number,water:number,type:PlanetType,extent:Extent={lon:0,lat:0,spanLon:360,spanLat:180}){
 if(typeof document==='undefined')return null;void prepareTerrainArt();
 const w=extent.width??960,h=extent.height??480,key=JSON.stringify([seed,water,type,extent,revision]);
 if(cache.has(key)){const v=cache.get(key)!;cache.delete(key);cache.set(key,v);return v;}
 const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');if(!ctx)return null;
 const image=ctx.createImageData(w,h),heights=new Float32Array(w*h),classes=new Uint8Array(w*h),names:TerrainElevation[]=['Liquid','Lowland','Highland','Mountains'];
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const lon=wrapLongitude(extent.lon+((x+.5)/w-.5)*extent.spanLon),lat=Math.max(-90,Math.min(90,extent.lat+(.5-(y+.5)/h)*extent.spanLat));const i=y*w+x;heights[i]=surfaceElevationValue(lon,lat,seed);classes[i]=names.indexOf(getSurfaceElevation(lon,lat,seed,water,type));}
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=y*w+x,e=classes[i],lon=extent.lon+((x+.5)/w-.5)*extent.spanLon,lat=extent.lat+(.5-(y+.5)/h)*extent.spanLat;
  const mirror=(n:number)=>{const q=((Math.floor(n)%512)+512)%512;return q<256?q:511-q;};
  const texture=materials[terrainMaterial(type,names[e])],u=mirror(lon*51.2+Math.sin(lat*.1)*100+Math.sin(lon*Math.PI/90)*70+seed),v=mirror(lat*51.2+Math.sin(lon*Math.PI/60)*100+heights[i]*80+(seed>>>8)),t=(v*256+u)*4;
  const u2=mirror(lon*(512/15)+Math.sin(lat*.19)*70+seed+97),v2=mirror(lat*(512/15)+Math.sin(lon*Math.PI/45)*60+(seed>>>8)+53),t2=(v2*256+u2)*4;
  const left=heights[y*w+Math.max(0,x-1)],up=heights[Math.max(0,y-1)*w+x],slope=(left-heights[i]+up-heights[i])*6;
  let shade=Math.max(.9,Math.min(1.08,1+slope));
  if(e&&((x>0&&classes[i-1]===0)||(y>0&&classes[i-w]===0)))shade*=1.08;
  else if(e&&x>0&&Math.abs(heights[i]-left)<.012&&Math.floor(heights[i]*18)!==Math.floor(left*18))shade*=.93;
  // Use height-class cartographic colors; painted grain adds relief without
  // inventing geographic landmarks or breaking the terrain legend.
  const base=e===0?[24,66,94]:e===1?[58,103,83]:e===2?[139,119,79]:[169,181,189];
  const grain=texture?(.65+((texture[t]*.3+texture[t+1]*.59+texture[t+2]*.11)*.55+(texture[t2]*.3+texture[t2+1]*.59+texture[t2+2]*.11)*.45)/255*.7):1;
  for(let channel=0;channel<3;channel++)image.data[i*4+channel]=base[channel]*shade*grain;
  image.data[i*4+3]=255;
 }
 ctx.putImageData(image,0,0);c.dataset.terrainArt='meshy-materials-live-elevation';c.dataset.extent=JSON.stringify(extent);
 cache.set(key,c);while(cache.size>8)cache.delete(cache.keys().next().value!);return c;
}

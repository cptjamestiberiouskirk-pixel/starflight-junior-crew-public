import {armorAppearance,armorTintLayer} from './armor-style';
import catalog from '../assets/ships/catalog.json';

export interface ShipVisualConfig { cargoPods:number; armorClass:number; laserClass:number; missileClass:number; }
const bounded=(n:number,max:number)=>Number.isFinite(n)?Math.max(0,Math.min(max,Math.floor(n))):0;
export function shipConfiguration(config:ShipVisualConfig):ShipVisualConfig {
  return {cargoPods:bounded(config.cargoPods,16),armorClass:bounded(config.armorClass,5),laserClass:bounded(config.laserClass,5),missileClass:bounded(config.missileClass,5)};
}
export function shipConfigurationKey(config:ShipVisualConfig){
  const c=shipConfiguration(config);
  return `ship-c${String(c.cargoPods).padStart(2,'0')}-a${c.armorClass}-l${c.laserClass}-m${c.missileClass}`;
}
export function shipConfigurationURL(config:ShipVisualConfig,base=typeof document==='undefined'?'http://localhost/':new URL(import.meta.env.BASE_URL,document.baseURI).href){
  // Deliberately construct an on-demand URL: a glob would preload the entire library.
  return new URL(catalog.directory+shipConfigurationKey(config)+'.png?v='+catalog.version,base).href;
}
type Entry={image:HTMLImageElement;ready:boolean;promise:Promise<boolean>;resolve:(ready:boolean)=>void;tint?:HTMLCanvasElement};
const armorMaskURLs=[
 new URL('../assets/models/ship-armor-1.png',import.meta.url).href,new URL('../assets/models/ship-armor-2.png',import.meta.url).href,
 new URL('../assets/models/ship-armor-3.png',import.meta.url).href,new URL('../assets/models/ship-armor-4.png',import.meta.url).href,
 new URL('../assets/models/ship-armor-5.png',import.meta.url).href,
];
const masks=new Map<number,{image:HTMLImageElement;ready:boolean;pixels?:Uint8ClampedArray}>();
const cache=new Map<string,Entry>();
const MAX_IMAGES=8;
let loads=0,evictions=0;
function request(config:ShipVisualConfig):Entry|null {
  if(typeof Image==='undefined')return null;
  const key=shipConfigurationKey(config),existing=cache.get(key);
  if(existing){cache.delete(key);cache.set(key,existing);return existing;}
  const image=new Image();image.decoding='async';
  let resolve!:(ready:boolean)=>void;
  const entry:Entry={image,ready:false,promise:new Promise<boolean>(done=>{resolve=done;}),resolve:ready=>resolve(ready)};
  image.onload=()=>{entry.ready=image.naturalWidth===catalog.canvas[0]&&image.naturalHeight===catalog.canvas[1];entry.resolve(entry.ready);};
  image.onerror=()=>entry.resolve(false);
  cache.set(key,entry);loads++;
  while(cache.size>MAX_IMAGES){
    const oldest=cache.keys().next().value!;const previous=cache.get(oldest)!;cache.delete(oldest);
    previous.resolve(false);previous.image.onload=null;previous.image.onerror=null;previous.image.removeAttribute('src');if(previous.tint)previous.tint.width=previous.tint.height=0;evictions++;
  }
  image.src=shipConfigurationURL(config);
  return entry;
}
export const prepareConfiguredShip=(config:ShipVisualConfig)=>request(config)?.promise??Promise.resolve(false);
export function configuredShipImage(config:ShipVisualConfig){const entry=request(config);return entry?.ready?entry.image:null;}
export function drawConfiguredShip(ctx:CanvasRenderingContext2D,config:ShipVisualConfig,x:number,y:number,width:number,height:number){
  const entry=request(config);if(!entry?.ready)return false;const image=entry.image;
  const appearance=armorAppearance(config.armorClass);
  if(appearance.tier&&!entry.tint&&typeof document!=='undefined'){
   let mask=masks.get(appearance.tier);if(!mask){const image=new Image();mask={image,ready:false};const row=mask;image.onload=()=>{row.ready=image.naturalWidth===1087&&image.naturalHeight===602;};image.src=armorMaskURLs[appearance.tier-1];masks.set(appearance.tier,mask);}
   const bare=request({...config,cargoPods:0,laserClass:0,missileClass:0});
   if(mask.ready&&bare?.ready){
    const canvas=document.createElement('canvas');canvas.width=1087;canvas.height=602;const paint=canvas.getContext('2d',{willReadFrequently:true});
    if(paint){
     if(!mask.pixels){paint.drawImage(mask.image,0,0);mask.pixels=paint.getImageData(0,0,1087,602).data;paint.clearRect(0,0,1087,602);}
     paint.drawImage(image,0,0);const fitted=paint.getImageData(0,0,1087,602).data;paint.clearRect(0,0,1087,602);paint.drawImage(bare.image,0,0);const skin=paint.getImageData(0,0,1087,602).data;
     const layer=paint.createImageData(1087,602);layer.data.set(armorTintLayer(fitted,skin,mask.pixels,appearance.tier));paint.putImageData(layer,0,0);entry.tint=canvas;
    }
   }
  }
  ctx.save();ctx.shadowColor=appearance.accent;ctx.shadowBlur=appearance.glow;
  ctx.drawImage(image,x,y,width,height);if(entry.tint){ctx.shadowBlur=0;ctx.drawImage(entry.tint,x,y,width,height);}ctx.restore();
  if(ctx.canvas?.dataset){ctx.canvas.dataset.shipConfiguration=shipConfigurationKey(config);ctx.canvas.dataset.shipArmorTint=appearance.tier?(entry.tint?'ready':'loading'):'none';ctx.canvas.dataset.shipArmorColor=appearance.accent;}
  return true;
}
export const shipArtCacheState=()=>({entries:cache.size,limit:MAX_IMAGES,loads,evictions,keys:[...cache.keys()]});
/** Sprite-local emitter points, scaled using the unchanged hull frame. */
export function configuredLaserEmitters(laserClass:number,width:number){
  const points=(catalog.laserEmitters as Record<string,number[][]>)[String(bounded(laserClass,5))]??[];
  return points.map(([x,y])=>({x:x*width/catalog.canvas[0],y:-y*width/catalog.canvas[0]}));
}

export function clearShipArtCache(){
  for(const entry of cache.values()){entry.resolve(false);entry.image.onload=null;entry.image.onerror=null;entry.image.removeAttribute('src');if(entry.tint)entry.tint.width=entry.tint.height=0;}
  cache.clear();
}

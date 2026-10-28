import type {StarPlanet} from '../galaxy';
import {projectedPlanetTexture} from './planet-globe-renderer';
type Planet=Pick<StarPlanet,'atmosphereDensity'|'weather'|'type'|'gases'>;
export function planetWeatherStyle(p:Planet){
 const density={None:0,'Very Thin':.14,Thin:.28,Moderate:.65,Thick:.85,'Very Thick':1}[p.atmosphereDensity]??0;
 const storm={None:0,Calm:.15,Moderate:.45,Violent:.75,'Very Violent':1}[p.weather]??0;
 const tint=p.type==='Molten'?'#e5b48d':p.gases.some(g=>/chlorine|fluorine/i.test(g))?'#abc891':'#c2e1f4';
 return {density,storm,tint,cloudOpacity:density*(.38+storm*.48),rimOpacity:density?(.22+.55*Math.sqrt(density)):0};
}
const clouds=new Map<string,HTMLCanvasElement>();
function layer(p:Planet,seed:number){
 const style=planetWeatherStyle(p),key=JSON.stringify([p.type,p.weather,p.atmosphereDensity,seed]);if(clouds.has(key))return clouds.get(key)!;
 const c=document.createElement('canvas');c.width=512;c.height=256;const ctx=c.getContext('2d')!,im=ctx.createImageData(512,256);
 for(let y=0;y<256;y++)for(let x=0;x<512;x++){
  const lon=x/512*Math.PI*2,lat=(y/256-.5)*Math.PI,s=seed*.001;
  const swirl=Math.sin(lon*3+lat*4+s)*.48+Math.cos(lon*7-lat*8+s)*.3+Math.sin(lon*15+lat*16)*.16;
  const band=p.type==='Gas Giant'?Math.sin(lat*22+Math.sin(lon*3)*.7)*.4:0;
  const a=Math.max(0,Math.min(1,(swirl+band-.02)*1.8));const i=(y*512+x)*4;
  im.data[i]=p.type==='Molten'?229:224;im.data[i+1]=p.type==='Molten'?184:238;im.data[i+2]=p.type==='Molten'?149:246;im.data[i+3]=a*255;
 }ctx.putImageData(im,0,0);clouds.set(key,c);while(clouds.size>16)clouds.delete(clouds.keys().next().value!);return c;
}
/** Shared cached atmosphere for system and orbit; airless worlds stay airless. */
export function drawPlanetWeather(ctx:CanvasRenderingContext2D,x:number,y:number,r:number,p:Planet,seed:number,seconds:number){
 const style=planetWeatherStyle(p);if(!style.density)return;
 ctx.save();
 ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.clip();ctx.globalAlpha=style.cloudOpacity;
 const globe=projectedPlanetTexture(layer(p,seed),seconds*.045,r<80?128:512);ctx.drawImage(globe,x-r,y-r,2*r,2*r);
 if(style.storm>.6){ctx.globalAlpha=(.03+.03*Math.sin(seconds*.8+seed))*style.storm;ctx.fillStyle='#f6e9bf';ctx.fillRect(x-r,y-r,2*r,2*r);}
 ctx.restore();if(ctx.canvas?.dataset)ctx.canvas.dataset.planetWeather=JSON.stringify({atmosphere:p.atmosphereDensity,weather:p.weather,cloudOpacity:style.cloudOpacity});
}

/** Render outside the caller's planet clip: otherwise the entire outer rim disappears. */
export function drawPlanetAtmosphere(ctx:CanvasRenderingContext2D,x:number,y:number,r:number,p:Planet,zoom=1){
 const style=planetWeatherStyle(p);if(!style.density||r<=0)return;
 const width=Math.max(2.5/Math.max(.1,zoom),r*(.045+.045*style.density));
 ctx.save();const halo=ctx.createRadialGradient(x,y,r-width*.25,x,y,r+width);
 halo.addColorStop(0,'transparent');halo.addColorStop(.25,style.tint);halo.addColorStop(1,'transparent');
 ctx.globalAlpha=style.rimOpacity;ctx.fillStyle=halo;ctx.beginPath();ctx.arc(x,y,r+width,0,Math.PI*2);ctx.fill();ctx.restore();
}

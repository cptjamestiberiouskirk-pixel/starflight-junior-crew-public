import React,{useEffect,useRef} from 'react';
import {drawConfiguredShip,prepareConfiguredShip,shipConfiguration,shipConfigurationKey,type ShipVisualConfig} from '../utils/ship-art';
import ScienceCompositionArt from './ScienceCompositionArt';
export type ScienceOutfitting=ShipVisualConfig&{shieldClass:number;shieldsRaised:boolean};
function ConfiguredHull({config}:{config:ShipVisualConfig}){
 const canvas=useRef<HTMLCanvasElement>(null),key=shipConfigurationKey(config);
 useEffect(()=>{
  let active=true,timer:number|undefined;const started=performance.now(),c=canvas.current;if(!c)return;
  const ctx=c.getContext('2d');if(!ctx)return;ctx.clearRect(0,0,c.width,c.height);delete c.dataset.scienceConfiguration;
  const paint=()=>{if(!active)return;ctx.clearRect(0,0,c.width,c.height);if(drawConfiguredShip(ctx,config,18,26,604,334)){c.dataset.scienceConfiguration=key;}
   if(c.dataset.shipArmorTint==='loading'&&performance.now()-started<10000)timer=window.setTimeout(paint,100);
  };
  prepareConfiguredShip(config).then(ok=>{if(ok)paint();});
  return ()=>{active=false;if(timer!==undefined)clearTimeout(timer);};
 },[key]);
 return <canvas ref={canvas} width="640" height="400" className="science-configured-hull"/>;
}
export default function ScienceShipArt({field,outfitting,hull,shields,sensorHealth,planetImage}:{field:'Hull'|'Shields'|'Armor'|'Endurium fuel'|'Sensors';outfitting?:ScienceOutfitting;hull:number;shields:number;sensorHealth:number;planetImage?:string}){
 const config=shipConfiguration(outfitting??{cargoPods:0,armorClass:0,laserClass:0,missileClass:0});
 const fieldOn=!!outfitting?.shieldsRaised&&shields>0&&outfitting.shieldClass>0;
 return <span aria-hidden="true" className={'science-ship-art science-ship-art-'+field.replaceAll(' ','-').toLowerCase()} data-science-status-art={field} data-science-shield-state={field==='Shields'?(outfitting?.shieldClass?shields<=0?'depleted':fieldOn?'raised':'standby':'not-installed'):undefined}>
  {['Hull','Shields','Armor'].includes(field)&&<ConfiguredHull config={config}/>}
  {field==='Hull'&&hull<250&&<span className="science-hull-alert" style={{opacity:Math.max(0,Math.min(1,1-hull/250))}}/>}
  {field==='Shields'&&<svg className={'science-shield-envelope '+(fieldOn?'science-shield-energized':'')} viewBox="0 0 300 200"><g fill="none" stroke="currentColor" strokeWidth="1.5"><ellipse cx="162" cy="116" rx="112" ry="72"/>{[0,1,2,3].map(i=><ellipse key={i} cx="162" cy="116" rx={22+i*23} ry="72"/>)}{[80,110,140].map(y=><path key={y} d={'M55 '+y+'Q162 '+(y+25)+' 269 '+y}/>)}</g></svg>}
  {field==='Endurium fuel'&&<ScienceCompositionArt category="lithosphere" names={['Endurium']} revealed={true}/>}
  {field==='Sensors'&&<>
   {planetImage&&<span className="science-instrument-planet"><img src={planetImage} alt=""/><i/></span>}
   <svg className={'science-sensor-reticle '+(sensorHealth<=0?'science-sensor-offline':'')} viewBox="0 0 300 200"><g fill="none" stroke="currentColor" strokeWidth="1.5">{[30,52,74,96].map(r=><circle key={r} cx="172" cy="120" r={r}/>)}<path d="M172 16v184M60 120h230M172 120L238 58"/></g></svg>
  </>}
 </span>;
}

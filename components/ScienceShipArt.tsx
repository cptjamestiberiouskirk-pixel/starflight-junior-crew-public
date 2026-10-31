import React,{useEffect,useRef} from 'react';
import {drawConfiguredShip,prepareConfiguredShip,shipConfiguration,shipConfigurationKey,type ShipVisualConfig} from '../utils/ship-art';
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
export default function ScienceShipArt({field,outfitting,hull,shields,sensorHealth,fuel=0}:{field:'Hull'|'Shields'|'Armor'|'Endurium fuel'|'Sensors';outfitting?:ScienceOutfitting;hull:number;shields:number;sensorHealth:number;fuel?:number}){
 const config=shipConfiguration(outfitting??{cargoPods:0,armorClass:0,laserClass:0,missileClass:0});
 const fieldOn=!!outfitting?.shieldsRaised&&shields>0&&outfitting.shieldClass>0;
 return <span aria-hidden="true" className={'science-ship-art science-ship-art-'+field.replaceAll(' ','-').toLowerCase()} data-science-status-art={field} data-science-shield-state={field==='Shields'?(outfitting?.shieldClass?shields<=0?'depleted':fieldOn?'raised':'standby':'not-installed'):undefined}>
  {field==='Hull'&&<ConfiguredHull config={config}/>}
  {field==='Hull'&&hull<250&&<span className="science-hull-alert" style={{opacity:Math.max(0,Math.min(1,1-hull/250))}}/>}
  {field==='Shields'&&<svg className={'science-shield-envelope '+(fieldOn?'science-shield-energized':'')} viewBox="0 0 300 200"><g fill="none" stroke="currentColor" strokeWidth="1.5"><ellipse cx="162" cy="116" rx="112" ry="72"/>{[0,1,2,3].map(i=><ellipse key={i} cx="162" cy="116" rx={22+i*23} ry="72"/>)}{[80,110,140].map(y=><path key={y} d={'M55 '+y+'Q162 '+(y+25)+' 269 '+y}/>)}</g></svg>}
  {field==='Shields'&&<svg className="science-context-instrument science-shield-generator" viewBox="0 0 300 160"><g stroke="currentColor" strokeWidth="2" fill="#102e42"><path d="M113 52l37-19 37 19v55l-37 21-37-21Z"/><path d="M113 52l37 21 37-21M150 73v55" fill="none"/>{[0,1,2].map(i=><path key={i} d={`M${93-i*22} ${48-i*9}q-25 35 0 70M${207+i*22} ${48-i*9}q25 35 0 70`} fill="none" opacity={fieldOn?1:.2} />)}</g><circle cx="150" cy="86" r="7" fill={fieldOn?'#8df0eb':'#567184'}/></svg>}
  {field==='Armor'&&<svg className="science-context-instrument science-armor-layers" viewBox="0 0 300 160"><g stroke="#80b5c8" strokeWidth="2"><path d="M46 109l100-52 112 40-99 55Z" fill="#163244"/>{Array.from({length:config.armorClass},(_,i)=><path key={i} d={`M46 ${99-i*13}l100-52 112 40-99 55Z`} fill={i%2?'#adc7d0':'#d8e8eb'}/>)}<path d="M89 24l31 18m76 48 29 14" fill="none" stroke="#f0cb81"/></g></svg>}
  {field==='Endurium fuel'&&<svg className="science-context-instrument science-fuel-cell" data-science-fuel-state={fuel>0?'available':'empty'} viewBox="0 0 300 160"><g stroke="#8ab5c4" strokeWidth="2" fill="#153445"><path d="M71 35h131v89H71Z"/><ellipse cx="136" cy="35" rx="65" ry="17"/><path d="M71 124a65 17 0 0 0 131 0M202 63h41v58h28" fill="none"/><rect x="93" y="55" width="88" height="54" rx="8" fill={fuel>0?'#134d45':'#162c38'}/>{fuel>0&&<path d="M111 66l17-6 15 12-9 26-24-6ZM153 70l13 8-5 19-16-5Z" fill="#6ed6b4" stroke="#a9efd0"/>}<path d="M220 56v16m-7-8h14M243 93h12m-6-6v12" fill="none" stroke="#e9cd8f"/></g></svg>}
  {field==='Sensors'&&<>
   <svg className={'science-context-instrument science-sensor-dish '+(sensorHealth<=0?'science-sensor-offline':'')} viewBox="0 0 300 160"><g fill="none" stroke="currentColor" strokeWidth="2"><path d="M70 36q-8 68 69 72Z" fill="#183c52"/><path d="M104 73l44-36m-15 0h15v15M105 106l-12 32m-22 0h63"/>{[0,1,2].map(i=><path key={i} d={`M${162+i*23} ${24-i*3}q${27+i*8} 22 ${31+i*2} ${47+i*15}`} opacity={sensorHealth>0?1:.15}/>)}<path d={sensorHealth>0?'M170 132h15l9-22 13 39 12-30 10 13h42':'M170 132h101'} stroke="#8ce2bd"/></g></svg>
  </>}
 </span>;
}

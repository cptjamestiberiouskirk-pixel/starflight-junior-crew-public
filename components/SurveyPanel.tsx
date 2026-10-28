import {drawSensorSweep} from '../utils/scan-effects';
import React,{useEffect,useRef,useState} from 'react';
import {CONTACT_KINDS,CONTACT_NAMES,CONTACT_COLORS,CONTACT_SYMBOLS,contactCoordinates,drawSurveyContacts,type SurveyContact,type ContactKind} from '../utils/planet-survey';
import {planetTopography} from '../utils/planet-topography';
import {wrapLongitude} from '../utils/planet-coordinates';
import type {PlanetType} from '../galaxy';
const keyArt:Partial<Record<ContactKind,string>>={mineral:new URL('../assets/ui/science/mineral-key.webp',import.meta.url).href,installation:new URL('../assets/ui/science/installation-key.webp',import.meta.url).href,artifact:new URL('../assets/ui/science/artifact-key.webp',import.meta.url).href};

type Props={contacts:SurveyContact[];seed:number;water:number;type:PlanetType;target:{lat:number;lon:number};sampledRegions:number;scienceSkill?:number;onSelect?:(c:{lat:number;lon:number})=>void;onOpenLanding?:()=>void;locked?:boolean;scanning?:boolean;scanProgress?:number};
/** 12UI candidate B and its converted map state: symbol legend, dominant map,
 * stable selected-contact footer. All map pixels and facts come from the game. */
export default function SurveyPanel({contacts,seed,water,type,target,sampledRegions,scienceSkill,onSelect,onOpenLanding,locked=false,scanning=false,scanProgress=0}:Props){
 const [artRevision,setArtRevision]=useState(0);
 useEffect(()=>{const ready=()=>setArtRevision(n=>n+1);window.addEventListener('terrain-art-ready',ready);return()=>window.removeEventListener('terrain-art-ready',ready);},[]);
 const canvas=useRef<HTMLCanvasElement>(null),[region,setRegion]=useState(false),[page,setPage]=useState(0),[list,setList]=useState(false),[legendOpen,setLegendOpen]=useState(false),[selectedId,setSelectedId]=useState<string|null>(null);
 const [visible,setVisible]=useState<Record<ContactKind,boolean>>({mineral:true,lifeform:true,ruin:true,installation:true,artifact:true});
 const filtered=locked?[]:contacts.filter(c=>visible[c.kind]),signature=JSON.stringify(filtered),selected=filtered.find(c=>c.id===selectedId)??null;
 const pages=Math.max(1,Math.ceil(filtered.length/4)),currentPage=Math.min(page,pages-1);
 const centerLon=region?target.lon:0,centerLat=region?Math.max(-85,Math.min(85,target.lat)):0,spanLon=region?20:360,spanLat=region?10:180;
 const project=(c:{lat:number;lon:number;uncertaintyKm?:number})=>({x:42+(wrapLongitude(c.lon-centerLon)+spanLon/2)/spanLon*636,y:16+(centerLat+spanLat/2-c.lat)/spanLat*304,radius:(c.uncertaintyKm??0)*.2/spanLon*636});
 useEffect(()=>{const c=canvas.current,box=c?.parentElement;if(!c||!box)return;const fit=()=>{const r=box.getBoundingClientRect(),scale=Math.max(0,Math.min(r.width/720,r.height/360));c.style.width=`${720*scale}px`;c.style.height=`${360*scale}px`;};const observer=new ResizeObserver(fit);observer.observe(box);fit();return()=>observer.disconnect();},[list,legendOpen]);
 useEffect(()=>{
  const c=canvas.current,ctx=c?.getContext('2d');if(!c||!ctx)return;
  ctx.clearRect(0,0,720,360);const terrain=planetTopography(seed,water,type,{lon:centerLon,lat:centerLat,spanLon,spanLat,width:960,height:480});ctx.fillStyle='#071927';ctx.fillRect(42,16,636,304);
  ctx.save();ctx.beginPath();ctx.rect(42,16,636,304);ctx.clip();
  if(terrain){ctx.imageSmoothingEnabled=true;ctx.drawImage(terrain,42,16,636,304);c.dataset.terrainArt=terrain.dataset.terrainArt;}
  ctx.fillStyle='rgba(0,15,23,.18)';ctx.fillRect(42,16,636,304);ctx.strokeStyle='rgba(133,222,230,.2)';ctx.lineWidth=1;
  for(let x=42;x<=678;x+=106){ctx.beginPath();ctx.moveTo(x,16);ctx.lineTo(x,320);ctx.stroke();}
  for(let y=16;y<=320;y+=76){ctx.beginPath();ctx.moveTo(42,y);ctx.lineTo(678,y);ctx.stroke();}
  ctx.restore();drawSurveyContacts(ctx,filtered,project,{x:42,y:16,width:636,height:304});
  const point=project(target);ctx.save();ctx.beginPath();ctx.rect(42,16,636,304);ctx.clip();ctx.strokeStyle='#61e5f4';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(point.x,point.y,8,0,2*Math.PI);ctx.moveTo(point.x-12,point.y);ctx.lineTo(point.x+12,point.y);ctx.moveTo(point.x,point.y-12);ctx.lineTo(point.x,point.y+12);ctx.stroke();
  if(selected){const p=project(selected);ctx.strokeStyle='#fff';ctx.beginPath();ctx.arc(p.x,p.y,9,0,2*Math.PI);ctx.stroke();}ctx.restore();
  ctx.fillStyle='#b9d5e4';ctx.font='12px Rajdhani,sans-serif';ctx.textAlign='right';
  for(let n=0;n<=4;n++)ctx.fillText((centerLat+spanLat/2-n*spanLat/4).toFixed(region?0:0),34,20+n*76);
  ctx.textAlign='center';for(let n=0;n<=6;n++)ctx.fillText((region?wrapLongitude(centerLon-spanLon/2+n*spanLon/6):(-180+n*60)).toFixed(0),42+n*106,340);
  if(scanning){const base=document.createElement('canvas');base.width=720;base.height=360;base.getContext('2d')!.drawImage(c,0,0);const started=performance.now();let frame=0;const animate=(now:number)=>{ctx.clearRect(0,0,720,360);ctx.drawImage(base,0,0);drawSensorSweep(ctx,{x:42,y:16,width:636,height:304},scanProgress+(now-started)/3000,now/1000);c.dataset.sensorSweep='active';frame=requestAnimationFrame(animate);};frame=requestAnimationFrame(animate);return()=>{cancelAnimationFrame(frame);delete c.dataset.sensorSweep;};}
 },[signature,region,seed,water,type,target.lat,target.lon,selectedId,locked,list,legendOpen,scanning,scanProgress,artRevision]);
 const selectNext=()=>{if(filtered.length)setSelectedId(filtered[(Math.max(-1,filtered.findIndex(c=>c.id===selectedId))+1)%filtered.length].id);};
 return <section className="survey-panel survey-map-workspace" aria-label="Recorded planetary survey" data-survey-locked={locked}>
  <header><p>{locked?'Scan and analyze this reading to reveal contact locations.':`${sampledRegions} sampled regions${scienceSkill!==undefined?` · Science ${scienceSkill}`:''} · unmarked areas are unexplored.`}</p><span data-survey-count={filtered.length}>{filtered.length} known contacts</span></header>
  <div className="survey-map-toolbar"><div role="group" aria-label="Map extent"><button aria-pressed={!region} onClick={()=>setRegion(false)}>Whole planet</button><button aria-pressed={region} onClick={()=>setRegion(true)}>Landing region</button></div><div><button aria-pressed={list} onClick={()=>{setList(!list);setLegendOpen(false);}}>{list?'Show map':'Contact list'}</button><button className="survey-mobile-legend-button" aria-pressed={legendOpen} onClick={()=>setLegendOpen(!legendOpen)}>{legendOpen?'Close legend':'Legend'}</button></div></div>
  <div className="survey-map-layout" data-legend-open={legendOpen}>
   <aside className="survey-symbol-key" aria-label="Contact categories">{CONTACT_KINDS.map(k=><button key={k} aria-pressed={visible[k]} onClick={()=>{setVisible({...visible,[k]:!visible[k]});setPage(0);}}><b style={{color:CONTACT_COLORS[k]}}>{keyArt[k]?<img src={keyArt[k]} alt=""/>:CONTACT_SYMBOLS[k]}</b><span>{CONTACT_NAMES[k]}</span><small>{locked?'—':contacts.filter(c=>c.kind===k).length}</small></button>)}<p>◌ Approximate location<br/>Markers use this legend; select one for details.</p></aside>
   <div className="survey-map-area">
    {list?<div className="survey-contact-page"><ol>{filtered.slice(currentPage*4,currentPage*4+4).map(c=><li key={c.id}><button data-contact-id={c.id} onClick={()=>{setSelectedId(c.id);setList(false);}}><b style={{color:CONTACT_COLORS[c.kind]}}>{CONTACT_SYMBOLS[c.kind]}</b><span>{c.label}<small>{contactCoordinates(c)}{c.uncertaintyKm?' · approximate':''}</small></span></button></li>)}</ol>{!filtered.length&&<p>No recorded contacts available in these categories.</p>}<nav aria-label="Contact pages"><button disabled={currentPage===0} onClick={()=>setPage(currentPage-1)}>Previous</button><span>{currentPage+1} / {pages}</span><button disabled={currentPage+1>=pages} onClick={()=>setPage(currentPage+1)}>Next</button></nav></div>:
     <div className="survey-canvas-fit"><canvas ref={canvas} width={720} height={360} data-survey-contacts={signature} data-planet-seed={seed} aria-label={region?'Landing region with recorded findings':'Whole planet with recorded findings'} tabIndex={0} onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();selectNext();}}} onClick={e=>{const box=e.currentTarget.getBoundingClientRect(),x=(e.clientX-box.left)/box.width*720,y=(e.clientY-box.top)/box.height*360;
      const hit=filtered.map(c=>({c,d:Math.hypot(project(c).x-x,project(c).y-y)})).sort((a,b)=>a.d-b.d)[0];
      if(hit&&hit.d<=16)setSelectedId(hit.c.id);else if(onSelect&&x>=42&&x<=678&&y>=16&&y<=320)onSelect({lon:wrapLongitude(centerLon+((x-42)/636-.5)*spanLon),lat:Math.max(-89.9,Math.min(89.9,centerLat+(.5-(y-16)/304)*spanLat))});
     }}/></div>}
   </div>
  </div>
  <footer className="survey-selected-contact" role="region" aria-label="Selected survey contact"><div><b style={{color:selected?CONTACT_COLORS[selected.kind]:'#a2c6d6'}}>{selected?`${CONTACT_SYMBOLS[selected.kind]} ${selected.label}`:'Select a map symbol'}</b><small>{selected?`${contactCoordinates(selected)} · ${selected.uncertaintyKm?`Search within ${selected.uncertaintyKm.toFixed(1)} km`:'Position confirmed'}`:locked?'Locations stay hidden until scan and analysis complete.':'Contact details appear here without changing the map size.'}</small>{selected&&<small>{selected.source==='surface'?'Rover observation':selected.source==='artifact'?'Artifact-assisted detection':'Orbital analysis'}{selected.kind==='lifeform'?' · last observed position':''}</small>}</div><div className="survey-contact-actions"><button disabled={!filtered.length} onClick={selectNext}>Next contact</button>{onSelect&&<button disabled={!selected} onClick={()=>{if(selected){onSelect(selected);setRegion(true);}}}>Set landing site</button>}{onOpenLanding&&<button onClick={onOpenLanding}>Open landing map</button>}</div></footer>
 </section>;
}

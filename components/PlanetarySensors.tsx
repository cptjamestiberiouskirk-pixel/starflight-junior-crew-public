import React,{useState} from 'react';
import SurveyPanel from './SurveyPanel';
import ScienceCompositionArt from './ScienceCompositionArt';
import ScienceFieldArt from './ScienceFieldArt';
import ScienceShipArt,{type ScienceOutfitting} from './ScienceShipArt';
import {scienceContacts} from '../utils/science-visibility';
import type {PlanetSurfaceState} from '../surface';
import type {StarPlanet} from '../galaxy';
import {PLANET_SCAN_SECONDS,scanReady,planetMassTons,planetAnalysisFields,type PlanetaryScanState} from '../utils/planet-scans';
const scienceIcons={mass:new URL('../assets/ui/science/cards/mass-icon.png',import.meta.url).href,bio:new URL('../assets/ui/science/cards/bio-icon.png',import.meta.url).href,mineral:new URL('../assets/ui/science/cards/mineral-icon.png',import.meta.url).href,atmosphere:new URL('../assets/ui/science/cards/atmosphere-icon.png',import.meta.url).href,hydrosphere:new URL('../assets/ui/science/cards/hydrosphere-icon.png',import.meta.url).href,lithosphere:new URL('../assets/ui/science/cards/lithosphere-icon.png',import.meta.url).href};
const analysisIcons={object:new URL('../assets/ui/science/cards/object-icon.png',import.meta.url).href,surface:new URL('../assets/ui/science/cards/surface-icon.png',import.meta.url).href,gravity:new URL('../assets/ui/science/cards/gravity-icon.png',import.meta.url).href,density:new URL('../assets/ui/science/cards/density-icon.png',import.meta.url).href,temperature:new URL('../assets/ui/science/cards/temperature-icon.png',import.meta.url).href,weather:new URL('../assets/ui/science/cards/weather-icon.png',import.meta.url).href};
type Props={planet:StarPlanet;scan:PlanetaryScanState|null;onScan:()=>void;onAnalyze:()=>void;officer?:{name:string;alive:boolean;vitality:number;skills:{science:number}};sensorHealth:number;planetImage?:string;surface?:PlanetSurfaceState;planetSeed:number;target:{lat:number;lon:number};onSelect:(c:{lat:number;lon:number})=>void;onOpenLanding:()=>void;shipStatus?:{hull:number;shields:number;armor:number;fuel:number};outfitting?:ScienceOutfitting};
/** Converted 12UI candidate B shell and matching Readings/Analysis branch states.
 * One task per tab replaces the former vertically stacked panels. */
export default function PlanetarySensors({planet:p,scan,onScan,onAnalyze,officer,sensorHealth,planetImage,surface,planetSeed,target,onSelect,onOpenLanding,shipStatus,outfitting}:Props){
 const [tab,setTab]=useState('Survey map'),ready=scanReady(scan),busy=!!scan&&!ready,analyzed=ready&&!!scan?.analysis,conscious=!!officer?.alive&&officer.vitality>0;
 const [compositionTab,setCompositionTab]=useState('Atmosphere');
 const composition=[{label:'Atmosphere',category:'atmosphere' as const,items:p.gases},{label:'Hydrosphere',category:'hydrosphere' as const,items:[p.hydrosphereCompound||'None']},{label:'Lithosphere',category:'lithosphere' as const,items:p.minerals.map(m=>m.name)}];
 const confirmedSurface=analyzed&&scan!.analysis!.known[0]?planetAnalysisFields(p)[0].value:null;
 return <section className="planetary-sensors science-workspace" aria-label="Planetary sensors" data-science-view={tab}>
  <header className="science-workspace-heading"><div>{planetImage&&<img src={planetImage} alt=""/>}<div><small>SCIENCE / ORBIT {p.slot}</small><h3>{p.name}</h3><p>{conscious?`${officer!.name} · Science ${officer!.skills.science}`:'No conscious Science Officer assigned'}</p></div></div><div className="science-main-actions"><button onClick={onScan} disabled={busy||sensorHealth<=0}>{scan?'Rescan planet':'Scan planet'}</button><button onClick={onAnalyze} disabled={!ready||analyzed||!conscious}>Analyze reading</button><button onClick={onOpenLanding}>Landing map</button></div></header>
  <div className="science-workspace-progress"><progress aria-label="Planetary scan progress" value={scan?.elapsed??0} max={PLANET_SCAN_SECONDS}/><span role="status">{sensorHealth<=0?'Sensors inoperative':busy?`Scanning ${Math.round(scan!.elapsed/PLANET_SCAN_SECONDS*100)}%`:analyzed?'Analysis complete':ready?'Reading complete · analyze to locate contacts':'Ready to scan'}</span></div>
  <div role="tablist" aria-label="Science views" className="science-view-tabs">{['Survey map','Readings','Analysis','Ship status'].map(t=><button key={t} id={'science-tab-'+t.replaceAll(' ','-')} role="tab" aria-selected={tab===t} aria-controls="science-tab-content" tabIndex={tab===t?0:-1} onClick={()=>setTab(t)} onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const tabs=['Survey map','Readings','Analysis','Ship status'];const next=tabs[(tabs.indexOf(t)+(e.key==='ArrowRight'?1:3))%4];setTab(next);requestAnimationFrame(()=>document.getElementById('science-tab-'+next.replaceAll(' ','-'))?.focus());}}}>{t}</button>)}</div>
  <div id="science-tab-content" role="tabpanel" aria-labelledby={'science-tab-'+tab.replaceAll(' ','-')} className="science-tab-content">
   {tab==='Survey map'&&<SurveyPanel contacts={scienceContacts(surface,scan)} seed={planetSeed} water={p.hydrospherePercent} type={p.type} target={target} sampledRegions={analyzed?surface?.survey?.sampledRegions??0:0} scienceSkill={analyzed?surface?.survey?.scienceSkill:undefined} onSelect={onSelect} locked={!analyzed} scanning={busy} scanProgress={(scan?.elapsed??0)/PLANET_SCAN_SECONDS}/>}
   {tab==='Readings'&&<div className="science-reading-view science-illustrated-readings"><dl className="science-metrics"><div><img className="science-metric-icon" src={scienceIcons.mass} alt=""/><dt>Mass</dt><dd>{ready?planetMassTons(p.mass):'Awaiting reading'}</dd></div><div><img className="science-metric-icon" src={scienceIcons.bio} alt=""/><dt>Bio density</dt><dd>{ready?`${p.bioDensity}%`:'—'}</dd></div><div><img className="science-metric-icon" src={scienceIcons.mineral} alt=""/><dt>Mineral density</dt><dd>{ready?`${p.mineralDensity}%`:'—'}</dd></div></dl><div className="science-composition-switches" role="group" aria-label="Composition cards">{composition.map(c=><button key={c.label} type="button" aria-pressed={compositionTab===c.label} onClick={()=>setCompositionTab(c.label)}>{c.label}</button>)}</div><div className="science-composition-cards">{composition.map(c=><article key={c.label} data-science-composition={c.category} data-composition-selected={compositionTab===c.label}>
    <ScienceCompositionArt category={c.category} names={c.items} revealed={ready} confirmedSurface={confirmedSurface}/>
    <div className="science-card-copy"><h4><img src={scienceIcons[c.category]} alt=""/>{c.label}</h4>{ready?<ul>{(c.items.length?c.items:['None']).map((s,i)=><li key={i}>{s}</li>)}</ul>:<p>Awaiting reading</p>}</div>
    {ready&&<small className="science-sample-caption">Composition sample</small>}
   </article>)}</div><p className="science-reading-note">Densities are relative. Composition is ordered by abundance; individual compound percentages are unknown.</p></div>}
   {tab==='Analysis'&&<div className="science-analysis-view science-illustrated-analysis"><h4>SCIENCE OFFICER ANALYSIS</h4><dl><div className="science-analysis-card"><ScienceFieldArt field="object" known={analyzed} value={analyzed?`Planet / ${p.slot}`:''} planetImage={planetImage}/><dt><img src={analysisIcons.object} alt=""/>Object / orbit</dt><dd>{analyzed?`Planet / ${p.slot}`:'Awaiting analysis'}</dd></div>{planetAnalysisFields(p).map((f,i)=>{
    const field=(['surface','gravity','density','temperature','weather'] as const)[i],known=analyzed&&!!scan!.analysis!.known[i];
    return <div key={f.label} className="science-analysis-card" data-science-analysis-field={field} data-science-confirmed={known}>
     <ScienceFieldArt field={field} known={known} value={known?f.value:''} planetImage={planetImage} confirmedSurface={confirmedSurface}/>
     <dt><img src={analysisIcons[field]} alt=""/>{f.label}</dt><dd className={analyzed&&!known?'uncertain':''}>{analyzed?(known?f.value:'Not certain'):'Awaiting analysis'}</dd>
    </div>;
   })}</dl><p>Interpretation depends on the assigned officer’s Science skill. Uncertain fields are not confirmed facts.</p></div>}
   {tab==='Ship status'&&<div className="science-analysis-view science-illustrated-status"><h4>SHIP STATUS</h4><dl>{Object.entries({Hull:shipStatus?.hull??0,Shields:shipStatus?.shields??0,Armor:shipStatus?.armor??0,'Endurium fuel':`${shipStatus?.fuel.toFixed(1)??'0'} m³`,Sensors:`${sensorHealth}%`}).map(([k,v])=><div key={k} className="science-analysis-card" data-science-status-field={k}>
    <ScienceShipArt field={k as 'Hull'|'Shields'|'Armor'|'Endurium fuel'|'Sensors'} outfitting={outfitting} hull={shipStatus?.hull??0} shields={shipStatus?.shields??0} sensorHealth={sensorHealth} planetImage={planetImage}/>
    <dt>{k}</dt><dd>{v}</dd>
    {k==='Armor'&&outfitting&&<small className="science-status-caption">Class {outfitting.armorClass} · {outfitting.armorClass*20}% hull skin</small>}
    {k==='Shields'&&outfitting&&<small className="science-status-caption">{outfitting.shieldClass===0?'Not installed':shipStatus?.shields===0?'Depleted':outfitting.shieldsRaised?'Raised':'Standby'}</small>}
   </div>)}</dl></div>}
  </div>
 </section>;
}

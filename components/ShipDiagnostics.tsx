import React,{useId,useState} from 'react';
import {shipConfigurationURL,type ShipVisualConfig} from '../utils/ship-art';
import {diagnosticStatus,type DiagnosticKey} from '../utils/ship-diagnostics';
type Props={config:ShipVisualConfig&{engineClass:number;shieldClass:number};hull:number;health:Record<Exclude<DiagnosticKey,'Hull'>,number>;inoperative:Partial<Record<DiagnosticKey,boolean>>};
const zones:Record<Exclude<DiagnosticKey,'Hull'>,number[][]>={Engines:[[40,230,95,145]],Sensors:[[995,265,85,95]],Comms:[[868,205,124,63]],Shields:[[145,240,190,120]],Lasers:[[150,0,300,65],[150,537,300,65]],Missiles:[[120,65,290,85],[120,452,290,85]]};
export default function ShipDiagnostics({config,hull,health,inoperative}:Props){
 const id=useId().replaceAll(':',''),[selected,setSelected]=useState<DiagnosticKey>('Hull');
 const installed=(k:DiagnosticKey)=>k==='Lasers'?config.laserClass>0:k==='Missiles'?config.missileClass>0:k==='Shields'?config.shieldClass>0:true;
 const status=(k:DiagnosticKey)=>diagnosticStatus(k==='Hull'?hull/250*100:health[k],!!inoperative[k],installed(k));
 const image=shipConfigurationURL(config),active=status(selected);
 return <section className="ship-diagnostics" aria-label="Ship subsystem schematic">
  <header><strong>SHIP SYSTEMS • LIVE DIAGNOSTICS</strong><span>Installed configuration · fore →</span></header>
  <svg viewBox="-20 -30 1127 662" role="img" aria-label="Original ship silhouette with subsystem health overlays">
   <defs><mask id={id+'-skin'}><image href={image} x="0" y="0" width="1087" height="602"/></mask>
    <filter id={id+'-edge'}><feMorphology in="SourceAlpha" operator="dilate" radius="3" result="grow"/><feComposite in="grow" in2="SourceAlpha" operator="out" result="edge"/><feFlood floodColor={status('Hull').color}/><feComposite in2="edge" operator="in"/></filter></defs>
   <image href={image} width="1087" height="602" opacity=".38"/>
   <image href={image} width="1087" height="602" filter={`url(#${id}-edge)`}/>
   <g mask={`url(#${id}-skin)`}>{(Object.keys(zones) as Exclude<DiagnosticKey,'Hull'>[]).map(k=><g key={k} data-system={k} data-status={status(k).state} fill={status(k).color} opacity={selected===k ? .8 : .28}>{zones[k].map(([x,y,w,h],i)=><rect key={i} x={x} y={y} width={w} height={h}/>)}</g>)}</g>
   {(Object.keys(zones) as Exclude<DiagnosticKey,'Hull'>[]).map((k,i)=>{const [x,y,w,h]=zones[k][0];return <g key={k}><title>{`${k}: ${status(k).state}, ${status(k).health}%`}</title><circle cx={x+w/2} cy={y+h/2} r="14" fill="#061321" stroke={status(k).color} strokeWidth="3"/><text x={x+w/2} y={y+h/2+6} textAnchor="middle" fill={status(k).color} fontSize="18" fontWeight="bold">{i+1}</text></g>;})}
  </svg>
  <div className="diagnostic-key">{(['Hull',...Object.keys(zones)] as DiagnosticKey[]).map((k,i)=>{const s=status(k);return <button key={k} onClick={()=>setSelected(k)} aria-pressed={selected===k} data-system={k} data-status={s.state} style={{borderColor:s.color,color:s.color}}>{i>0?`${i}. `:''}{k}<small>{s.state==='Not fitted'?'Not fitted':`${Math.round(s.health)}% · ${s.state}`}</small></button>;})}</div>
  <p role="status"><strong style={{color:active.color}}>{selected}: {active.state}</strong>{installed(selected)?` · ${active.health.toFixed(0)}% integrity${inoperative[selected]?' · malfunction flag active':''}`:' · no installed unit to damage or repair'}</p>
  <p className="diagnostic-note">Green: nominal · Amber: damaged · Red: inoperative · Gray: not fitted. Locations are functional service zones, not individual impact coordinates.</p>
 </section>;
}

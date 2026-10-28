import React from 'react';
import type {MineralDeposit} from '../surface';
import {MINING_RANGE,type MiningSession} from '../utils/mining';

interface Props {
  deposits:MineralDeposit[];x:number;y:number;used:number;fuel:number;selectedId:string|null;
  session:MiningSession|null;lastExtracted:number;message:string;onSelect:(id:string)=>void;onStart:()=>void;
  onReturn:()=>void;canReturn:boolean;onStop:()=>void;onApproach:(target:MineralDeposit)=>void;onClose:()=>void;
}
/** Candidate C's mining strip, fitted around the existing six terrain commands. */
export default function MiningConsole(p:Props) {
  const nearby=p.deposits.filter(d=>!d.taken&&d.volume>0).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));
  const target=nearby.find(d=>d.id===p.selectedId)??nearby[0];
  const distance=target?Math.hypot(target.x-p.x,target.y-p.y):0;
  const inRange=!!target&&distance<=MINING_RANGE;
  return <section className="mining-console" aria-label="Mining console">
    <div className="mining-heading"><strong>MINING LASER</strong><button aria-label="Close mining console" onClick={p.onClose}>Close ×</button></div>
    <div className="mining-layout">
      <div className="mining-main">
        <div className="mining-source">
          <img src="assets/images/mining-selected-cutout-81.png" alt="" width="48" height="40"/>
          <div><span className="mining-label">SELECTED DEPOSIT</span><strong>{target?.name??'No deposits detected'}</strong></div>
          <div className="mining-distance">{target?`${distance.toFixed(1)} km`:'—'}<small>{inRange?'Within laser range':target?'Approach to 6 km':'Scan or explore the surface'}</small></div>
        </div>
        <div className="mining-actions">
          <button className="mining-start" onClick={p.onStart} disabled={!inRange||!!p.session||p.used>=49.95||p.fuel<=0}>Start mining <kbd>G</kbd></button>
          <button className="mining-stop" onClick={p.onStop} disabled={!p.session}>Stop mining <kbd>G</kbd></button>
          {target&&!inRange&&<button className="mining-approach" disabled={p.fuel<=0} onClick={()=>p.onApproach(target)}>Approach deposit</button>}
          <button className="mining-approach" onClick={p.onReturn} disabled={!p.canReturn}>Return to ship</button>
        </div>
        <div className="mining-readouts">
          <div className="mining-hold"><span>ROVER HOLD <strong>{p.used.toFixed(1)} / 50 m³</strong></span><meter aria-label="Rover hold capacity" min={0} max={50} value={p.used}/></div>
          <div className="mining-extracted"><span>EXTRACTED</span><strong>{(p.session?.extracted??p.lastExtracted).toFixed(1)} m³</strong></div>
        </div>
        <p className="mining-status" role="status">{p.session?`Cutting ${target?.name??'deposit'} · ${target?.volume.toFixed(1)??'0'} m³ remaining`:p.message||'Select a deposit, approach if needed, then start. Movement stops the laser.'}</p>
      </div>
      <div className="mining-targets" aria-label="Nearby mineral deposits">
        <span className="mining-label">NEARBY DEPOSITS</span>
        {nearby.slice(0,4).map(d=><button key={d.id} aria-pressed={target?.id===d.id} disabled={!!p.session} onClick={()=>p.onSelect(d.id)}><span>{d.name}<small>{d.volume.toFixed(1)} m³</small></span><strong>{Math.hypot(d.x-p.x,d.y-p.y).toFixed(1)} km</strong></button>)}
        {!nearby.length&&<p>No uncollected deposits in this survey region.</p>}
      </div>
    </div>
  </section>;
}

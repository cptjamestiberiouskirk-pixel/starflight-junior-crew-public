import React from 'react';
type Part={name:string;mass:number;buy:number;power?:number;shield?:number;armor?:number;damage?:number};
export default function UpgradeComparison({kind,current,next,level}:{kind:string;current?:Part;next?:Part;level:number}){
  if(!next)return null;
  const stat=kind==='engines'?'power':kind==='shielding'?'shield':kind==='armor'?'armor':'damage';
  const label={power:'Drive power',shield:'Shield capacity',armor:'Armor capacity',damage:'Damage'}[stat];
  return <dl className="upgrade-comparison" aria-label={`${kind} upgrade comparison`}>
    <div><dt>{label}</dt><dd>{current?.[stat]??0} <span aria-label="becomes">→</span> <strong>{next[stat]}</strong></dd></div>
    <div><dt>Mass (t)</dt><dd>{current?.mass??0} → <strong>{next.mass}</strong></dd></div>
    {kind==='armor'&&<div><dt>Hull coverage</dt><dd>{level*20}% → <strong>{(level+1)*20}%</strong></dd></div>}
    <div><dt>Purchase</dt><dd>{next.buy.toLocaleString()} M.U.</dd></div>
  </dl>;
}

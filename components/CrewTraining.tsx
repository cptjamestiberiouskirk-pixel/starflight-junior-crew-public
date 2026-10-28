import React from 'react';
import type {CrewMember,RaceSpec,Skills} from '../App';
import {TRAINING_SKILLS,planCrewTraining} from '../utils/personnel';
interface Props {crew:CrewMember;spec:RaceSpec;credits:number;selected:(keyof Skills)[];onSelect:(skills:(keyof Skills)[])=>void;onTrain:()=>void;onClose:()=>void;message:string|null}
export default function CrewTraining(p:Props){
 const plan=planCrewTraining(p.crew,p.spec,p.selected,p.credits);
 return <section role="dialog" aria-modal="true" aria-labelledby="crew-training-heading" className="w-full max-w-md glass-panel border-2 border-cyan-500 rounded-3xl p-4 shadow-2xl flex flex-col gap-2 text-slate-100">
  <div className="flex items-start justify-between gap-2 border-b border-cyan-900 pb-2"><h3 id="crew-training-heading" className="text-base font-black text-cyan-300">VR ACADEMY · {p.crew.name}</h3><button aria-label="Close training" onClick={p.onClose} className="min-h-9 min-w-9 text-slate-300">×</button></div>
  <p className="text-xs text-slate-300">Choose one or more categories. Each costs 300 M.U. and adds up to {p.spec.learningRate} points, within species limits.</p>
  <fieldset className="space-y-2"><legend className="sr-only">Training categories</legend>{TRAINING_SKILLS.map(skill=>{
   const cur=p.crew.skills[skill],max=p.spec.maxSkills[skill],locked=!p.crew.alive||!p.spec.canTrain||max<=cur||max===0;
   return <label key={skill} className={`flex items-center gap-3 p-2 border rounded-xl min-h-11 ${locked?'border-slate-800 text-slate-500':'border-cyan-800 bg-cyan-950/60 text-white cursor-pointer'}`}>
    <input type="checkbox" aria-label={`Train ${skill}`} checked={p.selected.includes(skill)} disabled={locked} onChange={e=>p.onSelect(e.target.checked?[...p.selected,skill]:p.selected.filter(s=>s!==skill))} className="accent-cyan-400 w-4 h-4 shrink-0"/>
    <span className="flex-1 capitalize text-xs font-bold">{skill}<small className="block text-slate-400 font-normal">{cur} / {max}</small></span><span className="text-xs font-mono text-yellow-300">{locked?'At limit':`${cur} → ${Math.min(max,cur+p.spec.learningRate)}`}</span>
   </label>;
  })}</fieldset>
  <div className="flex justify-between gap-2 text-xs font-mono"><span>{plan.skills.length} selected</span><strong className="text-amber-300">Total: {plan.cost.toLocaleString()} M.U.</strong></div>
  <p role="status" className="text-xs text-slate-300">{p.message??(plan.error&&p.selected.length?plan.error:`Available: ${p.credits.toLocaleString()} M.U.`)}</p>
  <div className="flex gap-2"><button onClick={p.onClose} className="flex-1 min-h-11 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs">Cancel Training</button><button disabled={!!plan.error} onClick={p.onTrain} className="flex-1 min-h-11 rounded-xl bg-cyan-600 text-white font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed">Train selected</button></div>
 </section>;
}

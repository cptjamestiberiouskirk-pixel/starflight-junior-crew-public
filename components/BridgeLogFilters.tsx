import React from 'react';
import type {BridgeFilter} from '../utils/personnel';
interface Props {type:BridgeFilter;search:string;onType:(value:BridgeFilter)=>void;onSearch:(value:string)=>void;count:number;total:number;prefix:string}
export default function BridgeLogFilters(p:Props){return <div className="space-y-1.5 text-[11px] mb-2" role="group" aria-label={`${p.prefix} filters`}>
 <div className="flex gap-2 min-w-0"><label className="min-w-0 flex-1"><span className="sr-only">{p.prefix} category</span><select aria-label={`${p.prefix} category`} value={p.type} onChange={e=>p.onType(e.target.value as BridgeFilter)} className="w-full min-h-9 rounded-lg border border-cyan-900 bg-slate-950 px-2 text-cyan-200"><option value="all">All messages</option><option value="info">Bridge updates</option><option value="alert">Alerts</option><option value="banter">Crew banter</option></select></label><button disabled={p.type==='all'&&!p.search} onClick={()=>{p.onType('all');p.onSearch('');}} className="text-cyan-300 disabled:opacity-40 min-h-9 px-2">Reset</button></div>
 <label className="block"><span className="sr-only">{p.prefix} search</span><input aria-label={`${p.prefix} search`} type="search" value={p.search} onChange={e=>p.onSearch(e.target.value)} placeholder="Search messages or speaker…" className="w-full min-h-9 rounded-lg border border-slate-700 bg-slate-950 px-2 text-slate-100"/></label>
 <p className="text-slate-400">{p.count} of {p.total} messages</p>
</div>;}

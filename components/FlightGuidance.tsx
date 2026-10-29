import React,{useState} from 'react';
import {nextActionHint,type HintContext} from '../utils/presentation-polish';
export default function FlightGuidance(props:HintContext){
  const [open,setOpen]=useState(false);
  return <aside className="flight-guidance" aria-label="Optional crew guidance">
    <button type="button" aria-expanded={open} aria-controls="crew-guidance-copy" onClick={()=>setOpen(v=>!v)}>{open?'Hide guidance':'Crew guidance'}</button>
    {open&&<p id="crew-guidance-copy" role="status">{nextActionHint(props)}</p>}
  </aside>;
}

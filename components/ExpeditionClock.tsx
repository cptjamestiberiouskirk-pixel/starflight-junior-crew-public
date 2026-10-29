import React from 'react';
import {Clock} from 'lucide-react';

/** Display the existing saved stardate/hour. No independent clock or time state. */
export default function ExpeditionClock({value}:{value:string}){
  return <span data-expedition-clock role="timer" aria-live="off" aria-label={`Expedition clock: ${value}`} className="expedition-clock">
    <Clock size={17} aria-hidden="true" className="text-cyan-400 shrink-0"/>
    <span className="expedition-clock-copy">
      <strong>Expedition clock</strong>
      <span>{value}</span>
    </span>
  </span>;
}

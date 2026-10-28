import React from 'react';
import {CONTACT_KINDS,CONTACT_COLORS,CONTACT_SYMBOLS,CONTACT_NAMES} from '../utils/planet-survey';
import {ELEVATION_COLORS} from '../utils/planet-topography';
export default function SurveyLegend(){return <div className="survey-legend" aria-label="Map legend"><span>CONTACTS</span>{CONTACT_KINDS.map(k=><span key={k}><b style={{color:CONTACT_COLORS[k]}}>{CONTACT_SYMBOLS[k]}</b> {CONTACT_NAMES[k]}</span>)}<span>◌ Dashed halo: approximate search area</span><span>TERRAIN</span>{Object.entries(ELEVATION_COLORS).map(([k,c])=><span key={k}><i style={{background:c}}/>{k}</span>)}</div>;}

import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup as render} from 'react-dom/server';
import ScienceFieldArt from './components/ScienceFieldArt';
import ScienceShipArt from './components/ScienceShipArt';
export function runScienceCardArtTests(){
 let passed=0;const check=(condition:unknown,message:string)=>{assert(condition,message);passed++;};
 const values={object:'Planet / 6',surface:'Ice',gravity:'0.96 g',density:'Very Thin',temperature:'Sub-Arctic',weather:'None'};
 for(const [field,value] of Object.entries(values)){
  const props={field:field as keyof typeof values,value,planetImage:'private-planet.png'};
  const hidden=render(<ScienceFieldArt {...props} known={false}/>);
  check(!hidden.includes('private-planet')&&!hidden.includes(value)&&hidden.includes('unresolved'),'Unconfirmed artwork reveals no planet or value');
  const known=render(<ScienceFieldArt {...props} known/>);
  check(known.includes('private-planet')===(field==='object'),'Only object uses the planet portrait');
  if(!['object','surface'].includes(field))check(known.includes('<svg')&&!known.includes('<img'),'Instrument cards have distinct vector scenes, not repeated photos');
 }
 const outfitting={cargoPods:8,armorClass:5,laserClass:3,missileClass:4,shieldClass:3,shieldsRaised:false};
 const status=(field:Parameters<typeof ScienceShipArt>[0]['field'],patch={})=>render(<ScienceShipArt field={field} outfitting={outfitting} hull={250} shields={2500} sensorHealth={100} {...patch}/>);
 for(const field of ['Hull','Shields','Armor','Endurium fuel','Sensors'] as const){
  const html=status(field);check(html.includes('<canvas')===(field==='Hull'),'Only hull renders the complete configured ship');
  check(!html.includes('science-instrument-planet'),'Ship diagnostics never recycle the planet portrait');
 }
 check(status('Shields').includes('data-science-shield-state="standby"'),'Stored shield points do not imply shields raised');
 check(status('Shields',{shields:0}).includes('data-science-shield-state="depleted"'),'Zero shields are depleted');
 check(status('Shields',{outfitting:{...outfitting,shieldClass:0}}).includes('data-science-shield-state="not-installed"'),'No shield equipment stays not installed');
 check(status('Sensors',{sensorHealth:0}).includes('science-sensor-offline'),'Sensor dish respects disabled sensors');
 check(status('Endurium fuel',{fuel:0}).includes('data-science-fuel-state="empty"'),'Empty tank does not show fuel crystals');
 check(status('Endurium fuel',{fuel:20}).includes('data-science-fuel-state="available"'),'Fuel cell reflects available Endurium without inventing tank capacity');
 return {passed,failed:0,results:[]};
}

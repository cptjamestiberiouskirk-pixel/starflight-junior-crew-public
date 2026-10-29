import React,{useEffect,useState,type ReactNode} from 'react';
import {voiceEngine,getBanterLineHash} from '../voice';
type Message={id:string;text:string;speaker?:string;post?:string};
export default function CrewTransmission({messages,portrait}:{messages:Message[];portrait:(speaker:string)=>ReactNode}){
  const [hash,setHash]=useState<string|null>(null);
  useEffect(()=>{const update=()=>setHash(voiceEngine.getCurrentCrewHash());update();const timer=window.setInterval(update,125);return()=>window.clearInterval(timer);},[]);
  const message=hash?messages.find(m=>getBanterLineHash(m.text)===hash):undefined;
  if(!message)return null;
  return <section className="crew-transmission" aria-label="Current crew transmission">
    <div className="transmitting-portrait">{portrait(message.speaker??'')}</div>
    <div><strong>{message.speaker||message.post||'Crew'}</strong><p>{message.text}</p></div>
  </section>;
}

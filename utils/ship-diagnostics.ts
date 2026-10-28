export type DiagnosticKey='Hull'|'Engines'|'Sensors'|'Comms'|'Shields'|'Missiles'|'Lasers';
export function diagnosticStatus(health:number,inoperative=false,installed=true){
  const hp=Math.max(0,Math.min(100,Number.isFinite(health)?health:0));
  const state=!installed?'Not fitted':inoperative||hp<=0?'Inoperative':hp<100?'Degraded':'Nominal';
  return {health:hp,state,color:state==='Not fitted'?'#7891a6':state==='Inoperative'?'#fb7185':state==='Degraded'?'#fbbf24':'#34d399'};
}

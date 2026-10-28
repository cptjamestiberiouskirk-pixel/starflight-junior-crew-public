import assert from 'node:assert/strict';
import {UNIVERSE} from './galaxy';
import {beginPlanetScan,advancePlanetScan,analyzePlanetScan,scanReady,scanPlanetKey,planetMassTons,planetAnalysisFields,validPlanetScan} from './utils/planet-scans';
import {encodeSaveToBase64,decodeSaveFromBase64,type ExportSavePayload} from './utils/save-codec';
import fixture from './test-fixtures/commissioned-mission.json';
export function runPlanetScanTests() {
  let passed=0;const check=(v:unknown,label:string)=>{assert(v,label);passed++;};
  const officer={alive:true,vitality:100,skills:{science:50}};
  const key=scanPlanetKey(1,2), initial=beginPlanetScan(key);
  check(analyzePlanetScan(null,officer)===null,'Analysis requires a current sensor reading');
  check(analyzePlanetScan(initial,officer)===null,'An unfinished sweep cannot be analyzed');
  check(advancePlanetScan(initial,2,true)===initial,'Pause freezes the sweep');
  check(advancePlanetScan(initial,NaN)===initial&&advancePlanetScan(initial,-2)===initial,'Invalid elapsed time cannot advance a sweep');
  const partial=advancePlanetScan(initial,1.2),ready=advancePlanetScan(partial,20);
  check(!scanReady(partial)&&scanReady(ready)&&ready.elapsed===3,'The sweep completes once and clamps its clock');
  check(advancePlanetScan(ready,1)===ready,'A completed reading does not change during idle frames');
  check(analyzePlanetScan(ready,undefined)===null,'An unassigned reserve officer cannot analyze');
  check(analyzePlanetScan(ready,{...officer,alive:false})===null&&analyzePlanetScan(ready,{...officer,vitality:0})===null,'Dead or incapacitated officers cannot analyze');
  let roll=0;const analyzed=analyzePlanetScan(ready,officer,()=>[0,.245,.25,.5,.995][roll++])!;
  check(analyzed.analysis?.known.join(',')==='true,true,false,false,false','Five fields roll independently at the original 0 through 199 threshold');
  check(analyzePlanetScan(analyzed,officer)===null,'Analysis consumes its reading; rescan before another attempt');
  for(const skill of [0,200,250])check(analyzePlanetScan(ready,{...officer,skills:{science:skill}},()=>.999)!.analysis!.known.every(v=>v===(skill>=200)),`Science ${skill} respects original certainty limits`);
  check(planetMassTons(5000)==='5 × 10^21 tons'&&planetMassTons(1)==='1 × 10^18 tons','Recovered mass units are converted to tons without changing data');
  const gap=UNIVERSE.stars.flatMap(s=>s.planets).find(p=>p.slot!==p.orderIndex+1)!;
  check(!!gap&&scanPlanetKey(99,gap.slot)!==scanPlanetKey(99,gap.orderIndex+1),'Raw orbit slots preserve gaps in the original planetary order');
  const p=UNIVERSE.stars[0].planets[0];
  check(planetAnalysisFields({...p,type:'Gas Giant'})[0].value==='Gas'&&planetAnalysisFields({...p,type:'Crystal'})[0].value==='Unknown','Gas and crystal worlds retain original surface descriptions');
  check(validPlanetScan(partial,key)&&!validPlanetScan(partial,'2:2'),'A reading belongs to exactly one planet');
  for(const bad of [{...partial,elapsed:-1},{...partial,elapsed:4},{...partial,analysis:{known:[true,true,true,true,true]}},{...ready,analysis:{known:[true]}},{...ready,analysis:{known:['yes',true,true,true,true]}}])check(!validPlanetScan(bad,key),'Malformed or premature scan data is rejected');
  const save=structuredClone(fixture) as ExportSavePayload;
  check(!!decodeSaveFromBase64(encodeSaveToBase64(save)),'Legacy saves without scans still load');
  const snap=save.data.snapshot!,star=UNIVERSE.stars.find(s=>s.id===snap.currentStarId)!;
  snap.location='In Orbit';snap.orbitPlanetIndex=0;save.data.location='In Orbit';
  const ownKey=scanPlanetKey(star.id,star.planets[0].slot);
  for(const scan of [{...partial,planetKey:ownKey},{...analyzed,planetKey:ownKey}]) {
    snap.planetaryScan=scan;
    check(JSON.stringify(decodeSaveFromBase64(encodeSaveToBase64(save))?.data.snapshot?.planetaryScan)===JSON.stringify(scan),'Sweep progress and consumed analysis survive the real save codec');
  }
  snap.planetaryScan={...ready,planetKey:'999:8'};
  check(decodeSaveFromBase64(encodeSaveToBase64(save))===null,'A foreign planetary reading cannot replace a saved mission');
  snap.planetaryScan={...ready,planetKey:ownKey};snap.location='Starport';save.data.location='Starport';
  check(decodeSaveFromBase64(encodeSaveToBase64(save))===null,'A stored orbital reading requires an orbital location');
  return {passed,failed:0,results:[`PASS ${passed} planetary sensor and legacy-save checks`]};
}

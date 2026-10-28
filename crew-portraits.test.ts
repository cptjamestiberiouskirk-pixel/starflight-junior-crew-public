import assert from 'node:assert/strict';
import {CREW_PORTRAIT_RACES,PORTRAITS_PER_RACE,allocateCrewPortrait,normalizeCrewPortraits,portraitIds,isCrewPortraitId,crewPortraitPath,type PortraitMember} from './utils/crew-portraits';
import {decodeSaveFromBase64,encodeSaveToBase64,type ExportSavePayload} from './utils/save-codec';
import fixture from './test-fixtures/commissioned-mission.json';

export function runCrewPortraitTests(){
  let passed=0;const check=(condition:boolean,label:string)=>{assert(condition,label);passed++;};
  for(const race of CREW_PORTRAIT_RACES){
    const roster:PortraitMember[]=[];
    for(let n=0;n<25;n++){
      const member={id:`${race}-${n}`,race,portraitId:allocateCrewPortrait(race,roster,`seed-${n}`)};
      if(n<PORTRAITS_PER_RACE)check(!roster.some(c=>c.portraitId===member.portraitId),`${race} recruit ${n} gets unused portrait`);
      roster.push(member);
    }
    check(new Set(roster.map(c=>c.portraitId)).size===11,`${race} uses all eleven portraits`);
    const counts=portraitIds(race).map(id=>roster.filter(c=>c.portraitId===id).length);
    check(Math.max(...counts)-Math.min(...counts)<=1,`${race} exhausted pool repeats evenly`);
    const without=roster.slice(0,11).filter((_,i)=>i!==4);
    check(allocateCrewPortrait(race,without,'replacement')===roster[4].portraitId,`${race} freed portrait becomes reusable`);
    const legacy=Array.from({length:11},(_,n)=>({id:`old-${n}`,race}));
    const migrated=normalizeCrewPortraits(legacy);
    check(new Set(migrated.map(c=>c.portraitId)).size===11,`${race} old clone roster migrates uniquely`);
    check(migrated[0].portraitId===`${race.toLowerCase()}-00`,`${race} first old member retains original`);
    check(!('portraitId' in legacy[0]),'Migration does not mutate input');
    check(JSON.stringify(normalizeCrewPortraits(migrated))===JSON.stringify(migrated),'Migration idempotent');
    const explicit={...legacy[0],portraitId:`${race.toLowerCase()}-01`};
    const reserved=normalizeCrewPortraits([...legacy.slice(1),explicit]);
    check(reserved.at(-1)!.portraitId===explicit.portraitId&&reserved.filter(c=>c.portraitId===explicit.portraitId).length===1,'Explicit later appearance reserved before legacy allocation');
    const reversed=normalizeCrewPortraits([...migrated].reverse());
    check(reversed.every(c=>migrated.find(m=>m.id===c.id)?.portraitId===c.portraitId),'Reorder keeps appearances');
    check(crewPortraitPath(migrated[0])===`assets/images/crew_${race.toLowerCase()}_atlas.webp`,'Original atlas retained');
    check(crewPortraitPath({...legacy[0],portraitId:`${race.toLowerCase()}-10`})===`assets/crew/${race.toLowerCase()}-10.webp`,'New atlas path valid');
    check(!isCrewPortraitId(race,'../../bad.webp')&&!isCrewPortraitId(race,`${race.toLowerCase()}-11`),'Reject paths and out of range IDs');
    const payload=structuredClone(fixture) as unknown as ExportSavePayload;
    payload.data.snapshot!.crewRoster=roster.slice(0,11).map(c=>({...payload.data.snapshot!.crewRoster[0],...c}));
    const encoded=encodeSaveToBase64(payload),decoded=decodeSaveFromBase64(encoded);
    check(decoded?.data.snapshot!.crewRoster.every((c,i)=>c.portraitId===roster[i].portraitId)===true,'Public save roundtrip retains IDs');
    const bad=structuredClone(payload);bad.data.snapshot!.crewRoster[0].portraitId='human-99';
    check(decodeSaveFromBase64(JSON.stringify(bad))===null,'Malformed appearance rejected before restore');
  }
  check(decodeSaveFromBase64(JSON.stringify(fixture))!==null,'Legacy save without optional appearance remains valid');
  const mixed=CREW_PORTRAIT_RACES.flatMap(race=>Array.from({length:5},(_,n)=>({id:`${race}-${n}`,race})));
  check(new Set(normalizeCrewPortraits(mixed).map(crewPortraitPath)).size===25,'Full mixed roster uses 25 unique images');
  const same=normalizeCrewPortraits(Array.from({length:11},(_,n)=>({id:`crew-${n}`,race:'Human' as const,alive:n!==0})));
  check(allocateCrewPortrait('Human',same.slice(0,10),'new')===same[10].portraitId,'Dead and reserve roster entries reserve their portrait');
  check(normalizeCrewPortraits([{id:'a',race:'Human' as const,portraitId:'velox-01'}])[0].portraitId==='human-00','Cross-race internal stale ID safely normalizes');
  return {passed,failed:0,results:[]};
}

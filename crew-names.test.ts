import {NAME_POOLS,type NameSource} from './utils/personnel';
import {generateRecruitName,canonicalNamePresentation,recruitNamePresentation,type NameStyle} from './utils/crew-names';
import {allocateCrewPortrait,crewPortraitPresentation,normalizeCrewPortraits,type PortraitMember} from './utils/crew-portraits';
import type {Species} from './App';
export function runCrewNameTests(){
 let passed=0,failed=0;const results:string[]=[];const check=(ok:boolean,label:string)=>{if(ok)passed++;else{failed++;results.push('FAIL '+label);}};
 const sources=Object.keys(NAME_POOLS) as Exclude<NameSource,'Any series'>[],races:Species[]=['Human','Velox','Thrynn','Elowan','Android'],styles:NameStyle[]=['auto','masculine','feminine','neutral'];
 const all=new Set(Object.values(NAME_POOLS).flat().map(name=>name.toLowerCase()));
 check(sources.includes('Starflight 1')&&sources.includes('Starflight 2'),'Both original game categories exist');
 for(const source of sources){
  const original=[...NAME_POOLS[source]];const used:string[]=[];
  for(let n=0;n<original.length;n++){
   const item=generateRecruitName(source,'existing','Human',used,'auto',()=>0);check(!!item&&original.includes(item.name as never),'Existing mode uses an exact documented name');
   if(item)used.push(item.name);
  }
  check(generateRecruitName(source,'existing','Human',used,'auto',()=>0)===null,'Exhausted existing list does not invent a canonical name');
  for(const race of races)for(const style of styles){
   const occupied:string[]=[];
   for(let n=0;n<30;n++){
    const item=generateRecruitName(source,'unique',race,occupied,style,()=>.1);
    check(!!item&&item.name.length>0&&item.name.length<=14,'Every unique name respects original length limit');
    if(!item)break;
    check(!all.has(item.name.toLowerCase()),'New inspired names never return an existing-list character');
    check(!occupied.some(name=>name.toLowerCase()===item.name.toLowerCase()),'Constant RNG cannot create duplicate names');
    check(item.race===race&&item.source===source&&item.mode==='unique','Selected race/category/mode retained');
    occupied.push(item.name);
   }
   const prior=generateRecruitName(source,'unique',race,[] ,style,()=>0)!;
   const next=generateRecruitName(source,'unique',race,[` ${prior.name.toUpperCase()} `],style,()=>0)!;
   check(next.name.toLowerCase()!==prior.name.toLowerCase(),'Case and whitespace collision rejected');
  }
 }
 for(const roll of [NaN,Infinity,-Infinity,-10,0,.99999999,1,10])for(const race of races){
  for(const mode of ['existing','unique'] as const){const item=generateRecruitName('Any series',mode,race,[],'auto',()=>roll);check(!!item&&item.name.length<=14,'Adversarial RNG bounded in both modes');}
 }
 check(generateRecruitName('__proto__' as NameSource,'existing','Human',[])===null,'Prototype source rejected');
 check(generateRecruitName('Starflight 1','invalid' as never,'Human',[])===null,'Invalid mode rejected');
 check(generateRecruitName('Starflight 1','unique','invalid' as Species,[])===null,'Invalid species rejected');
 check(generateRecruitName('Starflight 1','unique','Human',[],'invalid' as NameStyle)===null,'Invalid style rejected');
 check(canonicalNamePresentation('Leia Organa')==='feminine'&&canonicalNamePresentation('Spock')==='masculine','Known fictional character presentations retained');
 check(canonicalNamePresentation('Thyrrthynnn')==='feminine','Original manual identifies the Thrynn captain as female');
 check(canonicalNamePresentation('Bethamial')==='neutral'&&canonicalNamePresentation('A Custom Name')==='neutral','Unknown/alien names do not infer biological gender');
 check(recruitNamePresentation('Leia Organa','Human','masculine',null)==='feminine','A known name cannot be assigned a conflicting portrait by style preference');
 check(recruitNamePresentation('A Custom Name','Human','feminine',null)==='feminine','Custom names allow explicit presentation choice');
 for(const race of ['Human','Android','Elowan'] as Species[])for(const presentation of ['masculine','feminine'] as const){
  const roster:PortraitMember[]=[];
  for(let n=0;n<12;n++){const id=allocateCrewPortrait(race,roster,String(n),presentation);check(crewPortraitPresentation(race,id)===presentation,'Matching authored portrait style chosen');roster.push({id:String(n),race,portraitId:id});}
  const before=JSON.stringify(roster);normalizeCrewPortraits(roster);check(JSON.stringify(roster)===before,'Existing identities are never remapped for name matching');
 }
 for(const race of ['Velox','Thrynn'] as Species[])for(const style of styles){const item=generateRecruitName('Starflight 2','unique',race,[],style)!;check(item.presentation==='neutral','Unclassified alien styles remain neutral');check(crewPortraitPresentation(race,allocateCrewPortrait(race,[],'x','feminine'))==='neutral','No invented gender for unclassified alien art');}
 const used=Array.from({length:1000},(_,i)=>`x-${i}`);let seed=0;for(let n=0;n<90;n++){const item=generateRecruitName('Starflight 1','unique','Human',used,'feminine',()=>0)!;check(!!item&&!used.includes(item.name),'Bounded fallback handles an exhausted inspired spelling pool');used.push(item.name);seed++;}
 return {passed,failed,results};
}

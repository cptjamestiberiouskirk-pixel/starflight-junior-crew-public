import assert from 'node:assert/strict';
import {compositionIllustration as visual} from './utils/science-illustrations';
import {GAS_LEGEND,HYDROSPHERE_LEGEND,ELEMENT_LEGEND} from './galaxy';
export function runScienceIllustrationTests(){
 let passed=0;const check=(v:unknown,label:string)=>{assert(v,label);passed++;};
 for(const category of ['atmosphere','hydrosphere','lithosphere'] as const){
  const locked=visual(category,['Water','Gold'],false,'Ice');
  check(locked.kind==='unresolved'&&locked.names.length===0&&locked.symbols.length===0&&locked.texture==='space','Locked art must not disclose composition or analysis');
  check(visual(category,[],true).names.length===0,'No compound means no invented sample');
 }
 check(visual('atmosphere',['None'],true).kind==='vacuum','Airless worlds must not have a cloud illustration');
 const halogens=visual('atmosphere',['Fluorine','Chlorine'],true);
 check(halogens.symbols.join(',')==='F₂,Cl₂'&&halogens.names.join(',')==='Fluorine,Chlorine','Atmosphere keeps actual gases and abundance order');
 const methane=visual('hydrosphere',['Methane'],true),water=visual('hydrosphere',['Water'],true);
 check(methane.symbols[0]==='CH₄'&&methane.kind==='compound-sample'&&water.symbols[0]==='H₂O'&&water.kind==='water-sample','Methane must not silently become a water ocean');
 check(visual('hydrosphere',['Water'],true).texture==='liquid'&&visual('hydrosphere',['Water'],true,'Ice').texture==='ice','Only confirmed analysis selects frozen sample art');
 check(visual('hydrosphere',['None'],true).texture==='rock','Absent hydrosphere does not show liquid');
 const ore=visual('lithosphere',['Zinc','Plutonium'],true);
 check(ore.kind==='metal-sample'&&ore.texture==='rock'&&ore.symbols.join(',')==='Zn,Pu','Metallic ore uses a rock/metal sample, not unrelated blue crystals');
 check(visual('lithosphere',['Gold'],true).accent!==visual('lithosphere',['Copper'],true).accent,'Material accents distinguish gold and copper');
 check(visual('lithosphere',['Rodnium'],true).symbols[0]==='Rodnium','Fictional ore does not acquire an invented real chemical symbol');
 for(const [category,legend] of [['atmosphere',GAS_LEGEND],['hydrosphere',HYDROSPHERE_LEGEND],['lithosphere',ELEMENT_LEGEND]] as const){
  for(const name of Object.values(legend)){
   const actual=visual(category,[name],true);
   check(name==='None'?actual.names.length===0:actual.names[0]===name&&actual.symbols.length===1,'Every original catalog entry retains its identity');
  }
 }
 const unknown=visual('hydrosphere',['Uncatalogued material'],true);
 check(unknown.symbols[0]==='Uncatalogued material','Unknown compound is not relabelled as familiar water');
 return {passed,failed:0,results:[]};
}

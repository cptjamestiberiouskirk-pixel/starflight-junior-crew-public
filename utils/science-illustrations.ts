/** Composition artwork describes the reported sample, never an undiscovered map
 * contact or a measured colour/phase. Analysis may confirm a frozen surface. */
export type CompositionCategory='atmosphere'|'hydrosphere'|'lithosphere';
export type ScienceTexture='space'|'gas'|'liquid'|'ice'|'rock'|'crystal';
export interface CompositionIllustration {
  kind:string; texture:ScienceTexture; accent:string; names:string[]; symbols:string[];
}
const signatures:Record<string,{symbol:string;accent:string}>={
 'Ammonia':{symbol:'NH₃',accent:'#b9cfe3'},'Ammonia Compounds':{symbol:'NH₃ mix',accent:'#b9cfe3'},
 'Argon':{symbol:'Ar',accent:'#b8bbdf'},'Carbon Dioxide':{symbol:'CO₂',accent:'#d5bea2'},
 'Carbon Monoxide':{symbol:'CO',accent:'#d4c9bb'},'Chlorine':{symbol:'Cl₂',accent:'#cbdb82'},
 'Chlorine Compounds':{symbol:'Cl mix',accent:'#bac791'},'Fluorine':{symbol:'F₂',accent:'#e8e6a0'},
 'Fluorine Compounds':{symbol:'F mix',accent:'#d2dbab'},'Helium':{symbol:'He',accent:'#d8c6a6'},
 'Hydrogen':{symbol:'H₂',accent:'#bad2e7'},'Hydrogen Cyanide':{symbol:'HCN',accent:'#b9c9da'},
 'Metal Compounds':{symbol:'Metal mix',accent:'#b8c4c8'},'Methane':{symbol:'CH₄',accent:'#a6c5dc'},
 'Nitrogen':{symbol:'N₂',accent:'#bed6e1'},'Oxygen':{symbol:'O₂',accent:'#bad7e9'},
 'Ethanol':{symbol:'C₂H₅OH',accent:'#bfd6dc'},'Methanol':{symbol:'CH₃OH',accent:'#bdd6da'},
 'Silicon Compounds':{symbol:'Si mix',accent:'#cbbda5'},'Sodium Compounds':{symbol:'Na mix',accent:'#e2d4aa'},
 'Sulfur Compounds':{symbol:'S mix',accent:'#dfcf83'},'Water':{symbol:'H₂O',accent:'#8bcee9'},
 'Aluminum':{symbol:'Al',accent:'#c1d0d9'},'Antimony':{symbol:'Sb',accent:'#b9c3cb'},
 'Chromium':{symbol:'Cr',accent:'#c6d7df'},'Cobalt':{symbol:'Co',accent:'#b0c2ca'},
 'Copper':{symbol:'Cu',accent:'#d4966d'},'Gold':{symbol:'Au',accent:'#dfc26b'},
 'Iron':{symbol:'Fe',accent:'#aeb9be'},'Lead':{symbol:'Pb',accent:'#a9b0bc'},
 'Magnesium':{symbol:'Mg',accent:'#d2d9dd'},'Mercury':{symbol:'Hg',accent:'#c7d5dc'},
 'Molybdenum':{symbol:'Mo',accent:'#bbc7cf'},'Nickel':{symbol:'Ni',accent:'#b8c4c9'},
 'Platinum':{symbol:'Pt',accent:'#cfd6d7'},'Plutonium':{symbol:'Pu',accent:'#b3bdc8'},
 'Promethium':{symbol:'Pm',accent:'#b9c2cb'},'Silver':{symbol:'Ag',accent:'#d4e0e5'},
 'Tin':{symbol:'Sn',accent:'#c1cbd2'},'Titanium':{symbol:'Ti',accent:'#b8c8d2'},
 'Tungsten':{symbol:'W',accent:'#aabac4'},'Zinc':{symbol:'Zn',accent:'#b6c7d3'},
 // These are game materials, not asserted real chemical elements.
 'Endurium':{symbol:'Endurium',accent:'#8ce2bd'},'Endurium (Fuel)':{symbol:'Endurium',accent:'#8ce2bd'},
 'Rodnium':{symbol:'Rodnium',accent:'#c3a4e4'},
};
export function compositionIllustration(category:CompositionCategory,reported:readonly string[],revealed:boolean,confirmedSurface:string|null=null):CompositionIllustration {
 if(!revealed)return {kind:'unresolved',texture:'space',accent:'#6a8b9b',names:[],symbols:[]};
 const names=reported.filter(name=>name.trim()&&name!=='None');
 if(!names.length)return {kind:category==='atmosphere'?'vacuum':'none',texture:category==='atmosphere'?'space':'rock',accent:'#8fa8b8',names:[],symbols:[]};
 const first=names[0],sample=signatures[first];
 const base={accent:sample?.accent??'#b2c4cf',names:[...names],symbols:names.map(name=>signatures[name]?.symbol??name)};
 if(category==='atmosphere')return {...base,kind:'gas-sample',texture:'gas'};
 if(category==='lithosphere'){
  const fictional=names.every(name=>['Endurium','Endurium (Fuel)','Rodnium'].includes(name));
  return {...base,kind:fictional?'game-mineral':'metal-sample',texture:fictional?'crystal':'rock'};
 }
 const frozen=confirmedSurface==='Ice';
 return {...base,kind:frozen?'frozen-sample':first==='Water'?'water-sample':first==='Metal Compounds'?'metal-compounds':'compound-sample',texture:frozen?'ice':first==='Metal Compounds'?'rock':'liquid'};
}

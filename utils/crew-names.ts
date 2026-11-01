import type {Species} from '../App';
import {NAME_POOLS,type NameSource} from './personnel';
export type NameMode='existing'|'unique';
export type NamePresentation='masculine'|'feminine'|'neutral';
export type NameStyle='auto'|NamePresentation;
export interface GeneratedCrewName {name:string;presentation:NamePresentation;source:NameSource;mode:NameMode;race:Species}
const key=(name:string)=>name.normalize('NFKC').trim().toLowerCase();
const feminine=new Set(['Uhura','Deanna Troi','Beverly','Kira Nerys','Jadzia Dax','Ezri Dax','Janeway',"B'Elanna",'Seven of Nine','Kes',"T'Pol",'Hoshi Sato','Burnham','Mariner','Tendi','Chapel','Leia Organa','Padme Amidala','Ahsoka Tano','Mon Mothma','Hera Syndulla','Sabine Wren','Bo-Katan','Jyn Erso','Rey','Rose Tico','Maz Kanata','Fennec Shand','Naomi Nagata','Camina Drummer','Bobbie Draper','Avasarala','Julie Mao','Clarissa Mao','Anna Volovodov','Elvi Okoye','Michio Pa','Thyrrthynnn'].map(key));
const neutral=new Set(['R2-D2','C-3PO','BB-8','Chopper','K2-SO',...NAME_POOLS['Starflight 1'],...NAME_POOLS['Starflight 2']].map(key));
const knownMasculine=new Set(['Max Zarfleen','McGuin','Phloon de Lux','Slim'].map(key));
const canonical=new Set(Object.values(NAME_POOLS).flat().map(key));
/** Only explicitly catalogued fictional names have a known style. Never infer a
 * person's gender from arbitrary typed names. Alien identities stay neutral. */
export function canonicalNamePresentation(name:string):NamePresentation {
 const normalized=key(name);
 return feminine.has(normalized)?'feminine':knownMasculine.has(normalized)?'masculine':neutral.has(normalized)||!canonical.has(normalized)?'neutral':'masculine';
}
export function recruitNamePresentation(name:string,race:Species,style:NameStyle,generated:GeneratedCrewName|null):NamePresentation {
 const known=generated?.name===name&&generated.race===race?generated.presentation:canonicalNamePresentation(name);
 return known!=='neutral'?known:style==='auto'?'neutral':style;
}
const humanFirst={
 masculine:['Taren','Dalen','Corin','Bren','Kelan','Arlen','Joren','Marek'],
 feminine:['Alya','Mira','Nela','Sera','Talia','Lina','Rhea','Vela'],
 neutral:['Ari','Ren','Lane','Sage','Ash','Ryn','Aven','Kest'],
};
const flavor={
 'Star Trek':{human:['Valen','Tavor','Selan','Rellan','Voss','Kest','Merin','Aster'],syllables:['el','or','an','ev','ur','al'],android:'AX'},
 'Star Wars':{human:['Vex','Korr','Tavo','Orlen','Daro','Varo','Venn','Sorn'],syllables:['ra','to','vo','ka','sha','zan'],android:'RX'},
 'The Expanse':{human:['Navar','Beltran','Kepler','Maris','Roth','Ceres','Novak','Varga'],syllables:['ke','da','ro','na','bel','va'],android:'TY'},
 'Starflight 1':{human:['Zarlen','McVale','Pelin','Arthen','Garan','Noaren','Verran','Kelmar'],syllables:['pha','the','nu','fa','ve','gar'],android:'G'},
 'Starflight 2':{human:['Luxen','Cloud','Outren','Shyren','Astrel','Nebrin','Orlen','Rellan'],syllables:['rre','pte','cio','lux','shy','xel'],android:'PX'},
};
const alien={
 Velox:{first:['Pte','Rre','Vex','Kli','Phe','Xi','Tzi','Qe'],last:['tex','lixi','xi','nok','tik','pex']},
 Thrynn:{first:['Thy','Ssa',"N'qr",'Tyr','Rhys','Vra','Ssy','Qrr'],last:['ynn','la','iss','a','esh','ak']},
 Elowan:{first:['Ael','Fae','Bela','Cio','Syl','Luma','Elo','Vael'],last:['ion','ial','lia','iel','ara','eth']},
};
function fraction(random:()=>number){const roll=random();return Number.isFinite(roll)?Math.min(.999999999,Math.max(0,roll)):0;}
export function availableCrewNames(source:NameSource,occupied:readonly string[],style:NameStyle='auto'):string[]{
 if(source!=='Any series'&&!Object.hasOwn(NAME_POOLS,source))return [];
 const used=new Set(occupied.map(key)),pools=source==='Any series'?Object.values(NAME_POOLS):[NAME_POOLS[source]];
 return pools.flatMap(pool=>[...pool]).filter(name=>!used.has(key(name))&&(style==='auto'||canonicalNamePresentation(name)==='neutral'||canonicalNamePresentation(name)===style));
}
/** Local, bounded generation. Inspired names are new combinations, not claims
 * about canonical characters or species existing in the other franchises. */
export function generateRecruitName(source:NameSource,mode:NameMode,race:Species,occupied:readonly string[],style:NameStyle='auto',random=Math.random):GeneratedCrewName|null {
 if(source!=='Any series'&&!Object.hasOwn(NAME_POOLS,source)||!['existing','unique'].includes(mode)||!['auto','masculine','feminine','neutral'].includes(style)||!['Human','Velox','Thrynn','Elowan','Android'].includes(race))return null;
 const used=new Set(occupied.map(key));
 const sources=source==='Any series'?Object.keys(NAME_POOLS) as (keyof typeof NAME_POOLS)[]:[source];
 if(mode==='existing'){
  const available=availableCrewNames(source,occupied,style);
  if(!available.length)return null;
  const name=available[Math.floor(fraction(random)*available.length)];
  return {name,presentation:canonicalNamePresentation(name)==='neutral'&&style!=='auto'?style:canonicalNamePresentation(name),source,mode,race};
 }
 const category=sources[Math.floor(fraction(random)*sources.length)],theme=flavor[category];
 const presentation:NamePresentation=race==='Velox'||race==='Thrynn'||race==='Android'?'neutral':style==='auto'?(['masculine','feminine','neutral'] as const)[Math.floor(fraction(random)*3)]:style;
 const candidates:string[]=[];
 if(race==='Human')for(const first of humanFirst[presentation])for(const last of theme.human)candidates.push(`${first} ${last}`);
 else if(race==='Android')for(let n=101;n<=999;n++)candidates.push(`${theme.android}${n}-${String.fromCharCode(65+n%26)}`);
 else {
  const parts=alien[race];if(!parts)return null;
  const endings=race==='Elowan'&&presentation==='feminine'?['ia','ara','iel','lia','a','elle']:race==='Elowan'&&presentation==='masculine'?['ion','eth','or','en','ar','ial']:parts.last;
  for(const first of parts.first)for(const middle of theme.syllables)for(const last of endings)candidates.push(first+middle+last);
 }
 const start=Math.floor(fraction(random)*candidates.length);
 for(let n=0;n<candidates.length;n++){
  const name=candidates[(start+n)%candidates.length];if(name.length<=14&&!used.has(key(name))&&!canonical.has(key(name)))return {name,presentation,source:category,mode,race};
 }
 // Preserve lore-shaped spelling when a small finite pool is exhausted.
 for(let n=2;n<=used.size+2;n++){
  const suffix=`-${n}`,name=candidates[start].slice(0,14-suffix.length)+suffix;
  if(!used.has(key(name))&&!canonical.has(key(name)))return {name,presentation,source:category,mode,race};
 }
 return null;
}

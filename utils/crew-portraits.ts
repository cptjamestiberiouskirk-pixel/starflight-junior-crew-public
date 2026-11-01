import type {Species} from '../App';
import type {NamePresentation} from './crew-names';
/** Authored presentation tags for the fictional artwork, not biological sex.
 * Insect/reptile designs have no defined gender; their tags remain neutral. */
const portraitStyles:Partial<Record<Species,readonly NamePresentation[]>>={
 Human:['neutral','masculine','feminine','masculine','feminine','feminine','masculine','feminine','masculine','feminine','masculine'],
 Android:['neutral','masculine','feminine','masculine','feminine','masculine','feminine','masculine','feminine','neutral','masculine'],
 Elowan:['neutral','masculine','feminine','masculine','feminine','masculine','feminine','feminine','neutral','feminine','masculine'],
};
export function crewPortraitPresentation(race:Species,id:string):NamePresentation{return portraitStyles[race]?.[Number(id.split('-').at(-1))]??'neutral';}

export interface PortraitMember {id:string;race:Species;portraitId?:string}
export const PORTRAITS_PER_RACE=11; // Ten new faces plus the retained original atlas.
export const CREW_PORTRAIT_RACES:Species[]=['Human','Velox','Thrynn','Elowan','Android'];
export function portraitIds(race:Species):string[]{
  return Array.from({length:PORTRAITS_PER_RACE},(_,i)=>`${race.toLowerCase()}-${String(i).padStart(2,'0')}`);
}
export function isCrewPortraitId(race:Species,id:unknown):id is string {
  return typeof id==='string'&&portraitIds(race).includes(id);
}
export function crewPortraitId(member:PortraitMember):string {
  return isCrewPortraitId(member.race,member.portraitId)?member.portraitId:`${member.race.toLowerCase()}-00`;
}
export function crewPortraitPath(member:PortraitMember):string {
  const id=crewPortraitId(member);
  return id.endsWith('-00')?`assets/images/crew_${member.race.toLowerCase()}_atlas.webp`:`assets/crew/${id}.webp`;
}
function seedHash(seed:string):number {
  let h=2166136261;
  for(const character of seed)h=Math.imul(h^character.charCodeAt(0),16777619);
  return h>>>0;
}
function pick(race:Species,counts:Map<string,number>,seed:string,legacy=false):string {
  const ids=portraitIds(race),minimum=Math.min(...ids.map(id=>counts.get(id)??0));
  // First legacy member keeps the original face. New recruits begin among the new art.
  const start=legacy?0:1+seedHash(seed)%(PORTRAITS_PER_RACE-1);
  for(let i=0;i<ids.length;i++){
    const id=ids[(start+i)%ids.length];
    if((counts.get(id)??0)===minimum)return id;
  }
  return ids[0];
}
/** Persist appearance once; reserve explicit IDs before filling older saves' missing IDs.
 * Existing assigned faces never change just because the roster is reordered or edited.
 */
export function normalizeCrewPortraits<T extends PortraitMember>(roster:readonly T[]):(T & {portraitId:string})[]{
  const counts=new Map<string,number>();
  for(const member of roster)if(isCrewPortraitId(member.race,member.portraitId))counts.set(member.portraitId,(counts.get(member.portraitId)??0)+1);
  return roster.map(member=>{
    if(isCrewPortraitId(member.race,member.portraitId))return member as T & {portraitId:string};
    const portraitId=pick(member.race,counts,member.id,true);
    counts.set(portraitId,(counts.get(portraitId)??0)+1);
    return {...member,portraitId};
  });
}
/** Includes every roster entry, including reserves and memorial records. Reuse is balanced
 * only when more than eleven members of one race exhaust that race's available faces.
 */
export function allocateCrewPortrait(race:Species,roster:readonly PortraitMember[],seed:string,presentation?:NamePresentation):string {
  const counts=new Map<string,number>();
  for(const member of normalizeCrewPortraits(roster))counts.set(member.portraitId!,(counts.get(member.portraitId!)??0)+1);
  if(presentation&&presentation!=='neutral'){
    const matching=portraitIds(race).filter(id=>crewPortraitPresentation(race,id)===presentation);
    if(matching.length){
      const minimum=Math.min(...matching.map(id=>counts.get(id)??0)),start=seedHash(seed)%matching.length;
      for(let i=0;i<matching.length;i++){const id=matching[(start+i)%matching.length];if((counts.get(id)??0)===minimum)return id;}
    }
  }
  return pick(race,counts,seed);
}

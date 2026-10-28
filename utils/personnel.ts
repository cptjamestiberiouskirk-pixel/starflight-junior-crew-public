import type {CrewMember,RaceSpec,Skills,Species} from '../App';
import {RACE_BANTER_LIBRARY} from '../banter';
export const TRAINING_SKILLS:(keyof Skills)[]=['science','navigation','engineering','communications','medicine'];
export const TRAINING_COST=300;
/** A batch is one atomic purchase of the original single-category sessions. */
export function planCrewTraining(crew:Pick<CrewMember,'alive'|'race'|'skills'>,spec:RaceSpec,selected:readonly (keyof Skills)[],credits:number){
 const skills=TRAINING_SKILLS.filter(k=>selected.includes(k));
 const cost=skills.length*TRAINING_COST;
 const error=!crew.alive?'Deceased officers cannot be trained.':!spec.canTrain||crew.race==='Android'?'Androids cannot be trained.':!skills.length?'Select at least one category.':skills.some(k=>crew.skills[k]>=spec.maxSkills[k]||spec.maxSkills[k]<=0)?'A selected category has reached its species limit.':!Number.isFinite(credits)||credits<cost?'Insufficient funds for the selected training.':null;
 const next={...crew.skills};
 if(!error)for(const key of skills)next[key]=Math.min(spec.maxSkills[key],next[key]+spec.learningRate);
 return {skills,cost,error,next};
}
export const NAME_POOLS={
 'Star Trek':['Spock','James T. Kirk','Uhura','Scotty','Sulu','Chekov','Picard','William Riker','Data','Worf','La Forge','Deanna Troi','Beverly','Wesley Crusher','Sisko','Kira Nerys','Jadzia Dax','Ezri Dax','Odo','Quark','Nog','Rom','Janeway','Chakotay','Tuvok',"B'Elanna",'Tom Paris','Harry Kim','Seven of Nine','Neelix','Kes',"T'Pol",'Archer','Trip Tucker','Hoshi Sato','Malcolm Reed','Travis','Burnham','Saru','Boimler','Mariner','Tendi','Rutherford','Pike','Chapel'],
 'Star Wars':['Luke Skywalker','Leia Organa','Han Solo','Chewbacca','Lando','Obi-Wan Kenobi','Anakin','Padme Amidala','Ahsoka Tano','Rex','Wedge Antilles','Mon Mothma','Admiral Ackbar','Hera Syndulla','Sabine Wren','Ezra Bridger','Kanan Jarrus','Zeb Orrelios','Chopper','Din Djarin','Grogu','Bo-Katan','Boba Fett','Fennec Shand','Cassian Andor','Jyn Erso','K2-SO','Bodhi Rook','Rey','Finn','Poe Dameron','Rose Tico','Maz Kanata','R2-D2','C-3PO','BB-8','Qui-Gon Jinn','Mace Windu','Yoda','Plo Koon'],
 'The Expanse':['James Holden','Naomi Nagata','Amos Burton','Alex Kamal','Camina Drummer','Bobbie Draper','Avasarala','Fred Johnson','Joe Miller','Julie Mao','Clarissa Mao','Anderson Dawes','Klaes Ashford','Marco Inaros','Filip Inaros','Shed Garvey','Prax','Anna Volovodov','Elvi Okoye','Fayez Sarkis','Duarte','Santiago Singh','Bull','Michio Pa','Dawes','Cotyar','Arjun','Erinwright']
} as const;
export type NameSource='Any series'|keyof typeof NAME_POOLS;
const normalized=(name:string)=>name.normalize('NFKC').trim().toLocaleLowerCase();
export function generateCrewName(source:NameSource,occupied:readonly string[],random=Math.random){
 const pool=source==='Any series'?Object.values(NAME_POOLS).flat():[...NAME_POOLS[source]];
 const used=new Set(occupied.map(normalized));const available=pool.filter(n=>!used.has(normalized(n)));
 const roll=random();const fraction=Number.isFinite(roll)?Math.min(.999999999,Math.max(0,roll)):0;
 if(available.length)return available[Math.floor(fraction*available.length)];
 for(let n=2;n<=used.size+2;n++){const suffix=` ${n}`,name=pool[0].slice(0,14-suffix.length).trimEnd()+suffix;if(!used.has(normalized(name)))return name;}
 return 'New Recruit';
}
/** Exact existing text: hashes and original recordings remain unchanged. */
export function assignmentVoiceLine(race:Species){
 const index:Record<Species,number>={Human:3,Velox:2,Thrynn:1,Elowan:3,Android:3};
 return RACE_BANTER_LIBRARY[race].starport_crew![index[race]];
}
export const CONCOURSE_DANCE_DELAY=8;
export function concourseDanceFrame(idle:number,moving=false){return !moving&&Number.isFinite(idle)&&idle>=CONCOURSE_DANCE_DELAY?Math.floor((idle-CONCOURSE_DANCE_DELAY)*5)%10:null;}
export function isConcourseMoveKey(key:string){return ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','a','A','w','W','s','S','d','D'].includes(key);}
export type BridgeMessage={text:string;speaker?:string;post?:string;type?:'info'|'alert'|'banter'};
export type BridgeFilter='all'|'info'|'alert'|'banter';
export function filterBridgeMessages<T extends BridgeMessage>(rows:readonly T[],type:BridgeFilter,search:string){
 const query=search.trim().toLocaleLowerCase();
 return rows.filter(m=>(type==='all'||(m.type??'info')===type)&&(!query||`${m.speaker??''} ${m.post??''} ${m.text}`.toLocaleLowerCase().includes(query)));
}

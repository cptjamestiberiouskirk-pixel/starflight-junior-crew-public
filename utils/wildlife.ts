import type { LifeformSpecimen } from '../surface';

export interface LifeformTraits {
  bodyPlan:number;
  bodyClass:number;
  intelligence:number;
  aggression:number;
  hitPoints:number;
  niche:'Producer'|'Herbivore'|'Carnivore'|'Omnivore';
  composition:string[];
}

/** Legacy cartoon species have names and sizes but no anatomical record.
 * Keep those species and their capture values; supply explicit compatibility
 * traits so injuries and data valuation can use the original rules. */
export function lifeformTraits(lifeform:LifeformSpecimen):LifeformTraits {
  const name=lifeform.speciesName.toLowerCase();
  const bodyPlan=lifeform.bodyPlan ?? (/spore|gorgon/.test(name)?10:/float|jelly/.test(name)?6:/strider|crawler/.test(name)?5:/wing|stalker/.test(name)?3:4);
  return {
    bodyPlan,bodyClass:bodyPlan===0?0:bodyPlan<=5?1:bodyPlan<=8?2:bodyPlan<=10?3:4,
    intelligence:lifeform.intelligence ?? 50,
    aggression:lifeform.aggression ?? (lifeform.temperament==='aggressive'?75:lifeform.temperament==='fleeing'?25:45),
    hitPoints:lifeform.hitPoints ?? ({Small:30,Medium:60,Large:100,Behemoth:180}[lifeform.size]),
    niche:lifeform.niche ?? (lifeform.temperament==='aggressive'?'Carnivore':'Herbivore'),
    composition:lifeform.composition ?? ['Carbon','Nitrogen','Oxygen'],
  };
}

export function lifeformHit(hitRoll:number,hitChance:number,shielded:boolean) {
  return hitRoll<hitChance && (!shielded || (hitRoll-1)*10<hitChance);
}

interface WildlifeCrew {id:string;name:string;alive:boolean;vitality:number;durability:number}
export interface WildlifeAttackEvent {id:string;name:string;damage:number;shielded:boolean;dead:boolean}

/** BEHAV-OV ATTACK-PLAYER, also ported by TerrainLifeform.AttackPlayer. */
export function resolveWildlifeAttack<T extends WildlifeCrew>(traits:Pick<LifeformTraits,'aggression'|'intelligence'|'hitPoints'>,roster:T[],assignedIds:(string|null)[],shielded:boolean,random=Math.random) {
  const next=roster.map(c=>({...c}));
  const assigned=new Set(assignedIds);
  const roll=1+Math.floor(random()*100);
  const attacks=roll<=70?1:roll<=95?2:3;
  const events:WildlifeAttackEvent[]=[];
  for(let i=0;i<attacks;i++) {
    const crew=next.filter(c=>assigned.has(c.id)&&c.alive&&c.vitality>0);
    if(!crew.length) break;
    const victim=crew[Math.min(crew.length-1,Math.floor(random()*crew.length))];
    const hitChance=Math.floor((traits.aggression+traits.intelligence)/2);
    const hitRoll=1+Math.floor(random()*100);
    const hits=lifeformHit(hitRoll,hitChance,shielded);
    const maximum=Math.max(1,Math.floor(Math.floor((traits.aggression+2*traits.hitPoints)/3)/Math.max(1,victim.durability)));
    const damage=hits?1+Math.floor(random()*maximum):0;
    victim.vitality=Math.max(0,victim.vitality-damage);
    const died=hits&&victim.vitality===0;
    if(died) victim.alive=false;
    events.push({id:victim.id,name:victim.name,damage,shielded:!hits&&shielded&&hitRoll<hitChance,dead:died});
  }
  return {roster:next,events};
}

export interface SurveyKnowledge {classes:number[];orders:number[];species:string[];unpaidValue:number}
export const emptySurveyKnowledge=():SurveyKnowledge=>({classes:[],orders:[],species:[],unpaidValue:0});
export const RECORDING_SECONDS=3;
export const RECORDING_RANGE=2.5;
// TerrainLifeforms records for 2/999 of a full charge; the web rover displays %.
export const RECORDING_ENERGY=200/999;
export interface SurfaceRecording {lifeformId:string;planetKey:string;remaining:number;interruptedFor:number}

/** Follow the selected specimen, not a saved position. This is navigation
 * assistance only: the recording still needs its original range, time and energy.
 * No pursuit state is persisted, so old in-progress recordings resume safely. */
export function recordingFollowTarget(recording:SurfaceRecording|null,planetKey:string,lifeforms:LifeformSpecimen[],x:number,y:number,fuel:number,manual:boolean,available:boolean) {
  if(!recording || recording.planetKey!==planetKey || recording.remaining<=0 || recording.interruptedFor>0 || manual || !available || fuel<=0) return null;
  const target=lifeforms.find(lf=>lf.id===recording.lifeformId);
  if(!target || target.captured || target.recorded || target.dead || target.stunned) return null;
  const dx=target.x-x,dy=target.y-y,distance=Math.hypot(dx,dy);
  if(!Number.isFinite(distance) || distance>RECORDING_RANGE || distance<=1.2) return null;
  // Hold back from the animal rather than driving through it. Wildlife retains
  // its own motion/attack rules; aggressive animals can still approach and attack.
  return {x:target.x-dx/distance*1.2,y:target.y-dy/distance*1.2};
}

/** Novel class/order/species rewards and attribute percentages from
 * PD_General.LearnLifeform and GD_Species.GetDataValue. */
export function recordLifeform(knowledge:SurveyKnowledge,lifeform:LifeformSpecimen,planetKey:string) {
  const traits=lifeformTraits(lifeform);
  const speciesKey=`${planetKey}:${lifeform.speciesName}`;
  const base=!knowledge.classes.includes(traits.bodyClass)?50:!knowledge.orders.includes(traits.bodyPlan)?20:!knowledge.species.includes(speciesKey)?5:0;
  const carbon=traits.composition.indexOf('Carbon');
  const bonus=traits.intelligence+(traits.niche==='Herbivore'?25:traits.niche==='Producer'?0:50)
    +Math.min(100,Math.round(lifeform.volume*10))+(carbon<0?50:carbon>=2?30:carbon===1?10:0);
  const value=base+Math.floor(base*bonus/100);
  const earned=lifeform.dead?Math.floor(value/2):value;
  return {earned,speciesKey,knowledge:{
    classes:[...new Set([...knowledge.classes,traits.bodyClass])],
    orders:[...new Set([...knowledge.orders,traits.bodyPlan])],
    species:[...new Set([...knowledge.species,speciesKey])],
    unpaidValue:knowledge.unpaidValue+earned,
  }};
}

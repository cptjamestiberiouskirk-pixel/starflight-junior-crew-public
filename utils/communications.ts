import type {AlienGroup,AlienRace,AlienShip,DiplomaticPosture} from '../alien';
import {PARSED_COMM_LINES,resolveRaceId,resolvePostureCode,type ParsedCommLine} from '../src/commData';
import VESSEL_STRENGTH from '../src/vesselStrength.json';

/** Shipped ORIGINATOR records, via AlienPersonality.cs; see comm-rules-provenance. */
export const ALIEN_PERSONALITIES: Partial<Record<AlienRace,{friendly:number;hostile:number;fight:number;start:number;friendlyEffect:number;hostileEffect:number;obsequiousEffect:number}>> = {
  Elowan:{friendly:25,hostile:60,fight:60,start:44,friendlyEffect:-10,hostileEffect:20,obsequiousEffect:0},
  Thrynn:{friendly:30,hostile:60,fight:80,start:44,friendlyEffect:-8,hostileEffect:20,obsequiousEffect:5},
  Spemin:{friendly:0,hostile:20,fight:80,start:10,friendlyEffect:0,hostileEffect:30,obsequiousEffect:-8},
  Veloxi:{friendly:20,hostile:60,fight:80,start:44,friendlyEffect:0,hostileEffect:20,obsequiousEffect:-8},
  Mechans:{friendly:10,hostile:75,fight:99,start:48,friendlyEffect:0,hostileEffect:0,obsequiousEffect:0},
  Gazurtoid:{friendly:0,hostile:0,fight:40,start:26,friendlyEffect:0,hostileEffect:30,obsequiousEffect:-20},
};
export const clampMood=(mood:number)=>Math.max(0,Math.min(100,mood));
export const postureBit=(posture:DiplomaticPosture)=>({Obsequious:1,Friendly:2,Neutral:4,Hostile:8}[posture]);

export function moodDisposition(race:AlienRace,mood:number,strengthDifference=0) {
  const p=ALIEN_PERSONALITIES[race];
  let talk:DiplomaticPosture='Friendly';
  let fleet:DiplomaticPosture='Friendly';
  if(race==='Uhlek')talk=fleet='Hostile';
  else if(p) {
    if(mood>=p.fight)talk=fleet=strengthDifference>5?'Obsequious':'Hostile';
    else {
      talk=mood<p.friendly?'Friendly':mood<p.hostile?'Neutral':strengthDifference>15?'Obsequious':'Hostile';
      fleet=talk==='Hostile'?'Neutral':talk;
    }
  }
  return {talk,fleet,fighting:fleet==='Hostile'};
}

export function moodDecides(group:AlienGroup,hasHuman=true,elanDestroyed=false) {
  return !!ALIEN_PERSONALITIES[group.race] && !group.hasSurrendered && !group.attackedByPlayer && !group.isHomeworldFleet
    && !(group.race==='Elowan'&&elanDestroyed) && !(group.race==='Mechans'&&!hasHuman);
}
export function encounterDisposition(group:AlienGroup,strengthDifference=0,hasHuman=true,mechanUnlocked=false,elanDestroyed=false) {
  if(group.hasSurrendered)return {talk:'Obsequious',fleet:'Obsequious',fighting:false} as const;
  if(group.attackedByPlayer || group.isHomeworldFleet&&group.homeworldAttackStarted || group.race==='Elowan'&&elanDestroyed
    || group.race==='Mechans'&&!hasHuman&&!mechanUnlocked)return {talk:'Hostile',fleet:'Hostile',fighting:true} as const;
  if(group.isHomeworldFleet)return {talk:'Neutral',fleet:'Neutral',fighting:false} as const;
  if(group.race==='Mechans'&&!hasHuman&&mechanUnlocked)return {talk:'Friendly',fleet:'Friendly',fighting:false} as const;
  return moodDisposition(group.race,group.currentMood,strengthDifference);
}

export function postureMoodEffect(race:AlienRace,posture:DiplomaticPosture,phrases=1,isQuestion=false) {
  const p=ALIEN_PERSONALITIES[race];
  if(!p)return 0;
  const full=posture==='Friendly'?p.friendlyEffect:posture==='Hostile'?p.hostileEffect:posture==='Obsequious'?p.obsequiousEffect:0;
  return full/Math.max(1,phrases)/(isQuestion?2:1);
}
export function rememberedRaceMood(base:number,end:number) {
  return clampMood(base+(end>base?1:-1)*Math.max(5,Math.floor(Math.abs(end-base)/3)));
}
export function phraseLimit(posture:DiplomaticPosture,random=Math.random) {
  const [low,span]=posture==='Obsequious'?[10,10]:posture==='Friendly'?[10,5]:posture==='Hostile'?[4,3]:[5,5];
  return low+Math.floor(random()*span);
}
export function impatientMoodDelta(race:AlienRace,mood:number,strengthDifference=0) {
  const p=ALIEN_PERSONALITIES[race];
  if(!p)return 0;
  return 2*(mood>=p.fight?(strengthDifference>5?1:16):postureBit(moodDisposition(race,mood,strengthDifference).talk));
}
export function alienQuestionDelta(id:number,yes:boolean) {
  const line=PARSED_COMM_LINES.find(line=>line.id===id&&line.subject===14);
  return (yes?line?.deltaYes:line?.deltaNo)??0;
}
export function originalCommCandidates(group:AlienGroup,subject:number,talk:DiplomaticPosture):ParsedCommLine[] {
  const p=resolvePostureCode(talk),bit=postureBit(talk),race=resolveRaceId(group.race);
  return PARSED_COMM_LINES.filter(line=>line.race===race&&line.subject===subject
    && (line.postureMask===undefined?line.posture===p:!!(line.postureMask&bit))
    && (line.contextMask===undefined?(!line.homeworld||!!group.isHomeworldFleet):!!(line.contextMask&(group.isHomeworldFleet?2:1)))
    && (!line.surrender||group.hasSurrendered));
}
export function questionWait(question:{remindersLeft:number},remaining:number) {
  if(remaining>0)return 'wait';
  // Two reminders, then impatience. No implicit No answer.
  return question.remindersLeft>0?'reminder':'impatient';
}

export interface ConversationClock {
  nextSpeech:number;
  playerPhrases:number;
  alienPhrases:number;
  phraseLimit:number;
  scanRemaining:number;
  scanned:boolean;
  noHumansWarned:boolean;
  shieldsUp:boolean;
  weaponsArmed:boolean;
  transmissionIndex:number;
  returnToOrbit?:number;
  /** Optional in older saves; initialized once on restore. */
  hails?:number;
  pendingHail?:boolean;
  disconnected?:boolean;
  playerHailedFirst?:boolean;
  playerPostures?:number;
  connectionRemaining?:number;
  pendingSubject?:number;
  lockedSubjects?:number[];
}
export function newConversationClock(talk:DiplomaticPosture,shieldsUp:boolean,weaponsArmed:boolean,random=Math.random):ConversationClock {
  return {nextSpeech:5+25*random(),playerPhrases:0,alienPhrases:0,phraseLimit:phraseLimit(talk,random),
    scanRemaining:5+85*random(),scanned:false,noHumansWarned:false,shieldsUp,weaponsArmed,transmissionIndex:0,
    hails:0,pendingHail:false,disconnected:false,playerHailedFirst:false,playerPostures:0,connectionRemaining:120+180*random(),lockedSubjects:[]};
}
export function afterPlayerPhrase(clock:ConversationClock,random=Math.random) {
  clock.nextSpeech+=5;
  if(clock.nextSpeech>10)clock.nextSpeech=5+5*random();
}

export function restoreConversationClock(clock:ConversationClock,connected:boolean,previousHails:number,random=Math.random) {
  clock.hails??=connected?0:Math.max(0,Math.min(3,previousHails));
  clock.pendingHail??=false;clock.disconnected??=false;
  clock.playerHailedFirst??=false;clock.playerPostures??=0;
  clock.connectionRemaining??=120+180*random();clock.lockedSubjects??=[];
  return clock;
}
export function closeConversation(clock:ConversationClock) {
  clock.disconnected=true;clock.pendingHail=false;clock.pendingSubject=undefined;
  clock.playerPhrases=0;clock.playerHailedFirst=false;
}
export function hailPostureEffect(clock:ConversationClock,race:AlienRace,posture:DiplomaticPosture) {
  const replying=(clock.hails??0)>0;
  clock.disconnected=false;clock.pendingHail=!replying;
  if(replying){clock.playerPhrases++;clock.hails=0;return postureMoodEffect(race,posture);}
  clock.playerHailedFirst=true;
  const bit=postureBit(posture);
  if((clock.playerPostures??0)&bit)return 0;
  clock.playerPostures=(clock.playerPostures??0)|bit;
  return postureMoodEffect(race,posture);
}
export function playerPhraseEffect(clock:ConversationClock,race:AlienRace,posture:DiplomaticPosture,isQuestion=false) {
  clock.playerPhrases++;
  let effect=postureMoodEffect(race,posture,clock.playerPhrases,isQuestion);
  const bit=postureBit(posture);
  if(clock.playerHailedFirst&&!((clock.playerPostures??0)&bit)) {
    clock.playerPostures=(clock.playerPostures??0)|bit;
    effect+=postureMoodEffect(race,posture);
  }
  return effect;
}
export function nextUnansweredHail(clock:ConversationClock) {
  clock.hails=(clock.hails??0)+1;clock.nextSpeech=20;
  return clock.hails===2?4:clock.hails===3?9:0;
}
export function responseSubject(clock:ConversationClock,subject:number,random=Math.random) {
  if(subject!==10&&subject!==11)return subject;
  const locks=clock.lockedSubjects??=[];
  if(Math.floor(random()*101)<20&&!locks.includes(subject))locks.push(subject);
  return locks.includes(subject)?5:subject;
}
export function nextLoreLine(history:Record<string,number>,race:number,subject:number,candidates:ParsedCommLine[]) {
  const key=`${race}:${subject}`,last=history[key]??0;
  const next=candidates.find(line=>line.id>last);
  history[key]=next?.id??0;
  return next?.id;
}
export function nextTransmission(group:AlienGroup,clock:ConversationClock,talk:DiplomaticPosture) {
  const lines=originalCommCandidates(group,5,talk);
  // Original terminating transmissions continue by least-used phrase across
  // meetings. Others run once in this encounter, in data order.
  if(lines.some(line=>line.action===127))return lines.map(line=>line.id);
  const line=lines[clock.transmissionIndex++];
  return line?[line.id]:[];
}
export function conversationEvent(clock:ConversationClock,dt:number,state:{connected:boolean;busy:boolean;fighting:boolean;personality:boolean;homeworld:boolean},random=Math.random):'hail'|'response'|'turn'|'terminate'|null {
  if(clock.disconnected&&!clock.pendingHail||state.fighting||state.busy)return null;
  if(state.connected&&!state.personality) {
    clock.connectionRemaining=Math.max(0,(clock.connectionRemaining??120)-dt);
    if(clock.connectionRemaining===0)return 'terminate';
  }
  clock.nextSpeech=Math.max(0,clock.nextSpeech-dt);
  if(clock.nextSpeech>0)return null;
  clock.nextSpeech=10+20*random();
  if(state.connected)return 'turn';
  if(clock.pendingHail)return 'response';
  if((clock.hails??0)<3||state.homeworld){clock.nextSpeech=20;return 'hail';}
  return null;
}

/** The captain's skills multiply installed classes; living ships contribute
 * their original VESSEL strength in proportion to remaining armor and shields. */
export function playerDiplomaticStrength(classes:number[],skills?:Partial<Record<'science'|'navigation'|'engineering'|'communications'|'medicine',number>>) {
  const sum=classes.reduce((a,n)=>a+Math.max(0,n),0);
  const total=skills?(['science','navigation','engineering','communications','medicine'] as const).reduce((a,key)=>a+(skills[key]??0),0):0;
  return sum+Math.trunc(sum*Math.max(0,total-550)/500);
}
export function alienDiplomaticStrength(ships:AlienShip[]) {
  const vessels:Record<string,{strength:number;armor:number;shields:number}>=VESSEL_STRENGTH;
  return ships.reduce((total,ship)=>{
    if(ship.isWreck||ship.hullIntegrity<=0)return total;
    const name=ship.race==='Mechans'?'Mechan Scout':ship.race==='Veloxi Drone'?'Veloxi Drone':ship.race==='Nomad'?'Nomad Probe'
      :ship.race==='Mysterions'?'Mysterion':ship.race==='Minstrels'?'Minstrel':ship.race==='Derelict'?'Noah 9 Derelict Transport':`${ship.race} ${ship.vesselType}`;
    const vessel=vessels[name];
    if(!vessel||!vessel.armor&&!vessel.shields)return total;
    return total+Math.trunc(vessel.strength*(Math.max(0,ship.armor)+Math.max(0,ship.shields))/(vessel.armor+vessel.shields));
  },0);
}

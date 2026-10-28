import assert from 'node:assert/strict';
import {createAlienShip,DEFAULT_BASE_MOODS,generateAlienGroups,type AlienGroup,type AlienRace} from './alien';
import {moodDisposition,encounterDisposition,moodDecides,postureMoodEffect,rememberedRaceMood,phraseLimit,impatientMoodDelta,alienQuestionDelta,originalCommCandidates,questionWait,newConversationClock,afterPlayerPhrase,playerDiplomaticStrength,alienDiplomaticStrength} from './utils/communications';
import {restoreConversationClock,closeConversation,hailPostureEffect,playerPhraseEffect,nextUnansweredHail,responseSubject,nextLoreLine,nextTransmission,conversationEvent} from './utils/communications';
import {selectCommLine} from './src/commData';
import {PARSED_COMM_LINES} from './src/commData';
import {flightEncounter} from './utils/encounters';
import {fleetCanFire,markFleetAttacked,updateFleetSurrender,beginFleetVisit} from './utils/reinforcements';
import {encodeSaveToBase64,decodeSaveFromBase64,type ExportSavePayload} from './utils/save-codec';
import saveFixture from './test-fixtures/commissioned-mission.json';

export function runCommunicationsTests() {
  let passed=0;const check=(condition:boolean,label:string)=>{assert(condition,label);passed++;};
  const group=(race:AlienRace,mood:number):AlienGroup=>({id:'comm-test',race,x:0,y:0,homeX:0,homeY:0,territoryRadius:1,
    shipsCount:1,spawnedTotal:1,baseMood:mood,currentMood:mood,posture:'Neutral',ships:[createAlienShip(race,'Scout','comm-ship',4,0)]});
  for(const [race,start,friendly,hostile,fight] of [
    ['Elowan',44,25,60,60],['Thrynn',44,30,60,80],['Spemin',10,0,20,80],
    ['Veloxi',44,20,60,80],['Mechans',48,10,75,99],['Gazurtoid',26,0,0,40],
  ] as const) {
    check(DEFAULT_BASE_MOODS[race]===start,`${race} starts at the original ORIGINATOR base mood`);
    if(friendly) {
      check(moodDisposition(race,friendly-1).talk==='Friendly',`${race} friendly band ends below the threshold`);
      check(moodDisposition(race,friendly).talk==='Neutral',`${race} neutral band starts at the threshold`);
    } else check(moodDisposition(race,0).talk!=='Friendly',`${race} can never become friendly through mood`);
    if(hostile<fight) {
      const state=moodDisposition(race,hostile);
      check(state.talk==='Hostile'&&state.fleet==='Neutral'&&!state.fighting,`${race} abusive talk does not fire weapons`);
    }
    check(!moodDisposition(race,fight-.01).fighting&&moodDisposition(race,fight).fighting,`${race} attacks only at its fight threshold`);
    check(moodDisposition(race,fight,6).fleet==='Obsequious',`${race} flees a sufficiently stronger player`);
  }
  check(moodDisposition('Spemin',20,15).talk==='Hostile'&&moodDisposition('Spemin',20,16).talk==='Obsequious','Threats turn to grovelling only beyond strength difference fifteen');
  check(postureMoodEffect('Mechans','Friendly')===0&&postureMoodEffect('Mechans','Hostile')===0,'Mechan recognition cannot be earned or lost by posture spam');
  check(postureMoodEffect('Spemin','Friendly')===0&&postureMoodEffect('Spemin','Obsequious')===-8,'Spemin calm only under the original posture effect');
  check(postureMoodEffect('Thrynn','Obsequious')===5&&postureMoodEffect('Gazurtoid','Obsequious')===-20,'Thrynn and Gazurtoid have different grovelling reactions');
  check(postureMoodEffect('Elowan','Friendly',4,true)===-1.25,'Repeated player questions apply half the diminishing posture effect');
  for(const [id,no,yes] of [[98,10,-10],[99,100,-10],[100,10,-10],[101,-10,100],[102,-10,10],[103,-10,10],[104,10,-10],[105,-10,100],[106,10,-10]]) {
    check(alienQuestionDelta(id,false)===no&&alienQuestionDelta(id,true)===yes,`Mechan question ${id} uses its recovered answer changes`);
  }
  check(rememberedRaceMood(44,44)===39&&rememberedRaceMood(44,45)===49&&rememberedRaceMood(44,10)===33,'Race reputation uses the original equal, minimum and integer-third steps');
  check(rememberedRaceMood(2,2)===0&&rememberedRaceMood(98,100)===100,'Race reputation stays within zero and one hundred');
  for(const [posture,min,max] of [['Friendly',10,14],['Neutral',5,9],['Hostile',4,6],['Obsequious',10,19]] as const) {
    check(phraseLimit(posture,()=>0)===min&&phraseLimit(posture,()=>.99999)===max,`${posture} draws the original inclusive phrase range`);
  }
  check(impatientMoodDelta('Mechans',48)===8&&impatientMoodDelta('Gazurtoid',26)===16&&impatientMoodDelta('Elowan',60)===32,'Impatience follows talk posture and fight bands');
  check(questionWait({remindersLeft:2},.01)==='wait'&&questionWait({remindersLeft:2},0)==='reminder'&&questionWait({remindersLeft:0},0)==='impatient','Ordinary timeout never creates a NO response');
  const mech=group('Mechans',48);
  check(originalCommCandidates(mech,14,'Neutral').map(l=>l.id).join(',')==='98,99,100,101,102,103,104,105,106','Neutral Mechans ask the original nine questions');
  check(!originalCommCandidates(mech,14,'Friendly').length&&originalCommCandidates(mech,15,'Friendly').some(l=>l.id===97),'A multi-posture termination line stays available without inventing friendly questions');
  check(encounterDisposition(mech,0,false,false).fighting&&!moodDecides(mech,false),'Unrecognized Mechans attack a crew with no assigned living human');
  check(!encounterDisposition(mech,0,false,true).fighting&&encounterDisposition(mech,0,false,true).talk==='Friendly','Permanent recognition survives a later human-free crew');
  markFleetAttacked(mech);
  check(encounterDisposition(mech,0,true,true).fighting&&!moodDecides(mech),'Player fire overrides permanent recognition for this visit');
  const surrendered=group('Spemin',10);
  surrendered.ships.push({...surrendered.ships[0],id:'wreck',isWreck:true,hullIntegrity:0});surrendered.spawnedTotal=2;
  updateFleetSurrender(surrendered);markFleetAttacked(surrendered);
  check(!encounterDisposition(surrendered).fighting&&!fleetCanFire(surrendered,true),'Diplomacy changes cannot revoke a fleet surrender');
  const home=group('Spemin',100);home.isHomeworldFleet=true;
  check(!encounterDisposition(home).fighting&&!moodDecides(home),'Homeworld fleets keep their warning sequence despite mood');
  home.homeworldAttackStarted=true;check(encounterDisposition(home).fighting,'The last homeworld warning still starts combat');
  const clock=newConversationClock('Neutral',true,false,()=>0);
  check(clock.nextSpeech===5&&clock.scanRemaining===5,'Initial conversation and scan clocks respect their lower bounds');
  afterPlayerPhrase(clock,()=>0);check(clock.nextSpeech===10,'A player phrase adds five seconds');
  afterPlayerPhrase(clock,()=>.5);check(clock.nextSpeech===7.5,'A long response wait is redrawn between five and ten seconds');
  check(playerDiplomaticStrength([5,5,5,5],{science:250,navigation:250,engineering:250,communications:250,medicine:250})===48,'Captain skills scale the original installed-class strength with integer division');
  check(alienDiplomaticStrength([createAlienShip('Mechans','Scout','mechan-strength')])===200,'The Mechan scout retains its original strength two hundred');
  const injured=createAlienShip('Spemin','Warship','injured');injured.armor=400;
  check(alienDiplomaticStrength([injured])===4,'Damage reduces vessel strength by remaining original armor and shields');
  const gaz94=PARSED_COMM_LINES.find(l=>l.id===94)!;
  check(gaz94.homeworld===1&&!originalCommCandidates(group('Gazurtoid',26),gaz94.subject,'Hostile').some(l=>l.id===94),'Recovered context keeps Gazurtoid homeworld lines out of space');
  for(const id of [394,483])check(PARSED_COMM_LINES.find(l=>l.id===id)?.homeworld===0,`Recovered context restores line ${id} to space conversations`);
  const heaven=generateAlienGroups().find(g=>g.id==='canonical-77')!;
  const flight={location:'In Orbit',x:0,y:0,starX:145,starY:107,orbitSlot:4,cooldown:0,uhlekSilenced:false,droneClearance:false};
  check(flightEncounter([heaven],flight)?.id==='canonical-77'&&!flightEncounter([heaven],{...flight,mechan9Unlocked:true}),'Recognized missions can enter Heaven on later visits');
  const save=structuredClone(saveFixture) as ExportSavePayload;
  const snap=save.data.snapshot!;snap.activeEncounterGroup=group('Mechans',18);snap.activeEncounterGroup.conversation=clock;snap.mechan9Unlocked=true;
  snap.alienCommsState={active:true,connected:true,playerPosture:'Neutral',alienPosture:'Neutral',alienMood:18,conversationCount:0,maxPhrases:6,pendingAlienQuestion:{id:104,text:'Code red?',remindersLeft:1,timer:20},activeTradeOffer:null,activeTriviaQuestion:null,activeAssistanceRequest:null,alienHailsCount:1,lastAlienSpeakerText:'Code red?',lastGarbledAlienText:'Code red?',lastCaptainText:'',activeSubject:null,dialogueHistory:[]};
  snap.questionCountdownTimer=9.5;
  const restored=decodeSaveFromBase64(encodeSaveToBase64(save))?.data.snapshot;
  check(restored?.mechan9Unlocked===true&&restored?.activeEncounterGroup?.conversation?.nextSpeech===7.5&&restored?.alienCommsState?.pendingAlienQuestion?.id===104&&restored?.questionCountdownTimer===9.5,'Recognition, cadence and unfinished question survive the public codec');
  snap.alienCommsState.pendingAlienQuestion!.id=9;
  check(decodeSaveFromBase64(encodeSaveToBase64(save))===null,'A question ID from another race cannot influence Mechan recognition');
  delete snap.alienCommsState.pendingAlienQuestion!.id;
  check(!!decodeSaveFromBase64(encodeSaveToBase64(save)),'Legacy questions without original IDs still load');
  snap.activeEncounterGroup.conversation.nextSpeech=Infinity;
  check(decodeSaveFromBase64(encodeSaveToBase64(save))===null,'Invalid saved conversation clocks cannot replace a mission');
  beginFleetVisit(mech);check(!mech.attackedByPlayer&&!mech.conversation,'A fresh visit resets only encounter hostility and clocks');
  const waiting={connected:false,busy:false,fighting:false,personality:true,homeworld:false};
  const hails=newConversationClock('Neutral',false,false,()=>0);
  check(conversationEvent(hails,4.99,waiting,()=>0)===null,'Aliens do not hail before the original five-second minimum');
  check(conversationEvent(hails,.02,waiting,()=>0)==='hail'&&nextUnansweredHail(hails)===0&&hails.hails===1&&hails.nextSpeech===20,'The first hail waits twenty seconds for a reply without anger');
  check(conversationEvent(hails,19,waiting,()=>0)===null&&conversationEvent(hails,1,waiting,()=>0)==='hail'&&nextUnansweredHail(hails)===4,'The second unanswered hail arrives after twenty seconds and adds four mood');
  check(conversationEvent(hails,20,waiting,()=>0)==='hail'&&nextUnansweredHail(hails)===9,'The third unanswered hail adds nine mood');
  check(conversationEvent(hails,20,waiting,()=>0)===null&&hails.hails===3,'Ordinary fleets do not send a fourth unanswered hail');
  check(conversationEvent(hails,30,{...waiting,homeworld:true},()=>0)==='hail','A homeworld fleet continues through all of its warnings');
  const outgoing=newConversationClock('Neutral',false,false,()=>0);
  check(hailPostureEffect(outgoing,'Elowan','Friendly')===-10&&!!outgoing.playerHailedFirst&&outgoing.playerPhrases===0,'Hailing first applies a new posture once and does not count a statement');
  afterPlayerPhrase(outgoing,()=>0);
  check(conversationEvent(outgoing,10,waiting,()=>0)==='response','A player hail queues an alien response instead of connecting instantly');
  check(playerPhraseEffect(outgoing,'Elowan','Friendly')===-10,'The first subsequent statement has its full diminishing effect');
  check(playerPhraseEffect(outgoing,'Elowan','Hostile')===30,'A newly used posture after hailing first adds its one-time full effect');
  check(Math.abs(playerPhraseEffect(outgoing,'Elowan','Hostile')-20/3)<1e-9,'Repeating that posture cannot receive another full-effect bonus');
  outgoing.pendingSubject=10;outgoing.lockedSubjects=[10];closeConversation(outgoing);
  check(!!outgoing.disconnected&&!outgoing.pendingHail&&outgoing.playerPhrases===0&&!outgoing.playerHailedFirst&&outgoing.pendingSubject===undefined,'Ending the link clears pending responses and resets link-specific player counters');
  check(outgoing.playerPostures===10&&outgoing.lockedSubjects[0]===10,'Ending a link retains encounter-wide posture use and lore locks');
  check(conversationEvent(outgoing,300,waiting,()=>0)===null,'A closed link cannot begin unsolicited hails again');
  const reply=newConversationClock('Neutral',false,false,()=>0);reply.hails=1;
  check(hailPostureEffect(reply,'Elowan','Friendly')===-10&&reply.playerPhrases===1&&reply.hails===0&&!reply.pendingHail,'Replying to an alien hail connects without scheduling another response');
  check(playerPhraseEffect(reply,'Elowan','Friendly')===-5,'A reply already counted as a player phrase before the first statement');
  const busy=newConversationClock('Neutral',false,false,()=>0);busy.pendingSubject=11;
  check(conversationEvent(busy,10,{...waiting,connected:true,busy:true,personality:false},()=>0)===null&&busy.nextSpeech===5&&busy.connectionRemaining===120,'Question and priority-business waits pause normal conversation and lifetime clocks');
  check(conversationEvent(busy,120,{...waiting,connected:true,personality:false},()=>0)==='terminate','A non-personality transmitter has the original connection lifetime');
  const personal=newConversationClock('Neutral',false,false,()=>0);
  check(conversationEvent(personal,300,{...waiting,connected:true},()=>0)==='turn'&&personal.connectionRemaining===120,'Personality races use phrase limits rather than connection seconds');
  const legacyClock=newConversationClock('Neutral',false,false,()=>0);
  for(const key of ['hails','pendingHail','disconnected','playerHailedFirst','playerPostures','connectionRemaining','lockedSubjects'])delete (legacyClock as any)[key];
  legacyClock.nextSpeech=3.25;restoreConversationClock(legacyClock,false,2,()=>.5);
  check(legacyClock.hails===2&&legacyClock.nextSpeech===3.25&&legacyClock.connectionRemaining===210,'Legacy clocks retain elapsed speech time and received hails during optional-field migration');
  const topics=newConversationClock('Friendly',false,false,()=>0);
  check(responseSubject(topics,7,()=>{throw Error('Ordinary subjects must not roll');})===7,'Ordinary topics never lock out');
  check(responseSubject(topics,10,()=>.2)===10&&topics.lockedSubjects?.length===0,'A roll of twenty is outside the original lore-lockout threshold');
  check(responseSubject(topics,10,()=>.19)===5&&topics.lockedSubjects?.join(',')==='10','A roll of nineteen locks Old Empire answers for the encounter');
  check(responseSubject(topics,10,()=>.99)===5&&responseSubject(topics,11,()=>.99)===11,'A locked topic stays locked while the other lore topic remains available');
  check(responseSubject(newConversationClock('Friendly',false,false),10,()=>.2)===10,'A fresh encounter clears topic locks');
  const lore=originalCommCandidates(group('Elowan',10),11,'Friendly'),history:Record<string,number>={};
  for(const line of lore)check(nextLoreLine(history,1,11,lore)===line.id,'Lore answers advance in original file order');
  check(nextLoreLine(history,1,11,lore)===undefined&&history['1:11']===0,'Exhausting lore yields no-more-information and resets its next cycle');
  check(nextLoreLine(history,1,11,lore)===lore[0].id,'A later lore cycle starts at its first answer');
  const mystClock=newConversationClock('Friendly',false,false,()=>0),myst=group('Mysterions',1);
  check(nextTransmission(myst,mystClock,'Friendly').join(',')==='185'&&!nextTransmission(myst,mystClock,'Friendly').length,'The Mysterion payload runs once; 186 and 187 remain its separate response and hail');
  const nomad=group('Nomad',1),nomClock=newConversationClock('Friendly',false,false,()=>0),uses:Record<number,number>={};
  const ids=nextTransmission(nomad,nomClock,'Friendly');
  check(ids.length>1&&ids.some(id=>PARSED_COMM_LINES.find(l=>l.id===id)?.action===127),'Terminating Nomad reports are selected across meetings by their saved phrase use');
  const firstReport=selectCommLine({race:'Nomad',subject:5,posture:'Friendly',preferredLineIds:ids,usageTracker:uses});
  const secondReport=selectCommLine({race:'Nomad',subject:5,posture:'Friendly',preferredLineIds:nextTransmission(nomad,newConversationClock('Friendly',false,false),'Friendly'),usageTracker:uses});
  check(firstReport.id===ids[0]&&secondReport.id===ids[1],'Reopening a terminating transmitter advances instead of replaying its first report');
  const lifecycleSave=structuredClone(saveFixture) as ExportSavePayload;
  lifecycleSave.data.snapshot!.activeEncounterGroup=group('Elowan',10);
  lifecycleSave.data.snapshot!.activeEncounterGroup.conversation=topics;
  lifecycleSave.data.snapshot!.commTopicProgress=history;
  const lifecycleRestored=decodeSaveFromBase64(encodeSaveToBase64(lifecycleSave))?.data.snapshot;
  check(lifecycleRestored?.activeEncounterGroup?.conversation?.lockedSubjects?.[0]===10&&lifecycleRestored.commTopicProgress?.['1:11']===lore[0].id,'Encounter lore locks and mission lore progression survive the actual save codec');
  lifecycleSave.data.snapshot!.commTopicProgress={'1:11':99};
  check(decodeSaveFromBase64(encodeSaveToBase64(lifecycleSave))===null,'An unrelated race/question ID cannot replace saved lore progress');
  delete lifecycleSave.data.snapshot!.commTopicProgress;topics.lockedSubjects=[9];
  check(decodeSaveFromBase64(encodeSaveToBase64(lifecycleSave))===null,'Only the two original lore topics may be locked in an imported mission');
  return {passed,failed:0,results:[] as string[]};
}

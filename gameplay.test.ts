import assert from 'node:assert/strict';
import { decodeSaveFromBase64, encodeSaveToBase64 } from './utils/save-codec';
import { adjustCargoStock, canRemoveCargoPod, consumeFuel, fitCargo, isCrystalArtifact, newMissionDestination, planetKey, roverCommand, shipCargoVolume, survivingPlanets } from './utils/gameplay-rules';
import { UNIVERSE } from './galaxy';
import { CANONICAL_ARTIFACTS, generatePlanetSurface, preparePlanetSurface, type LifeformSpecimen, type SurfaceRuin } from './surface';
import { advanceLifeform, stunnerTarget, mineableVolume, recoverRuinArtifact, recoveredCargo, landingRequirements } from './utils/surface-rules';
import { surfaceCoordinates, localSurfacePosition } from './utils/planet-coordinates';
import fixture from './test-fixtures/commissioned-mission.json';
import type { ExportSavePayload } from './utils/save-codec';
import { createSafeStorage } from './utils/storage';
import { advanceDetonation, detonationResult, type DetonationSequence } from './utils/detonation';
import { createAlienShip, generateAlienGroups, PARSED_COMM_LINES, resolveRaceId, calculateTranslationStrength, type AlienGroup } from './alien';
import { distressCallPass, distressCallDecision, reinforcementArrivalOdds, DISTRESS_CALLERS, updateFleetSurrender, markFleetAttacked, fleetPosture, fleetCanFire, beginFleetVisit } from './utils/reinforcements';
import { flightEncounter, trackFleets, trackingStep, type FlightContext } from './utils/encounters';
import { projectileArrival, resolveShipHit, type ShipDefense } from './utils/combat-rules';
import { advanceHealth, repairPercentageRate, crewHealingRate, fieldRepairCost, bestActingOfficer } from './utils/maintenance';
import { MINERAL_CATALOG, marketCommodities, getEnduriumPrice, clampPurchaseQuantity, saleQuantity, accruedInterest } from './utils/economy';
import { thrynnFuelOffer, exchangeArtifactForFuel, payFuelTribute } from './utils/diplomacy-rules';
import { restoreSettings, DEFAULT_GAME_SETTINGS } from './utils/settings';
import { advanceCrystalHeat } from './utils/crystal-heat';
import { releaseNotices } from './utils/notices';
import { selectFleetCommLine } from './utils/fleet-comms';

export function runGameplayTests() {
  let passed = 0;
  const check = (condition: boolean, label: string) => { assert(condition, label); passed++; };
  check(calculateTranslationStrength(0,[],null,false,'Elowan')===0,'No skill or matching crew provides no translation strength');
  check(calculateTranslationStrength(30,[],null,false,'Elowan')===83,'Unassisted translation uses the original integer square root');
  check(calculateTranslationStrength(30,[{race:'Elowan',alive:true}],null,false,'Elowan')===133,'A matching crew bonus is added to skill before taking its square root');
  check(calculateTranslationStrength(30,[{race:'Elowan',alive:true}],'Elowan',false,'Elowan')===183,'Matching officer and crew bonuses do not incorrectly force perfect translation');
  check(calculateTranslationStrength(30,[{race:'Elowan',alive:false}],null,false,'Elowan')===83,'Deceased crew grant no translation bonus');
  check(calculateTranslationStrength(30,[{race:'Android',alive:true}],'Android',false,'Mechans')===83,'Androids do not receive the original three living-race language bonuses');
  check(calculateTranslationStrength(30,[{race:'Velox',alive:true}],'Velox',false,'Veloxi Drone')===83,'The automated drone does not inherit the living Veloxi language bonus');
  check(calculateTranslationStrength(0,[],null,true,'Spemin')===250,'The Whining Orb supplies enough skill for full Spemin translation');
  const canonicalFleets=generateAlienGroups();
  const flight:FlightContext={location:'Hyperspace',x:178,y:88,starX:125,starY:100,orbitSlot:null,cooldown:0,uhlekSilenced:false,droneClearance:false};
  check(canonicalFleets.length===316 && new Set(canonicalFleets.map(g=>g.id)).size===316,'The twelve modeled races retain all 316 authored encounters with stable unique IDs');
  check(canonicalFleets.filter(g=>g.isHomeworldFleet).map(g=>g.id).sort().join(',')==='canonical-139,canonical-165,canonical-233,canonical-65','Only the four original homeworld orbital fleets receive the homeworld flag');
  check(flightEncounter(canonicalFleets,flight)?.id==='canonical-0','Normal hyperspace contact detects the authored Elowan scout at 178,88');
  check(flightEncounter(canonicalFleets,{...flight,cooldown:0.01})===null,'The escape grace period prevents immediate flight reengagement');
  for(const location of ['Starport','Docking Bay','On Planet','Terrain Vehicle','Encounter']) check(flightEncounter(canonicalFleets,{...flight,location})===null,`No space encounter starts while ${location}`);
  check(flightEncounter(canonicalFleets,{...flight,location:'In Orbit',starX:82,starY:148,orbitSlot:6})?.id==='canonical-139','The Spemin home fleet uses raw slot six, which is planet one in its system');
  check(flightEncounter(canonicalFleets,{...flight,location:'In Orbit',starX:82,starY:148,orbitSlot:1})===null,'Ordinal planet numbers cannot accidentally match the wrong orbital slot');
  check(flightEncounter(canonicalFleets,{...flight,location:'In Orbit',starX:82,starY:148,orbitSlot:6,cooldown:60})?.id==='canonical-139','The flight escape grace period does not suppress an orbital guardian on orbit entry');
  for(const race of ['Spemin','Thrynn','Veloxi','Gazurtoid'] as const) {
    const home=structuredClone(canonicalFleets.find(g=>g.race===race&&g.isHomeworldFleet)!);
    const raceId=resolveRaceId(race);
    let warnings=PARSED_COMM_LINES.filter(line=>line.race===raceId&&line.homeworld===1&&line.subject===1);
    if(!warnings.length) warnings=PARSED_COMM_LINES.filter(line=>line.race===raceId&&line.homeworld===1&&line.subject===5);
    check(warnings.length>0,`${race} has authored homeworld warnings`);
    for(let i=0;i<warnings.length;i++) {
      const selected=selectFleetCommLine(home,{race,subject:1,posture:'Friendly',usageTracker:{}});
      check(selected.id===warnings[i].id && selected.line.homeworld===1,`${race} warning ${i+1} follows the original order regardless of posture`);
      if(i<warnings.length-1) check(home.homeworldWarningStage!==3,'A home fleet does not attack before the last warning of its list');
    }
    check(home.homeworldWarningStage===3,`${race} starts hostilities after its last homeworld warning`);
    const refusal=selectFleetCommLine(home,{race,subject:'The Old Empire',posture:'Neutral',usageTracker:{}});
    const hasRefusals=PARSED_COMM_LINES.some(line=>line.race===raceId&&line.homeworld===1&&line.subject===5);
    check(!hasRefusals || refusal.line.homeworld===1,'A home fleet uses its authored homeworld refusals when available');
    check(home.homeworldWarningStage===3,'Changing warning lists cannot undo the final warning');
  }
  const savedWarnings=structuredClone(canonicalFleets.find(g=>g.id==='canonical-139')!);
  selectFleetCommLine(savedWarnings,{race:'Spemin',subject:1,posture:'Hostile',usageTracker:{}});
  const restoredWarnings=JSON.parse(JSON.stringify(savedWarnings)) as AlienGroup;
  const nextWarning=selectFleetCommLine(restoredWarnings,{race:'Spemin',subject:1,posture:'Hostile',usageTracker:{}});
  const speminHails=PARSED_COMM_LINES.filter(l=>l.race===6&&l.subject===1&&l.homeworld===1);
  check(nextWarning.id===speminHails[Math.min(1,speminHails.length-1)].id,'Reloading an encounter advances from its saved warning count');
  const surrenderedThrynn=structuredClone(canonicalFleets.find(g=>g.race==='Thrynn'&&!g.isHomeworldFleet)!);surrenderedThrynn.hasSurrendered=true;
  const thrynnSurrender=PARSED_COMM_LINES.find(l=>l.race===7&&l.surrender===1)!;
  const surrenderLine=selectFleetCommLine(surrenderedThrynn,{race:'Thrynn',subject:thrynnSurrender.subject,posture:'Obsequious',usageTracker:{}});
  check(surrenderLine.id===thrynnSurrender.id && surrenderedThrynn.surrenderLinesSeen?.includes(surrenderLine.id)===true,'A surrendered Thrynn says its neutral surrender line before ordinary obsequious dialogue');
  const deadContact=structuredClone(canonicalFleets[0]);deadContact.ships.forEach(ship=>{ship.isWreck=true;ship.hullIntegrity=0;});
  check(flightEncounter([deadContact],flight)===null,'Destroyed fleets cannot begin a new encounter');
  const farContact={...canonicalFleets[0],id:'far',x:178.8};
  check(flightEncounter([farContact,canonicalFleets[0]],flight)?.id==='canonical-0','Overlapping fleets yield only the nearest contact');
  const silencedContact={...canonicalFleets[0],race:'Uhlek' as const};
  check(flightEncounter([silencedContact],{...flight,uhlekSilenced:true})===null,'Silenced Uhlek do not intercept normal travel');
  const drone=canonicalFleets.find(g=>g.id==='canonical-301')!;
  check(flightEncounter([drone],{...flight,location:'In Orbit',starX:128,starY:124,orbitSlot:1,droneClearance:true})===null,'Granted drone clearance suppresses the real orbital drone encounter');
  check(trackingStep(40,true,false)===16 && trackingStep(-40,true,false)===-16 && trackingStep(40,false,false)===24,'Original tracking shares truncate toward zero in eight-cell increments');
  check(trackingStep(3,true,false)===3 && trackingStep(-3,true,false)===-3 && trackingStep(40,true,true)===32,'Close fleets finish their approach and the Pearl uses its original ratio');
  const movingFleet={...canonicalFleets[0],x:138,y:88,homeX:138,homeY:88};
  check(trackFleets([movingFleet],flight,false).length===1 && movingFleet.x===154 && movingFleet.y===88,'A local hyperspace fleet advances on a tracking pass');
  const boundedFleet={...canonicalFleets[0],x:178,y:50,homeX:100,homeY:50};
  check(trackFleets([boundedFleet],flight,false).length===0 && trackFleets([boundedFleet],flight,true).length===1,'The Pearl lifts the original home-displacement restriction');
  const stableFleets=generateAlienGroups();
  check(stableFleets.every((g,i)=>g.id===canonicalFleets[i].id && g.x===canonicalFleets[i].x && g.y===canonicalFleets[i].y && g.ships.length===canonicalFleets[i].ships.length),'Untouched fleet positions and initial wave sizes are stable across save reloads');
  const distressState={race:'Elowan',present:1,entered:5,called:false,posture:'Hostile',surrendering:false,homeworld:false};
  for(const race of DISTRESS_CALLERS) {
    check(distressCallDecision({...distressState,race},()=>0)==='called',`${race} can call for help away from its homeworld`);
  }
  for(const race of ['Minstrels','Mysterions','Nomad','Derelict','Veloxi Drone']) {
    check(distressCallDecision({...distressState,race,homeworld:true},()=>0)==='none',`${race} never sends a distress call`);
  }
  for(const patch of [{present:0},{present:3},{entered:20},{posture:'Friendly'},{posture:'Neutral'},{surrendering:true}]) {
    check(distressCallDecision({...distressState,...patch,homeworld:true},()=>0)==='none','Homeworlds still obey distress restrictions: '+JSON.stringify(patch));
  }
  check(distressCallDecision(distressState,()=>1/1500)==='none' && distressCallDecision(distressState,()=>0.999/1500)==='called','Call roll is exactly one successful integer out of 1500');
  check(distressCallDecision({...distressState,present:2,homeworld:true},()=>0.999)==='called','A qualifying homeworld fleet calls without a random delay');
  check(reinforcementArrivalOdds(1)===16 && reinforcementArrivalOdds(2)===10,'Arrival denominator follows original integer division');
  check(distressCallDecision({...distressState,called:true},()=>1/16)==='none' && distressCallDecision({...distressState,called:true},()=>0.999/16)==='arrived','Arrival roll has an exact one-in-16 boundary for one survivor');
  check(distressCallDecision({...distressState,present:2,called:true},()=>1/10)==='none' && distressCallDecision({...distressState,present:2,called:true},()=>0.999/10)==='arrived','Arrival roll has an exact one-in-10 boundary for two survivors');
  check(distressCallDecision({...distressState,called:true,posture:'Friendly',surrendering:true},()=>0)==='arrived','A distress call already sent still receives its wave after diplomacy changes');
  check(distressCallDecision({...distressState,called:true,present:0},()=>0)==='none','No reinforcements arrive after the last alien has died');
  const waveGroup=():AlienGroup=>({id:'distress-qa',race:'Uhlek',x:0,y:0,homeX:0,homeY:0,territoryRadius:20,isHomeworldFleet:true,shipsCount:5,spawnedTotal:5,baseMood:100,currentMood:100,posture:'Hostile',ships:Array.from({length:5},(_,i)=>({...createAlienShip('Uhlek','Warship','original-'+i,0,3),isWreck:i>0,hullIntegrity:i>0?0:1000}))});
  const reinforcementGroup=waveGroup();
  for(const race of ['Spemin','Thrynn','Veloxi'] as const) {
    const surrendering=waveGroup();surrendering.race=race;surrendering.isHomeworldFleet=false;
    check(updateFleetSurrender(surrendering) && !!surrendering.hasSurrendered && surrendering.posture==='Obsequious' && surrendering.ships.every(s=>s.shields===0),`${race} surrenders and lowers shields after losing half its fleet`);
    check(!updateFleetSurrender(surrendering),'A surrender is announced once rather than on every simulation step');
    check(!markFleetAttacked(surrendering) && surrendering.posture==='Obsequious' && fleetPosture(surrendering,'Friendly')==='Obsequious','Surrender survives further player fire and diplomatic mood changes');
    surrendering.distressCalled=true;
    check(distressCallPass(surrendering,true,{x:0,y:0},()=>0)==='arrived' && surrendering.ships.every(s=>s.shields===0) && surrendering.posture==='Obsequious','Previously called reinforcements arrive disarmed under the fleet surrender');
  }
  for(const race of ['Elowan','Gazurtoid','Mechans','Uhlek','Minstrels','Mysterions','Nomad','Derelict','Veloxi Drone'] as const) {
    const resilient=waveGroup();resilient.race=race;resilient.isHomeworldFleet=false;
    check(!updateFleetSurrender(resilient) && !resilient.hasSurrendered,`${race} does not inherit another species cowardice rule`);
  }
  const homeRemnant=waveGroup();homeRemnant.race='Spemin';
  check(!updateFleetSurrender(homeRemnant),'A homeworld fleet never surrenders through ordinary casualty cowardice');
  const threeShips=waveGroup();threeShips.race='Thrynn';threeShips.isHomeworldFleet=false;threeShips.ships=threeShips.ships.slice(0,3);threeShips.spawnedTotal=3;threeShips.ships[1].isWreck=false;threeShips.ships[1].hullIntegrity=300;
  check(!updateFleetSurrender(threeShips),'One loss out of three does not reach the surrender threshold');
  threeShips.ships[1].isWreck=true;threeShips.ships[1].hullIntegrity=0;
  check(updateFleetSurrender(threeShips),'Two losses out of three reach the surrender threshold');
  const extinctFleet=waveGroup();extinctFleet.race='Thrynn';extinctFleet.isHomeworldFleet=false;extinctFleet.ships.forEach(s=>{s.isWreck=true;s.hullIntegrity=0;});
  check(!updateFleetSurrender(extinctFleet),'A fully destroyed fleet cannot transmit a new surrender');
  const attackedFleet=waveGroup();
  check(markFleetAttacked(attackedFleet) && fleetPosture(attackedFleet,'Neutral')==='Hostile','A fleet fired upon stays hostile until the encounter ends');
  const warningFleet=waveGroup();
  check(!fleetCanFire(warningFleet,true),'Homeworld weapons stay silent before their final warning, even with a hostile mood');
  warningFleet.homeworldAttackStarted=true;
  check(fleetCanFire(warningFleet,false),'The final warning authorizes the hostile homeworld fleet to fire');
  warningFleet.homeworldAttackStarted=false;markFleetAttacked(warningFleet);
  check(fleetCanFire(warningFleet,false),'The player firing first cancels the homeworld warning grace');
  warningFleet.hasSurrendered=true;
  check(!fleetCanFire(warningFleet,true),'A surrender overrides every firing permission');
  warningFleet.distressCalled=true;warningFleet.homeworldWarningCounts=[2,2,1];warningFleet.homeworldWarningStage=3;warningFleet.surrenderLinesSeen=[3];
  beginFleetVisit(warningFleet);
  check(!warningFleet.attackedByPlayer && !warningFleet.homeworldAttackStarted && !warningFleet.hasSurrendered && warningFleet.homeworldWarningCounts.join(',')==='0,0,0' && warningFleet.homeworldWarningStage===0,'A fresh encounter visit resets its conversation and attack flags');
  check(warningFleet.distressCalled===true && warningFleet.spawnedTotal===5 && warningFleet.ships.length===5,'A fresh visit retains the pending distress call, lifetime entries and wrecks');
  check(distressCallPass(reinforcementGroup,false,{x:30,y:-20},()=>0)==='called' && reinforcementGroup.ships.length===5 && reinforcementGroup.distressCalled===true,'Sending a call cannot spawn a wave in that same pass');
  const savedPendingGroup=JSON.parse(JSON.stringify(reinforcementGroup)) as AlienGroup;
  check(distressCallPass(savedPendingGroup,false,{x:30,y:-20},()=>0)==='arrived' && savedPendingGroup.ships.length===8 && savedPendingGroup.spawnedTotal===8 && !savedPendingGroup.distressCalled,'A restored pending call adds a complete wave and clears its call flag');
  check(savedPendingGroup.ships.slice(0,5).every((s,i)=>s.id===reinforcementGroup.ships[i].id && s.isWreck===reinforcementGroup.ships[i].isWreck),'Arrivals retain every existing wreck and salvage target');
  check(savedPendingGroup.ships.slice(5).every(s=>Math.max(Math.abs(s.x-30),Math.abs(s.y+20))===15 && s.hullIntegrity===s.maxHull && s.hasPlasmaBolts && !s.isWreck),'New warships arrive healthy on the square fifteen cells around the current player');
  for(let pass=0;pass<20;pass++) {
    savedPendingGroup.ships.forEach((ship,i)=>{if(i>0){ship.isWreck=true;ship.hullIntegrity=0;}});
    distressCallPass(savedPendingGroup,false,{x:0,y:0},()=>0);
  }
  check(savedPendingGroup.spawnedTotal===20 && savedPendingGroup.ships.length===20 && new Set(savedPendingGroup.ships.map(s=>s.id)).size===20,'Repeated calls stop at twenty total entries with unique ship IDs');
  const largeWave=waveGroup();largeWave.shipsCount=20;largeWave.distressCalled=true;
  distressCallPass(largeWave,false,{x:0,y:0},()=>0);
  check(largeWave.ships.filter(s=>!s.isWreck).length===16 && largeWave.spawnedTotal===20,'Canvas encounters do not inherit the Unity port eight-model screen cap');
  const cappedWave=waveGroup();cappedWave.spawnedTotal=19;cappedWave.distressCalled=true;
  distressCallPass(cappedWave,false,{x:0,y:0},()=>0);
  check(cappedWave.ships.length===6 && cappedWave.spawnedTotal===20,'A final wave is truncated to the remaining lifetime allowance');
  const noticeCatalog=[{id:1,date:'01-01-4620'},{id:2,date:'02-01-4620'},{id:13,date:'29-10-4620'},{id:14,date:'01-01-4621'}];
  const archivedNotices=[{...noticeCatalog[0],read:true},{id:101,date:'01-01-4620',read:true}];
  check(releaseNotices(archivedNotices,noticeCatalog,0)===archivedNotices,'Future notices do not arrive early or replace stable state');
  const dayOneNotices=releaseNotices(archivedNotices,noticeCatalog,1);
  check(dayOneNotices.length===3 && dayOneNotices[2].id===2 && !dayOneNotices[2].read,'A scheduled notice arrives unread on its exact release day');
  const lateNotices=releaseNotices(dayOneNotices,noticeCatalog,298);
  check(lateNotices.length===4 && lateNotices.some(n=>n.id===13&&!n.read),'Late campaign warnings become available after a time jump');
  check(lateNotices[0]===archivedNotices[0] && lateNotices[1]===archivedNotices[1],'Notice release preserves read flags and earned milestone records');
  check(releaseNotices(lateNotices,noticeCatalog,298)===lateNotices,'Rechecking a date cannot duplicate notices');
  check(releaseNotices(lateNotices,noticeCatalog,0)===lateNotices,'Returning to an earlier developer date cannot erase historical notices');
  check(releaseNotices(lateNotices,noticeCatalog,300).at(-1)?.id===14,'Notice dates follow the 300-day standard year');
  for(const hz of [30,60,120]) {
    let exposure={ticks:0,remainder:0};
    for(let step=0;step<hz*140;step++) exposure=advanceCrystalHeat(exposure,1/hz);
    check(exposure.ticks===70 && exposure.remainder<1e-8,`Crystal radiation reaches its first hull threshold at exactly 140 seconds at ${hz}Hz`);
  }
  const beforeThermalThreshold={ticks:69,remainder:1.95};
  const resumedHeat=advanceCrystalHeat(JSON.parse(JSON.stringify(beforeThermalThreshold)),0.05);
  check(resumedHeat.ticks===70 && resumedHeat.pulses.join(',')==='70','Reloaded thermal exposure crosses its pending damage threshold exactly once');
  check(advanceCrystalHeat(resumedHeat,0).pulses.length===0,'Paused thermal exposure cannot repeat damage');
  check(advanceCrystalHeat({ticks:279,remainder:1.95},0.1).ticks===280 && advanceCrystalHeat({ticks:280,remainder:0},1).pulses.length===0,'Terminal radiation fires once and stops accumulating');
  const successionSpecialists=(['science','navigation','engineering','communications','medicine'] as const).map(skill=>({id:skill,alive:true,skills:{science:10,navigation:10,engineering:10,communications:10,medicine:10,[skill]:200}}));
  for(const [post,skill] of [['Captain','science'],['Science Officer','science'],['Navigator','navigation'],['Engineer','engineering'],['Communications','communications'],['Doctor','medicine']] as const) {
    check(bestActingOfficer(successionSpecialists,post)?.id===skill,`Casualty succession selects the ${skill} specialist for ${post}`);
  }
  check(bestActingOfficer([{...successionSpecialists[2],alive:false},successionSpecialists[0]],'Engineer')?.id==='science','A deceased specialist cannot inherit a bridge post');
  check(bestActingOfficer([],'Doctor')===null,'An empty surviving roster leaves the station vacant');
  check(bestActingOfficer([{...successionSpecialists[0],alive:false}],'Captain')===null,'Total crew loss has no acting commander');
  check(bestActingOfficer([successionSpecialists[0],{...successionSpecialists[0],id:'tie'}],'Captain')?.id==='science' && successionSpecialists[0].id==='science','Ties preserve roster order without mutating candidates');
  check(thrynnFuelOffer(45000,50,50,1.5)===1.5, 'A full-hold Thrynn exchange uses the space released by its relic');
  check(thrynnFuelOffer(45000,50,49.95,1.5)===1.5, 'Thrynn quotes floor fractional capacity instead of rounding it up');
  check(thrynnFuelOffer(45000,50,50,0)===0, 'No available cargo space produces no positive offer');
  check(thrynnFuelOffer(33,500,20,1)===1, 'Small relic values retain the existing minimum Thrynn quote');
  const relicCopies=[{id:'cone',volume:1.5},{id:'cone',volume:1.5},{id:'egg',volume:5}];
  const trade=exchangeArtifactForFuel(relicCopies,'cone',19.95,1.5,50,50)!;
  check(trade.fuel===21.45 && trade.artifacts.length===2 && trade.artifacts[0]===relicCopies[1] && relicCopies.length===3, 'Artifact exchange removes exactly one copy and preserves fractional fuel and source data');
  check(exchangeArtifactForFuel(relicCopies,'missing',20,1,50,40)===null, 'A vanished artifact cannot be exchanged again');
  check(exchangeArtifactForFuel(relicCopies,'cone',20,0,50,50)===null, 'A zero offer cannot silently become a one-unit reward');
  check(exchangeArtifactForFuel(relicCopies,'cone',20,2,50,50)===null, 'Changed capacity cannot fulfil an oversized fuel promise');
  check(payFuelTribute(4,9)===null && payFuelTribute(9,9)===0, 'Veloxi tribute requires the full amount and accepts its exact boundary');
  check(payFuelTribute(9.05,9)===0.05 && payFuelTribute(4,0)===null, 'Tribute preserves fractional fuel and rejects an invalid zero demand');
  const animal: LifeformSpecimen = {id:'animal',speciesName:'Survey Hunter',size:'Small',volume:1,bountyValue:1200,temperament:'aggressive',color:'#ff3322',x:0,y:0,vx:0,vy:0,stunned:false,dead:false,recorded:false,captured:false};
  for(const temperament of ['aggressive','fleeing'] as const) {
    const overlapping={...animal,temperament};
    const attacked=advanceLifeform(overlapping,0,0,1/60,()=>1);
    check(Number.isFinite(overlapping.x) && Number.isFinite(overlapping.y) && Math.hypot(overlapping.x,overlapping.y)>0, `${temperament} wildlife can separate from an overlapping rover without corrupting coordinates`);
    check(attacked===(temperament==='aggressive'), 'Only aggressive wildlife attacks during separation');
  }
  for(const flag of ['stunned','dead','captured'] as const) {
    const inactive={...animal,[flag]:true};
    check(!advanceLifeform(inactive,0,0,1,()=>0) && inactive.x===0 && inactive.y===0, `${flag} wildlife neither moves nor attacks`);
  }
  const liveTarget={...animal,id:'living',x:3};
  check(stunnerTarget([{...animal,dead:true},{...animal,stunned:true},liveTarget],0,0)?.id==='living', 'Stunner bypasses dead and already stunned wildlife');
  check(stunnerTarget([{...animal,x:6}],0,0)!==null && stunnerTarget([{...animal,x:6.001}],0,0)===null, 'Stunner range includes its boundary and excludes distant targets');
  check(mineableVolume(8,0.05)===0 && mineableVolume(8,0.3)===0.3, 'Mining cannot round fractional free space into an overflow');
  check(mineableVolume(0.05,2)===0.05 && mineableVolume(8,50)===2.5, 'Mining preserves a small remainder and its normal chunk limit');
  const cone=CANONICAL_ARTIFACTS.find(a=>a.id==='crystal-cone')!;
  const ruin: SurfaceRuin={id:'ruin',name:'Survey Vault',x:0,y:0,loreTitle:'Record',loreMessage:'Record',artifactId:cone.id,explored:false};
  check(!recoverRuinArtifact(ruin,cone,1) && ruin.explored && ruin.artifactRecovered===false, 'Full-hold ruin exploration leaves its relic at the site');
  check(recoverRuinArtifact(ruin,cone,1.5) && ruin.artifactRecovered===true, 'Freeing cargo space permits a later exact-capacity recovery');
  check(!recoverRuinArtifact(ruin,cone,50), 'Revisiting the same ruin cannot duplicate a recovered artifact');
  check(!recoverRuinArtifact({...ruin,artifactRecovered:undefined,explored:true},cone,50), 'Legacy explored ruins remain recovered');
  const safeCargo=recoveredCargo({name:'The Black Egg [ARMED]',isArmed:true,volume:5});
  check(!safeCargo.isArmed && safeCargo.name==='The Black Egg' && safeCargo.volume===5, 'Recovered armed cargo is disarmed without losing its payload');
  const coordinates=surfaceCoordinates(20,179,10,5);
  check(coordinates.lat===19 && coordinates.lon===-179, 'Surface positions use the same scale and longitude wrapping everywhere');
  const local=localSurfacePosition(20,179,coordinates.lat,coordinates.lon);
  check(local.x===10 && local.y===5, 'Local and planetary coordinates roundtrip across the longitude seam');
  const crystalWorld=UNIVERSE.stars.find(star=>star.x===192 && star.y===152)!;
  const nexusSurface=generatePlanetSurface(192,152,crystalWorld.planets[0],{lat:20,lon:45});
  const nexus=nexusSurface.ruins.find(ruin=>ruin.isControlNexus)!;
  check(nexus.x===0 && nexus.y===-135, 'The Control Nexus remains at 47N 45E when landing at 20N 45E');
  nexus.explored=true; nexus.artifactRecovered=true;
  preparePlanetSurface(nexusSurface,192,152,crystalWorld.planets[0],47,45);
  check(nexus.x===0 && nexus.y===0 && nexus.explored && nexus.artifactRecovered, 'Landing at the Nexus preserves its exploration state and places it at the landing site');
  check(nexusSurface.ruins.filter(ruin=>ruin.isControlNexus).length===1, 'New regions cannot duplicate the canonical Nexus');
  const resourceWorld=UNIVERSE.stars[0].planets[0];
  const regional=generatePlanetSurface(125,100,resourceWorld,{lat:20,lon:25});
  const depleted=regional.minerals[0];
  depleted.taken=true; depleted.volume=0;
  regional.droppedCargo.push({id:'left-cargo',name:'Copper',type:'mineral',volume:3,value:360,x:1,y:2});
  const cargoWorld=surfaceCoordinates(20,25,1,2);
  const originalNodeCount=regional.minerals.length;
  preparePlanetSurface(regional,125,100,resourceWorld,30,40);
  const cargoAfter=surfaceCoordinates(30,40,regional.droppedCargo[0].x,regional.droppedCargo[0].y);
  check(Math.abs(cargoWorld.lat-cargoAfter.lat)<1e-9 && Math.abs(cargoWorld.lon-cargoAfter.lon)<1e-9, 'Moving landing sites preserves the world position of dropped cargo');
  check(depleted.taken && depleted.volume===0 && regional.minerals.length>originalNodeCount, 'New terrain regions add local deposits without refilling old ones');
  const expandedNodeCount=regional.minerals.length;
  for(let revisit=0;revisit<5;revisit++) {
    preparePlanetSurface(regional,125,100,resourceWorld,20,25);
    preparePlanetSurface(regional,125,100,resourceWorld,30,40);
  }
  check(regional.minerals.length===expandedNodeCount && new Set(regional.minerals.map(item=>item.id)).size===expandedNodeCount, 'Revisiting known regions never duplicates resource nodes');
  preparePlanetSurface(regional,125,100,resourceWorld,20,25);
  check(Math.abs(regional.droppedCargo[0].x-1)<1e-9 && Math.abs(regional.droppedCargo[0].y-2)<1e-9 && depleted.taken, 'Returning to the original site restores cargo coordinates and the depleted deposit');
  const regionalSave=structuredClone(fixture) as ExportSavePayload;
  Object.assign(regionalSave.data.snapshot!,{currentSurfaceState:regional,planetSurfaces:{'125-100-0':regional}});
  const regionalRoundtrip=decodeSaveFromBase64(encodeSaveToBase64(regionalSave))!.data.snapshot!.currentSurfaceState!;
  check(regionalRoundtrip.generatedRegions?.length===2 && regionalRoundtrip.originLat===20 && regionalRoundtrip.minerals[0].taken, 'Multi-region surface state survives the actual mission codec');
  const invalidSurfaces:string[]=[], duplicateEntities:string[]=[];
  for(const star of UNIVERSE.stars) for(const planet of star.planets) {
    const generated=generatePlanetSurface(star.x,star.y,planet,{lat:0,lon:0});
    const entities=[...generated.minerals,...generated.lifeforms,...generated.ruins];
    if(!entities.every(item=>Number.isFinite(item.x)&&Number.isFinite(item.y))) invalidSurfaces.push(`${star.id}:${planet.orderIndex}`);
    if(new Set(entities.map(item=>item.id)).size!==entities.length) duplicateEntities.push(`${star.id}:${planet.orderIndex}`);
  }
  check(invalidSurfaces.length===0, 'All 811 generated planetary surfaces have finite entity coordinates: '+invalidSurfaces.join(','));
  check(duplicateEntities.length===0, 'All 811 generated planetary surfaces have unique local entity IDs: '+duplicateEntities.join(','));
  check(landingRequirements(1.08,0.2).fuelBurn===0.2 && !landingRequirements(1.08,0.2).isInsufficient, 'Exactly the displayed landing fuel meets the requirement');
  check(landingRequirements(1.08,0.199).isInsufficient && !landingRequirements(1.08,0.3).isInsufficient, 'Landing rejects actual fuel shortages and accepts reserves');
  check(landingRequirements(0,0).fuelBurn===0 && !landingRequirements(0,0).isInsufficient, 'Zero gravity is not replaced by Arth gravity');
  check(!landingRequirements(7.99,20).isCrush && landingRequirements(8,20).isCrush, 'Gravity crush threshold remains exactly eight G');
  for (const patch of [{landingLat:91},{landingLong:null},{currentSurfaceState:{...regional,originLat:91}},{currentSurfaceState:{...regional,generatedRegions:[{}]}},{currentSurfaceState:{...regional,lifeforms:[{...animal,bountyValue:null}]}},{currentSurfaceState:{...regional,lifeforms:[{...animal,vx:'invalid'}]}},{currentSurfaceState:{...regional,ruins:[{...ruin,artifactRecovered:'yes'}]}}]) {
    const invalid=structuredClone(regionalSave);
    Object.assign(invalid.data.snapshot!,patch);
    check(decodeSaveFromBase64(encodeSaveToBase64(invalid))===null,'Corrupt planetary state is rejected: '+Object.keys(patch)[0]);
  }
  check(projectileArrival(100, -0.01) === 'expired', 'An expired distant missile cannot hit the player');
  check(projectileArrival(0.5, -0.01) === 'hit', 'A projectile reaching its target on the final step still hits');
  check(projectileArrival(0.8, 1) === 'travel' && projectileArrival(0.8, 0) === 'expired', 'Impact uses the actual collision radius');
  const defense: ShipDefense = {shields:0,armor:150,hull:250,shieldClass:1,armorClass:1,shieldsRaised:false,inNebula:false};
  const firstHit = resolveShipHit(defense,100);
  const secondHit = resolveShipHit(firstHit,100);
  check(firstHit.armor === 50 && firstHit.hull === 250, 'The first hit consumes the available armor');
  check(secondHit.armor === 0 && secondHit.hull === 200, 'A simultaneous second hit penetrates the remaining armor');
  const shielded = {...defense,shields:150,shieldsRaised:true};
  const shieldVolley = resolveShipHit(resolveShipHit(shielded,100),100);
  check(shieldVolley.shields === 0 && shieldVolley.armor === 100 && shieldVolley.hull === 250, 'Multiple impacts consume shields before armor without reusing either pool');
  const nebulaHit = resolveShipHit({...shielded,inNebula:true},100);
  check(nebulaHit.shields === 150 && nebulaHit.armor === 50, 'Nebula damage bypasses shields without consuming them');
  const protectedHit = resolveShipHit({...defense,armorClass:5},100);
  check(protectedHit.armorLoss === 20 && protectedHit.hullDamage === 0, 'Installed armor class retains its damage reduction');
  check(resolveShipHit(defense,0).armor === 150 && resolveShipHit({...defense,hull:0},100).armor === 150, 'Zero damage and an already destroyed ship cannot take another hit');
  check(resolveShipHit({...defense,armor:0,hull:20},100).hull === 0, 'Lethal damage clamps hull at zero');
  for (const hz of [30,60,120]) {
    let health=50, primary=50, hull=100, subsystem=80;
    for (let i=0;i<hz*10;i++) {
      health=advanceHealth(health,100,crewHealingRate(20,false),1/hz);
      primary=advanceHealth(primary,100,crewHealingRate(20,true),1/hz);
      hull=advanceHealth(hull,250,repairPercentageRate(50)*2.5,1/hz);
      subsystem=advanceHealth(subsystem,100,repairPercentageRate(0),1/hz);
    }
    check(Math.abs(health-52)<1e-8 && Math.abs(primary-54)<1e-8, `Healing and primary treatment retain their exact rates at ${hz}Hz`);
    check(Math.abs(hull-125)<1e-8 && Math.abs(subsystem-85)<1e-8, `Hull and minimum-skill repairs retain their exact rates at ${hz}Hz`);
  }
  check(fieldRepairCost(249.5/2.5) === 0.1, 'Fractional hull damage remains repairable for the minimum mineral charge');
  check(fieldRepairCost(98) === 0.2 && fieldRepairCost(50) === 5 && fieldRepairCost(100) === 0, 'Field repairs retain existing mineral prices');
  check(adjustCargoStock(0.15,-fieldRepairCost(99)) === 0.05, 'A minimum repair preserves the unused fractional mineral balance');
  const nearFullPurchase=clampPurchaseQuantity(5,12000,440,0.15);
  check(nearFullPurchase === 0.1 && adjustCargoStock(29.85,nearFullPurchase) === 29.95, 'Buying near capacity cannot round mineral stock above the purchased amount');
  check(adjustCargoStock(0.15,-saleQuantity(5,0.15)) === 0.05, 'Selling one tenth preserves stock below the trade lot size');
  check(adjustCargoStock(adjustCargoStock(0.15,0.1),-0.1) === 0.15, 'A purchase and sale conserve the original fractional inventory');
  check(adjustCargoStock(5.05,-5) === 0.05 && adjustCargoStock(0.05,-0.05) === 0, 'Jettisoning preserves the remainder or empties an exact fractional load');
  check(advanceHealth(99,100,10,1) === 100 && advanceHealth(50,100,1,0) === 50, 'Maintenance clamps at full health and freezes while paused');
  const fluxSave=structuredClone(fixture) as ExportSavePayload;
  check(JSON.stringify(restoreSettings(undefined))===JSON.stringify(DEFAULT_GAME_SETTINGS),'Legacy missions with no settings restore explicit defaults');
  const legacySettings=restoreSettings({musicVolume:0,voicesVolume:undefined,banterEnabled:false});
  check(legacySettings.musicVolume===0 && legacySettings.voicesVolume===0.8 && !legacySettings.banterEnabled && legacySettings.graphicsQuality==='High' && !legacySettings.crtFilter && legacySettings.screenShake,'Legacy missing fields cannot inherit another mission settings while valid zero/false choices remain intact');
  const settingsSave=structuredClone(fluxSave);
  settingsSave.data.snapshot!.settings={...DEFAULT_GAME_SETTINGS,graphicsQuality:'Low',crtFilter:true,screenShake:false,musicVolume:0,soundVolume:0.35,voicesVolume:1,alienVoiceEffects:false};
  const settingsRoundtrip=decodeSaveFromBase64(encodeSaveToBase64(settingsSave))!.data.snapshot!.settings!;
  check(settingsRoundtrip.graphicsQuality==='Low' && settingsRoundtrip.crtFilter===true && settingsRoundtrip.screenShake===false && settingsRoundtrip.musicVolume===0 && settingsRoundtrip.soundVolume===0.35 && settingsRoundtrip.voicesVolume===1 && settingsRoundtrip.alienVoiceEffects===false,'Graphics, audio and accessibility choices survive the save codec exactly');
  for(const settings of [{musicVolume:-0.01},{soundVolume:1.01},{voicesVolume:null},{graphicsQuality:'Ultra'},{textSpeed:'Turbo'},{crtFilter:'yes'},{screenShake:0},{banterEnabled:null},null]) {
    const invalid=structuredClone(fluxSave);
    (invalid.data.snapshot! as any).settings=settings;
    check(decodeSaveFromBase64(encodeSaveToBase64(invalid))===null,'Invalid graphics/audio settings cannot replace a mission: '+JSON.stringify(settings));
  }
  const validComms={active:true,connected:true,alienMood:60,alienPosture:'Neutral',playerPosture:'Neutral',dialogueHistory:[],pendingPriorityBusiness:{type:'veloxi_tribute',promptText:'Pay tribute',timer:60,tributeAmount:9}};
  for(const patch of [
    {alienMood:101},{dialogueHistory:null},{pendingPriorityBusiness:{...validComms.pendingPriorityBusiness,tributeAmount:-9}},
    {pendingPriorityBusiness:{type:'thrynn_artifact',promptText:'Trade',timer:60,artifactId:'cone',fuelOffer:null}},
    {pendingAlienQuestion:{text:'Answer',timer:1,remindersLeft:-1}},
  ]) {
    const invalid=structuredClone(fluxSave);
    (invalid.data.snapshot! as any).alienCommsState={...validComms,...patch};
    check(decodeSaveFromBase64(encodeSaveToBase64(invalid))===null,'Invalid diplomatic records cannot replace a mission: '+Object.keys(patch)[0]);
  }
  const pendingDiplomacy=structuredClone(fluxSave);
  (pendingDiplomacy.data.snapshot! as any).alienCommsState=validComms;
  check(decodeSaveFromBase64(encodeSaveToBase64(pendingDiplomacy))!==null,'Valid pending tribute survives mission import');
  Object.assign(fluxSave.data.snapshot!,{fluxDisorientation:25,fluxCooldown:4,fluxExitDest:[69,65]});
  const fluxRoundtrip=decodeSaveFromBase64(encodeSaveToBase64(fluxSave))!.data.snapshot!;
  check(fluxRoundtrip.fluxDisorientation===25 && fluxRoundtrip.fluxCooldown===4 && fluxRoundtrip.fluxExitDest?.[1]===65, 'Flux recovery and exit lock survive the save codec');
  for(const patch of [{fluxDisorientation:-1},{fluxCooldown:-1},{fluxExitDest:[69]},{fluxExitDest:[250,65]},{fluxExitDest:[69,null]}]) {
    const invalid=structuredClone(fluxSave);
    Object.assign(invalid.data.snapshot!,patch);
    check(decodeSaveFromBase64(encodeSaveToBase64(invalid))===null,'Corrupt flux navigation state is rejected: '+Object.keys(patch)[0]);
  }
  for(const patch of [
    {subsystems:null}, {subsystems:{...fluxSave.data.snapshot!.subsystems,Sensors:101}},
    {inoperativeSystems:{...fluxSave.data.snapshot!.inoperativeSystems,Engines:'yes'}},
    {activeRepairTask:{target:'Unknown',targetHealth:100,mineralName:'Copper',mineralCost:1}},
    {activeRepairTask:{target:'Sensors',targetHealth:100,mineralName:'Copper',mineralCost:-1}},
    {crewRoster:[{...fluxSave.data.snapshot!.crewRoster[0],vitality:null}]},
    {playerShieldPoints:null}, {activePatientId:{id:'not-an-id'}},
  ]) {
    const invalid=structuredClone(fluxSave);
    Object.assign(invalid.data.snapshot!,patch);
    check(decodeSaveFromBase64(encodeSaveToBase64(invalid))===null,'Corrupt maintenance state is rejected: '+Object.keys(patch)[0]);
  }
  check(decodeSaveFromBase64('{"data":{"shipName":"Broken"}}') === null, 'Incomplete imports cannot overwrite a valid mission');
  check(decodeSaveFromBase64('{"snapshot":{},"shipName":"Broken","slot":"E"}') === null, 'Missing snapshot fields are rejected');
  check(decodeSaveFromBase64('not a save') === null, 'Corrupt codes are rejected');
  const payload = structuredClone(fixture) as ExportSavePayload;
  payload.data.snapshot!.shipName = 'Étoile 🚀';
  const encoded = encodeSaveToBase64(payload);
  for(const patch of [{crystalHeatTicks:-1},{crystalHeatTicks:1.5},{crystalHeatTicks:281},{crystalHeatRemainder:-0.1},{crystalHeatRemainder:2},{crystalHeatRemainder:null}]) {
    const invalidHeat=structuredClone(payload);
    Object.assign(invalidHeat.data.snapshot!,patch);
    check(decodeSaveFromBase64(JSON.stringify(invalidHeat))===null,'Invalid thermal exposure cannot replace a mission: '+JSON.stringify(patch));
  }
  check(decodeSaveFromBase64(encoded)?.data.snapshot?.shipName === 'Étoile 🚀', 'Save codes preserve Unicode names');
  check(!!decodeSaveFromBase64(JSON.stringify(payload)), 'Plain JSON export remains supported');
  check(!!decodeSaveFromBase64(JSON.stringify(payload.data)), 'Legacy raw slot exports remain supported');
  check(!!decodeSaveFromBase64(encoded.slice(8)), 'Bare base64 exports remain supported');
  const baySave=structuredClone(payload);
  Object.assign(baySave.data.snapshot!,{cinematicState:'launch',cinematicRemaining:4,cinematicDuration:8});
  check(decodeSaveFromBase64(encodeSaveToBase64(baySave))?.data.snapshot?.cinematicDuration===8,'New launch duration survives the actual public export/import codec');
  delete baySave.data.snapshot!.cinematicDuration;
  check(!!decodeSaveFromBase64(encodeSaveToBase64(baySave)),'Legacy cinematic saves remain valid without a duration field');
  for(const value of [0,-1,31,null,'8',3]){
    const badBay=structuredClone(baySave);Object.assign(badBay.data.snapshot!,{cinematicDuration:value});
    check(decodeSaveFromBase64(encodeSaveToBase64(badBay))===null,'Malformed or shorter-than-remaining cinematic duration cannot replace a mission: '+String(value));
  }
  const mismatched = structuredClone(payload);
  mismatched.data.credits = -999;
  mismatched.data.shipName = 'stale metadata';
  const normalized = decodeSaveFromBase64(JSON.stringify(mismatched))!.data;
  check(normalized.credits === payload.data.snapshot!.credits && normalized.shipName === 'Étoile 🚀', 'Slot labels and balances derive from the validated mission snapshot');
  for (const patch of [{location:'Unknown'}, {location:'On Planet',orbitPlanetIndex:null}, {currentStarId:-1}, {engineClass:99}, {enduriumFuel:-1}, {systemShipX:null}, {crewRoster:[{}]}, {cargoHold:{Cobalt:-2}}, {stardateHour:24}]) {
    const invalid = structuredClone(payload);
    Object.assign(invalid.data.snapshot!, patch);
    check(decodeSaveFromBase64(JSON.stringify(invalid)) === null, 'Invalid mission state is rejected: '+Object.keys(patch).join(','));
  }
  for (const artifact of CANONICAL_ARTIFACTS) {
    check(isCrystalArtifact(artifact, 'orb') === (artifact.id === 'crystal-orb'), `${artifact.realName} has only its own artifact effect`);
  }
  check(isCrystalArtifact({id:'art-crystal_orb'}, 'orb'), 'Legacy artifact IDs retain their powers');
  check(isCrystalArtifact({realName:'The Crystal Orb'}, 'orb'), 'Legacy named artifacts retain their powers');
  check(!isCrystalArtifact({codeName:'Pulsing Amber Orb'}, 'orb'), 'Whining Orb cannot bypass the Crystal Planet heat guard');
  for (const hz of [30,60,120]) {
    let fuel = 100;
    for (let step = 0; step < hz * 60; step++) fuel = consumeFuel(fuel, 0.01 / hz);
    check(Math.abs(fuel - 99.4) < 1e-8, `Rover uses the same fuel after 60 seconds at ${hz}Hz`);
  }
  check(consumeFuel(0.001, 1) === 0, 'Fuel never becomes negative');
  check(Math.abs(consumeFuel(consumeFuel(19.95005,0.1),0.5)-19.35005)<1e-10,'Laser and missile charges preserve fuel below three decimal places');
  check(shipCargoVolume(20.06,{Aluminum:29.88,Endurium:0},[],[]) === 49.94, 'Shared capacity accounting retains fractional fuel');
  check(shipCargoVolume(20,{Copper:1},[{volume:5}],[{volume:2}]) === 28, 'Fuel, minerals, artifacts and specimens all occupy cargo space');
  check(!canRemoveCargoPod(1,90), 'A loaded cargo pod cannot be sold if the ship would overflow');
  check(canRemoveCargoPod(1,50) && !canRemoveCargoPod(1,50.01), 'Pod removal uses exact capacity boundaries');
  check(canRemoveCargoPod(2,100) && !canRemoveCargoPod(0,0), 'Only installed, unneeded pods can be removed');
  check(newMissionDestination([{slot:'A',empty:false},{slot:'B',empty:true},{slot:'E',empty:false}],'A').slot === 'B', 'Starting a fresh mission preserves a selected occupied save');
  check(newMissionDestination([{slot:'A',empty:false},{slot:'B',empty:true},{slot:'E',empty:true}],'E').slot === 'E', 'An explicitly selected empty slot is preferred');
  check(newMissionDestination([{slot:'A',empty:false},{slot:'E',empty:false}],'E').replace, 'Replacing a mission requires confirmation when slots are full');
  const traded = new Set(marketCommodities(1,1,4620).map(item=>item.name));
  const mined = new Set(UNIVERSE.stars.flatMap(star=>star.planets.flatMap(planet=>planet.minerals.map(mineral=>mineral.name))));
  check([...mined].every(name=>traded.has(name)), 'Every mineral generated in the galaxy can be traded');
  check(['Copper','Silver','Iron','Platinum'].every(name=>traded.has(name)), 'All subsystem repair materials can be purchased');
  check(MINERAL_CATALOG.find(item=>item.name==='Chromium')?.price === 520, 'Chromium uses the original ELEMENT value rather than the remake fallback');
  check(getEnduriumPrice(19,2,4620) === 1000 && getEnduriumPrice(20,2,4620) === 1500, 'First announced fuel price change starts on day 49');
  check(getEnduriumPrice(14,5,4620) === 1500 && getEnduriumPrice(15,5,4620) === 2000, 'Second announced fuel price change starts on day 134');
  check(marketCommodities(20,2,4620).find(item=>item.name==='Endurium')?.sellPrice === 1500, 'Fuel buyback uses the prevailing market price');
  check(clampPurchaseQuantity(10,500,1000,30) === 0.5, 'Buying clamps to available credits');
  check(clampPurchaseQuantity(0.1,12000,120,50-49.94) === 0, 'Fractional fuel use cannot make a near-full hold accept too much cargo');
  check(clampPurchaseQuantity(10,12000,120,0.3) === 0.3, 'Cargo uses precise tenths without floating-point underflow');
  check(clampPurchaseQuantity(5,-1,1000,20) === 0, 'A negative balance cannot buy goods');
  check(saleQuantity(5,2.7) === 2.7 && saleQuantity(0.1,0.06) === 0, 'Selling clamps to available whole tenths');
  check(accruedInterest(47000,30) === 564, 'Thirty-day bank interest cannot lose a whole MU to floating-point rounding');
  check(accruedInterest(12000,300) === 1440, 'A full standard year accrues exactly twelve percent');
  check(accruedInterest(2499,1) === 0 && accruedInterest(2500,1) === 1, 'Interest retains the original whole-MU payment boundary');
  check(accruedInterest(47000,0) === 0 && accruedInterest(-100,30) === -1 && accruedInterest(47000,-1) === 0, 'Negative balances are charged interest, while repeated and negative-time events earn none');
  for (const key of ['w','a','s','d','W','A','S','D','ArrowUp','ArrowDown','ArrowLeft','ArrowRight']) {
    check(roverCommand(key) === undefined, `${key} remains a movement key rather than opening an action menu`);
  }
  check(roverCommand('q') === 'scan' && roverCommand('R') === 'weapon', 'Action shortcuts avoid WASD and support uppercase');
  const mixedCargo = [{type:'mineral', volume:10, value:100}, {type:'artifact', volume:5, value:1000}, {type:'specimen', volume:2, value:200}];
  const partial = fitCargo(mixedCargo, 3.2);
  check(partial.accepted.length === 1 && partial.accepted[0].volume === 3.2, 'Only available capacity is unloaded');
  check(partial.remaining.length === 3 && partial.remaining[0].volume === 6.8, 'Overflow cargo stays in the rover');
  check(Math.abs(partial.accepted[0].value! + partial.remaining[0].value! - 100) < 1e-9, 'Splitting cargo conserves its value');
  check(fitCargo(mixedCargo.slice(1), 4).accepted[0].type === 'specimen', 'Oversized artifacts are retained whole while smaller cargo can fit');
  check(fitCargo(mixedCargo, 0).remaining.length === 3, 'Full ship loses no rover cargo');
  check(fitCargo(mixedCargo, 17).remaining.length === 0, 'Exact capacity transfers all items');
  for (const free of [0,0.05,0.1,0.3,1.95,3.2,7,17,100]) {
    const result = fitCargo(mixedCargo, free);
    const used = result.accepted.reduce((sum,item)=>sum+item.volume,0);
    const total = used + result.remaining.reduce((sum,item)=>sum+item.volume,0);
    check(used <= free + 1e-9 && Math.abs(total - 17) < 1e-9, `Transfer conserves cargo without exceeding ${free} m³`);
  }
  const target = { systemCoords: [192,152] as [number,number], planetIndex: 0, lat: 47, lon: 45, isArmed: true };
  for (const hz of [30,60,120]) {
    let sequence: DetonationSequence | null = { target, elapsed: 0 };
    const events: string[] = [];
    for (let step=0; step<hz*11 && sequence; step++) {
      const result = advanceDetonation(sequence, 1/hz);
      sequence = result.sequence; events.push(...result.events);
    }
    check(sequence === null && events.join(',') === 'signal,5,4,3,2,1,blast,resolve', `Countdown resolves once at ${hz}Hz`);
  }
  const mid = advanceDetonation({target,elapsed:0},4.5).sequence!;
  check(advanceDetonation(mid,0).sequence?.elapsed === 4.5, 'Paused simulation does not advance the bomb');
  const restored = JSON.parse(JSON.stringify(mid)) as DetonationSequence;
  check(advanceDetonation(restored,5.5).events.join(',') === '2,1,blast,resolve', 'Reload resumes the countdown without replaying earlier events');
  check(advanceDetonation({target,elapsed:0},10).events.length === 8, 'A large timestep does not skip countdown events');
  check(detonationResult(target) === 'victory', 'Black Egg at the Control Nexus wins the campaign');
  check(detonationResult({...target,lat:52,lon:50}) === 'victory', 'Nexus tolerance includes its boundary');
  check(detonationResult({...target,lat:52.1}) === 'damaged', 'Missing the Nexus does not award victory');
  check(detonationResult({...target,systemCoords:[55,32],planetIndex:1}) === 'uhlek', 'Uhlek homeworld destruction silences the swarm');
  check(detonationResult({...target,systemCoords:[148,63],planetIndex:1}) === 'elowan', 'Elowan homeworld destruction has diplomatic consequences');
  check(detonationResult({...target,systemCoords:[125,100]}) === 'destroyed', 'Ordinary destruction does not award a campaign victory');
  const pending = structuredClone(payload);
  pending.data.snapshot!.detonationSequence = restored;
  check(decodeSaveFromBase64(encodeSaveToBase64(pending))?.data.snapshot?.detonationSequence?.elapsed === 4.5, 'Pending countdown survives the actual export/import codec');
  pending.data.snapshot!.detonationSequence = {...restored, elapsed: -1};
  check(decodeSaveFromBase64(encodeSaveToBase64(pending)) === null, 'Corrupt pending countdowns are rejected');
  const combat = structuredClone(payload);
  Object.assign(combat.data.snapshot!, {
    location:'Encounter', encounterShipPos:{x:9,y:-4}, laserCooldown:1.5, missileCooldown:2.5, combatPassTimer:0.4,
    combatActive:true, encounterPassIndex:2, combatDuration:22, questionCountdownTimer:12, questionTotalTime:60,
    activeEncounterGroup:{id:'qa-group',race:'Elowan',x:125,y:100,homeX:125,homeY:100,territoryRadius:10,shipsCount:1,spawnedTotal:1,baseMood:10,currentMood:10,posture:'Friendly',ships:[createAlienShip('Elowan','Scout','qa-alien',10,-4)]},
  });
  const combatRoundtrip = decodeSaveFromBase64(encodeSaveToBase64(combat))!.data.snapshot!;
  const rememberedFleet=structuredClone(combat);
  rememberedFleet.data.snapshot!.fleetChanges={'canonical-0':canonicalFleets[0]};
  rememberedFleet.data.snapshot!.alienTrackingHour=2;
  check(decodeSaveFromBase64(encodeSaveToBase64(rememberedFleet))?.data.snapshot?.fleetChanges?.['canonical-0'].ships[0].id===canonicalFleets[0].ships[0].id,'Actual save codec retains the sparse campaign fleet ledger');
  for(const patch of [{fleetChanges:{'wrong-id':canonicalFleets[0]}},{fleetChanges:{'canonical-0':{...canonicalFleets[0],x:null}}},{fleetChanges:{'canonical-0':{...canonicalFleets[0],orbitSlot:9}}},{alienTrackingHour:-1},{alienTrackingHour:1.5}]) {
    const badFleet=structuredClone(combat);Object.assign(badFleet.data.snapshot!,patch);
    check(decodeSaveFromBase64(encodeSaveToBase64(badFleet))===null,'Corrupt campaign fleet state is rejected: '+Object.keys(patch)[0]);
  }
  const pendingDistress=structuredClone(combat);
  pendingDistress.data.snapshot!.activeEncounterGroup={...reinforcementGroup,distressCalled:true};
  pendingDistress.data.snapshot!.combatPassTimer=0.24;
  const pendingDistressRestored=decodeSaveFromBase64(encodeSaveToBase64(pendingDistress))!.data.snapshot!;
  check(pendingDistressRestored.activeEncounterGroup?.distressCalled===true && pendingDistressRestored.activeEncounterGroup.spawnedTotal===5 && pendingDistressRestored.combatPassTimer===0.24,'Save codec retains a pending call, total entries and fractional pass timer');
  for(const patch of [{distressCalled:'yes'},{hasSurrendered:'yes'},{attackedByPlayer:1},{homeworldAttackStarted:1},{homeworldWarningStage:4},{homeworldWarningCounts:[0,1]},{homeworldWarningCounts:[0,-1,0]},{surrenderLinesSeen:[1,1]},{surrenderLinesSeen:[553]},{spawnedTotal:21},{spawnedTotal:4},{spawnedTotal:-1},{shipsCount:0},{shipsCount:2.5}]) {
    const invalidDistress=structuredClone(pendingDistress);
    Object.assign(invalidDistress.data.snapshot!.activeEncounterGroup!,patch);
    check(decodeSaveFromBase64(encodeSaveToBase64(invalidDistress))===null,'Invalid reinforcement data cannot replace a mission: '+JSON.stringify(patch));
  }
  check(combatRoundtrip.encounterShipPos?.x === 9 && combatRoundtrip.encounterShipPos.y === -4, 'Combat saves retain the player position');
  check(combatRoundtrip.laserCooldown === 1.5 && combatRoundtrip.missileCooldown === 2.5, 'Weapon cooldowns survive export/import');
  check(combatRoundtrip.combatPassTimer === 0.4 && combatRoundtrip.combatDuration === 22 && combatRoundtrip.encounterPassIndex === 2, 'Combat pass progression survives export/import');
  for (const patch of [{activeEncounterGroup:{ships:[]}}, {encounterShipPos:{x:null,y:0}}, {laserCooldown:-1}, {vehicleHold:{}}, {currentSurfaceState:{minerals:[]}}, {planetSurfaces:{broken:{}}}]) {
    const invalid = structuredClone(combat);
    Object.assign(invalid.data.snapshot!, patch);
    check(decodeSaveFromBase64(encodeSaveToBase64(invalid)) === null, 'Corrupt encounter/surface records are rejected: '+Object.keys(patch).join(','));
  }
  let wrecks = [[{type:'endurium', volume:3, value:3000},{type:'mineral',volume:4,value:400}], [{type:'mineral',volume:5,value:500}]];
  let salvageCapacity = 1.2;
  for (let pass=0; pass<120; pass++) {
    wrecks = wrecks.map(loot => {
      const result = fitCargo(loot,salvageCapacity);
      salvageCapacity -= result.accepted.reduce((sum,item)=>sum+item.volume,0);
      return result.remaining;
    });
  }
  check(Math.abs(wrecks.flat().reduce((sum,item)=>sum+item.volume,0) - 10.8) < 1e-9, 'Repeated nearby wreck checks leave overflow loot intact');
  const destroyed = new Set([planetKey(125,100,1)]);
  check(!destroyed.has(planetKey(125,100,0)) && !destroyed.has(planetKey(125,100,2)), 'Destroying one planet does not destroy adjacent planets');
  const arth = UNIVERSE.stars.find(star => star.id === 1)!;
  for (const removed of [0,1,2]) {
    const remaining = survivingPlanets(arth.planets,arth.x,arth.y,[planetKey(arth.x,arth.y,removed)]);
    check(remaining.length === arth.planets.length - 1 && remaining.every(planet=>planet.orderIndex !== removed), `Removing Arth-system planet ${removed+1} preserves all neighbors despite gaps in slots`);
  }
  const disk = new Map([['mission', 'old checkpoint']]);
  let full = true;
  const storage = createSafeStorage(() => ({getItem: key => disk.get(key) ?? null, setItem: (key, value) => { if (full) throw new Error('Quota exceeded'); disk.set(key, value); }}));
  check(!storage.set('mission', 'new checkpoint'), 'Storage-full saves report that persistence failed');
  check(storage.get('mission') === 'new checkpoint', 'Failed saves remain available for export, ahead of an older disk copy');
  check(disk.get('mission') === 'old checkpoint', 'A failed save preserves the last durable checkpoint');
  full = false;
  check(storage.set('mission', 'recovered checkpoint') && disk.get('mission') === 'recovered checkpoint', 'Saving recovers once storage is writable');
  check(storage.get('mission') === 'recovered checkpoint', 'Recovered writes supersede the session fallback');
  return { passed, failed: 0, results: [] as string[] };
}

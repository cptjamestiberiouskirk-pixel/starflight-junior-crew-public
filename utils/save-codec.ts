import {isCrewPortraitId} from './crew-portraits';
import {validPlanetSurvey} from './planet-survey';
import {survivingPlanets} from './gameplay-rules';
import {validPlanetScan,scanPlanetKey} from './planet-scans';
import type { SaveSlotData } from '../App';
import { UNIVERSE } from '../galaxy';
import {PARSED_COMM_LINES,resolveRaceId} from '../src/commData';
import {saveRenderCoordinatesAreSafe} from './render-safety';
import {MAX_SAVE_JSON_BYTES,MAX_SAVE_NODES,importTextWithinBudget,saveJSONTextWithinBudget,saveStructureWithinBudget,validSaveCollections,validSaveFleetMembers,validSaveSurfaceMembers,validSaveMessages} from './save-validation';

const locations = ['Starport', 'Docking Bay', 'Star System', 'Hyperspace', 'In Orbit', 'Landing', 'On Planet', 'Terrain Vehicle', 'Encounter'];
const record = (value: unknown): value is Record<string, any> => !!value && typeof value === 'object' && !Array.isArray(value);
const finite = (value: unknown) => typeof value === 'number' && Number.isFinite(value);
const alienRaces = ['Veloxi','Uhlek','Gazurtoid','Spemin','Thrynn','Elowan','Mechans','Minstrels','Nomad','Veloxi Drone','Mysterions','Derelict'];
const subsystemKeys = ['Engines','Sensors','Comms','Shields','Missiles','Lasers'];
function validFleet(group: unknown) {
  if(!record(group) || typeof group.id!=='string' || !alienRaces.includes(group.race)
    || !['x','y','homeX','homeY'].every(key=>finite(group[key]))
    || !['baseMood','currentMood'].every(key=>finite(group[key])&&group[key]>=0&&group[key]<=100)
    || !['Friendly','Neutral','Hostile','Obsequious'].includes(group.posture)
    || !Array.isArray(group.ships) || group.ships.length>20
    || !group.ships.every(ship=>record(ship) && typeof ship.id==='string'
      && ['x','y','armor','shields','hullIntegrity','maxHull','laserClass','missileClass'].every(key=>finite(ship[key])))) return false;
  if(new Set(group.ships.map(ship=>ship.id)).size!==group.ships.length) return false;
  if(group.distressCalled!==undefined && typeof group.distressCalled!=='boolean') return false;
  if(group.hasSurrendered!==undefined && typeof group.hasSurrendered!=='boolean') return false;
  if(group.attackedByPlayer!==undefined && typeof group.attackedByPlayer!=='boolean') return false;
  if(group.conversation!==undefined) {
    const clock=group.conversation;
    if(!record(clock)||!finite(clock.nextSpeech)||clock.nextSpeech<0||clock.nextSpeech>35
      ||!finite(clock.scanRemaining)||clock.scanRemaining< -4||clock.scanRemaining>90
      ||!['playerPhrases','alienPhrases','transmissionIndex'].every(key=>Number.isSafeInteger(clock[key])&&clock[key]>=0)
      ||!Number.isInteger(clock.phraseLimit)||clock.phraseLimit<4||clock.phraseLimit>19
      ||!['scanned','noHumansWarned','shieldsUp','weaponsArmed'].every(key=>typeof clock[key]==='boolean')
      ||clock.returnToOrbit!==undefined&&(!finite(clock.returnToOrbit)||clock.returnToOrbit<0||clock.returnToOrbit>3||group.id!=='canonical-77'))return false;
    if(clock.hails!==undefined&&(!Number.isSafeInteger(clock.hails)||clock.hails<0||clock.hails>552))return false;
    for(const key of ['pendingHail','disconnected','playerHailedFirst'])if(clock[key]!==undefined&&typeof clock[key]!=='boolean')return false;
    if(clock.playerPostures!==undefined&&(!Number.isInteger(clock.playerPostures)||clock.playerPostures<0||clock.playerPostures>15))return false;
    if(clock.connectionRemaining!==undefined&&(!finite(clock.connectionRemaining)||clock.connectionRemaining<0||clock.connectionRemaining>300))return false;
    if(clock.pendingSubject!==undefined&&(!Number.isInteger(clock.pendingSubject)||clock.pendingSubject<7||clock.pendingSubject>11))return false;
    if(clock.lockedSubjects!==undefined&&(!Array.isArray(clock.lockedSubjects)||clock.lockedSubjects.length>2||new Set(clock.lockedSubjects).size!==clock.lockedSubjects.length||!clock.lockedSubjects.every(id=>id===10||id===11)))return false;
  }
  if(group.droneChallenge!==undefined) {
    const test=group.droneChallenge;
    if(group.race!=='Veloxi Drone'||!record(test)||!['waiting','asking','granted','denied'].includes(test.status)
      ||!Number.isInteger(test.correct)||test.correct<0||test.correct>6
      ||!finite(test.remaining)||test.remaining<0||test.remaining>15
      ||(test.status==='asking' ? !Number.isInteger(test.number)||test.number<1||test.number>99||test.correct===6
        : test.number!==null)
      ||(test.status==='granted'&&test.correct!==6)
      ||(test.status==='waiting'&&test.correct===6))return false;
  }
  if(group.homeworldAttackStarted!==undefined && typeof group.homeworldAttackStarted!=='boolean') return false;
  if(group.homeworldWarningStage!==undefined && (!Number.isInteger(group.homeworldWarningStage) || group.homeworldWarningStage<0 || group.homeworldWarningStage>3)) return false;
  if(group.homeworldWarningCounts!==undefined && (!Array.isArray(group.homeworldWarningCounts) || group.homeworldWarningCounts.length!==3 || !group.homeworldWarningCounts.every(n=>Number.isInteger(n)&&n>=0&&n<=552))) return false;
  if(group.surrenderLinesSeen!==undefined && (!Array.isArray(group.surrenderLinesSeen) || group.surrenderLinesSeen.length>552 || !group.surrenderLinesSeen.every(n=>Number.isInteger(n)&&n>=1&&n<=552) || new Set(group.surrenderLinesSeen).size!==group.surrenderLinesSeen.length)) return false;
  for(const key of ['shipsCount','spawnedTotal']) {
    if(group[key]!==undefined && (!Number.isInteger(group[key]) || group[key]<1 || group[key]>20)) return false;
  }
  if(group.spawnedTotal!==undefined && group.spawnedTotal<group.ships.length) return false;
  if(group.encounterLocation!==undefined && !['Hyperspace','Star System','In Orbit'].includes(group.encounterLocation)) return false;
  for(const key of ['starX','starY']) if(group[key]!==undefined && (!finite(group[key]) || group[key]<0 || group[key]>(key==='starX'?249:219))) return false;
  return validSaveFleetMembers(group) && (group.orbitSlot==null || Number.isInteger(group.orbitSlot) && group.orbitSlot>=1 && group.orbitSlot<=8);
}
function surface(value:unknown) {
  if(record(value)&&value.survey!==undefined&&!validPlanetSurvey(value.survey))return false;
  if (!record(value) || !finite(value.planetSeed) || !['minerals','ruins','lifeforms','droppedCargo'].every(key => Array.isArray(value[key]) && value[key].every(item => record(item) && typeof item.id==='string' && finite(item.x) && finite(item.y)))) return false;
  for (const [key,min,max] of [['originLat',-90,90],['originLong',-180,180]] as const) {
    if (value[key]!==undefined && (!finite(value[key]) || value[key]<min || value[key]>max)) return false;
  }
  if (value.generatedRegions!==undefined && (!Array.isArray(value.generatedRegions) || !value.generatedRegions.every(region=>typeof region==='string'))) return false;
  if (!value.minerals.every(item => typeof item.name==='string' && finite(item.volume) && item.volume>=0 && typeof item.taken==='boolean')) return false;
  if (!value.ruins.every(item => ['name','loreTitle','loreMessage'].every(key=>typeof item[key]==='string') && typeof item.explored==='boolean'
    && (item.artifactId===undefined || typeof item.artifactId==='string')
    && (item.artifactRecovered===undefined || typeof item.artifactRecovered==='boolean')
    && (item.lat===undefined || finite(item.lat) && item.lat>=-90 && item.lat<=90)
    && (item.long===undefined || finite(item.long) && item.long>=-180 && item.long<=180))) return false;
  if (!value.lifeforms.every(item => typeof item.speciesName==='string' && ['Small','Medium','Large','Behemoth'].includes(item.size)
    && ['passive','fleeing','aggressive'].includes(item.temperament) && finite(item.volume) && item.volume>=0 && finite(item.bountyValue) && item.bountyValue>=0
    && ['vx','vy'].every(key=>item[key]===undefined || finite(item[key]))
    && ['aggression','intelligence'].every(key=>item[key]===undefined || finite(item[key])&&item[key]>=0&&item[key]<=100)
    && (item.hitPoints===undefined || finite(item.hitPoints)&&item.hitPoints>=0&&item.hitPoints<=256)
    && (item.bodyPlan===undefined || Number.isInteger(item.bodyPlan)&&item.bodyPlan>=0&&item.bodyPlan<=13)
    && (item.attackCooldown===undefined || finite(item.attackCooldown)&&item.attackCooldown>=0&&item.attackCooldown<=.5)
    && (item.niche===undefined || ['Producer','Herbivore','Carnivore','Omnivore'].includes(item.niche))
    && (item.composition===undefined || Array.isArray(item.composition)&&item.composition.length<=8&&item.composition.every(element=>typeof element==='string'))
    && ['stunned','dead','recorded','captured'].every(key=>typeof item[key]==='boolean'))) return false;
  return value.droppedCargo.every(item => typeof item.name==='string' && ['mineral','artifact','specimen'].includes(item.type) && finite(item.volume) && item.volume>=0 && finite(item.value) && item.value>=0) && validSaveSurfaceMembers(value);
}

/** Reject incomplete/corrupt imports before they replace an existing slot. */
export function isPlayableSave(data: unknown): data is SaveSlotData {
  if (!saveStructureWithinBudget(data) || !record(data) || !record(data.snapshot)) return false;
  const s = data.snapshot;
  if(!saveRenderCoordinatesAreSafe(s))return false;
  if (!locations.includes(s.location) || typeof s.shipName !== 'string') return false;
  if (s.settings!==undefined) {
    const settings=s.settings;
    if (!record(settings)) return false;
    for (const key of ['musicVolume','soundVolume','voicesVolume']) {
      if (settings[key]!==undefined && (!finite(settings[key]) || settings[key]<0 || settings[key]>1)) return false;
    }
    for (const key of ['banterEnabled','alienVoiceEffects','crtFilter','screenShake']) {
      if (settings[key]!==undefined && typeof settings[key]!=='boolean') return false;
    }
    if (settings.textSpeed!==undefined && !['Slow','Normal','Fast','Instant'].includes(settings.textSpeed)) return false;
    if (settings.graphicsQuality!==undefined && !['Low','Medium','High'].includes(settings.graphicsQuality)) return false;
  }
  for (const key of ['credits', 'concourseAstronautX', 'galaxyShipX', 'galaxyShipY', 'systemShipX', 'systemShipY', 'shipHeading', 'enduriumFuel', 'hullIntegrity']) {
    if (!finite(s[key])) return false;
  }
  for (const key of ['engineClass', 'shieldClass', 'armorClass', 'missileClass', 'laserClass']) {
    if (!Number.isInteger(s[key]) || s[key] < 0 || s[key] > 5) return false;
  }
  if (!Number.isInteger(s.cargoPods) || s.cargoPods < 0 || s.cargoPods > 16 || s.enduriumFuel < 0) return false;
  if (!record(s.cargoHold) || !Object.values(s.cargoHold).every(v => finite(v) && (v as number) >= 0)) return false;
  if (!Array.isArray(s.crewRoster) || !s.crewRoster.every(c => record(c) && typeof c.id === 'string' && typeof c.name === 'string' && typeof c.alive === 'boolean' && (c.portraitId === undefined || isCrewPortraitId(c.race,c.portraitId)) && finite(c.vitality) && c.vitality >= 0 && c.vitality <= 100 && finite(c.durability) && c.durability >= 0 && ['Human', 'Velox', 'Thrynn', 'Elowan', 'Android'].includes(c.race) && record(c.skills) && ['science', 'navigation', 'engineering', 'communications', 'medicine'].every(k => finite(c.skills[k])))) return false;
  if(s.orbitAnimPhase!==undefined&&(!finite(s.orbitAnimPhase)||s.orbitAnimPhase<0||s.orbitAnimPhase>1e12))return false;
  if(s.hyperspaceDepartureStarId!=null&&(!Number.isInteger(s.hyperspaceDepartureStarId)||!UNIVERSE.stars.some(st=>st.id===s.hyperspaceDepartureStarId)))return false;
  if(s.roverWaypoint!=null && (!record(s.roverWaypoint)||!finite(s.roverWaypoint.x)||!finite(s.roverWaypoint.y)||Math.abs(s.roverWaypoint.x)>1800||Math.abs(s.roverWaypoint.y)>900))return false;
  if (s.subsystems !== undefined && (!record(s.subsystems) || !subsystemKeys.every(k => finite(s.subsystems[k]) && s.subsystems[k] >= 0 && s.subsystems[k] <= 100))) return false;
  if (s.inoperativeSystems !== undefined && (!record(s.inoperativeSystems) || !subsystemKeys.every(k => typeof s.inoperativeSystems[k] === 'boolean'))) return false;
  for (const key of ['playerArmorPoints','playerShieldPoints']) {
    if (s[key] !== undefined && (!finite(s[key]) || s[key] < 0)) return false;
  }
  if (s.activePatientId !== undefined && s.activePatientId !== null && typeof s.activePatientId !== 'string') return false;
  if (s.activeRepairTask != null) {
    const task = s.activeRepairTask;
    if (!record(task) || !['Hull',...subsystemKeys].includes(task.target) || typeof task.mineralName !== 'string'
      || !finite(task.targetHealth) || task.targetHealth <= 0 || task.targetHealth > 100
      || !finite(task.mineralCost) || task.mineralCost < 0) return false;
  }
  if (!record(s.assignedPosts) || !['Captain', 'Science Officer', 'Navigator', 'Engineer', 'Communications', 'Doctor'].every(k => s.assignedPosts[k] === null || typeof s.assignedPosts[k] === 'string')) return false;
  if (!Array.isArray(s.artifactsInHold) || !s.artifactsInHold.every(a => record(a) && typeof a.id === 'string' && finite(a.volume) && a.volume>=0 && typeof a.codeName === 'string' && typeof a.realName === 'string')) return false;
  if (s.alienCommsState !== undefined) {
    const comms=s.alienCommsState;
    const postures=['Friendly','Neutral','Hostile','Obsequious'];
    if (!record(comms) || typeof comms.active!=='boolean' || typeof comms.connected!=='boolean'
      || !finite(comms.alienMood) || comms.alienMood<0 || comms.alienMood>100
      || !postures.includes(comms.alienPosture) || !postures.includes(comms.playerPosture)
      || !Array.isArray(comms.dialogueHistory) || !comms.dialogueHistory.every(line=>record(line) && typeof line.text==='string')) return false;
    const business=comms.pendingPriorityBusiness;
    if (business!=null && (!record(business) || !['thrynn_artifact','veloxi_crystal_orb','veloxi_ellipsoid','veloxi_tribute'].includes(business.type)
      || typeof business.promptText!=='string' || !finite(business.timer) || business.timer<0
      || business.type==='thrynn_artifact' && (typeof business.artifactId!=='string' || !finite(business.fuelOffer) || business.fuelOffer<0)
      || business.type==='veloxi_tribute' && (!finite(business.tributeAmount) || business.tributeAmount<=0))) return false;
    const question=comms.pendingAlienQuestion;
    if (question!=null && (!record(question) || typeof question.text!=='string' || !finite(question.timer) || question.timer<0 || !finite(question.remindersLeft) || question.remindersLeft<0)) return false;
    if(question?.id!==undefined&&(!Number.isInteger(question.id)||!Number.isInteger(question.remindersLeft)||question.remindersLeft>2
      ||!PARSED_COMM_LINES.some(line=>line.id===question.id&&line.subject===14&&line.race===resolveRaceId(s.activeEncounterGroup?.race??''))))return false;
  }
  if(s.mechan9Unlocked!==undefined&&typeof s.mechan9Unlocked!=='boolean')return false;
  if(s.commTopicProgress!==undefined) {
    if(!record(s.commTopicProgress)||Object.keys(s.commTopicProgress).length>60)return false;
    for(const [key,last] of Object.entries(s.commTopicProgress)) {
      const match=key.match(/^(\d+):(7|8|9|10|11)$/);
      if(!match||!alienRaces.some(race=>resolveRaceId(race)===Number(match[1]))||!Number.isInteger(last)||(last as number)<0)return false;
      if(last!==0&&!PARSED_COMM_LINES.some(line=>line.id===last&&line.race===Number(match[1])&&line.subject===Number(match[2])))return false;
    }
  }
  const star = UNIVERSE.stars.find(st => st.id === s.currentStarId);
  if (!star) return false;
  for (const [key,min,max] of [['landingLat',-90,90],['landingLong',-180,180]] as const) {
    if (s[key]!==undefined && (!finite(s[key]) || s[key]<min || s[key]>max)) return false;
  }
  if (s.orbitPlanetIndex !== null && (!Number.isInteger(s.orbitPlanetIndex) || s.orbitPlanetIndex < 0 || s.orbitPlanetIndex >= star.planets.length)) return false;
  const destroyed=[...(Array.isArray(s.destroyedPlanetKeys)?s.destroyedPlanetKeys:Array.isArray(s.destroyedPlanets)?s.destroyedPlanets:[])];
  if(s.gameWon||s.flaresStopped||s.flaresHalted)destroyed.push('192-152-0');
  const remainingPlanets=survivingPlanets(star.planets,star.x,star.y,destroyed);
  if (['In Orbit', 'Landing', 'On Planet', 'Terrain Vehicle'].includes(s.location) && (s.orbitPlanetIndex===null||!remainingPlanets[s.orbitPlanetIndex])) return false;
  const scannedPlanet=s.location==='In Orbit' && s.orbitPlanetIndex!==null?remainingPlanets[s.orbitPlanetIndex]:null;
  if(s.planetaryScan!=null && !validPlanetScan(s.planetaryScan,scannedPlanet?scanPlanetKey(star.id,scannedPlanet.slot):null))return false;
  if (s.activeEncounterGroup != null) {
    if(!validFleet(s.activeEncounterGroup)) return false;
  }
  if(s.fleetChanges!==undefined && (!record(s.fleetChanges) || Object.keys(s.fleetChanges).length>316
    || !Object.entries(s.fleetChanges).every(([id,group])=>/^canonical-\d+$/.test(id) && record(group) && group.id===id && validFleet(group)))) return false;
  if(s.alienTrackingHour!==undefined && (!Number.isInteger(s.alienTrackingHour) || s.alienTrackingHour<0)) return false;
  if (s.location === 'Encounter' && !s.activeEncounterGroup) return false;
  if (s.encounterShipPos !== undefined && (!record(s.encounterShipPos) || !finite(s.encounterShipPos.x) || !finite(s.encounterShipPos.y))) return false;
  for (const key of ['encounterPassIndex','combatDuration','combatPassTimer','laserCooldown','missileCooldown','encounterCooldown','questionCountdownTimer','questionTotalTime']) {
    if (s[key] !== undefined && (!finite(s[key]) || s[key] < 0)) return false;
  }
  for (const key of ['fluxDisorientation','fluxCooldown']) {
    if (s[key] !== undefined && (!finite(s[key]) || s[key] < 0)) return false;
  }
  if(s.crystalHeatTicks!==undefined && (!Number.isInteger(s.crystalHeatTicks) || s.crystalHeatTicks<0 || s.crystalHeatTicks>280)) return false;
  if(s.crystalHeatRemainder!==undefined && (!finite(s.crystalHeatRemainder) || s.crystalHeatRemainder<0 || s.crystalHeatRemainder>=2)) return false;
  if (s.fluxExitDest != null && (!Array.isArray(s.fluxExitDest) || s.fluxExitDest.length !== 2
    || !s.fluxExitDest.every(finite) || s.fluxExitDest[0] < 0 || s.fluxExitDest[0] > 249
    || s.fluxExitDest[1] < 0 || s.fluxExitDest[1] > 219)) return false;
  if (s.projectiles !== undefined && (!Array.isArray(s.projectiles) || !s.projectiles.every(p => record(p) && ['x','y','targetX','targetY','speed','damage','duration'].every(key => finite(p[key]))))) return false;
  for (const key of ['vehicleHold','specimensInHold','bulletins','evaluations','bankLedger','pendingRecommendations','visitedStarIds','traversedFluxIds','recommendedPlanets','loggedTelemetryPlanets','bridgeLog','systemMessages','banterLog']) {
    if (s[key] !== undefined && !Array.isArray(s[key])) return false;
  }
  if (s.currentSurfaceState != null && !surface(s.currentSurfaceState)) return false;
  if(s.surveyKnowledge!==undefined) {
    const knowledge=s.surveyKnowledge;
    if(!record(knowledge) || !finite(knowledge.unpaidValue) || knowledge.unpaidValue<0 || !Number.isSafeInteger(knowledge.unpaidValue)) return false;
    if(!Array.isArray(knowledge.classes)||!knowledge.classes.every(n=>Number.isInteger(n)&&n>=0&&n<=4)) return false;
    if(!Array.isArray(knowledge.orders)||!knowledge.orders.every(n=>Number.isInteger(n)&&n>=0&&n<=13)) return false;
    if(!Array.isArray(knowledge.species)||!knowledge.species.every(n=>typeof n==='string'&&n.length<300)) return false;
    if(['classes','orders','species'].some(key=>new Set(knowledge[key]).size!==knowledge[key].length)) return false;
  }
  if(s.artifactStock!==undefined) {
    if(!Array.isArray(s.artifactStock)||new Set(s.artifactStock.map(entry=>record(entry)?entry.stockId:null)).size!==s.artifactStock.length) return false;
    for(const entry of s.artifactStock) {
      if(!record(entry)||typeof entry.stockId!=='string'||!finite(entry.price)||entry.price<=0||!record(entry.artifact)) return false;
      const artifact=entry.artifact;
      if(['id','codeName','realName','description'].some(key=>typeof artifact[key]!=='string')||!finite(artifact.volume)||artifact.volume<0||!finite(artifact.basePrice)||artifact.basePrice<0||typeof artifact.appraised!=='boolean') return false;
    }
  }
  if(s.surfaceRecording!=null) {
    const action=s.surfaceRecording;
    if(!record(action)||typeof action.lifeformId!=='string'||typeof action.planetKey!=='string'
      ||!finite(action.remaining)||action.remaining<0||action.remaining>3
      ||!finite(action.interruptedFor)||action.interruptedFor<0||action.interruptedFor>1) return false;
  }
  if (s.planetSurfaces !== undefined && (!record(s.planetSurfaces) || !Object.values(s.planetSurfaces).every(surface))) return false;
  if (s.cinematicState !== undefined && !['none','launch','dock','descent','surface_launch'].includes(s.cinematicState)) return false;
  if (s.cinematicRemaining !== undefined && (!finite(s.cinematicRemaining) || s.cinematicRemaining < 0 || s.cinematicRemaining > 30)) return false;
  if (s.cinematicDuration !== undefined && (!finite(s.cinematicDuration) || s.cinematicDuration <= 0 || s.cinematicDuration > 30)) return false;
  if (s.cinematicDuration !== undefined && s.cinematicRemaining !== undefined && s.cinematicRemaining > s.cinematicDuration) return false;
  if (s.detonationSequence != null) {
    const sequence = s.detonationSequence;
    if (!record(sequence) || !finite(sequence.elapsed) || sequence.elapsed < 0 || sequence.elapsed >= 10 || !record(sequence.target)) return false;
    const target = sequence.target;
    if (!Array.isArray(target.systemCoords) || target.systemCoords.length !== 2 || !target.systemCoords.every(finite)
      || !Number.isInteger(target.planetIndex) || target.planetIndex < 0 || target.planetIndex > 7
      || !finite(target.lat) || !finite(target.lon) || target.isArmed !== true) return false;
  }
  for (const [key, min, max] of [['stardateDay', 1, 30], ['stardateMonth', 1, 10], ['stardateYear', 4620, 99999], ['stardateHour', 0, 23]] as const) {
    if (!Number.isInteger(s[key]) || s[key] < min || s[key] > max) return false;
  }
  return validSaveCollections(data);
}

/** Storage is a second untrusted entry point. Metadata-only prototype slots
 * remain supported; malformed snapshots must never fall back to that path. */
export function restorableSaveSlot(value:unknown,slot:SaveSlotData['slot']):SaveSlotData|null {
  if(!saveStructureWithinBudget(value)||!record(value))return null;
  if(value.snapshot!==undefined) return isPlayableSave(value)?{...normalizeSlot(value),slot}:null;
  if(typeof value.shipName!=='string'||typeof value.stardate!=='string'||typeof value.timestamp!=='string'
    ||!finite(value.credits)||!locations.includes(value.location)||typeof value.empty!=='boolean'
    ||value.bridgeLog!==undefined&&!validSaveMessages(value.bridgeLog))return null;
  return {...value,slot} as SaveSlotData;
}

export function parseSaveJSON(text:string):unknown {
  if(!saveJSONTextWithinBudget(text))return null;
  try {const data:unknown=JSON.parse(text);return saveStructureWithinBudget(data)?data:null;}catch{return null;}
}

/** The manifest holds five independent slots; each is validated separately. */
export function parseSaveManifest(text:string):unknown[]|null {
  if(!saveJSONTextWithinBudget(text,MAX_SAVE_JSON_BYTES*5,MAX_SAVE_NODES*5))return null;
  try {const data:unknown=JSON.parse(text);return Array.isArray(data)&&data.length<=5?data:null;}catch{return null;}
}

function normalizeSlot(data: SaveSlotData): SaveSlotData {
  const snapshot = data.snapshot!;
  return {
    ...data,
    slot: ['A','B','C','D','E'].includes(data.slot) ? data.slot : 'A',
    credits: snapshot.credits,
    shipName: snapshot.shipName || 'UNNAMED VESSEL',
    location: snapshot.location,
    stardate: `${String(snapshot.stardateDay).padStart(2,'0')}-${String(snapshot.stardateMonth).padStart(2,'0')}-${snapshot.stardateYear}`,
    empty: false,
    timestamp: typeof data.timestamp === 'string' ? data.timestamp : '',
  };
}

export interface ExportSavePayload {
  v: number;
  type: string;
  slot: 'A' | 'B' | 'C' | 'D' | 'E';
  timestamp: number;
  data: SaveSlotData;
}

export function encodeSaveToBase64(payload: ExportSavePayload): string {
  try {
    const jsonStr = JSON.stringify(payload);
    const utf8Bytes = new TextEncoder().encode(jsonStr);
    let binary = '';
    const len = utf8Bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(utf8Bytes[i]);
    }
    const b64 = btoa(binary);
    return `SFSAVE1_${b64}`;
  } catch (e) {
    console.error('Error encoding save:', e);
    return '';
  }
}

export function decodeSaveFromBase64(rawStr: string): ExportSavePayload | null {
  try {
    if(!importTextWithinBudget(rawStr))return null;
    let clean = rawStr.trim();
    if (clean.startsWith('SFSAVE1_')) {
      clean = clean.slice('SFSAVE1_'.length).trim();
    }
    let jsonStr: string;
    if(clean.startsWith('{'))jsonStr=clean;
    else {
      // Budget decoded bytes before atob allocates its binary string. Include
      // whitespace-tolerant old Base64 without creating an unbounded copy.
      const b64=clean.replace(/\s/g,'');
      const padding=b64.endsWith('==')?2:b64.endsWith('=')?1:0;
      if(Math.floor(b64.length*3/4)-padding>MAX_SAVE_JSON_BYTES)return null;
      const binary = atob(b64);
      if(binary.length>MAX_SAVE_JSON_BYTES)return null;
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      jsonStr = new TextDecoder().decode(bytes);
    }

    const parsed = parseSaveJSON(jsonStr) as Record<string,any>|null;
    if (!parsed || typeof parsed !== 'object') return null;
    if(parsed.v!==undefined&&(!Number.isSafeInteger(parsed.v)||parsed.v<1)
      ||parsed.type!==undefined&&typeof parsed.type!=='string'
      ||parsed.timestamp!==undefined&&typeof parsed.timestamp!=='string'&&!finite(parsed.timestamp)
      ||parsed.slot!==undefined&&(!['A','B','C','D','E'].includes(parsed.slot)))return null;

    if (parsed.data && typeof parsed.data === 'object') {
      const data = parsed.data;
      if (isPlayableSave(data)) {
        return {
          v: parsed.v || 1,
          type: parsed.type || 'starflight_save',
          slot: parsed.slot || data.slot || 'A',
          timestamp: parsed.timestamp || Date.now(),
          data: normalizeSlot(data),
        };
      }
    }

    if (isPlayableSave(parsed)) {
      return {
        v: 1,
        type: 'starflight_save',
        slot: parsed.slot || 'A',
        timestamp: Date.now(),
        data: normalizeSlot(parsed),
      };
    }

    return null;
  } catch (e) {
    return null;
  }
}


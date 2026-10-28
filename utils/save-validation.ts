/** Resource limits apply before decoding and before any mission is persisted.
 * They are deliberately well above normal missions, including accumulated
 * surfaces/history. Rejection never truncates or rewrites the player's backup. */
export const MAX_SAVE_JSON_BYTES=4*1024*1024;
export const MAX_SAVE_TEXT_CHARS=Math.ceil(MAX_SAVE_JSON_BYTES/3)*4+4096;
export const MAX_SAVE_FILE_BYTES=MAX_SAVE_TEXT_CHARS;
export const MAX_SAVE_NODES=250000;
export const MAX_SAVE_COLLECTION_ITEMS=20000;
export const MAX_SAVE_STRING_CHARS=65536;
export const MAX_SAVE_DEPTH=32;

export function saveTextWithinBudget(text:unknown,limit=MAX_SAVE_JSON_BYTES):text is string {
  if(typeof text!=='string'||text.length>limit)return false;
  let bytes=0;
  for(let i=0;i<text.length;i++) {
    const c=text.charCodeAt(i);
    if(c<128)bytes++;else if(c<2048)bytes+=2;
    else if(c>=0xd800&&c<=0xdbff&&i+1<text.length&&text.charCodeAt(i+1)>=0xdc00&&text.charCodeAt(i+1)<=0xdfff){bytes+=4;i++;}
    else bytes+=3;
    if(bytes>limit)return false;
  }
  return true;
}
export const importTextWithinBudget=(text:unknown):text is string=>
  typeof text==='string'&&text.length<=MAX_SAVE_TEXT_CHARS&&saveTextWithinBudget(text,MAX_SAVE_FILE_BYTES);

/** Cheap lexical preflight before JSON.parse builds an object graph. JSON.parse
 * remains the syntax authority; quoted braces and escaped quotes are ignored. */
export function saveJSONTextWithinBudget(text:string,limit=MAX_SAVE_JSON_BYTES,nodeLimit=MAX_SAVE_NODES):boolean {
  if(!saveTextWithinBudget(text,limit))return false;
  let quoted=false,escaped=false,depth=0,tokens=0;
  for(let i=0;i<text.length;i++) {
    const c=text[i];
    if(quoted){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c==='"')quoted=false;continue;}
    if(c==='"')quoted=true;
    else if(c==='{'||c==='['){if(++depth>MAX_SAVE_DEPTH+1)return false;}
    else if(c==='}'||c===']')depth--;
    if(c==='{'||c==='['||c===','||c===':')if(++tokens>nodeLimit*2)return false;
  }
  return true;
}

/** Iterative traversal bounds unknown extension data as well as known fields.
 * No recursive walk, stringify or clone of an unbudgeted input is required. */
export function saveStructureWithinBudget(value:unknown):boolean {
  const stack:Array<[unknown,number]>=[[value,0]];let nodes=0;
  while(stack.length) {
    const [v,depth]=stack.pop()!;
    if(++nodes>MAX_SAVE_NODES||depth>MAX_SAVE_DEPTH)return false;
    if(typeof v==='string'){if(v.length>MAX_SAVE_STRING_CHARS)return false;continue;}
    if(typeof v==='number'){if(!Number.isFinite(v))return false;continue;}
    if(v===null||typeof v==='boolean')continue;
    if(!v||typeof v!=='object')return false;
    const entries=Object.entries(v);
    if(entries.length>MAX_SAVE_COLLECTION_ITEMS||Array.isArray(v)&&entries.length!==v.length)return false;
    // Bound queued nodes too; a wide tree cannot allocate a huge work stack.
    if(nodes+stack.length+entries.length>MAX_SAVE_NODES)return false;
    for(const [key,item] of entries){if(key.length>MAX_SAVE_STRING_CHARS)return false;if(item!==undefined||Array.isArray(v))stack.push([item,depth+1]);}
  }
  return true;
}

type Test=(v:any)=>boolean;
export const saveRecord=(v:unknown):v is Record<string,any>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const str:Test=v=>typeof v==='string';
const num:Test=v=>typeof v==='number'&&Number.isFinite(v);
const bool:Test=v=>typeof v==='boolean';
const nonnegative:Test=v=>num(v)&&v>=0;
const integer:Test=v=>Number.isSafeInteger(v);
const oneOf=(...values:unknown[]):Test=>v=>values.includes(v);
const array=(test:Test):Test=>v=>Array.isArray(v)&&v.length<=MAX_SAVE_COLLECTION_ITEMS&&v.every(test);
const map=(test:Test):Test=>v=>saveRecord(v)&&Object.values(v).every(test);
function shape(required:Record<string,Test>,optional:Record<string,Test>={}):Test {
  return v=>saveRecord(v)&&Object.entries(required).every(([k,test])=>test(v[k]))
    &&Object.entries(optional).every(([k,test])=>v[k]===undefined||test(v[k]));
}
const nullable=(test:Test):Test=>v=>v===null||test(v);
const posts=oneOf('Captain','Science Officer','Navigator','Engineer','Communications','Doctor');
const races=oneOf('Veloxi','Uhlek','Gazurtoid','Spemin','Thrynn','Elowan','Mechans','Minstrels','Nomad','Veloxi Drone','Mysterions','Derelict');
export const validSaveMessages=array(shape({id:str,text:str},{speaker:str,post:posts,type:oneOf('info','alert','banter')}));
const artifact=shape({id:str,codeName:str,realName:str,volume:nonnegative,basePrice:nonnegative,description:str},{name:str,value:nonnegative,appraised:bool,specialEffectDesc:str});
const cargo=shape({id:str,name:str,type:oneOf('mineral','artifact','specimen'),volume:nonnegative,value:nonnegative},
  {artifactRef:artifact,speciesName:str,isArmed:bool,armedTimer:nonnegative});
const planet=shape({slot:integer,orderIndex:integer,name:str,type:oneOf('Rock','Frozen','Liquid','Gas Giant','Molten','Crystal'),
  size:oneOf('Small','Medium','Large','Huge'),renderSize:num,color:str,gravity:num,mass:num,orbitRadius:num,orbitSpeed:num,initialAngle:num,
  atmosphereDensity:oneOf('None','Very Thin','Thin','Moderate','Thick','Very Thick'),gases:array(str),hydrosphereCompound:str,hydrospherePercent:num,
  temperature:str,temperatureRange:str,tempMin:str,tempMax:str,tempMinIndex:num,tempMaxIndex:num,weather:oneOf('None','Calm','Moderate','Violent','Very Violent'),
  minerals:array(shape({name:str,density:num})),mineralDensity:num,enduriumDensity:num,bioDensity:num},{storyName:str,isHomeworld:bool,destroyed:bool});
const pending=shape({starId:integer,starName:str,starX:num,starY:num,slot:integer,planet,colonyName:str,stardate:str});
const bulletin=shape({id:num,date:str,title:str,paragraphs:array(str),author:str,read:bool});
const evaluation=shape({id:str,planetName:str,colonyName:str,starX:num,starY:num,stardate:str,suitable:bool,
  verdict:oneOf('SUITABLE','UNSUITABLE'),payout:num,reasons:array(str),notes:str,read:bool},
  {rating:oneOf('A','B','C','D','F'),fine:num,bonus:num,warningMessage:str,isOptimal:bool});
const bank=shape({date:str,desc:str,amount:num,balance:num},{type:str,stardate:str,note:str});
const target=shape({systemCoords:v=>Array.isArray(v)&&v.length===2&&v.every(num),planetIndex:integer,lat:num,lon:num,isArmed:bool});
const projectile=shape({id:str,fromPlayer:bool,type:oneOf('laser','missile','plasma'),x:num,y:num,targetX:num,targetY:num,speed:num,damage:num,duration:num},
  {maxDuration:num,color:str,targetShipId:str,targetIsPlayer:bool,playerLaunchX:num,playerLaunchY:num,isMiss:bool,sourceRace:str,sourceWeapon:str,sourceClass:str});
const fleetShip=shape({id:str,race:races,vesselClass:str,x:num,y:num,armor:num,shields:num,hullIntegrity:num,maxHull:num,laserClass:num,missileClass:num},
  {vesselType:oneOf('Transport','Scout','Warship','Drone','Probe','Minstrel','Derelict','Cosmic Entity'),
    size:oneOf('Small','Medium','Large','Dreadnought','Station','Cosmic Entity'),maxShields:num,fireDelay:num,fireCooldown:num,
    isStationary:bool,isMissileImmune:bool,isLaserImmune:bool,hasPlasmaBolts:bool,isWreck:bool,looted:bool,
    loot:array(shape({name:str,volume:nonnegative,type:oneOf('mineral','endurium','artifact'),value:nonnegative}))});
export const validSaveFleetMembers:Test=v=>saveRecord(v)&&array(fleetShip)(v.ships)
  &&shape({},{territoryRadius:num,isHomeworldFleet:bool})(v);
export const validSaveSurfaceMembers:Test=v=>saveRecord(v)&&shape(
  {planetType:oneOf('Rock','Frozen','Liquid','Gas Giant','Molten','Crystal'),color:str,hydrosphereCompound:str,scannedTimer:num})(v)
  &&v.lifeforms.every(shape({}, {color:str,composition:array(str),attackCooldown:num,heading:num}))
  &&v.ruins.every(shape({}, {isControlNexus:bool}))
  &&v.droppedCargo.every(cargo);

/** Missing later-version fields retain their existing restore defaults. Every
 * supplied collection member and nested renderable field must have its schema. */
export function validSaveCollections(slot:unknown):boolean {
  if(!saveRecord(slot)||!shape({}, {bridgeLog:validSaveMessages,isDev:bool,gameWon:bool,flaresHalted:bool})(slot)||!saveRecord(slot.snapshot))return false;
  const s=slot.snapshot;
  if(!shape({}, {
    bridgeLog:validSaveMessages,systemMessages:validSaveMessages,
    artifactStock:array(shape({stockId:str,price:nonnegative,artifact})),
    banterLog:array(shape({speaker:str,text:str,post:posts})),vehicleHold:array(cargo),specimensInHold:array(cargo),
    bulletins:array(bulletin),evaluations:array(evaluation),bankLedger:array(bank),pendingRecommendations:array(pending),
    visitedStarIds:array(integer),traversedFluxIds:array(integer),usedFluxes:array(integer),recommendedPlanets:array(str),
    loggedTelemetryPlanets:array(str),destroyedPlanetKeys:array(str),destroyedPlanets:array(str),sterilizedPlanets:array(str),discoveredSpecies:array(str),
    projectiles:array(projectile),commLineUsage:map(nonnegative),speciesBaseMoods:map(num),
    armedDetonationTracker:nullable(target),encounterShotsFired:shape({laser:nonnegative,missile:nonnegative}),
    prevLocation:oneOf('Starport','Docking Bay','Star System','Hyperspace','In Orbit','Landing','On Planet','Terrain Vehicle','Encounter'),
    vehicleWeapon:oneOf('Stunner','Laser'),starportRoomIndex:num,inRoom:bool,systemZoom:num,hyperZoom:num,vehicleHeading:num,vehicleFuel:num,
    lastInterestAbsDay:num,lastInterestStardateDays:num,lastInterestStardate:str,unsuitablePlanetsRecommendedCount:num,unsuitableCount:num,
    encounterTargetIndex:integer,isDev:bool,gameWon:bool,flaresHalted:bool,flaresStopped:bool,starportDestroyed:bool,vehicleDestroyed:bool,
    shieldsRaised:bool,weaponsArmed:bool,combatActive:bool,hasPurchasedBlackBox:bool,grantedDroneClearanceUntilHyperspace:bool,
    hasGivenEllipsoid:bool,hasRefusedCrystalOrb:bool,uhlekSilenced:bool,elowanHostile:bool,
  })(s))return false;
  if(!s.crewRoster.every(shape({}, {color:str,quirk:str})))return false;
  if(!s.artifactsInHold.every(artifact))return false;
  const comm=s.alienCommsState;
  if(comm!==undefined&&!shape({}, {
    conversationCount:num,maxPhrases:num,alienHailsCount:num,lastAlienSpeakerText:str,lastGarbledAlienText:str,lastCaptainText:str,
    activeSubject:nullable(v=>str(v)||num(v)),alienKnowsNothingMore:bool,
    activeTradeOffer:nullable(shape({stage:oneOf('Plutonium','Artifact','BlackBox'),itemName:str,costDesc:str,timer:num},{enduriumReward:num,priceCredits:num})),
    activeTriviaQuestion:nullable(shape({id:str,race:races,questionText:str,options:array(shape({label:str,isCorrect:bool})),timer:num},{rewardMoodDelta:num})),
    activeAssistanceRequest:nullable(shape({race:races,text:str,enduriumRequired:num,timer:num})),
    dialogueHistory:array(shape({text:str,race:races,subject:str},{rawText:str,timestamp:str})),
  })(comm))return false;
  if(comm?.pendingPriorityBusiness!=null&&!shape({}, {artifactName:str})(comm.pendingPriorityBusiness))return false;
  return true;
}

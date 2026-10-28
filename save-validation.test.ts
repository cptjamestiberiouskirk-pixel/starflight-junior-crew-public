import assert from 'node:assert/strict';
import {decodeSaveFromBase64,encodeSaveToBase64,parseSaveJSON,parseSaveManifest,restorableSaveSlot,type ExportSavePayload} from './utils/save-codec';
import {MAX_SAVE_JSON_BYTES,MAX_SAVE_TEXT_CHARS,MAX_SAVE_COLLECTION_ITEMS,MAX_SAVE_STRING_CHARS,MAX_SAVE_DEPTH,MAX_SAVE_NODES,saveStructureWithinBudget,saveJSONTextWithinBudget,saveTextWithinBudget,importTextWithinBudget} from './utils/save-validation';
import {UNIVERSE} from './galaxy';
import {createAlienShip,generateAlienGroups} from './alien';
import {generatePlanetSurface,CANONICAL_ARTIFACTS} from './surface';
import {surveyPlanet} from './utils/planet-survey';
import {planetKey} from './utils/gameplay-rules';
import fixture from './test-fixtures/commissioned-mission.json';

export function runSaveValidationTests() {
  let passed=0;
  const check=(v:unknown,label:string)=>{assert(v,label);passed++;};
  const bad=structuredClone(fixture) as ExportSavePayload;
  bad.data.snapshot!.bridgeLog=[null] as any;
  check(decodeSaveFromBase64(JSON.stringify(bad))===null,'Reject malformed log members before persistence');
  check(!!decodeSaveFromBase64(encodeSaveToBase64(fixture as ExportSavePayload)),'Preserve the commissioned legacy mission');
  const fresh=()=>structuredClone(fixture) as ExportSavePayload;
  const representations=(p:ExportSavePayload)=>{const json=JSON.stringify(p),b64=Buffer.from(json).toString('base64');return [json,JSON.stringify(p.data),b64,'SFSAVE1_'+b64];};
  const validate=(p:ExportSavePayload,expected:boolean,label:string)=>{
    for(const text of representations(p))check((decodeSaveFromBase64(text)!==null)===expected,label+' through all public encodings');
    check((restorableSaveSlot(p.data,'E')!==null)===expected,label+' through stored-slot restoration');
  };
  const samplePlanet=UNIVERSE.stars.find(s=>s.x===125&&s.y===100)!.planets[0];
  const cargo={id:'cargo',name:'Copper',type:'mineral',volume:1.25,value:40};
  const artifact={...CANONICAL_ARTIFACTS[0],appraised:false};
  const message={id:'m',text:'Étoile 🚀',post:'Science Officer',speaker:'Spock',type:'info'};
  const cases:Array<[string,any]>=[
    ['vehicleHold',[cargo]],['specimensInHold',[{...cargo,type:'specimen',speciesName:'Test'}]],
    ['bulletins',[{id:1,date:'01-01-4620',title:'Test',author:'Interstel',paragraphs:['Memo'],read:false}]],
    ['evaluations',[{id:'e',planetName:'Planet',colonyName:'New Arth',starX:125,starY:100,stardate:'01-01-4620',suitable:true,verdict:'SUITABLE',payout:100,reasons:['Water'],notes:'Habitable',read:false}]],
    ['bankLedger',[{date:'01-01-4620',desc:'Interest',amount:1.5,balance:200}]],
    ['pendingRecommendations',[{starId:1,starName:'Sol',starX:125,starY:100,slot:samplePlanet.slot,planet:samplePlanet,colonyName:'Colony',stardate:'01-01-4620'}]],
    ['bridgeLog',[message]],['systemMessages',[message]],['banterLog',[{speaker:'Pike',text:'Hello',post:'Captain'}]],
    ['artifactsInHold',[artifact]],
    ['artifactStock',[{stockId:'stock',price:500,artifact}]],
    ['projectiles',[{id:'p',fromPlayer:true,type:'laser',x:0,y:0,targetX:3,targetY:2,speed:1,damage:20,duration:0.5,maxDuration:1,color:'#0ff'}]],
  ];
  for(const [key,items] of cases) {
    const valid=fresh();(valid.data.snapshot as any)[key]=items;validate(valid,true,'Legitimate '+key);
    for(const value of [null,0,'bad',[],{},true]) {
      const p=fresh();(p.data.snapshot as any)[key]=[value];validate(p,false,'Malformed member '+key);
    }
    for(const [field,value] of Object.entries(items[0])) {
      const p=fresh(),invalid=structuredClone(items[0]);invalid[field]=typeof value==='number'?'12':typeof value==='boolean'?'false':{};
      (p.data.snapshot as any)[key]=[invalid];validate(p,false,'Wrong nested type '+key+'.'+field);
    }
  }
  for(const key of ['visitedStarIds','traversedFluxIds','usedFluxes','recommendedPlanets','loggedTelemetryPlanets','destroyedPlanetKeys','destroyedPlanets','sterilizedPlanets','discoveredSpecies']) {
    const numeric=['visitedStarIds','traversedFluxIds','usedFluxes'].includes(key),valid=fresh();(valid.data.snapshot as any)[key]=numeric?[1,2]:['125-100-0'];validate(valid,true,'Legacy alias '+key);
    for(const member of [null,{},[],numeric?'1':1]){const p=fresh();(p.data.snapshot as any)[key]=[member];validate(p,false,'Invalid primitive collection '+key);}
  }
  for(const value of [[null],[{id:'m',text:{}}]]) {const p=fresh();p.data.bridgeLog=value as any;validate(p,false,'Top-level fallback logs are validated');}
  for(const field of ['name','value','specialEffectDesc']){const p=fresh();p.data.snapshot!.artifactStock=[{stockId:'stock',price:500,artifact:{...artifact,[field]:{bad:'object'}}}] as any;validate(p,false,'Depot purchase delayed-consumer boundary '+field);}
  const fleets=generateAlienGroups();
  const encounter=fresh();encounter.data.snapshot!.activeEncounterGroup=fleets[0];validate(encounter,true,'Actual authored fleet');
  const cosmic=fresh();cosmic.data.snapshot!.activeEncounterGroup=fleets.find(g=>g.race==='Mysterions')!;validate(cosmic,true,'Actual cosmic entity size');
  const ledger=fresh();ledger.data.snapshot!.fleetChanges=Object.fromEntries(fleets.map(g=>[g.id,g]));validate(ledger,true,'All 316 authored fleets');
  for(const field of ['race','vesselClass','size','vesselType','maxShields','isStationary','isWreck','loot']) {
    const p=structuredClone(encounter);(p.data.snapshot!.activeEncounterGroup!.ships[0] as any)[field]=field==='loot'?[null]:{};validate(p,false,'Malformed active fleet '+field);
    const g=p.data.snapshot!.activeEncounterGroup!;p.data.snapshot!.activeEncounterGroup=null;p.data.snapshot!.fleetChanges={[g.id]:g};validate(p,false,'Malformed latent fleet '+field);
  }
  const surface=generatePlanetSurface(125,100,samplePlanet);
  const region=surveyPlanet(undefined,125,100,samplePlanet,0,0,250,true,true,()=>0);
  const planetSave=fresh();planetSave.data.snapshot!.currentSurfaceState=region;planetSave.data.snapshot!.planetSurfaces={'125-100-0':region};validate(planetSave,true,'Real multi-region surveyed surface');
  for(const key of ['minerals','ruins','lifeforms','droppedCargo']){const p=fresh();p.data.snapshot!.currentSurfaceState={...surface,[key]:[null]};validate(p,false,'Malformed current surface '+key);const saved=p.data.snapshot!.currentSurfaceState;p.data.snapshot!.currentSurfaceState=null;p.data.snapshot!.planetSurfaces={'125-100-0':saved!};validate(p,false,'Malformed retained surface '+key);}
  for(const patch of [{currentSurfaceState:{...surface,droppedCargo:[{...cargo,artifactRef:{id:null},x:0,y:0}]}},{activeEncounterGroup:{...fleets[0],ships:[{...createAlienShip('Spemin','Scout','s',0,0),loot:[null]}]}},{pendingRecommendations:[{...(cases.find(c=>c[0]==='pendingRecommendations')![1][0]),planet:{...samplePlanet,gases:[{}]}}]}]) {const p=fresh();Object.assign(p.data.snapshot!,patch);validate(p,false,'Nested renderable schema');}
  const missing=fresh();for(const key of ['settings','cinematicDuration','roverWaypoint','planetSurfaces','fleetChanges','surfaceRecording','planetaryScan'])delete (missing.data.snapshot as any)[key];for(const c of missing.data.snapshot!.crewRoster)delete c.portraitId;validate(missing,true,'Optional later-version fields and portraits remain absent');
  for(const alias of ['destroyedPlanetKeys','destroyedPlanets'])for(const location of ['In Orbit','Landing','On Planet','Terrain Vehicle']) {
    const p=fresh(),star=UNIVERSE.stars.find(st=>st.id===p.data.snapshot!.currentStarId)!;
    Object.assign(p.data.snapshot!,{location,orbitPlanetIndex:0,planetaryScan:null});
    delete p.data.snapshot!.destroyedPlanetKeys;(p.data.snapshot as any)[alias]=star.planets.map(planet=>planetKey(star.x,star.y,planet.orderIndex));
    validate(p,false,'No surviving planet for '+location+' via '+alias);
  }
  const metadata={slot:'A',timestamp:'Legacy',credits:123,shipName:'Prototype',stardate:'01-01-4620',location:'Starport',empty:false,bridgeLog:[message]};
  check(!!restorableSaveSlot(metadata,'E'),'Metadata-only prototype slot remains available');
  check(!restorableSaveSlot({...metadata,bridgeLog:[null]},'E'),'Metadata-only log bypass rejected');
  check(!restorableSaveSlot({...metadata,snapshot:null},'E'),'Bad snapshot cannot become a metadata-only prototype');
  check(!!parseSaveManifest(JSON.stringify(Array.from({length:5},(_,i)=>({...metadata,slot:'ABCDE'[i]})))),'Five-slot legacy manifest accepted');
  check(parseSaveManifest(JSON.stringify(Array(6).fill(metadata)))===null,'Manifest cannot allocate arbitrary slots');
  const extension=fresh() as any;extension.data.snapshot.extension=Array(MAX_SAVE_COLLECTION_ITEMS).fill(0);validate(extension,true,'Exact generous collection boundary accepted');extension.data.snapshot.extension.push(0);validate(extension,false,'Oversized extension arrays rejected');
  const stringBoundary=fresh() as any;stringBoundary.data.snapshot.extension='a'.repeat(MAX_SAVE_STRING_CHARS);validate(stringBoundary,true,'Long valid extension text preserved');stringBoundary.data.snapshot.extension+='a';validate(stringBoundary,false,'Overlong strings rejected');
  const nodes:any={};for(let i=0;i<Math.ceil(MAX_SAVE_NODES/MAX_SAVE_COLLECTION_ITEMS);i++)nodes[i]=Array(MAX_SAVE_COLLECTION_ITEMS).fill(0);
  check(!saveStructureWithinBudget(nodes),'Aggregate node budget applies across many otherwise-small arrays');
  let deep:any=0;for(let i=0;i<MAX_SAVE_DEPTH+2;i++)deep=[deep];check(!saveStructureWithinBudget(deep),'Deep object graph rejected without recursion');check(!saveJSONTextWithinBudget(JSON.stringify(deep)),'Deep JSON rejected before parsing');
  const cycle:any={};cycle.self=cycle;check(!saveStructureWithinBudget(cycle),'Cycles rejected in in-memory fallback');
  const quoted=JSON.stringify({text:'{[\\"quoted\\"]}'});check(!!parseSaveJSON(quoted),'JSON budget handles quoted delimiters and escaped quotes');
  check(saveTextWithinBudget('🚀',4)&&!saveTextWithinBudget('🚀',3),'UTF-8 budget counts surrogate pairs');
  check(importTextWithinBudget('a'.repeat(MAX_SAVE_TEXT_CHARS))&&!importTextWithinBudget('a'.repeat(MAX_SAVE_TEXT_CHARS+1)),'Input length boundary checked before trim/copy');
  const base=JSON.stringify(fresh()),padded=base+' '.repeat(MAX_SAVE_JSON_BYTES-base.length);
  check(!!decodeSaveFromBase64('SFSAVE1_'+Buffer.from(padded).toString('base64')),'Exactly budgeted decoded backup accepted');
  let parses=0,decodes=0;const oldParse=JSON.parse,oldAtob=globalThis.atob;
  try {
    JSON.parse=((...args:Parameters<typeof JSON.parse>)=>{parses++;return oldParse(...args);}) as typeof JSON.parse;
    globalThis.atob=(v:string)=>{decodes++;return oldAtob(v);};
    check(decodeSaveFromBase64('a'.repeat(MAX_SAVE_TEXT_CHARS+1))===null&&parses===0&&decodes===0,'Oversized encoded input rejected before decoding/parsing');
    check(decodeSaveFromBase64('SFSAVE1_'+Buffer.from(padded+' ').toString('base64'))===null&&parses===0&&decodes===0,'Decoded byte budget enforced before atob');
    check(decodeSaveFromBase64(JSON.stringify(deep))===null&&parses===0,'Depth rejected before JSON.parse');
  } finally {JSON.parse=oldParse;globalThis.atob=oldAtob;}
  return {passed,failed:0,results:[]};
}

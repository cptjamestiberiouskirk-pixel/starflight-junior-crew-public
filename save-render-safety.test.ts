import assert from 'node:assert/strict';
import {decodeSaveFromBase64,encodeSaveToBase64,restorableSaveSlot,type ExportSavePayload} from './utils/save-codec';
import fixture from './test-fixtures/commissioned-mission.json';
import {boundedGridIndices,MAX_GRID_AXIS_ITEMS,MAX_RENDER_COORDINATE,saveRenderCoordinatesAreSafe} from './utils/render-safety';
import {tacticalCameraTarget} from './utils/space-rendering';

/** External mission data must never become non-progressing render indices. */
export function runSaveRenderSafetyTests() {
  let passed=0;
  const check=(value:unknown,label:string)=>{assert(value,label);passed++;};
  const fresh=()=>structuredClone(fixture) as unknown as ExportSavePayload;
  const attack=fresh();
  attack.data.snapshot!.vehicleX=1e20;
  check(decodeSaveFromBase64(JSON.stringify(attack))===null,'Reject extreme rover position before imported slot mutation');
  check(!!decodeSaveFromBase64(JSON.stringify(fresh())),'Legitimate commissioned mission remains accepted');
  const encodings=(p:ExportSavePayload)=>[JSON.stringify(p),JSON.stringify(p.data),encodeSaveToBase64(p),encodeSaveToBase64(p).slice(8)];
  const fleet=()=>({id:'canonical-0',race:'Spemin',x:125,y:100,homeX:125,homeY:100,baseMood:50,currentMood:50,posture:'Neutral',
    ships:[{id:'test-ship',race:'Spemin',vesselClass:'Scout',x:3,y:18,armor:1,shields:0,hullIntegrity:100,maxHull:100,laserClass:1,missileClass:0}]});
  const targets:Array<[string,(s:any,value:any)=>void]>=[
    ...['x','y','targetX','targetY','playerLaunchX','playerLaunchY'].map(key=>[
      `projectiles.${key}`,(s:any,v:any)=>{s.location='Encounter';s.orbitPlanetIndex=null;s.activeEncounterGroup=fleet();s.projectiles=[{id:'legacy-beam',fromPlayer:false,type:'laser',x:0,y:0,targetX:3,targetY:18,speed:1,damage:1,duration:1,[key]:v}];},
    ] as [string,(s:any,v:any)=>void]),
    ...['vehicleX','vehicleY','galaxyShipX','galaxyShipY','systemShipX','systemShipY','concourseAstronautX','concourseAstronautY'].map(key=>[key,(s:any,v:any)=>{s[key]=v;}] as [string,(s:any,v:any)=>void]),
    ...(['x','y'] as const).flatMap(axis=>[
      [`encounterShipPos.${axis}`,(s:any,v:any)=>{s.encounterShipPos={x:0,y:0,[axis]:v};}] as [string,(s:any,v:any)=>void],
      [`activeFleet.ship.${axis}`,(s:any,v:any)=>{s.activeEncounterGroup=fleet();s.activeEncounterGroup.ships[0][axis]=v;}] as [string,(s:any,v:any)=>void],
      [`storedFleet.ship.${axis}`,(s:any,v:any)=>{const g=fleet();(g.ships[0] as any)[axis]=v;s.fleetChanges={'canonical-0':g};}] as [string,(s:any,v:any)=>void],
    ]),
  ];
  for(const [name,mutate] of targets) {
    for(const value of [1e20,-1e20,Number.MAX_VALUE,-Number.MAX_VALUE,MAX_RENDER_COORDINATE+1,-MAX_RENDER_COORDINATE-1,NaN,Infinity,-Infinity,'0',null,{},[]]) {
      const p=fresh();mutate(p.data.snapshot,value);
      for(const text of encodings(p))check(decodeSaveFromBase64(text)===null,`Reject ${name}=${String(value)} across every public save representation`);
      check(!saveRenderCoordinatesAreSafe(p.data.snapshot),`Legacy restore rejects unsafe ${name} without imposing a new schema`);
    }
    for(const value of [0,-0,0.125,-123.456,24000,-24000,1e6,MAX_RENDER_COORDINATE,-MAX_RENDER_COORDINATE]) {
      const p=fresh();mutate(p.data.snapshot,value);
      for(const text of encodings(p))check(!!decodeSaveFromBase64(text),`Preserve legitimate/precision-safe ${name}=${value}`);
    }
  }
  for(const groupField of ['activeEncounterGroup','fleetChanges'])for(const axis of ['x','y','homeX','homeY']) {
    const p=fresh(),g=fleet();(g as any)[axis]=1e20;
    (p.data.snapshot as any)[groupField]=groupField==='fleetChanges'?{'canonical-0':g}:g;
    check(decodeSaveFromBase64(JSON.stringify(p))===null,`Reject latent fleet ${groupField}.${axis}`);
  }
  check(saveRenderCoordinatesAreSafe({}),'Legacy missing optional coordinate fields retain existing defaults');
  for(const key of ['systemZoom','hyperZoom']){
    for(const value of [0,-0,-1,Number.MIN_VALUE,Number.MAX_VALUE,NaN,Infinity,-Infinity,'1',null,{},[]]){
      const p=fresh();(p.data.snapshot as any)[key]=value;
      for(const raw of encodings(p))check(decodeSaveFromBase64(raw)===null,`Reject non-renderable ${key} before slot mutation`);
      check(!saveRenderCoordinatesAreSafe(p.data.snapshot),'Legacy restoration rejects non-renderable camera math too');
    }
    for(const value of [.0001,.5,.65,1,2.5,6,8,1000,1e6]){const p=fresh();(p.data.snapshot as any)[key]=value;for(const raw of encodings(p))check(!!decodeSaveFromBase64(raw),'Retain valid historical zooms beyond current UI presets');}
  }
  check(saveRenderCoordinatesAreSafe({vehicleX:-24000.25,vehicleY:24000.125,activeEncounterGroup:{ships:[]}}),'Long rover voyages and empty legacy fleets stay supported');
  const monetaryTargets:Array<[string,(p:ExportSavePayload,value:number)=>void,boolean]>=[
    ['credits',(p,v)=>{p.data.snapshot!.credits=v;},true],
    ['slot.credits',(p,v)=>{p.data.credits=v;},true],
    ...(['amount','balance'] as const).map(key=>[`bankLedger.${key}`,(p:ExportSavePayload,v:number)=>{(p.data.snapshot as any).bankLedger=[{date:'01-01-4620',desc:'Historical transaction',amount:0,balance:0,[key]:v}];},true] as [string,(p:ExportSavePayload,v:number)=>void,boolean]),
    ...(['payout','fine','bonus'] as const).map(key=>[`evaluations.${key}`,(p:ExportSavePayload,v:number)=>{(p.data.snapshot as any).evaluations=[{id:'old-eval',planetName:'Recorded world',colonyName:'Survey',starX:125,starY:100,stardate:'01-01-4620',suitable:true,verdict:'SUITABLE',payout:0,reasons:[],notes:'Historical evaluation',read:true,[key]:v}];},true] as [string,(p:ExportSavePayload,v:number)=>void,boolean]),
    ...(['basePrice','value'] as const).map(key=>[`artifactsInHold.${key}`,(p:ExportSavePayload,v:number)=>{p.data.snapshot!.artifactsInHold=[{id:'red-cylinder',codeName:'Red Cylinder',realName:'Red Cylinder',volume:.2,basePrice:100,description:'Historical relic',appraised:false,[key]:v}];},false] as [string,(p:ExportSavePayload,v:number)=>void,boolean]),
    ['cargo.value',(p,v)=>{(p.data.snapshot as any).vehicleHold=[{id:'specimen',name:'Survey specimen',type:'specimen',volume:1,value:v}];},false],
    ['artifactStock.price',(p,v)=>{(p.data.snapshot as any).artifactStock=[{stockId:'old-stock',price:v,artifact:{id:'red-cylinder',codeName:'Red Cylinder',realName:'Red Cylinder',volume:.2,basePrice:100,description:'Historical relic',appraised:false}}];},false],
  ];
  for(const [name,mutate,signed] of monetaryTargets){
    for(const value of [Number.MAX_SAFE_INTEGER+1,Number.MAX_VALUE/10,Number.MAX_VALUE,-Number.MAX_SAFE_INTEGER-1,-Number.MAX_VALUE]){
      const p=fresh();mutate(p,value);for(const raw of encodings(p))check(decodeSaveFromBase64(raw)===null,`Reject unsafe money ${name} across public encodings`);
      check(restorableSaveSlot(p.data,'E')===null,`Legacy slot restore rejects unsafe money ${name} before resume`);
    }
    for(const value of [0,.5,1000000,Number.MAX_SAFE_INTEGER,...(signed?[-.5,-15000,-Number.MAX_SAFE_INTEGER]:[])]){
      if(name==='artifactStock.price'&&value===0)continue; // The existing catalog schema requires a positive ask.
      const p=fresh();mutate(p,value);for(const raw of encodings(p))check(!!decodeSaveFromBase64(raw),`Retain signed, fractional and inclusive precision-safe historical ${name}`);
      check(!!restorableSaveSlot(p.data,'E'),`Legacy restore keeps valid ${name} unchanged`);
    }
  }
  for(const credits of [0,.5,-.5,1000000,-15000,Number.MAX_SAFE_INTEGER,-Number.MAX_SAFE_INTEGER]){
    const metadata={slot:'E',timestamp:'Historical slot',shipName:'Historical crew',stardate:'01-01-4620',location:'Starport',empty:false,credits};
    check(restorableSaveSlot(metadata,'E')?.credits===credits,'Metadata-only legacy slots retain signed/fractional precise balances');
  }
  for(const credits of [Number.MAX_SAFE_INTEGER+1,-Number.MAX_SAFE_INTEGER-1,Number.MAX_VALUE,-Number.MAX_VALUE,NaN,Infinity,'1000',null]){
    const metadata={slot:'E',timestamp:'Historical slot',shipName:'Historical crew',stardate:'01-01-4620',location:'Starport',empty:false,credits};
    check(restorableSaveSlot(metadata,'E')===null,'Metadata-only prototype slots cannot bypass the safe money domain');
  }
  for(const key of ['lastInterestAbsDay','lastInterestStardateDays']){
    for(const day of [-1,-.5,-Number.MAX_VALUE,28614000,Number.MAX_VALUE,.5,NaN,Infinity,'0',null]){
      const p=fresh();(p.data.snapshot as any)[key]=day;
      for(const raw of encodings(p))check(decodeSaveFromBase64(raw)===null,`Reject non-calendar ${key} before an imported day can overflow interest`);
      check(restorableSaveSlot(p.data,'E')===null,'Stored interest day aliases share the same safe calendar domain');
    }
    for(const day of [undefined,-0,0,10,300,28613999]){
      const p=fresh();if(day===undefined)delete (p.data.snapshot as any)[key];else (p.data.snapshot as any)[key]=day;
      if(key==='lastInterestStardateDays')delete (p.data.snapshot as any).lastInterestAbsDay;
      for(const raw of encodings(p))check(!!decodeSaveFromBase64(raw),'Missing, ordinary and inclusive last supported calendar-day aliases remain compatible');
      check(!!restorableSaveSlot(p.data,'E'),'Old alias-only interest checkpoints remain restorable');
    }
  }
  for(const speed of [-Number.MIN_VALUE,-1,-Number.MAX_VALUE,0,1,30,Number.MAX_VALUE]){
    const p=fresh();Object.assign(p.data.snapshot!,{location:'Encounter',orbitPlanetIndex:null,activeEncounterGroup:fleet(),projectiles:[{id:'legacy-speed',fromPlayer:false,type:'laser',x:-3,y:0,targetX:0,targetY:0,speed,damage:0,duration:30}]});
    for(const raw of encodings(p))check((decodeSaveFromBase64(raw)!==null)===(speed>=0),'Negative speed cannot escape the coordinate guard; zero and forward legacy projectiles remain supported');
    check((restorableSaveSlot(p.data,'E')!==null)===(speed>=0),'Stored negative-speed projectile cannot resume');
  }
  const surface=()=>({planetSeed:0,planetType:'Rock',color:'#999',hydrosphereCompound:'Water',scannedTimer:0,minerals:[],ruins:[],droppedCargo:[],lifeforms:[{id:'legacy-lifeform',speciesName:'Survey crawler',size:'Small',volume:1,bountyValue:40,temperament:'passive',color:'#a3e635',x:0,y:.6,stunned:false,dead:false,recorded:false,captured:false}]});
  for(const where of ['currentSurfaceState','planetSurfaces'])for(const axis of ['vx','vy']){
    for(const value of [Number.MAX_VALUE,-Number.MAX_VALUE,MAX_RENDER_COORDINATE+1,-MAX_RENDER_COORDINATE-1,NaN,Infinity,'0',null]){
      const p=fresh(),ground=surface();(ground.lifeforms[0] as any)[axis]=value;(p.data.snapshot as any)[where]=where==='planetSurfaces'?{'125-100-0':ground}:ground;
      for(const raw of encodings(p))check(decodeSaveFromBase64(raw)===null,`Reject overflowing latent/current wildlife ${axis} across save representations`);
      check(restorableSaveSlot(p.data,'E')===null,'Stored unsafe wildlife velocity cannot resume');
    }
    for(const value of [undefined,0,-.5,1.6,-1.6,24000,-24000,MAX_RENDER_COORDINATE,-MAX_RENDER_COORDINATE]){
      const p=fresh(),ground=surface();if(value!==undefined)(ground.lifeforms[0] as any)[axis]=value;(p.data.snapshot as any)[where]=where==='planetSurfaces'?{'125-100-0':ground}:ground;
      for(const raw of encodings(p))check(!!decodeSaveFromBase64(raw),'Retain absent velocity defaults and historical speeds beyond current wildlife rules');
      check(!!restorableSaveSlot(p.data,'E'),'Valid stored current/latent wildlife retains its velocity');
    }
  }
  const unicode=fresh();unicode.data.snapshot!.shipName='Étoile 🚀';
  for(const text of encodings(unicode))check(decodeSaveFromBase64('  '+text+'  ')?.data.snapshot?.shipName==='Étoile 🚀','Unicode/trimmed legacy encodings remain intact');

  for(const [first,last,step] of [[-8,12,1],[-7,11,2],[0,0,1],[-127,0,1],[10,30,3]]) {
    const expected:number[]=[];for(let i=first;i<=last;i+=step)expected.push(i);
    check(JSON.stringify(boundedGridIndices(first,last,step))===JSON.stringify(expected),'Normal grid indices and odd cross-grid parity remain byte-exact');
  }
  for(const [first,last,step] of [[1e20,1e20,1],[-1e20,1e20,1],[0,1e6,1],[0,127,1e-300],[-Number.MAX_VALUE,Number.MAX_VALUE,1],[Infinity,Infinity,1],[NaN,1,1],[0,2,0],[0,2,-1],[0,2,Infinity],[2,1,1]])
    check(boundedGridIndices(first,last,step).length===0,'Unsafe or excessive grids yield bounded empty detail layers');
  check(boundedGridIndices(0,MAX_GRID_AXIS_ITEMS-1).length===MAX_GRID_AXIS_ITEMS,'Exact render budget is accepted');
  check(boundedGridIndices(0,MAX_GRID_AXIS_ITEMS).length===0,'Over-budget render work is not truncated or iterated');
  for(const value of [1e6,1e20,Number.MAX_VALUE,-Number.MAX_VALUE])for(const y of [0,value]) {
    const camera=tacticalCameraTarget(1280,720,{x:value,y},[{x:-value,y:-y}]);
    const xs=boundedGridIndices(Math.floor(camera.x-640/camera.cellSize-2),Math.ceil(camera.x+640/camera.cellSize+2));
    const ys=boundedGridIndices(Math.floor(camera.y-360/camera.cellSize-2),Math.ceil(camera.y+360/camera.cellSize+2));
    let work=0;for(const _x of xs)for(const _y of ys)work++;
    check(work<=MAX_GRID_AXIS_ITEMS**2,'Extreme and wide-but-finite tactical cameras have bounded nested work');
  }
  for(const position of [0,24000.125,1e6,1e20,Number.MAX_VALUE,-Number.MAX_VALUE])for(const zoom of [.55,1,1.35]) {
    const scale=38*zoom,tile=256*zoom;
    for(const size of [tile,Math.round(tile*1.414),4*scale]) {
      const first=Math.floor((-640+position*scale)/size),last=Math.ceil((640+position*scale)/size);
      const indices=boundedGridIndices(first,last);
      check(indices.length<=MAX_GRID_AXIS_ITEMS&&new Set(indices).size===indices.length,'Base, perturbation and elevation indices always progress at every supported zoom');
    }
  }
  return {passed,failed:0,results:[]};
}

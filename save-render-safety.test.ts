import assert from 'node:assert/strict';
import {decodeSaveFromBase64,encodeSaveToBase64,type ExportSavePayload} from './utils/save-codec';
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
  check(saveRenderCoordinatesAreSafe({vehicleX:-24000.25,vehicleY:24000.125,activeEncounterGroup:{ships:[]}}),'Long rover voyages and empty legacy fleets stay supported');
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

import {bayLaunchPose} from './utils/bay-flight';
import assert from 'node:assert/strict';
import { createFrameCell } from './utils/frame-state';
import { createFixedStepper, prepareCanvas } from './utils/helper';
import { scenePixelRatio } from './utils/settings';
import { interpolatePosition, projectedOrbitTexture, starAppearance, systemShipLength, orbitShipSize, hyperspaceShipSize, orbitTexturePhase, trailScreenRadius, tacticalCameraTarget,shipExhaustNozzles } from './utils/space-rendering';

export function runSpaceRenderingTests() {
  let passed = 0;
  const check = (condition: boolean, label: string) => { assert(condition, label); passed++; };
  for(const length of [18,50,180,1087]) {
    const nozzles=shipExhaustNozzles(length);
    check(nozzles.length===3&&nozzles[0].y<0&&nozzles[1].y<length*.01&&nozzles[2].y>0,'Every scale keeps all three painted nozzle openings');
    check(nozzles[0].x===nozzles[2].x&&nozzles[1].x>nozzles[0].x,'The center nozzle is inset from the two outer pylon mouths');
  }
  for(const [width,height] of [[1328,535],[900,520],[375,280],[280,375]]) {
    const player={x:0,y:0};
    const ships=[{x:-4,y:14},{x:0,y:17},{x:4,y:22}];
    const camera=tacticalCameraTarget(width,height,player,ships);
    check([player,...ships].every(v=>{
      const x=width/2+(v.x-camera.x)*camera.cellSize, y=height/2+(v.y-camera.y)*camera.cellSize;
      return x>=65 && x<=width-65 && y>=65 && y<=height-65;
    }),`Tactical entry fits player and fleet inside the actual ${width}x${height} canvas`);
    const escaped=tacticalCameraTarget(width,height,{x:23,y:-23},ships);
    check([escaped.x,escaped.y,escaped.cellSize].every(Number.isFinite) && escaped.cellSize>0,'Tactical framing remains finite while maneuvering away from a fleet');
  }
  const soloCamera=tacticalCameraTarget(900,520,{x:9,y:-4},[]);
  check(soloCamera.x===9 && soloCamera.y===-4 && soloCamera.cellSize===60,'An empty tactical fleet centers the player with bounded zoom');
  check(scenePixelRatio('Low',1.5)===0.75 && scenePixelRatio('Medium',1.5)===1 && scenePixelRatio('High',1.5)===1.5,'Quality selects distinct scene raster costs on a high-DPI display');
  check(scenePixelRatio('High',4)===2 && scenePixelRatio('High',NaN)===1,'High quality bounds backing-store cost and tolerates invalid device telemetry');
  const rasterCanvas={width:0,height:0};
  let scale=0;
  const rasterContext={canvas:rasterCanvas,setTransform(a:number){scale=a;}} as unknown as CanvasRenderingContext2D;
  prepareCanvas(rasterContext,900,520,scenePixelRatio('Low',1.5));
  check(rasterCanvas.width===675 && rasterCanvas.height===390 && scale===0.75,'Low quality reduces pixels while retaining CSS-coordinate drawing transforms');
  prepareCanvas(rasterContext,900,520,scenePixelRatio('High',1.5));
  check(rasterCanvas.width===1350 && rasterCanvas.height===780 && scale===1.5,'Returning to High restores sharp scene backing dimensions');
  for (const zoom of [0.65, 1, 2, 4, 8]) {
    for (const radius of [0.5, 2, 6, 10, 20]) {
      const length = systemShipLength(zoom, radius);
      check(length>=18&&length<Math.max(30,radius*zoom*2),`Ship stays readable and smaller than the smallest displayed planet at ${zoom}x`);
    }
  }
  for (const unstable of [false, true]) {
    for (const time of [0, 0.1, 0.5, 1, 10, 100]) {
      check(starAppearance(35, time, unstable).radius === 35, 'Star animation never changes its physical radius');
    }
  }
  check(starAppearance(35, 0, false).coronaAlpha !== starAppearance(35, 1, false).coronaAlpha, 'Corona remains animated');
  check(trailScreenRadius(5, 0, 0.25) <= 2, 'Legacy particles cannot become large clouds');
  check(trailScreenRadius(2, 0.125, 0.25) === 1, 'Exhaust shrinks while fading');
  check(trailScreenRadius(2, 0.3, 0.25) === 0, 'Expired exhaust has zero radius');
  const cell = createFrameCell(0);
  for (let i = 0; i < 60; i++) cell.set((value) => value + 1 / 60);
  check(Math.abs(cell.ref.current - 1) < 1e-10, 'Multiple physics substeps accumulate before a UI render');
  check(!cell.set(cell.ref.current), 'Unchanged values do not invalidate the UI');
  check(interpolatePosition(0, 10, 0.5) === 5, 'Movement is interpolated between fixed steps');
  check(interpolatePosition(0, 100, 0.5) === 100, 'Teleportation never sweeps across the system');
  let elapsed = 0;
  const step = createFixedStepper(1000 / 60, 5);
  step(0, (dt) => { elapsed += dt; });
  step(100, (dt) => { elapsed += dt; });
  check(elapsed > 0 && elapsed <= 5 / 60 + 1e-9, 'Catch-up is bounded');
  step.reset();
  step(10000, (dt) => { elapsed += dt; });
  const before = elapsed;
  step(10017, (dt) => { elapsed += dt; });
  check(elapsed - before <= 1 / 60 + 1e-9, 'Resuming after a pause has no catch-up jump');
  check(step.alpha() >= 0 && step.alpha() < 1, 'Interpolation fraction remains bounded');
  check(orbitShipSize(375,280)>=44&&orbitShipSize(1400,900)<=72,'Orbital hull is readable on phone and bounded on desktop');
  check(hyperspaceShipSize(.5)>=32&&hyperspaceShipSize(6)<=72,'Hyperspace retains a readable hull through zoom changes');
  const p0=orbitTexturePhase(0),p1=orbitTexturePhase(.002),p2=orbitTexturePhase(.004);
  check(p0.frame===p1.frame&&p1.frame===p2.frame&&p1.alpha>p0.alpha&&p2.alpha>p1.alpha,'Subtexel rotation advances continuously instead of waiting for an integer texture bucket');
  const wrap=orbitTexturePhase((511.5/512)/.06);
  check(wrap.frame===511&&wrap.nextFrame===0&&Math.abs(wrap.alpha-.5)<1e-9,'Texture interpolation wraps through the longitude seam');
  const originalDocument = globalThis.document;let projections=0,blends=0;
  const context = {globalAlpha:1,clearRect() {},save() {},beginPath() {},arc() {},clip() {},restore() {},drawImage(...args:any[]) {if(args.length>3)projections++;else blends++;}};
  (globalThis as any).document = {createElement:()=>({width:0,height:0,getContext:()=>context})};
  try {
    const texture={width:512,height:256} as HTMLCanvasElement;
    const first=projectedOrbitTexture(texture,0),projected=projections,composited=blends;
    check(projected>0,'Adjacent globe textures are projected once');
    check(projectedOrbitTexture(texture,.000001)===first&&projections===projected&&blends>composited,'Every subpixel frame blends without repeating expensive texture slices');
    projectedOrbitTexture(texture,.1);check(projections>projected,'Crossing a texel projects the next cache entry');
  }finally{if(originalDocument===undefined)delete (globalThis as any).document;else (globalThis as any).document=originalDocument;}
  const bayStart=bayLaunchPose(0),bayHold=bayLaunchPose(1.5/8),bayEnd=bayLaunchPose(1);
  check(bayHold.distance===0&&bayStart.worldAltitude===6,'Ship holds actual fixed altitude while berth hardware clears');
  check(bayHold.doorOpen===1&&bayHold.clampOpen===1,'Blast doors and clamps finish before any forward travel');
  let previous=bayStart;
  for(let frame=1;frame<=192;frame++){
    const pose=bayLaunchPose(frame/192);
    check(pose.worldAltitude===6&&pose.heading===Math.PI/2,'Every production frame keeps the approved flight plane and heading');
    check(pose.distance>=previous.distance,'Forward-only translation never reverses');
    if(pose.mainThrust>0)check(pose.distance-28.47>75.5,'Main drive ignition requires the entire stern to clear the actual outer wall');
    check(Math.abs(pose.camera[0])<30&&pose.camera[2]<32,'Production camera stays inside the clear corridor, below fixtures');
    previous=pose;
  }
  check(bayEnd.mainThrust===1&&bayEnd.distance===130,'Outside departure reaches the approved endpoint');
  check(bayLaunchPose(-1).distance===0&&bayLaunchPose(2).distance===bayEnd.distance,'Legacy/end timer values stay safely clamped');
  return { passed, failed: 0, results: [] };
}

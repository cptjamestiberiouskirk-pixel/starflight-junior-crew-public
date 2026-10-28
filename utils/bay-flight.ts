/** The approved Blender trajectory, in meters and game-clock seconds. */
export const BAY_LAUNCH_SECONDS=8;
/** Keep the whole hull framed at narrow aspect ratios without flattening it. */
export function bayCameraFov(aspect:number){
  const fitted=Number.isFinite(aspect)&&aspect>0?aspect:16/9;
  const halfHeight=Math.max(Math.tan(24*Math.PI/180),Math.tan(Math.PI/6)*(16/9)/fitted);
  return 2*Math.atan(halfHeight)*180/Math.PI;
}
const clamp=(n:number)=>Math.max(0,Math.min(1,Number.isFinite(n)?n:0));
export const baySmooth=(a:number,b:number,n:number)=>{const t=clamp((n-a)/(b-a));return t*t*(3-2*t);};
export function bayLaunchPose(progress:number){
  const p=clamp(progress),seconds=p*BAY_LAUNCH_SECONDS,travel=clamp((seconds-1.5)/6.3),distance=130*travel*travel;
  return {seconds,distance,worldAltitude:6,heading:Math.PI/2,
    doorOpen:baySmooth(0,1.35,seconds),clampOpen:baySmooth(.25,1.25,seconds),
    mainThrust:baySmooth(106,128,distance),
    camera:[20,-48+distance,21] as const,
    // Aim below the pressure hull so wide, short views leave room for exhaust.
    target:[0,distance-6,1] as const,
    stage:seconds<1.5?'RELEASING CLAMPS · OPENING BLAST DOORS':distance<47?'MANEUVERING · CLEARING BERTH':distance<104?'CROSSING BAY THRESHOLD':'BAY CLEAR · MAIN DRIVE ENGAGED'};
}
export function cinematicProgress(remaining:number,duration=3){return clamp(1-remaining/(duration>0?duration:3));}

/** Controlled stern-first berthing: no reversed main-drive plume or vertical lift. */
export function bayDockPose(progress:number){
 const seconds=clamp(progress)*8,distance=130*(1-baySmooth(1.3,6.7,seconds));
 return {seconds,distance,worldAltitude:6,heading:Math.PI/2,doorOpen:baySmooth(0,1.2,seconds)*(1-baySmooth(7,8,seconds)),clampOpen:1-baySmooth(6.7,7.5,seconds),mainThrust:0,
 camera:[20,-48+distance,21] as const,target:[0,distance-6,1] as const,
 stage:seconds<1.3?'DOCKING CLEARANCE · OPENING BLAST DOORS':seconds<6.7?'REVERSE APPROACH · MANEUVERING THRUSTERS':seconds<7.5?'BERTH SECURE · ENGAGING CLAMPS':'DOCKED · SEALING HANGAR'};
}

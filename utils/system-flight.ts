/** System-flight pacing follows the user's Unity-port D8 decision: class 1 is
 * one third of class 5, with sixths between. Original HYPER-OV has a shared cap;
 * this requested class scaling is a remake rule, not a recovered original one.
 * Browser world units use its 380-unit system radius and the recorded 2.72s
 * original/GOG radius traversal at full speed. Hyperspace/combat are unchanged. */
export const SYSTEM_CLASS_FIVE_SPEED=380/2.72;
export function systemFlightLimits(engineClass:number,mass:number,health=100,inoperative=false){
 const cls=Number.isFinite(engineClass)?Math.max(0,Math.min(5,Math.floor(engineClass))):0;
 const hp=Number.isFinite(health)?Math.max(0,Math.min(100,health)):0;
 const accelerationG=cls&&Number.isFinite(mass)&&mass>0?Math.floor(cls*500/mass):0; // SHIPGRPH-OV (.ACC)
 return {topSpeed:cls&&hp>0&&!inoperative?SYSTEM_CLASS_FIVE_SPEED*(cls+1)/6*hp/100:0,accelerationG,rampSeconds:Math.max(.25,Math.min(5,accelerationG>0?5/accelerationG:5))};
}
/** Exact integration of the 1/12 initial step and linear ramp, independent of
 * frame rate. Releasing direction stops immediately, like original system flight. */
export function advanceSystemFlight(speed:number,seconds:number,moving:boolean,engineClass:number,mass:number,health=100,inoperative=false){
 const limits=systemFlightLimits(engineClass,mass,health,inoperative);
 if(!moving||!Number.isFinite(seconds)||seconds<=0||!limits.topSpeed)return {...limits,speed:0,distance:0};
 const start=Math.max(limits.topSpeed/12,Math.min(limits.topSpeed,Number.isFinite(speed)?Math.max(0,speed):0));
 const a=limits.topSpeed*11/12/limits.rampSeconds;
 const rampTime=Math.min(seconds,(limits.topSpeed-start)/a);
 const end=start+a*rampTime;
 return {...limits,speed:end,distance:(start+end)/2*rampTime+limits.topSpeed*(seconds-rampTime)};
}
export function systemPlanetPosition(planet:{initialAngle:number;orbitSpeed:number;orbitRadius:number},elapsedSeconds:number){
 const t=Number.isFinite(elapsedSeconds)?Math.max(0,elapsedSeconds):0;
 const angle=planet.initialAngle+planet.orbitSpeed*(.2+t);
 return {currentX:Math.cos(angle)*planet.orbitRadius,currentY:Math.sin(angle)*planet.orbitRadius};
}
/** Same orbit plane as the rendered ellipse; the approved model's nose is +Y. */
export function orbitShipAttitude(phase:number){
 const p=Number.isFinite(phase)?phase:0;
 return {heading:Math.PI-p,bank:.055*Math.cos(p),cameraElevation:Math.asin(.45)};
}
/** Label lives in screen space, below the rotated hull's complete bounds. */
export function groundShipLabelPosition(x:number,y:number,width:number,height:number,heading:number){
 const a=Number.isFinite(heading)?heading:0;
 return {x,y:y+Math.abs(Math.sin(a))*width/2+Math.abs(Math.cos(a))*height/2+16};
}
/** Only the departed star is suppressed until the ship clears its arrival area. */
export function hyperspaceArrival<T extends {id:number;x:number;y:number}>(stars:T[],position:{x:number;y:number},departedId:number|null){
 const departed=stars.find(s=>s.id===departedId);
 const guard=departed&&Math.hypot(position.x-departed.x,position.y-departed.y)<=1.55?departedId:null;
 const nearest=stars.filter(s=>s.id!==guard).map(s=>({star:s,d:Math.hypot(position.x-s.x,position.y-s.y)})).sort((a,b)=>a.d-b.d)[0];
 return {departedId:guard,star:nearest&&nearest.d<=.65?nearest.star:null};
}

/** Fitted visuals mirror the established gantry conventions in App.tsx. */
export interface BayOutfitting{cargoPods:number;armorClass:number;laserClass:number;missileClass:number;engineClass:number;}
const tier=(n:number|undefined)=>Math.max(0,Math.min(5,Math.floor(Number.isFinite(n)?n!:0)));
export function bayOutfitting(ship:{cargoPodsCount:number;armorClass?:number;laserClass?:number;missileClass?:number;engineClass:number}):BayOutfitting{
 return {cargoPods:Math.max(0,Math.min(16,Math.floor(ship.cargoPodsCount))),armorClass:tier(ship.armorClass),laserClass:tier(ship.laserClass),missileClass:tier(ship.missileClass),engineClass:tier(ship.engineClass)};
}
export function bayPodSlot(index:number){const side=index<8?-1:1;return {side,x:side*4.5,y:-7.2+(index%8)*2.8};}
export const bayLaserBarrels=(laserClass:number)=>tier(laserClass)===0?0:tier(laserClass)>=3?4:2;
export const bayMissileTubes=(missileClass:number)=>tier(missileClass)===0?0:2*(tier(missileClass)+1);

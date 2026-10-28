import type { AlienGroup } from '../alien';

export interface FlightContext {
  location: string;
  x: number;
  y: number;
  starX: number;
  starY: number;
  orbitSlot: number | null;
  cooldown: number;
  uhlekSilenced: boolean;
  droneClearance: boolean;
  mechan9Unlocked?: boolean;
}

export function fleetMatchesLocation(group: AlienGroup, context: FlightContext) {
  const location=group.encounterLocation ?? 'Hyperspace';
  return location===context.location && (location==='Hyperspace' || group.starX===context.starX && group.starY===context.starY)
    && (location!=='In Orbit' || group.orbitSlot===context.orbitSlot)
    && !(context.uhlekSilenced && group.race==='Uhlek')
    && !(context.droneClearance && group.race==='Veloxi Drone')
    && !(context.mechan9Unlocked && group.id==='canonical-77')
    && group.ships.some(ship=>!ship.isWreck && ship.hullIntegrity>0);
}

/** Only one, nearest contact can begin in a simulation step. Orbit fleets are
 * matched by the original raw orbital slot, which can differ from planet order.
 */
export function flightEncounter(groups: AlienGroup[], context: FlightContext) {
  if (context.cooldown>0 && context.location!=='In Orbit' || !['Hyperspace','Star System','In Orbit'].includes(context.location)) return null;
  let nearest: AlienGroup | null=null;
  let nearestDistance=context.location==='Hyperspace'?1:12;
  for(const group of groups) {
    if(!fleetMatchesLocation(group,context)) continue;
    const distance=context.location==='In Orbit'?0:Math.hypot(group.x-context.x,group.y-context.y);
    if(distance<nearestDistance) {nearest=group;nearestDistance=distance;}
  }
  return nearest;
}

/** HYPERMSG-OV TRAK-E, in map coordinates. Truncate shares toward zero in
 * multiples of eight; close remnants cover the remaining distance in one move.
 */
export function trackingStep(distance: number, inHyperspace: boolean, pearl: boolean) {
  const units=Math.round(distance);
  if(!units) return 0;
  const numerator=(inHyperspace?1:3)+(pearl?3:0);
  const denominator=(inHyperspace?2:4)+(pearl?3:0);
  const step=Math.trunc(Math.trunc(units*numerator/denominator)/8)*8;
  return step || distance;
}

export function trackFleets(groups: AlienGroup[],context: FlightContext,pearl: boolean) {
  if(!['Hyperspace','Star System'].includes(context.location)) return [];
  const changed: AlienGroup[]=[];
  const hyperspace=context.location==='Hyperspace';
  for(const group of groups) {
    if(!fleetMatchesLocation(group,context)) continue;
    if(hyperspace && (Math.hypot(group.x-context.x,group.y-context.y)>75
      || !pearl && (group.x-group.homeX < -63 || group.x-group.homeX > 63 || group.y-group.homeY < -64 || group.y-group.homeY > 63))) continue;
    const dx=trackingStep(context.x-group.x,hyperspace,pearl);
    const dy=trackingStep(context.y-group.y,hyperspace,pearl);
    if(!dx&&!dy) continue;
    group.x+=dx;group.y+=dy;
    changed.push(group);
  }
  return changed;
}

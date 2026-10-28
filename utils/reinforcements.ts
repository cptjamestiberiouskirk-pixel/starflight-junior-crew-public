import { createAlienShip, type AlienGroup, type DiplomaticPosture } from '../alien';

export const DISTRESS_PASS_SECONDS = 0.25;
export const ENCOUNTER_SHIP_LIMIT = 20;
export const DISTRESS_CALLERS = new Set([
  'Elowan', 'Gazurtoid', 'Mechans', 'Spemin', 'Thrynn', 'Veloxi', 'Uhlek', 'Interstel Police',
]);

export function fleetPosture(group: AlienGroup, proposed: DiplomaticPosture): DiplomaticPosture {
  return group.hasSurrendered ? 'Obsequious' : group.attackedByPlayer ? 'Hostile' : proposed;
}

export function markFleetAttacked(group: AlienGroup) {
  group.attackedByPlayer=true;
  group.currentMood=100;
  group.posture=fleetPosture(group,'Hostile');
  return group.posture==='Hostile';
}

export function fleetCanFire(group: AlienGroup, combatActive: boolean) {
  return !group.hasSurrendered
    && (!group.isHomeworldFleet || !!group.homeworldAttackStarted || !!group.attackedByPlayer)
    && (combatActive || group.posture==='Hostile');
}

/** Original Spemin/Thrynn/Veloxi cowardice: a non-home fleet keeps its surrender
 * after losing at least half its arrivals, even if the player fires again.
 */
export function updateFleetSurrender(group: AlienGroup) {
  const wasSurrendered=!!group.hasSurrendered;
  const present=group.ships.filter(ship=>!ship.isWreck && ship.hullIntegrity>0).length;
  const entered=Math.max(group.ships.length,group.spawnedTotal??group.ships.length);
  if(!group.isHomeworldFleet && ['Spemin','Thrynn','Veloxi'].includes(group.race)
    && present>0 && present<entered && (entered-present)*2>=entered) group.hasSurrendered=true;
  if(group.hasSurrendered) {
    group.posture='Obsequious';
    for(const ship of group.ships) ship.shields=0;
  }
  return !wasSurrendered && !!group.hasSurrendered;
}

/** A fresh visit resets conversation/hostility flags, while a save reload does
 * not. Ship losses, pending distress calls and the entry cap remain persistent.
 */
export function beginFleetVisit(group: AlienGroup) {
  delete group.droneChallenge;
  delete group.conversation;
  group.attackedByPlayer=false;
  group.hasSurrendered=false;
  group.homeworldWarningStage=0;
  group.homeworldWarningCounts=[0,0,0];
  group.homeworldAttackStarted=false;
  group.surrenderLinesSeen=[];
  updateFleetSurrender(group);
}

/** COMM-OV WE850 uses integer division, also used by Encounter.DistressCallPass.
 * One survivor: 1/16; two survivors: 1/10. Do not invert the original odds.
 */
export function reinforcementArrivalOdds(present: number) {
  return Math.max(1, Math.floor(50 / (present * 2 + 1)));
}

export function distressCallDecision(state: {
  race: string; present: number; entered: number; called: boolean;
  posture: string; surrendering: boolean; homeworld: boolean;
}, random = Math.random): 'none' | 'called' | 'arrived' {
  if (!DISTRESS_CALLERS.has(state.race) || !state.present || state.entered >= ENCOUNTER_SHIP_LIMIT) return 'none';
  if (state.called) return Math.floor(random() * reinforcementArrivalOdds(state.present)) === 0 ? 'arrived' : 'none';
  if (state.present > 2 || state.surrendering || state.posture === 'Friendly' || state.posture === 'Neutral') return 'none';
  return state.homeworld || Math.floor(random() * 1500) === 0 ? 'called' : 'none';
}

/** One quarter-second pass. Existing wrecks remain salvageable; arrivals append.
 * shipsCount is the group's nominal wave size, not its number of survivors.
 * The Unity port's eight-model screen limit does not apply to this canvas game.
 */
export function distressCallPass(
  group: AlienGroup,
  surrendering: boolean,
  player: { x: number; y: number },
  random = Math.random,
): 'none' | 'called' | 'arrived' {
  const present = group.ships.filter(ship => !ship.isWreck && ship.hullIntegrity > 0).length;
  const entered = Math.max(group.ships.length, group.spawnedTotal ?? group.ships.length);
  const decision = distressCallDecision({race: group.race, present, entered,
    called: !!group.distressCalled, posture: group.posture, surrendering, homeworld: !!group.isHomeworldFleet}, random);
  if (decision === 'none') return decision;
  if (decision === 'called') {
    group.distressCalled = true;
    return 'called';
  }

  // A call already sent remains pending if diplomacy subsequently changes.
  const nominal = Math.max(1, group.shipsCount ?? group.ships.length);
  const count = Math.min(ENCOUNTER_SHIP_LIMIT - entered, Math.max(1, nominal - 2 + Math.floor(random() * 3)));
  const templates = group.ships;
  const arrivals = Array.from({ length: count }, (_, index) => {
    const side = Math.floor(random() * 31) - 15;
    const edge = random() < 0.5 ? -15 : 15;
    const horizontal = random() < 0.5;
    // Retain the encounter's authored vessel mix, including race-specific ships.
    const vesselType = templates[(entered + index) % templates.length].vesselType;
    return createAlienShip(group.race, vesselType, `${group.id}-reinforcement-${entered + index + 1}`,
      player.x + (horizontal ? side : edge), player.y + (horizontal ? edge : side));
  });
  group.ships = [...group.ships, ...arrivals];
  group.spawnedTotal = entered + count;
  group.distressCalled = false;
  updateFleetSurrender(group);
  return 'arrived';
}

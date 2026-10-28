import type { CrewPost, Skills } from '../App';

const stationSkill:Record<CrewPost,keyof Skills> = {
  Captain:'science','Science Officer':'science',Navigator:'navigation',Engineer:'engineering',Communications:'communications',Doctor:'medicine',
};

export function assignedCrew<T extends {id:string}>(roster:T[],posts:Record<string,string|null>) {
  const ids=new Set(Object.values(posts).filter(Boolean));
  return roster.filter(member=>ids.has(member.id));
}

/** Preserve Captain's existing science criterion; specialists use their station skill. */
export function bestActingOfficer<T extends {alive:boolean;skills:Skills}>(roster:T[],post:CrewPost):T|null {
  const skill=stationSkill[post];
  return roster.reduce<T|null>((best,officer)=>officer.alive && (!best || officer.skills[skill]>best.skills[skill]) ? officer : best,null);
}

/** Retain fractional progress; rounding belongs in the display, not each tick. */
export function advanceHealth(health: number, maximum: number, rate: number, seconds: number) {
  return Math.min(maximum, Math.max(0, health) + Math.max(0, rate) * Math.max(0, seconds));
}

export const repairPercentageRate = (engineerSkill: number) => Math.max(0.5, 0.02 * engineerSkill);
export const crewHealingRate = (doctorSkill: number, primaryPatient: boolean) => Math.max(0, 0.01 * doctorSkill) * (primaryPatient ? 2 : 1);

/** Existing nearest-tenth pricing, with a minimum for any unfinished repair. */
export function fieldRepairCost(healthPercent: number) {
  return healthPercent >= 100 ? 0 : Math.max(0.1, +((100 - Math.max(0, healthPercent)) * 0.1).toFixed(1));
}

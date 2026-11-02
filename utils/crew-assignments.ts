import type {CrewMember, CrewPost} from '../App';

export const CREW_ROLES: readonly CrewPost[] = ['Captain','Science Officer','Navigator','Engineer','Communications','Doctor'];
export type CrewAssignments = Record<CrewPost, string | null>;

const roleSkills = {'Science Officer':'science', Navigator:'navigation', Engineer:'engineering', Communications:'communications', Doctor:'medicine'} as const;
export function crewAssignmentSkillLabel(post: CrewPost) {
  return post === 'Captain' ? 'Total skills' : ({'Science Officer':'Science', Navigator:'Navigation', Engineer:'Engineering', Communications:'Communications', Doctor:'Medicine'} as const)[post];
}
export function crewAssignmentValue(member: Pick<CrewMember,'skills'>, post: CrewPost) {
  const value = (key: keyof CrewMember['skills']) => Number.isFinite(member.skills[key]) ? member.skills[key] : 0;
  // Captain diplomacy uses the sum of all five skills, rather than a separate leadership stat.
  return post === 'Captain' ? Object.values(roleSkills).reduce((sum,key)=>sum+value(key),0) : value(roleSkills[post]);
}
export function recommendedCrewForRole(roster: Pick<CrewMember,'id'|'alive'|'vitality'|'skills'>[], posts: CrewAssignments, post: CrewPost) {
  if (!CREW_ROLES.includes(post)) return null;
  const occupied = new Set(CREW_ROLES.filter(other => other !== post).map(other => posts[other]));
  return roster.reduce<(typeof roster)[number] | undefined>((best,member) => {
    if (!member.alive || !(member.vitality > 0) || occupied.has(member.id)) return best;
    if (!best) return member;
    const difference = crewAssignmentValue(member,post)-crewAssignmentValue(best,post);
    if (difference) return difference > 0 ? member : best;
    if ((member.id === posts[post]) !== (best.id === posts[post])) return member.id === posts[post] ? member : best;
    return member.vitality > best.vitality ? member : best;
  },undefined)?.id ?? null;
}

/** Old saves remain readable. Keep the first duty; leave repeated duties vacant. */
export function uniqueCrewAssignments(posts: CrewAssignments): CrewAssignments {
  const seen = new Set<string>();
  return Object.fromEntries(CREW_ROLES.map(post => {
    const id = posts[post];
    const unique = id && !seen.has(id) ? id : null;
    if (unique) seen.add(unique);
    return [post, unique];
  })) as CrewAssignments;
}

export function hasDuplicateCrewAssignments(posts: CrewAssignments) {
  const ids = CREW_ROLES.map(post => posts[post]).filter(Boolean);
  return new Set(ids).size !== ids.length;
}

export function crewAssignmentAllowed(roster: Pick<CrewMember,'id'|'alive'>[], posts: CrewAssignments, post: CrewPost, id: string | null) {
  return CREW_ROLES.includes(post) && (id === null || (
    roster.some(member => member.id === id && member.alive) &&
    !CREW_ROLES.some(other => other !== post && posts[other] === id)
  ));
}

export function certifiedCrewAssignments(roster: Pick<CrewMember,'id'|'alive'>[], posts: CrewAssignments) {
  const unique = uniqueCrewAssignments(posts);
  return CREW_ROLES.filter(post => roster.some(member => member.id === unique[post] && member.alive)).length;
}

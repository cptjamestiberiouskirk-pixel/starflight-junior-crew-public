import type {CrewMember, CrewPost} from '../App';

export const CREW_ROLES: readonly CrewPost[] = ['Captain','Science Officer','Navigator','Engineer','Communications','Doctor'];
export type CrewAssignments = Record<CrewPost, string | null>;

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

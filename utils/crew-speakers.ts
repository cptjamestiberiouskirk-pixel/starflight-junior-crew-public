import {CREW_ROLES} from './crew-assignments';

/** Older transmissions identify the officer by their post and full name. */
export function findCrewSpeaker<T extends {name:string;alive:boolean}>(roster:readonly T[],speaker:string):T|undefined {
  const post = CREW_ROLES.find(role => speaker.startsWith(role+' '));
  if (!post) return undefined;
  const name = speaker.slice(post.length+1);
  if (!name) return undefined;
  const matches = roster.filter(member => member.name === name);
  return matches.length === 1 && matches[0].alive ? matches[0] : undefined;
}

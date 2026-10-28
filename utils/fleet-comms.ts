import type { AlienGroup } from '../alien';
import { PARSED_COMM_LINES, resolveRaceId, resolveSubjectId, selectCommLine, type SelectCommLineOptions } from '../src/commData';

/** Encounter.FindHomeworldWarning and its surrender-line precedence. These
 * progression counters belong to the encounter, not global phrase usage.
 */
export function selectFleetCommLine(group: AlienGroup, options: SelectCommLineOptions) {
  const race=resolveRaceId(group.race);
  const subject=resolveSubjectId(options.subject);
  let preferredLineIds: number[] | undefined;
  if(group.isHomeworldFleet) {
    let warningSubject=[1,13,14].includes(subject)?1:subject===2?2:5;
    let warnings=PARSED_COMM_LINES.filter(line=>line.race===race && line.homeworld===1 && line.subject===warningSubject);
    if(!warnings.length) {
      warningSubject=5;
      warnings=PARSED_COMM_LINES.filter(line=>line.race===race && line.homeworld===1 && line.subject===5);
    }
    if(warnings.length) {
      const counts=group.homeworldWarningCounts ??= [0,0,0];
      const list=warningSubject===1?0:warningSubject===2?1:2;
      const index=Math.min(counts[list],warnings.length-1);
      preferredLineIds=[warnings[index].id];
      counts[list]=Math.min(counts[list]+1,warnings.length);
      group.homeworldWarningStage=Math.max(group.homeworldWarningStage??0,index===warnings.length-1?3:Math.min(2,(group.homeworldWarningStage??0)+1));
    }
  } else if(group.hasSurrendered) {
    const seen=group.surrenderLinesSeen ??= [];
    const first=PARSED_COMM_LINES.find(line=>line.race===race && line.subject===subject && line.surrender===1 && !seen.includes(line.id));
    if(first) preferredLineIds=[first.id];
  }
  const selected=selectCommLine({...options,isHomeworld:!!group.isHomeworldFleet,isSurrendered:!!group.hasSurrendered || options.isSurrendered,preferredLineIds});
  if(group.hasSurrendered && selected.line.surrender===1) {
    const seen=group.surrenderLinesSeen ??= [];
    if(!seen.includes(selected.id)) seen.push(selected.id);
  }
  return selected;
}

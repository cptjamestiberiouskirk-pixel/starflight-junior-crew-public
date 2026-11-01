import {CREW_ROLES,uniqueCrewAssignments,hasDuplicateCrewAssignments,crewAssignmentAllowed,certifiedCrewAssignments,type CrewAssignments} from './utils/crew-assignments';
import {crewAssignmentsAfterLoss} from './utils/maintenance';

export function runCrewAssignmentTests() {
  let passed=0,failed=0;const results:string[]=[];
  const check=(ok:boolean,label:string)=>{if(ok)passed++;else{failed++;results.push('FAIL '+label);}};
  const roster=Array.from({length:8},(_,index)=>({id:`crew-${index}`,alive:true,skills:{science:index,navigation:10-index,engineering:index*2,communications:index*3,medicine:index*4}}));
  const posts=Object.fromEntries(CREW_ROLES.map((post,index)=>[post,roster[index].id])) as CrewAssignments;
  check(certifiedCrewAssignments(roster,posts)===6,'Six different living crew clear all six roles');
  check(!hasDuplicateCrewAssignments(posts),'A fully staffed mission has no duplicate roles');
  for(const post of CREW_ROLES) {
    check(crewAssignmentAllowed(roster,posts,post,null),'A station may become vacant');
    check(crewAssignmentAllowed(roster,posts,post,posts[post]),'Keeping current assignment is valid');
    check(crewAssignmentAllowed(roster,posts,post,roster[6].id),'An unassigned officer may take a role');
    check(!crewAssignmentAllowed(roster,posts,post,'unknown'),'Unknown IDs cannot be assigned');
    check(!crewAssignmentAllowed(roster.map(member=>({...member,alive:false})),posts,post,roster[6].id),'Deceased officers cannot be assigned');
    for(const other of CREW_ROLES.filter(role=>role!==post)) check(!crewAssignmentAllowed(roster,posts,post,posts[other]),'Occupied officers cannot take a second role');
  }
  // All 4^6 mixtures cover duplicate placement, vacancies and stable first-role ownership.
  for(let code=0;code<4096;code++) {
    const original=Object.fromEntries(CREW_ROLES.map((post,index)=>[post,[null,'crew-0','crew-1','crew-2'][(code>>>(index*2))&3]])) as CrewAssignments;
    const before=JSON.stringify(original),normalized=uniqueCrewAssignments(original);
    check(!hasDuplicateCrewAssignments(normalized),'Every normalized role map is unique');
    check(JSON.stringify(original)===before,'Normalization never mutates a legacy checkpoint');
    check(JSON.stringify(uniqueCrewAssignments(normalized))===JSON.stringify(normalized),'Normalization is idempotent');
    check(certifiedCrewAssignments(roster,original)===new Set(Object.values(original).filter(Boolean)).size,'Certification counts distinct living officers');
    for(const post of CREW_ROLES) if(original[post]) {
      const first=CREW_ROLES.find(role=>original[role]===original[post]);
      check(normalized[post]===(first===post?original[post]:null),'Only earliest role retains a legacy duplicate officer');
    }
  }
  for(const post of CREW_ROLES) {
    const id=posts[post]!,deadRoster=roster.slice(0,6).map(member=>({...member,alive:member.id!==id}));
    const next=crewAssignmentsAfterLoss(deadRoster,posts,id);
    check(next[post]===null,'Loss without an unassigned survivor leaves the station vacant');
    check(!hasDuplicateCrewAssignments(next),'Succession never duplicates an occupied officer');
    for(const other of CREW_ROLES.filter(role=>role!==post)) check(next[other]===posts[other],'Survivors retain their original roles');
    const withSpare=crewAssignmentsAfterLoss([...deadRoster,roster[6],{...roster[7],alive:false}],posts,id);
    check(withSpare[post]===roster[6].id,'Only a living unassigned spare inherits the lost duty');
    check(certifiedCrewAssignments([...deadRoster,roster[6]],withSpare)===6,'Succession with a spare restores distinct certification');
    check(JSON.stringify(posts)===JSON.stringify(Object.fromEntries(CREW_ROLES.map((role,index)=>[role,`crew-${index}`]))),'Succession leaves the old assignment checkpoint untouched');
  }
  check(certifiedCrewAssignments(roster.map(member=>({...member,alive:false})),posts)===0,'Dead crew never certify launch');
  return {passed,failed,results};
}

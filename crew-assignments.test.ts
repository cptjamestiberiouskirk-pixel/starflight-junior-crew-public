import {CREW_ROLES,uniqueCrewAssignments,hasDuplicateCrewAssignments,crewAssignmentAllowed,certifiedCrewAssignments,crewAssignmentValue,crewAssignmentSkillLabel,recommendedCrewForRole,type CrewAssignments} from './utils/crew-assignments';
import {crewAssignmentsAfterLoss} from './utils/maintenance';
import {findCrewSpeaker} from './utils/crew-speakers';

export function runCrewAssignmentTests() {
  let passed=0,failed=0;const results:string[]=[];
  const check=(ok:boolean,label:string)=>{if(ok)passed++;else{failed++;results.push('FAIL '+label);}};
  const roster=Array.from({length:8},(_,index)=>({id:`crew-${index}`,alive:true,skills:{science:index,navigation:10-index,engineering:index*2,communications:index*3,medicine:index*4}}));
  const posts=Object.fromEntries(CREW_ROLES.map((post,index)=>[post,roster[index].id])) as CrewAssignments;
  const available=roster.map(member=>({...member,vitality:100}));
  const vacant=Object.fromEntries(CREW_ROLES.map(post=>[post,null])) as CrewAssignments;
  const beforeRecommendations=JSON.stringify({available,vacant});
  for(const [index,post] of CREW_ROLES.entries()) {
    const expected=[10,0,10,0,0,0][index];
    check(crewAssignmentValue(available[0],post)===expected,'Relevant role value including captain total');
    check(!!crewAssignmentSkillLabel(post),'Every role has a readable skill label');
    const expectedId=post==='Navigator'?'crew-0':'crew-7';
    check(recommendedCrewForRole(available,vacant,post)===expectedId,'Highest relevant skill recommended');
    check(recommendedCrewForRole(available.map(member=>({...member,alive:false})),vacant,post)===null,'No deceased recommendation');
    check(recommendedCrewForRole(available.map(member=>({...member,vitality:0})),vacant,post)===null,'No unconscious recommendation');
  }
  check(recommendedCrewForRole(available,posts,'Science Officer')==='crew-7','Occupied officers excluded from recommendation');
  let idReads=0;
  const largeRoster=Array.from({length:256},(_,index)=>({
    ...available[0],get id(){idReads++;return `large-${index}`;},
  }));
  check(recommendedCrewForRole(largeRoster,vacant,'Science Officer')==='large-0','Large roster preserves stable recommendation order');
  check(idReads <= 8*largeRoster.length,'Recommendation examines a bounded number of crew IDs per candidate');
  const duplicatedId=[{...available[0],alive:false,skills:{...available[0].skills,science:250}},available[0],available[1]];
  check(recommendedCrewForRole(duplicatedId,vacant,'Science Officer')===available[1].id,'A deceased candidate cannot borrow another member\'s living status');
  const dawes={id:'short',name:'Dawes',alive:true},anderson={id:'full',name:'Anderson Dawes',alive:true};
  for(const members of [[dawes,anderson],[anderson,dawes]]) {
    for(const role of CREW_ROLES)check(findCrewSpeaker(members,`${role} Anderson Dawes`)===anderson,'Resolve full speaker name independently of roster order');
    check(findCrewSpeaker(members,'Doctor Dawes')===dawes,'Shorter name resolves to its own officer');
    for(const speaker of ['Dawes','Visitor Anderson Dawes','Science Officer','Science Officer Other Dawes','Science Officer ']) {
      check(!findCrewSpeaker(members,speaker),'Unknown or incomplete speaker omits the crew portrait');
    }
  }
  check(!findCrewSpeaker([dawes,{...dawes,id:'other'}],'Doctor Dawes'),'Ambiguous same-name speaker omits the portrait');
  check(!findCrewSpeaker([{...dawes,alive:false}],'Doctor Dawes'),'Do not show a deceased officer transmitting');
  const tied=available.map(member=>({...member,skills:available[0].skills}));
  check(recommendedCrewForRole(tied,posts,'Science Officer')==='crew-1','Current officer wins a tied skill');
  check(recommendedCrewForRole(tied,vacant,'Science Officer')==='crew-0','Exact ties retain stable roster order');
  check(recommendedCrewForRole(tied.map((member,index)=>({...member,vitality:index+1})),vacant,'Science Officer')==='crew-7','Higher vitality breaks other ties');
  check(JSON.stringify({available,vacant})===beforeRecommendations,'Recommendation leaves roster and assignments untouched');
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

import {RACE_SPECS,type CrewMember,type Species} from './App';
import {getAllBanterLines} from './banter';
import {TRAINING_SKILLS,planCrewTraining,NAME_POOLS,generateCrewName,assignmentVoiceLine,concourseDanceFrame,isConcourseMoveKey,filterBridgeMessages} from './utils/personnel';
import {planetWeatherStyle} from './utils/planet-weather';
import {CONCOURSE_DANCE_RECTS,concourseDanceSprite} from './utils/concourse-sprites';
export function runPersonnelTests(){
 let passed=0,failed=0;const results:string[]=[];const check=(ok:boolean,label:string)=>{if(ok)passed++;else{failed++;results.push('FAIL '+label);}};
 for(const race of Object.keys(RACE_SPECS) as Species[]){const spec=RACE_SPECS[race];
  for(let mask=0;mask<32;mask++){
   const selected=TRAINING_SKILLS.filter((_,i)=>mask&(1<<i)),crew={race,alive:true,skills:{...spec.baseSkills}},copy=JSON.stringify(crew);
   const plan=planCrewTraining(crew,spec,selected,1500);check(plan.cost===selected.length*300,'Original per-category cost');
   check(!!plan.error===(race==='Android'||!selected.length),'Hardware and empty-selection gates');
   for(const skill of TRAINING_SKILLS)check(plan.next[skill]===(plan.error||!selected.includes(skill)?crew.skills[skill]:Math.min(spec.maxSkills[skill],crew.skills[skill]+spec.learningRate)),'Exact species boost, cap and untouched unselected category');
   check(JSON.stringify(crew)===copy,'Plan does not mutate roster');
  }
  const crew={race,alive:true,skills:{...spec.baseSkills,science:spec.maxSkills.science-1}};
  const p=planCrewTraining(crew,spec,['science','science'],300);check(p.cost===300,'Duplicate selections cannot double-charge');
  if(spec.canTrain)check(p.next.science===spec.maxSkills.science,'Last point clamps to species limit');
  check(!!planCrewTraining({...crew,alive:false},spec,['science'],99999).error,'Dead crew gate');
  check(!!planCrewTraining(crew,spec,['science','navigation'],599).error,'Insufficient funds rejects whole batch');
 }
 const human={race:'Human' as Species,alive:true,skills:{...RACE_SPECS.Human.baseSkills}};
 check(planCrewTraining(human,RACE_SPECS.Human,TRAINING_SKILLS,1500).error===null,'Exact total funds accepted');
 check(!!planCrewTraining(human,RACE_SPECS.Human,TRAINING_SKILLS,1499).error,'One-credit short rejected');
 check(!!planCrewTraining(human,RACE_SPECS.Human,['science'],NaN).error,'Invalid balance rejected');
 for(const [source,pool] of Object.entries(NAME_POOLS)){
  check(pool.every(name=>name.length>0&&name.length<=14),'Every canonical display name respects legacy limit');
  check(new Set(pool).size===pool.length,'No duplicate names in source');
  for(const roll of [0,.4,.999,1,-1,NaN,Infinity]){const name=generateCrewName(source as keyof typeof NAME_POOLS,[' Spock ','DATA','Luke Skywalker','Naomi Nagata'],()=>roll);check(name.length<=14&&!['spock','data','luke skywalker','naomi nagata'].includes(name.toLowerCase()),'Bounded RNG and case-insensitive roster avoidance');}
  const fallback=generateCrewName(source as keyof typeof NAME_POOLS,pool,()=>0);check(fallback.length<=14&&!pool.includes(fallback as never),'Exhausted pool has safe unique suffix');
 }
 const occupied:string[]=[];for(let i=0;i<30;i++){const name=generateCrewName('Any series',occupied,()=>.1);check(!occupied.includes(name),'Repeated generation stays distinct');occupied.push(name);}
 const lines=getAllBanterLines();for(const race of Object.keys(RACE_SPECS) as Species[])check(lines.includes(assignmentVoiceLine(race)),'Assignment uses exact existing recording text');
 for(const n of [0,2,7.999,-2,NaN,Infinity])check(concourseDanceFrame(n)===null,'Dance waits for idle threshold');
 for(const n of [8,8.2,9,10,20]){check(concourseDanceFrame(n)!>=0&&concourseDanceFrame(n)!<9,'Dance frame within the nine actual atlas poses');check(concourseDanceFrame(n,true)===null,'Movement always stops dance');}
 const fullBodies=[[0,489,135,205],[165,462,148,238],[339,489,205,189],[577,480,156,211],[774,478,160,210],[20,726,140,208],[266,742,179,185],[547,704,144,234],[772,737,158,191]];
 check(CONCOURSE_DANCE_RECTS.length===fullBodies.length,'Exactly nine complete dance poses, no phantom tenth cell');
 for(let frame=0;frame<fullBodies.length;frame++){
  const pose=concourseDanceSprite(frame)!,[x,y,width,height]=fullBodies[frame];
  check(pose.x<=x&&pose.y<=y&&pose.x+pose.width>=x+width&&pose.y+pose.height>=y+height,'Source rectangle contains the entire measured body');
  check(pose.x>=0&&pose.y>=0&&pose.x+pose.width<=934&&pose.y+pose.height<=940,'Source rectangle stays within original atlas');
  check(Math.abs(pose.renderWidth/pose.width-66/235)<1e-12&&Math.abs(pose.renderHeight/pose.height-66/235)<1e-12,'Every pose keeps the same original character scale and aspect ratio');
  const doubled=concourseDanceSprite(frame,1868,1880)!;check(doubled.x===pose.x*2&&doubled.height===pose.height*2&&doubled.renderHeight===pose.renderHeight,'Atlas resolution does not change character size');
 }
 for(const frame of [-1,9,1.5,NaN,Infinity])check(concourseDanceSprite(frame)===null,'Invalid animation frame is not sampled');
 for(const size of [0,-1,NaN,Infinity])check(concourseDanceSprite(0,size,size)===null,'Invalid atlas dimensions are not sampled');
 const cycle=new Set(Array.from({length:18},(_,i)=>concourseDanceFrame(8+i*.2+.01)));check(cycle.size===9&&!cycle.has(9),'Animation visits all nine poses over repeated loops');
 check(Number.isInteger(concourseDanceFrame(Number.MAX_VALUE))&&concourseDanceFrame(Number.MAX_VALUE)!<9,'Very old finite idle timers cannot overflow the animation frame');
 for(const key of ['Shift','Tab',' ','Enter','p'])check(!isConcourseMoveKey(key),'Unrelated keys do not reset idle');for(const key of ['ArrowLeft','ArrowRight','W','d'])check(isConcourseMoveKey(key),'Navigation resets idle');
 const rows=[{text:'Training complete',type:'info' as const},{text:'Warp failure',type:'alert' as const,speaker:'Navigator Spock'},{text:'Tea!',type:'banter' as const,post:'Doctor'},{text:'Legacy entry'}];
 check(filterBridgeMessages(rows,'all','').length===4,'All messages retained');check(filterBridgeMessages(rows,'info','').length===2,'Legacy untyped rows classify as info');check(filterBridgeMessages(rows,'alert',' spock ').length===1,'Category and case-insensitive speaker search intersect');check(filterBridgeMessages(rows,'banter','Doctor').length===1,'Post searchable');check(filterBridgeMessages(rows,'info','Spock').length===0,'No cross-category leak');check(filterBridgeMessages(rows,'all','<script>').length===0,'Search treated as literal text');check(rows.length===4,'Filtering preserves original feed');
 for(const atmosphereDensity of ['Very Thin','Thin','Moderate','Thick','Very Thick'] as const){const s=planetWeatherStyle({type:'Rock',gases:['Nitrogen'],weather:'Moderate',atmosphereDensity});check(s.rimOpacity>.4&&s.rimOpacity<=1,'Thin-to-thick atmospheric rims remain visible');}
 check(planetWeatherStyle({type:'Rock',gases:[],weather:'None',atmosphereDensity:'None'}).rimOpacity===0,'Airless planets stay airless');
 return {passed,failed,results};
}

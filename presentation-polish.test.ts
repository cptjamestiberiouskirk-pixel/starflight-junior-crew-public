import assert from 'node:assert/strict';
import {nextActionHint,placePlanetLabel,type LabelBox} from './utils/presentation-polish';
export function runPresentationPolishTests(){
  let passed=0;const check=(value:boolean,label:string)=>{assert(value,label);passed++;};
  const base=Object.freeze({location:'Star System',fuel:20,engines:1,hull:100});
  check(!nextActionHint(base).includes('available near'),'No false orbit availability away from a planet');
  check(nextActionHint({...base,nearby:{name:'Arth',isHomeworld:true}})==='Dock is available near Arth.','Homeworld uses Dock, never Orbit');
  check(nextActionHint({...base,nearby:{name:'Survey world'}})==='Orbit is available near Survey world.','Current nearby world enables the orbit hint');
  check(nextActionHint({...base,location:'Terrain Vehicle',canReturn:true}).startsWith('Return'),'Ground hint respects the actual return gate');
  check(nextActionHint({...base,location:'Terrain Vehicle',mining:true}).includes('Stop'),'Active mining has a stop hint');
  check(nextActionHint({...base,location:'In Orbit'}).includes('survey'),'Orbit guidance has no undiscovered mission destinations');
  check(nextActionHint({...base,fuel:0}).includes('depleted'),'Zero fuel does not suggest flying onward');
  check(nextActionHint({...base,location:'Starport',missingPosts:1}).includes('Personnel'),'Vacant posts get a commissioning hint');
  check(nextActionHint({...base,location:'Starport',unreadBulletins:2}).includes('bulletins'),'Known mission leads point to available bulletins');
  for(const width of [320,700,1440]){
    const occupied:LabelBox[]=[{x:8,y:8,width:120,height:60}];
    for(let i=0;i<20;i++){
      const before=[...occupied];
      const box=placePlanetLabel({x:width/2,y:100},90,20,{width,height:240},occupied);
      if(box){
        check(box.x>=8&&box.x+box.width<=width-8&&box.y>=8&&box.y+box.height<=232,'Crowded labels remain inside viewport');
        check(before.every(b=>box.x>=b.x+b.width+5||box.x+box.width+5<=b.x||box.y>=b.y+b.height+4||box.y+box.height+4<=b.y),'No overlapping contact labels');
      }else check(occupied.length===before.length,'Suppression never reserves an invisible label');
    }
  }
  check(placePlanetLabel({x:0,y:0},90,20,{width:0,height:0},[])===null,'Collapsed viewport produces no invalid label');
  return {passed,failed:0,results:[]};
}

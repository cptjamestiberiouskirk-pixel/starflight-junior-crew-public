import assert from 'node:assert/strict';
import {HeldKeys} from './utils/keyboard-input';
import {ruinSensorOverlay} from './utils/ruin-sensors';
import {detonationResult} from './utils/detonation';
import {isInStarSystemAtFlare} from './utils/stellar-flares';

export function runGameplayRound2Tests() {
  let passed=0;
  function check(condition:boolean,message:string) { assert(condition,message); passed++; }
  const held=new HeldKeys();
  for(const [key,modified,code] of [
    ['w','W','KeyW'],['a','A','KeyA'],['s','S','KeyS'],['d','D','KeyD'],
    ['2','@','Digit2'],['4','$','Digit4'],['6','^','Digit6'],['8','*','Digit8'],
    ['8','ArrowUp','Numpad8'],
  ]) {
    held.keyDown({key,code,repeat:false},true);
    check(held.has(key),'Record original command '+key);
    held.keyDown({key:modified,code,repeat:true},true);
    check(held.has(key),'Modifier changes do not replace the original command '+key);
    held.keyUp({key:modified,code});
    check(!held.has(key),'Release physical '+code+' regardless of modifiers');
  }
  held.keyDown({key:'^',code:'Digit6',repeat:false},true);
  check(!held.has('6'),'Shifted punctuation pressed first does not steer');
  held.clear();
  check(!held.keyDown({key:'6',code:'Digit6',repeat:true},true),'Auto-repeat cannot restore input after clearing');
  for(const code of ['Digit6','Numpad6'])held.keyDown({key:'6',code,repeat:false},true);
  held.keyUp({key:'^',code:'Digit6'});
  check(held.has('6'),'Releasing one physical key keeps the other active');
  held.keyUp({key:'ArrowRight',code:'Numpad6'});
  check(!held.has('6'),'Release the second key independently');
  held.keyDown({key:'D',code:'',repeat:false},true);
  held.keyUp({key:'d',code:''});
  check(!held.has('d'),'Code-less letter events retain compatible case folding');
  const reading=ruinSensorOverlay(192,152,0,true,true);
  check(reading.includes('Nexus at 47N 45E]'),'Red Cylinder reports the actual Nexus');
  check(reading.endsWith('pinpointed at 47N 45E!'),'Crystal Cone agrees with the Red Cylinder');
  const match=/pinpointed at (\d+)N (\d+)E!/.exec(reading)!;
  check(detonationResult({lat:Number(match[1]),lon:Number(match[2]),systemCoords:[192,152],planetIndex:0,isArmed:true})==='victory','Reported target resolves to victory');
  check(ruinSensorOverlay(215,86,2,true,true).includes('11N 104W]'),'Earth reports unsigned west longitude');
  check(!ruinSensorOverlay(215,86,2,true,true).includes('CONE HARMONICS'),'Cone stays silent away from the Crystal Planet');
  check(ruinSensorOverlay(192,152,0,false,false)==='','Uninstalled relics reveal no coordinates');
  for(const location of ['Star System','In Orbit','Landing','On Planet','Terrain Vehicle']) {
    check(isInStarSystemAtFlare(location,'Hyperspace'),location+' remains exposed to its star');
    check(isInStarSystemAtFlare('Encounter',location),'Tactical view retains the '+location+' origin');
  }
  check(!isInStarSystemAtFlare('Encounter','Hyperspace'),'Hyperspace intercept stays clear of the star');
  check(!isInStarSystemAtFlare('Hyperspace','Star System'),'Leaving the system ends its hazard');
  return {passed,failed:0,results:[]};
}

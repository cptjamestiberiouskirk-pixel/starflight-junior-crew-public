/** Original VPROBE# / Velox probe encounter: six numbers, not a trivia quiz. */
export interface DroneChallenge {
  status: 'waiting' | 'asking' | 'granted' | 'denied';
  correct: number;
  number: number | null;
  remaining: number;
}
export const newDroneChallenge = (): DroneChallenge => ({status:'waiting',correct:0,number:null,remaining:.5});
export function denyDroneOrbit(test: DroneChallenge) {
  test.status='denied';test.number=null;test.remaining=0;
}
export function answerDroneNumber(test: DroneChallenge, yes: boolean, attacked=false) {
  if(test.status!=='asking'||test.number===null)return false;
  if(attacked || yes!==(test.number%6===0)) {denyDroneOrbit(test);return false;}
  test.correct++;test.number=null;
  test.status=test.correct===6?'granted':'waiting';
  test.remaining=test.correct===6?3:1;
  return true;
}
export function advanceDroneChallenge(test: DroneChallenge, dt:number, connected:boolean, attacked=false, random:()=>number=Math.random): 'ask'|'deny'|'return'|null {
  if(test.status==='denied')return null;
  if(attacked || !connected && test.status!=='granted') {denyDroneOrbit(test);return 'deny';}
  test.remaining=Math.max(0,test.remaining-dt);
  if(test.remaining>1e-9)return null;
  if(test.status==='asking') {denyDroneOrbit(test);return 'deny';}
  if(test.status==='granted')return 'return';
  test.number=1+Math.min(98,Math.floor(Math.max(0,random())*99));
  test.status='asking';test.remaining=15;
  return 'ask';
}

import {shipConfigurationKey,shipConfigurationURL,prepareConfiguredShip,configuredShipImage,shipArtCacheState,configuredLaserEmitters,clearShipArtCache} from './utils/ship-art';
export async function runShipArtTests(){
 let passed=0;const check=(v:boolean,label:string)=>{if(!v)throw new Error(label);passed++;};
 const base={cargoPods:0,armorClass:0,laserClass:0,missileClass:0};
 const keys=new Set<string>();for(let c=0;c<=16;c++)for(let a=0;a<=5;a++)for(let l=0;l<=5;l++)for(let m=0;m<=5;m++)keys.add(shipConfigurationKey({cargoPods:c,armorClass:a,laserClass:l,missileClass:m}));
 check(keys.size===3672,'All valid configuration combinations have unique complete-image keys');
 check(shipConfigurationKey({cargoPods:NaN,armorClass:99,laserClass:-1,missileClass:2.7})==='ship-c00-a5-l0-m2','Legacy and corrupt visual values cannot escape the library');
 const url=shipConfigurationURL({...base,cargoPods:16,armorClass:5},'http://127.0.0.1:4174/starflight-junior-crew/');
 check(url.includes('/starflight-junior-crew/assets/ships/configurations/ship-c16-a5-l0-m0.png?v='),'Subdirectory and versioned local path');
 for(let tier=1;tier<=5;tier++){
  const p=configuredLaserEmitters(tier,1087);check(p.length===(tier<3?2:4),'Authored single/twin emitters retained');
  check(p.every(x=>x.x<0&&Math.abs(x.y)<301),'Emitter points remain at their original wing hardpoints');
  const small=configuredLaserEmitters(tier,108.7);check(small.every((x,i)=>Math.abs(x.x-p[i].x*.1)<.001),'Emitter scale agrees with the complete sprite frame');
 }
 check(configuredLaserEmitters(0,1087).length===0,'No visual beams for an absent laser');
 const originalImage=globalThis.Image;
 const instances:FakeImage[]=[];
 class FakeImage{
  decoding='';onload:(()=>void)|null=null;onerror:(()=>void)|null=null;naturalWidth=1087;naturalHeight=602;src='';
  constructor(){instances.push(this);}removeAttribute(){this.src='';}
 }
 try{
  globalThis.Image=FakeImage as any;
  const first=prepareConfiguredShip(base);check(configuredShipImage(base)===null,'Pending configuration cannot show a stale previously loaded ship');
  instances[0].onload!();check(await first,'Image completes only at the exact approved frame size');
  check(!!configuredShipImage(base),'Current completed image selected');
  const requests:Promise<boolean>[]=[];for(let c=1;c<=12;c++)requests.push(prepareConfiguredShip({...base,cargoPods:c}));
  check(shipArtCacheState().entries===8,'Decoded/in-flight cache remains bounded under rapid outfit changes');
  check(instances[1].src===''&&instances[1].onload===null,'Evicted pending load is cancelled instead of applying stale art');
  instances.at(-1)!.onerror!();check(await requests.at(-1)===false,'Missing image is a contained failure, never an unhandled rejection');
 }finally{clearShipArtCache();globalThis.Image=originalImage;}
 return {passed,failed:0,results:[]};
}



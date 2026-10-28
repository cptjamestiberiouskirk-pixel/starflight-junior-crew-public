import type {PlanetSurfaceState} from '../surface';
export function clampGroundZoom(value:number){return Number.isFinite(value)?Math.max(.4,Math.min(1.4,value)):1;}
/** [0,0] is the boarding apron; move the visual hull above that point so the
 * original 1.2 km boarding rule and legacy rover coordinates remain intact. */
export function groundShipAnchor(x:number,y:number,w:number,h:number,heading:number,zoom=1){
 const half=Math.abs(Math.sin(heading))*w/2+Math.abs(Math.cos(heading))*h/2;
 return {x,y:y-half-34*clampGroundZoom(zoom),apronX:x,apronY:y};
}
export function returnToShipAvailable(x:number,y:number,fuel:number,destroyed=false){return !destroyed&&fuel>0&&Math.hypot(x,y)>1.2;}
export function miningPulse(seconds:number){return .35+.65*Math.pow(.5+.5*Math.sin(seconds*Math.PI*2*1.25),2);}


/** Same nearest-first pickup decision as the existing collection handler. */
export function surfacePickupAvailable(surface:PlanetSurfaceState|null,x:number,y:number,used:number){
 if(!surface)return false;
 const near=(p:{x:number;y:number})=>Math.hypot(p.x-x,p.y-y),candidates:{distance:number;volume:number}[]=[];
 for(const m of surface.minerals)if(!m.taken&&m.volume>0&&near(m)<=2.5)candidates.push({distance:near(m),volume:m.volume});
 for(const r of surface.ruins)if(!(r.explored&&(!r.artifactId||(r.artifactRecovered??true)))&&near(r)<=2.5)candidates.push({distance:near(r),volume:0});
 for(const l of surface.lifeforms)if(!l.captured&&(l.stunned||l.dead)&&near(l)<=2.5)candidates.push({distance:near(l),volume:l.volume});
 for(const c of surface.droppedCargo)if(near(c)<=2.5)candidates.push({distance:near(c),volume:c.volume});
 candidates.sort((a,b)=>a.distance-b.distance);
 return candidates.length?used+candidates[0].volume<=50:surface.ruins.some(r=>near(r)<=2.5);
}

export function miningActionAvailable(surface:PlanetSurfaceState|null,x:number,y:number,used:number,fuel:number,selectedId:string|null){
 if(!surface||used>=49.95||fuel<=0)return false;
 const deposits=surface.minerals.filter(m=>!m.taken&&m.volume>0).sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y));
 const target=deposits.find(m=>m.id===selectedId)??deposits[0];
 return !!target&&Math.hypot(target.x-x,target.y-y)<=6;
}

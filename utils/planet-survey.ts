import type {StarPlanet} from '../galaxy';
import {CANONICAL_ARTIFACTS,preparePlanetSurface,type PlanetSurfaceState,type SurfaceRuin} from '../surface';
import {localSurfacePosition,surfaceCoordinates,wrapLongitude,SURFACE_DEGREES_PER_KM} from './planet-coordinates';

export const CONTACT_KINDS=['mineral','lifeform','ruin','installation','artifact'] as const;
export type ContactKind=typeof CONTACT_KINDS[number];
export type SurveyContact={id:string;kind:ContactKind;label:string;lat:number;lon:number;uncertaintyKm:number;source:'orbital'|'surface'|'artifact'};
export type PlanetSurvey={version:1;scienceSkill:number;sampledRegions:number;contacts:SurveyContact[]};
export const CONTACT_COLORS:Record<ContactKind,string>={mineral:'#ffca70',lifeform:'#85eeb0',ruin:'#c4a4ff',installation:'#50ddfa',artifact:'#f1f7ff'};
export const CONTACT_SYMBOLS:Record<ContactKind,string>={mineral:'◇',lifeform:'○',ruin:'□',installation:'⬡',artifact:'✧'};
export const CONTACT_NAMES:Record<ContactKind,string>={mineral:'Minerals',lifeform:'Life signs',ruin:'Ancient ruins',installation:'Installations',artifact:'Discovered artifacts'};
export function validPlanetSurvey(value:unknown):value is PlanetSurvey {
 if(!value||typeof value!=='object')return false;const v=value as PlanetSurvey;
 return v.version===1&&Number.isInteger(v.scienceSkill)&&v.scienceSkill>=0&&v.scienceSkill<=250
  &&Number.isInteger(v.sampledRegions)&&v.sampledRegions>=0&&v.sampledRegions<=10000
  &&Array.isArray(v.contacts)&&v.contacts.length<=10000&&new Set(v.contacts.map(c=>c?.id)).size===v.contacts.length
  &&v.contacts.every(c=>!!c&&typeof c.id==='string'&&c.id.length<=200&&CONTACT_KINDS.includes(c.kind)
   &&typeof c.label==='string'&&c.label.length<=200&&Number.isFinite(c.lat)&&Math.abs(c.lat)<=90
   &&Number.isFinite(c.lon)&&c.lon>=-180&&c.lon<180&&Number.isFinite(c.uncertaintyKm)&&c.uncertaintyKm>=0&&c.uncertaintyKm<=20
   &&['orbital','surface','artifact'].includes(c.source));
}
export const contactCoordinates=(c:SurveyContact)=>`${Math.abs(c.lat).toFixed(2)}°${c.lat<0?'S':'N'}, ${Math.abs(c.lon).toFixed(2)}°${c.lon<0?'W':'E'}`;
/** Existing authored facilities remain ordinary recoverable/explorable sites.
 * This classifies their physical structures; it creates no new installation. */
export const surfaceSiteKind=(r:SurfaceRuin):'installation'|'ruin'=>/Outpost|Laboratory|Assembly Core|Command Archive|Physics Lab|Armory|Telemetry Station|Observatory|Research Base|Weapons Cache|Weapon Vault|Subspace Beacon|Hyperspace Fold Vault/i.test(r.name)?'installation':'ruin';
type Observation=Omit<SurveyContact,'uncertaintyKm'|'source'>&{x:number;y:number;nexus:boolean;revealed:boolean};
function observations(s:PlanetSurfaceState):Observation[]{
 const at=(x:number,y:number)=>surfaceCoordinates(s.originLat??0,s.originLong??0,x,y);
 const ruins:Observation[]=s.ruins.flatMap(r=>{
  const kind=surfaceSiteKind(r),position=r.lat!==undefined&&r.long!==undefined?{lat:r.lat,lon:wrapLongitude(r.long)}:at(r.x,r.y);
  const site:Observation={id:r.id,kind,label:r.explored?r.name:kind==='installation'?'Installation signal':'Structural anomaly',...position,x:r.x,y:r.y,nexus:!!r.isControlNexus,revealed:r.explored};
  const a=CANONICAL_ARTIFACTS.find(a=>a.id===r.artifactId);
  return r.artifactId&&!r.artifactRecovered?[site,{...site,id:'artifact:'+r.id,kind:'artifact' as const,label:r.explored?(a?.codeName??'Discovered artifact'):'Artifact signal'}]:[site];
 });
 return [
  ...s.minerals.filter(m=>!m.taken&&m.volume>0).map(m=>({id:m.id,kind:'mineral' as const,label:m.name,...at(m.x,m.y),x:m.x,y:m.y,nexus:false,revealed:true})),
  ...s.lifeforms.filter(l=>!l.dead&&!l.captured).map(l=>({id:l.id,kind:'lifeform' as const,label:'Biological signal',...at(l.x,l.y),x:l.x,y:l.y,nexus:false,revealed:true})),...ruins,
 ];
}
export function orbitalSampleRegions(starX:number,starY:number,slot:number){
 let seed=(Math.imul(starX,73856093)^Math.imul(starY,19349663)^Math.imul(slot,83492791))>>>0;
 const random=()=>{seed=(seed+0x6d2b79f5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};
 return Array.from({length:12},(_,n)=>({lat:-60+Math.floor(n/4)*60+(random()-.5)*42,lon:-135+(n%4)*90+(random()-.5)*62}));
}
export const contactClusterLabel=(kind:ContactKind,count:number)=>`${count} ${CONTACT_NAMES[kind].toLowerCase()}`;
/** Actual saved objects and the existing skill/artifact gates, not baked pins. */
export function surveyPlanet(existing:PlanetSurfaceState|undefined,starX:number,starY:number,p:StarPlanet,lat:number,lon:number,skill:number,redCylinder=false,crystalCone=false,random=Math.random){
 let s=existing?structuredClone(existing):undefined;
 if(s){s.originLat??=lat;s.originLong??=lon;}
 for(const {lat:latitude,lon:longitude} of orbitalSampleRegions(starX,starY,p.slot))s=preparePlanetSurface(s,starX,starY,p,latitude,longitude);
 s=preparePlanetSurface(s,starX,starY,p,lat,lon);
 const science=Number.isFinite(skill)?Math.max(0,Math.min(250,Math.floor(skill))):0;
 const contacts=new Map((s.survey?.contacts??[]).map(c=>[c.id,c]));
 for(const o of observations(s)){
  if(o.nexus&&!crystalCone&&!redCylinder)continue;
  if(o.kind==='artifact'&&!o.revealed&&!redCylinder)continue;
  const structural=o.kind==='ruin'||o.kind==='installation'||o.kind==='artifact';
  const artifact=structural&&(redCylinder||o.nexus&&crystalCone);
  if(!artifact&&science<=Math.floor(Math.max(0,Math.min(.999999999,random()))*200))continue;
  const uncertainty=artifact?0:Math.max(0,(200-science)/25),step=uncertainty*SURFACE_DEGREES_PER_KM;
  const c:SurveyContact={id:o.id,kind:o.kind,label:o.nexus&&artifact?'Control Nexus':o.label,
   lat:step?Math.max(-89.9,Math.min(89.9,Math.round(o.lat/step)*step)):o.lat,
   lon:step?wrapLongitude(Math.round(o.lon/step)*step):o.lon,uncertaintyKm:uncertainty,source:artifact?'artifact':'orbital'};
  const old=contacts.get(c.id);if(!old||c.uncertaintyKm<old.uncertaintyKm||c.uncertaintyKm===old.uncertaintyKm&&old.kind==='ruin'&&c.kind==='installation')contacts.set(c.id,c);
 }
 s.survey={version:1,scienceSkill:science,sampledRegions:s.generatedRegions?.length??0,contacts:[...contacts.values()]};return s;
}
export function visibleSurveyContacts(s:PlanetSurfaceState|null|undefined,rover?:{x:number;y:number}):SurveyContact[]{
 if(!s)return [];
 const live=observations(s),ids=new Set(live.map(o=>o.id));
 const contacts=new Map((s.survey?.contacts??[]).filter(c=>ids.has(c.id)).map(c=>[c.id,c]));
 if(rover)for(const o of live)if((o.kind!=='artifact'||o.revealed)&&Math.hypot(o.x-rover.x,o.y-rover.y)<=2){
  contacts.set(o.id,{id:o.id,kind:o.kind,label:o.label,lat:o.lat,lon:o.lon,uncertaintyKm:0,source:'surface'});
 }
 return [...contacts.values()];
}
export function rememberLocalContacts(s:PlanetSurfaceState,rover:{x:number;y:number}){s.survey={version:1,scienceSkill:s.survey?.scienceSkill??0,sampledRegions:s.survey?.sampledRegions??0,contacts:visibleSurveyContacts(s,rover)};}
export function surveyClusters(contacts:SurveyContact[],project:(c:SurveyContact)=>{x:number;y:number;radius:number}){
 const cells=new Map<string,{kind:ContactKind;x:number;y:number;radius:number;uncertain:boolean;count:number}>();
 for(const c of contacts){const p=project(c),key=`${c.kind}:${Math.floor(p.x/20)}:${Math.floor(p.y/20)}`,old=cells.get(key);
  if(old){old.x=(old.x*old.count+p.x)/(old.count+1);old.y=(old.y*old.count+p.y)/(old.count+1);old.radius=Math.max(old.radius,p.radius);old.uncertain||=c.uncertaintyKm>0;old.count++;}
  else cells.set(key,{kind:c.kind,x:p.x,y:p.y,radius:p.radius,uncertain:c.uncertaintyKm>0,count:1});
 }return [...cells.values()];
}
export function drawContactSymbol(ctx:CanvasRenderingContext2D,kind:ContactKind,x:number,y:number,size=5){
 ctx.beginPath();
 if(kind==='lifeform')ctx.arc(x,y,size*.8,0,2*Math.PI);
 else {const count=kind==='installation'?6:kind==='artifact'?8:4;
  for(let i=0;i<count;i++){const angle=(kind==='ruin'?Math.PI/4:0)+i/count*Math.PI*2-Math.PI/2,r=kind==='artifact'&&i%2?size*.32:size;
   const px=x+Math.cos(angle)*r,py=y+Math.sin(angle)*r;i?ctx.lineTo(px,py):ctx.moveTo(px,py);}
  ctx.closePath();}
 ctx.fill();ctx.stroke();
}
export function drawSurveyContacts(ctx:CanvasRenderingContext2D,contacts:SurveyContact[],project:(c:SurveyContact)=>{x:number;y:number;radius:number},bounds:{x:number;y:number;width:number;height:number}){
 ctx.save();ctx.beginPath();ctx.rect(bounds.x,bounds.y,bounds.width,bounds.height);ctx.clip();
 for(const c of surveyClusters(contacts,project)){
  if(c.x<bounds.x-20||c.x>bounds.x+bounds.width+20||c.y<bounds.y-20||c.y>bounds.y+bounds.height+20)continue;
  ctx.strokeStyle=CONTACT_COLORS[c.kind];ctx.fillStyle='#061321';ctx.lineWidth=1.7;
  if(c.uncertain){ctx.setLineDash([3,3]);ctx.beginPath();ctx.ellipse(c.x,c.y,Math.max(8,c.radius),Math.max(8,c.radius),0,0,2*Math.PI);ctx.stroke();ctx.setLineDash([]);}
  drawContactSymbol(ctx,c.kind,c.x,c.y);
  // A compact shared legend identifies symbols. Repeated words/count badges
  // no longer obscure the map; filters and the selected contact carry details.
 }ctx.restore();
}
export const localContactPosition=(s:PlanetSurfaceState,c:SurveyContact)=>localSurfacePosition(s.originLat??0,s.originLong??0,c.lat,c.lon);

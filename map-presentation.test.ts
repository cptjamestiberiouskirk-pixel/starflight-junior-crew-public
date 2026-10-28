import assert from 'node:assert/strict';
import {landingMapBounds,landingMapPoint,orbitHullLighting} from './utils/map-presentation';
import {orbitalSampleRegions,contactClusterLabel,surveyPlanet,visibleSurveyContacts,drawSurveyContacts} from './utils/planet-survey';
import {generatePlanetSurface} from './surface';
import {UNIVERSE} from './galaxy';
import {surfaceCoordinates} from './utils/planet-coordinates';
import {decodeSaveFromBase64,encodeSaveToBase64} from './utils/save-codec';
import fixture from './test-fixtures/commissioned-mission.json';
export function runMapPresentationTests(){
 let passed=0;const check=(v:unknown,m:string)=>{assert(v,m);passed++;};
 for(const [w,h] of [[2560,300],[1440,200],[1280,180],[1024,220],[390,240],[320,240],[800,400],[120,80],[1,1]]){
  const b=landingMapBounds(w,h);check(b.x>=0&&b.y>=0&&b.x+b.width<=w+.001&&b.y+b.height<=h+.001,'All map edges fit both axes');check(Math.abs(b.width/b.height-2)<.001,'Projection keeps 2:1 aspect');
  if(b.width>=1){const c=landingMapPoint(w,h,b.x+b.width/2,b.y+b.height/2)!;check(c.lat===0&&c.lon===0,'Center pointer selects equator and prime meridian');check(landingMapPoint(w,h,b.x,b.y)?.lat===90,'Top edge is north pole');check(landingMapPoint(w,h,b.x+b.width,b.y+b.height)?.lon===180,'Right edge is longitude seam');check(landingMapPoint(w,h,b.x-1,b.y)===null,'Backdrop clicks cannot select coordinates');}
 }
 for(const [w,h] of [[0,0],[NaN,100],[100,Infinity],[-1,200]])check(landingMapPoint(w,h,0,0)===null,'Invalid/hidden viewport cannot corrupt landing target');
 for(let phase=-20;phase<=20;phase++){const l=orbitHullLighting(Math.sin(phase));check(l.alpha===1&&l.brightness>=.7&&l.brightness<=1,'Whole orbit dims illumination with opaque material');}
 check(orbitHullLighting(NaN).alpha===1&&orbitHullLighting(NaN).brightness===.7,'Invalid illumination fails to opaque night shading');
 const a=orbitalSampleRegions(125,100,1),b=orbitalSampleRegions(125,100,1),c=orbitalSampleRegions(126,100,1);
 check(a.length===12&&new Set(a.map(p=>p.lat.toFixed(3))).size===12,'Sparse sampling no longer creates three latitude rows');check(JSON.stringify(a)===JSON.stringify(b),'Sample positions stable across rescans and reload');check(JSON.stringify(a)!==JSON.stringify(c),'Different worlds have distinct sample sites');check(a.every(p=>p.lat>=-90&&p.lat<=90&&p.lon>=-180&&p.lon<180),'Sample sites remain valid coordinates');
 for(const kind of ['mineral','lifeform','ruin'] as const)check(contactClusterLabel(kind,4).includes('4 ')&&!/^\d+$/.test(contactClusterLabel(kind,4)),'Grouped marker describes what is counted');
 const star=UNIVERSE.stars[0],planet=star.planets[0],old=generatePlanetSurface(star.x,star.y,planet,{lat:0,lon:0});
 const original=old.minerals.map(m=>({id:m.id,...surfaceCoordinates(0,0,m.x,m.y)}));
 const scanned=surveyPlanet(old,star.x,star.y,planet,0,0,200,false,false,()=>0);
 for(const before of original){const m=scanned.minerals.find(m=>m.id===before.id)!;const at=surfaceCoordinates(scanned.originLat!,scanned.originLong!,m.x,m.y);check(Math.hypot(at.lat-before.lat,at.lon-before.lon)<.00001,'New sample regions never move saved deposits');}
 const labels:string[]=[];const ctx:any={save(){},restore(){},beginPath(){},rect(){},clip(){},setLineDash(){},ellipse(){},stroke(){},moveTo(){},lineTo(){},closePath(){},arc(){},fill(){},fillRect(){},measureText:(s:string)=>({width:s.length*6}),fillText(s:string,x:number,y:number){check(Number.isFinite(x)&&Number.isFinite(y),'Edge marker label stays finite');labels.push(s);}};
 drawSurveyContacts(ctx,Array.from({length:1000},(_,n)=>({id:String(n),kind:'mineral' as const,label:'Test',lat:0,lon:0,uncertaintyKm:0,source:'orbital' as const})),()=>({x:99,y:1,radius:0}),{x:0,y:0,width:100,height:60});
 check(labels.length===0,'Crowded map uses symbols only; counts and descriptions belong to legend and selected contact');
 for(const target of [undefined,null,{x:12,y:-8}]){const f:any=structuredClone(fixture);f.data.snapshot.roverWaypoint=target;const s=decodeSaveFromBase64(encodeSaveToBase64(f));check(!!s,'Legacy/null/valid waypoint public save accepted');if(target)check(s?.data.snapshot?.roverWaypoint?.x===12,'Waypoint persists public export/import');}
 for(const target of [{x:'12',y:0},{x:null,y:0},{x:Infinity,y:0},{x:0,y:901},{x:1801,y:0},[],true]){const f:any=structuredClone(fixture);f.data.snapshot.roverWaypoint=target;check(!decodeSaveFromBase64(JSON.stringify(f)),'Malformed navigation target rejected before overwrite');}
 check(visibleSurveyContacts(scanned).length>0,'Actual discoveries remain visible after irregular sampling');
 return {passed,failed:0,results:[]};
}

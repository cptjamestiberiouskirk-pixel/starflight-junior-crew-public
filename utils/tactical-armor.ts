import * as THREE from 'three';

type Polygon=THREE.Vector3[];
type Patch={polygons:Polygon[];normal:THREE.Vector3;u:number;v:number;iu:number;iv:number;bucket:number;area:number;center:THREE.Vector3;score:number};
const CELL=3,EPS=1e-9;
export const ARMOR_GLAZING_MARGIN=.04;
export function armorGlazingKeepouts(parent:THREE.Object3D){
 parent.updateWorldMatrix(true,true);const inverse=parent.matrixWorld.clone().invert(),boxes:THREE.Box3[]=[],seen=new Set<string>();
 parent.traverse((o:any)=>{
  const name=o.userData.source_name??o.name;
  if(name!=='Bridge cap'&&!String(name).startsWith('Forward observation window ')&&!(o.isMesh&&o.material?.name==='Cockpit blue-black'))return;
  const bounds=new THREE.Box3();o.traverse((child:any)=>{if(!child.isMesh||child.material?.name==='Ink'||child.userData.outline_for)return;const p=child.geometry.attributes.position,m=inverse.clone().multiply(child.matrixWorld);for(let i=0;i<p.count;i++)bounds.expandByPoint(new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(m));});
  if(bounds.isEmpty())return;bounds.expandByScalar(ARMOR_GLAZING_MARGIN);const key=[...bounds.min.toArray(),...bounds.max.toArray()].map(n=>n.toFixed(5)).join(':');
  if(!seen.has(key)){seen.add(key);boxes.push(bounds);}
 });return boxes;
}
function polygonArea(p:Polygon){let area=0;for(let i=1;i+1<p.length;i++)area+=p[i].clone().sub(p[0]).cross(p[i+1].clone().sub(p[0])).length()/2;return area;}
function clip(p:Polygon,axis:number,value:number,lower:boolean):Polygon {
 const out:Polygon=[];
 for(let i=0;i<p.length;i++){
  const a=p[i],b=p[(i+1)%p.length],da=(a.getComponent(axis)-value)*(lower?-1:1),db=(b.getComponent(axis)-value)*(lower?-1:1);
  if(da>=-EPS)out.push(a.clone());
  if((da>EPS&&db< -EPS)||(da< -EPS&&db>EPS)){const t=da/(da-db);out.push(a.clone().lerp(b,t));}
 }
 return out;
}
function outsideBox(p:Polygon,box:THREE.Box3){
 let inside=[p];const outside:Polygon[]=[];
 for(let axis=0;axis<3;axis++)for(const lower of [true,false]){
  const value=(lower?box.min:box.max).getComponent(axis),next:Polygon[]=[];
  for(const q of inside){const out=clip(q,axis,value,lower),keep=clip(q,axis,value,!lower);if(polygonArea(out)>EPS)outside.push(out);if(polygonArea(keep)>EPS)next.push(keep);}inside=next;
 }
 return outside;
}
function priority(p:THREE.Vector3){
 const gaussian=(x:number,y:number,sx:number,sy:number)=>Math.exp(-(((p.x-x)/sx)**2+((p.y-y)/sy)**2));
 const bridge=4*gaussian(0,21,7,7),engineering=3.8*gaussian(0,-21,8,7),roots=2.8*gaussian(0,-12,7,6);
 const spine=1.7*gaussian(0,3,3,16),leading=1.4*Math.exp(-(((p.y+11)/4)**2));
 const noise=Math.sin(Math.abs(p.x)*12.9898+p.y*78.233+Math.abs(p.z)*37.719)*43758.5453;
 return Math.max(bridge,engineering,roots,spine,leading)+.8*(noise-Math.floor(noise));
}

/** Allocate complete modeled hull skin, including sides/undersides, into five
 * cumulative equal-area bands. Each facing family receives its own 20% budget,
 * so coverage remains balanced from different viewing directions. */
export function buildTacticalArmor(parent:THREE.Object3D){
 parent.updateWorldMatrix(true,true);const inverse=parent.matrixWorld.clone().invert(),patches=new Map<string,Patch>(),keepouts=armorGlazingKeepouts(parent);
 parent.traverse((object:any)=>{
  if(!object.isMesh||!object.material?.name?.startsWith('Hull •'))return;
  const g=(object.geometry.index?object.geometry.toNonIndexed():object.geometry.clone()) as THREE.BufferGeometry;
  g.applyMatrix4(inverse.clone().multiply(object.matrixWorld));const positions=g.attributes.position,normals=g.attributes.normal;
  for(let i=0;i<positions.count;i+=3){
   let tri=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(positions,i+j));
   const normal=new THREE.Vector3();for(let j=0;j<3;j++)normal.add(new THREE.Vector3().fromBufferAttribute(normals,i+j));normal.normalize();
   const cross=tri[1].clone().sub(tri[0]).cross(tri[2].clone().sub(tri[0]));if(cross.length()<EPS)continue;
   if(cross.dot(normal)<0)tri=[tri[0],tri[2],tri[1]];
   const a=[Math.abs(normal.x),Math.abs(normal.y),Math.abs(normal.z)],axis=a.indexOf(Math.max(...a)),bucket=axis*2+(normal.getComponent(axis)<0?1:0);
   const [u,v]=axis===2?[0,1]:axis===0?[1,2]:[0,2];
   let eligible=[tri];for(const box of keepouts)eligible=eligible.flatMap(p=>outsideBox(p,box));
   for(const skin of eligible){
   const minU=Math.floor(Math.min(...skin.map(p=>p.getComponent(u)))/CELL),maxU=Math.floor((Math.max(...skin.map(p=>p.getComponent(u)))-EPS)/CELL);
   const minV=Math.floor(Math.min(...skin.map(p=>p.getComponent(v)))/CELL),maxV=Math.floor((Math.max(...skin.map(p=>p.getComponent(v)))-EPS)/CELL);
   for(let iu=minU;iu<=maxU;iu++)for(let iv=minV;iv<=maxV;iv++){
    let polygon=clip(skin,u,iu*CELL,false);polygon=clip(polygon,u,(iu+1)*CELL,true);polygon=clip(polygon,v,iv*CELL,false);polygon=clip(polygon,v,(iv+1)*CELL,true);
    const area=polygonArea(polygon);if(area<EPS)continue;
    const key=[normal.x.toFixed(4),normal.y.toFixed(4),normal.z.toFixed(4),normal.dot(tri[0]).toFixed(4),iu,iv].join(':');
    let patch=patches.get(key);if(!patch){patch={polygons:[],normal:normal.clone(),u,v,iu,iv,bucket,area:0,center:new THREE.Vector3(),score:0};patches.set(key,patch);}
    const center=polygon.reduce((s,p)=>s.add(p),new THREE.Vector3()).multiplyScalar(1/polygon.length);
    patch.center.addScaledVector(center,area);patch.area+=area;patch.polygons.push(polygon);
   }
   }
  }
  g.dispose();
 });
 const rows=[...patches.values()];rows.forEach(p=>{p.center.multiplyScalar(1/p.area);p.score=priority(p.center);});
 const positions=Array.from({length:5},()=>[] as number[]),normals=Array.from({length:5},()=>[] as number[]),uv=Array.from({length:5},()=>[] as number[]);
 const bandAreas=[0,0,0,0,0],facingAreas=Array(6).fill(0) as number[];
 function emit(patch:Patch,polygons:Polygon[],band:number){
  const sample=Math.abs(Math.imul(patch.iu+101,73856093)^Math.imul(patch.iv+211,19349663)^patch.bucket*83492791)%16,col=sample%4,row=Math.floor(sample/4);
  for(const p of polygons){
   const area=polygonArea(p);if(area<EPS)continue;bandAreas[band]+=area;
   for(let i=1;i+1<p.length;i++)for(const point of [p[0],p[i],p[i+1]]){
    const q=point.clone().addScaledVector(patch.normal,.008);positions[band].push(q.x,q.y,q.z);normals[band].push(patch.normal.x,patch.normal.y,patch.normal.z);
    const s=THREE.MathUtils.clamp(point.getComponent(patch.u)/CELL-patch.iu,0,1),t=THREE.MathUtils.clamp(point.getComponent(patch.v)/CELL-patch.iv,0,1);
    uv[band].push((col+(1+126*s)/128)/4,1-(row+(1+126*t)/128)/4);
   }
  }
 }
 for(let bucket=0;bucket<6;bucket++){
  const facing=rows.filter(p=>p.bucket===bucket).sort((a,b)=>b.score-a.score||a.center.y-b.center.y||a.center.x-b.center.x);
  const total=facing.reduce((n,p)=>n+p.area,0);facingAreas[bucket]=total;let used=0,band=0;
  for(const patch of facing){
   let remaining=patch.polygons,area=patch.area;
   while(area>EPS&&band<5){
    const budget=total*(band+1)/5-used;
    if(band===4||area<=budget+EPS){emit(patch,remaining,band);used+=area;area=0;if(used>=total*(band+1)/5-EPS)band++;}
    else {
     let lo=patch.iu*CELL,hi=(patch.iu+1)*CELL;
     for(let k=0;k<48;k++){const mid=(lo+hi)/2,cut=remaining.reduce((n,p)=>n+polygonArea(clip(p,patch.u,mid,true)),0);if(cut<budget)lo=mid;else hi=mid;}
     const cut=(lo+hi)/2,first=remaining.map(p=>clip(p,patch.u,cut,true));emit(patch,first,band);const filled=first.reduce((n,p)=>n+polygonArea(p),0);
     remaining=remaining.map(p=>clip(p,patch.u,cut,false));used+=filled;area=remaining.reduce((n,p)=>n+polygonArea(p),0);band++;
    }
   }
  }
 }
 const geometries=positions.map((p,i)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(normals[i],3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv[i],2));return g;});
 return {geometries,bandAreas,totalArea:bandAreas.reduce((n,a)=>n+a,0),facingAreas,patches:rows.length,keepouts};
}

/** Reuse actual approved ceramic tiles as a material atlas. No new source image
 * is generated, and every selected geometric plate is opaque underneath it. */
export function approvedCeramicAtlas(source:THREE.Texture|undefined){
 const image=source?.image;if(!image||typeof document==='undefined')return source??null;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const ctx=canvas.getContext('2d');if(!ctx)return source!;
 const white=[[221,91,38,28],[201,121,38,28],[241,121,38,28],[221,151,38,28]],dark=[201,481,38,28];
 ctx.fillStyle='#e8f0f2';ctx.fillRect(0,0,512,512);
 for(let i=0;i<16;i++){const rect=i===3||i===12?dark:white[i%white.length];ctx.drawImage(image,...rect as [number,number,number,number],i%4*128,Math.floor(i/4)*128,128,128);}
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;texture.name='Reused approved ceramic tile material';return texture;
}

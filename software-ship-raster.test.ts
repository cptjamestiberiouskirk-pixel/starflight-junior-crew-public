import assert from 'node:assert/strict';
import {rasterShipFaces,clipRasterTriangle,type RasterFace,type ClipVertex} from './utils/software-ship-raster';

export function runSoftwareShipRasterTests(){
  let passed=0;const check=(value:boolean,label:string)=>{assert(value,label);passed++;};
  const face=(z:number|number[],color:number[]):RasterFace=>({points:[[0,0],[8,0],[0,8]].map(([x,y],i)=>({x,y,z:Array.isArray(z)?z[i]:z,reciprocalW:1})),color});
  const pixel=(data:Uint8ClampedArray,x:number,y:number)=>Array.from(data.slice((y*8+x)*4,(y*8+x)*4+4));
  const sloped=face([.9,.9,-.9],[255,0,0]),flat=face(0,[0,0,255]);
  const crossed=rasterShipFaces([sloped,flat],8,8),reversed=rasterShipFaces([flat,sloped],8,8);
  check(pixel(crossed.rgba,1,1).join()==='0,0,255,255','Flat surface is nearer on the far side of the crossing');
  check(pixel(crossed.rgba,1,5).join()==='255,0,0,255','Sloping surface is nearer on the opposite side; whole-triangle sorting cannot do this');
  check(crossed.rgba.every((v,i)=>v===reversed.rgba[i]),'Opaque geometry order cannot change the visible ship');
  const hull=face(.5,[225,235,240]),ceramic=face(.49999,[245,208,90]);
  for(const order of [[hull,ceramic],[ceramic,hull]])check(pixel(rasterShipFaces(order,8,8).rgba,2,2).join()==='245,208,90,255','Closely spaced armor stays above the hull, regardless of triangle order');
  const behind=face(.8,[0,0,0]);check(pixel(rasterShipFaces([hull,behind],8,8).rgba,2,2).join()==='225,235,240,255','Rear geometry cannot form black fans through the hull');
  const tile=face(0,[255,255,255]);tile.texture={width:2,height:2,data:new Uint8ClampedArray([0,0,0,0,240,190,80,255,20,20,20,255,240,190,80,255])};tile.uv=[{x:0,y:0},{x:2,y:0},{x:0,y:2}];
  for(const order of [[hull,tile],[tile,hull]]){
    const image=rasterShipFaces(order,8,8);
    check(pixel(image.rgba,1,1).join()==='225,235,240,255','Transparent material aperture reveals the physical hull');
    check(pixel(image.rgba,5,1).join()==='240,190,80,255','Opaque thermal tile remains visible');
  }
  const perspective=face(0,[0,0,0]);perspective.points[1].reciprocalW=.25;perspective.uv=[{x:0,y:0},{x:4,y:0},{x:0,y:0}];perspective.texture={width:4,height:1,data:new Uint8ClampedArray([255,0,0,255,0,255,0,255,0,0,255,255,255,255,255,255])};
  check(pixel(rasterShipFaces([perspective],8,8).rgba,4,0).join()==='255,0,0,255','Perspective-correct UV interpolation avoids shearing the tile imagery');
  const glow=face(0,[0,0,255]);glow.opacity=.5;
  check(pixel(rasterShipFaces([glow,face(.4,[255,255,255])],8,8).rgba,2,2).join()==='128,128,255,255','Foreground exhaust blends over opaque physical hull');
  check(pixel(rasterShipFaces([glow,face(-.4,[255,255,255])],8,8).rgba,2,2).join()==='255,255,255,255','Exhaust behind the hull cannot make it transparent');
  const reused=rasterShipFaces([],8,8,crossed.rgba,crossed.depth);
  check(reused.rgba.every(v=>v===0)&&reused.depth.every(v=>v===Infinity),'Reused frame buffers cannot leave stale geometry or depth');
  const degenerate=face(0,[255,0,0]);degenerate.points[1]={...degenerate.points[0]};
  check(rasterShipFaces([degenerate],8,8).rgba.every(v=>v===0),'Zero-area triangles are harmless');
  const invalid=face(NaN,[255,0,0]);check(rasterShipFaces([invalid],8,8).rgba.every(v=>v===0),'Invalid depth does not corrupt the render');
  const outside=face(0,[255,0,0]);outside.points.forEach(p=>{p.x+=50;p.y+=50;});
  check(rasterShipFaces([outside],8,8).rgba.every(v=>v===0),'Offscreen triangles are clipped to bounded work');
  const clip=(x:number,y:number,z:number,w=1):ClipVertex=>({x,y,z,w,u:(x+1)/2,v:(y+1)/2});
  check(clipRasterTriangle([clip(-.5,-.5,0),clip(.5,-.5,0),clip(0,.5,0)]).length===1,'An in-view triangle is retained');
  check(clipRasterTriangle([clip(-.5,-.5,-2),clip(.5,-.5,-2),clip(0,.5,-2)]).length===0,'Fully near-clipped geometry is rejected');
  const crossing=clipRasterTriangle([clip(-.5,-.5,-2),clip(.5,-.5,0),clip(0,.5,0)]);
  check(crossing.length===2,'A wall crossing the near plane becomes two visible triangles instead of disappearing');
  check(crossing.flat().every(p=>p.z>=-p.w-1e-9&&p.z<=p.w+1e-9&&Math.abs(p.x)<=p.w+1e-9&&Math.abs(p.y)<=p.w+1e-9),'Clipped floor/wall vertices remain within all six view planes');
  check(crossing.flat().some(p=>Math.abs(p.z+1)<1e-9&&p.u>0&&p.u<1),'Clipping interpolates texture attributes at the new boundary');
  check(clipRasterTriangle([clip(NaN,0,0),clip(.5,0,0),clip(0,.5,0)]).length===0,'Nonfinite clip coordinates fail closed');
  const filtered=face(0,[0,0,0]);filtered.texture={width:2,height:1,filter:'linear',data:new Uint8ClampedArray([255,0,0,255,0,0,255,255])};filtered.uv=[{x:0,y:0},{x:2,y:0},{x:0,y:0}];
  check(pixel(rasterShipFaces([filtered],8,8).rgba,3,1).join()==='159,0,96,255','Filtered textures blend neighboring samples instead of shimmering between them');
  return {passed,failed:0,results:[]};
}

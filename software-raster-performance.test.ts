import assert from 'node:assert/strict';
import {rasterShipFaces,type RasterFace} from './utils/software-ship-raster';
import {referenceRasterShipFaces} from './test-fixtures/software-raster-reference';

export function runSoftwareRasterPerformanceTests(){
 let passed=0;const check=(value:boolean,label:string)=>{assert(value,label);passed++;};
 let state=712041;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
 for(let trial=0;trial<80;trial++){
  const faces:RasterFace[]=[];
  for(let i=0;i<12;i++){
   const face:RasterFace={points:Array.from({length:3},()=>({x:random()*58-10,y:random()*42-10,z:random()*1.8-.9,reciprocalW:.2+random()*2})),color:[0,1,2].map(()=>Math.floor(random()*256))};
   if(i%3){face.texture={width:4,height:4,filter:i%2?'linear':undefined,data:new Uint8ClampedArray(Array.from({length:64},(_,j)=>j%4===3?Math.floor(random()*230):Math.floor(random()*256)))};face.uv=Array.from({length:3},()=>({x:random()*7-1.5,y:random()*7-1.5}));}
   if(i%4===0)face.opacity=.3+random()*.5;
   faces.push(face);
  }
  const old=referenceRasterShipFaces(faces,40,28),now=rasterShipFaces(faces,40,28);
  let maximum=0,alphaMismatch=0;
  for(let i=0;i<old.rgba.length;i++){maximum=Math.max(maximum,Math.abs(old.rgba[i]-now.rgba[i]));if(i%4===3&&Math.abs(old.rgba[i]-now.rgba[i])>1)alphaMismatch++;}
  check(maximum<=1&&alphaMismatch===0,'Seeded depth/alpha/perspective/edge oracle '+trial+' retains pixels within one rounding level');
 }
 const points=[{x:.1,y:.3,z:0,reciprocalW:1},{x:30.7,y:1.4,z:0,reciprocalW:1},{x:.4,y:22.9,z:0,reciprocalW:1}];
 const front:RasterFace={points,color:[0,0,0],texture:{width:2,height:2,filter:'linear',opaque:true,data:new Uint8ClampedArray(Array(4).fill([240,230,220,255]).flat())},uv:[{x:0,y:0},{x:2,y:0},{x:0,y:2}]};
 const rear:RasterFace={points:points.map(p=>({...p,z:.5})),color:[255,0,0]};
 const old=referenceRasterShipFaces([front,rear],32,24),now=rasterShipFaces([front,rear],32,24);
 let priorLeaks=0,leaks=0;for(let i=0;i<now.rgba.length;i+=4){if(old.rgba[i]===255&&old.rgba[i+1]===0&&old.rgba[i+3]===255)priorLeaks++;if(now.rgba[i]===255&&now.rgba[i+1]===0&&now.rgba[i+3]===255)leaks++;}
 check(priorLeaks>0,'Frozen renderer reproduces false transparent depth holes from 255-alpha interpolation roundoff');
 check(leaks===0,'Verified opaque texture always writes depth and cannot leak rear geometry');
 const half={...front,texture:{...front.texture!,opaque:false,data:new Uint8ClampedArray(Array(4).fill([240,230,220,128]).flat())}};
 const under=rasterShipFaces([rear,half],32,24);
 check(under.rgba.some((v,i)=>i%4===1&&v>0&&v<230),'Actual translucent textures retain blending');
 return {passed,failed:0,results:[]};
}

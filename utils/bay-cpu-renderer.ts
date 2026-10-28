import * as THREE from 'three';
import {rasterShipFaces,clipRasterTriangle,type RasterFace,type RasterTexture} from './software-ship-raster';
const pixelTextures=new WeakMap<object,RasterTexture[]>();
const frameBuffers=new WeakMap<CanvasRenderingContext2D,{image:ImageData;depth:Float32Array;width:number;height:number}>();
function texturePixels(image:HTMLImageElement):RasterTexture[]{
 const cached=pixelTextures.get(image);if(cached)return cached;
 const canvas=document.createElement('canvas'),scale=Math.min(1,1024/Math.max(image.width,image.height)),levels:RasterTexture[]=[];
 let width=Math.max(1,Math.round(image.width*scale)),height=Math.max(1,Math.round(image.height*scale));
 while(true){canvas.width=width;canvas.height=height;const context=canvas.getContext('2d');if(!context)break;
  context.imageSmoothingEnabled=true;context.imageSmoothingQuality='high';context.drawImage(image,0,0,width,height);
  const data=context.getImageData(0,0,width,height).data;let opaque=true;for(let i=3;i<data.length;i+=4)if(data[i]!==255){opaque=false;break;}
  levels.push({data,width,height,filter:'linear',opaque});
  if(Math.max(width,height)<=16)break;width=Math.max(1,Math.floor(width/2));height=Math.max(1,Math.floor(height/2));
 }
 pixelTextures.set(image,levels);return levels;
}
const tintedTextures=new WeakMap<object,Map<string,HTMLCanvasElement>>();
function materialImage(image:HTMLImageElement,color:THREE.Color){
 if(color.r===1&&color.g===1&&color.b===1||typeof document==='undefined')return image;
 const key=color.getHexString();let entries=tintedTextures.get(image);if(!entries){entries=new Map();tintedTextures.set(image,entries);}
 const prior=entries.get(key);if(prior)return prior as unknown as HTMLImageElement;
 const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const ctx=canvas.getContext('2d');if(!ctx)return image;
 ctx.drawImage(image,0,0);ctx.globalCompositeOperation='multiply';ctx.fillStyle='#'+key;ctx.fillRect(0,0,canvas.width,canvas.height);ctx.globalCompositeOperation='destination-in';ctx.drawImage(image,0,0);ctx.globalCompositeOperation='source-over';
 entries.set(key,canvas);if(entries.size>8)entries.delete(entries.keys().next().value!);return canvas as unknown as HTMLImageElement;
}
type MeshCache={geometry:THREE.BufferGeometry;key:string;positions:Float64Array;normals:Float32Array;centers:Float64Array;uv:Float32Array;count:number};
const meshCaches=new WeakMap<object,Map<number,MeshCache>>();
const matrix=new THREE.Matrix4(),instance=new THREE.Matrix4();
/** Room geometry and ship fittings mostly translate without rotating. Cache
 * their camera-independent transforms instead of rebuilding every triangle. */
function transformedMesh(object:THREE.Mesh,index:number,geometry:THREE.BufferGeometry,transform:THREE.Matrix4):MeshCache{
 let entries=meshCaches.get(object);if(!entries){entries=new Map();meshCaches.set(object,entries);}
 const e=transform.elements,key=[e[0],e[1],e[2],e[4],e[5],e[6],e[8],e[9],e[10]].join(',');const prior=entries.get(index);
 if(prior&&prior.geometry===geometry&&prior.key===key)return prior;
 const attr=geometry.attributes.position,indices=geometry.index,uv=geometry.attributes.uv,count=Math.floor((indices?.count??attr.count)/3);
 const data:MeshCache={geometry,key,count,positions:new Float64Array(count*9),normals:new Float32Array(count*3),centers:new Float64Array(count*3),uv:new Float32Array(count*6)},sign=transform.determinant()<0?-1:1;
 for(let t=0;t<count;t++){
  for(let c=0;c<3;c++){const v=indices?indices.getX(t*3+c):t*3+c,x=attr.getX(v),y=attr.getY(v),z=attr.getZ(v),i=t*9+c*3;data.positions[i]=e[0]*x+e[4]*y+e[8]*z;data.positions[i+1]=e[1]*x+e[5]*y+e[9]*z;data.positions[i+2]=e[2]*x+e[6]*y+e[10]*z;if(uv){data.uv[t*6+c*2]=uv.getX(v);data.uv[t*6+c*2+1]=uv.getY(v);}}
  const p=t*9,n=t*3,a=data.positions,x1=a[p+3]-a[p],y1=a[p+4]-a[p+1],z1=a[p+5]-a[p+2],x2=a[p+6]-a[p],y2=a[p+7]-a[p+1],z2=a[p+8]-a[p+2];let nx=(y1*z2-z1*y2)*sign,ny=(z1*x2-x1*z2)*sign,nz=(x1*y2-y1*x2)*sign;const length=Math.hypot(nx,ny,nz)||1;nx/=length;ny/=length;nz/=length;data.normals[n]=nx;data.normals[n+1]=ny;data.normals[n+2]=nz;data.centers[n]=(a[p]+a[p+3]+a[p+6])/3;data.centers[n+1]=(a[p+1]+a[p+4]+a[p+7])/3;data.centers[n+2]=(a[p+2]+a[p+5]+a[p+8])/3;
 }
 entries.set(index,data);return data;
}
/** The fallback uses the same 3D meshes and production camera, not a top-down sprite. */
export function drawConfiguredShipCPU(ctx:CanvasRenderingContext2D,ship:THREE.Object3D,camera:THREE.Camera,x:number,y:number,width:number,height:number){
 ship.updateWorldMatrix(true,true);camera.updateMatrixWorld();const projection=camera.projectionMatrix.clone().multiply(camera.matrixWorldInverse);const faces:RasterFace[]=[];
 ship.traverse((object:any)=>{
  if(!object.isMesh||object.userData.outline_for)return;let ancestor=object;while(ancestor){if(!ancestor.visible)return;ancestor=ancestor.parent;}
  const geometry=object.geometry as THREE.BufferGeometry,mat=(Array.isArray(object.material)?object.material[0]:object.material) as THREE.MeshToonMaterial;
  const base=mat.color??new THREE.Color('#dce8e9'),instances=object.isInstancedMesh?object.count:1;
  for(let n=0;n<instances;n++){
   matrix.copy(object.matrixWorld);const tint=base.clone();
   if(object.isInstancedMesh){object.getMatrixAt(n,instance);matrix.multiply(instance);if(object.instanceColor){const color=new THREE.Color();object.getColorAt(n,color);tint.multiply(color);}}
   const cache=transformedMesh(object,n,geometry,matrix),tx=matrix.elements[12],ty=matrix.elements[13],tz=matrix.elements[14],e=projection.elements;
   const shades=[1,.73,.42].map(l=>{const c=tint.clone().multiplyScalar(l).convertLinearToSRGB();return [Math.round(c.r*255),Math.round(c.g*255),Math.round(c.b*255)];});
   const originalTexture=mat.map?.image as HTMLImageElement|undefined,texture=originalTexture?materialImage(originalTexture,tint):undefined,levels=texture?texturePixels(texture):[],baseTexture=levels[0];
   for(let t=0;t<cache.count;t++){
    const ni=t*3,pi=t*9,ui=t*6,nx=cache.normals[ni],ny=cache.normals[ni+1],nz=cache.normals[ni+2];
    if(nx*(camera.position.x-cache.centers[ni]-tx)+ny*(camera.position.y-cache.centers[ni+1]-ty)+nz*(camera.position.z-cache.centers[ni+2]-tz)<=0)continue;
    const color=shades[mat.type==='MeshBasicMaterial'||(-nx*.2357022604-ny*.2357022604+nz*.9428090416)>.55?0:nz>-.1?1:2];
    const clipped=clipRasterTriangle([0,1,2].map(i=>{const p=pi+i*3,x=cache.positions[p]+tx,y=cache.positions[p+1]+ty,z=cache.positions[p+2]+tz;return {x:e[0]*x+e[4]*y+e[8]*z+e[12],y:e[1]*x+e[5]*y+e[9]*z+e[13],z:e[2]*x+e[6]*y+e[10]*z+e[14],w:e[3]*x+e[7]*y+e[11]*z+e[15],u:cache.uv[ui+i*2],v:cache.uv[ui+i*2+1]};}));
    for(const triangle of clipped){
      const screen=triangle.map(p=>({x:(p.x/p.w+1)*width/2,y:(1-p.y/p.w)*height/2,z:p.z/p.w,reciprocalW:1/p.w}));let sampled=baseTexture;
      if(baseTexture){let ratio=1;for(let i=0;i<3;i++){const j=(i+1)%3,texels=Math.hypot((triangle[i].u-triangle[j].u)*baseTexture.width,(triangle[i].v-triangle[j].v)*baseTexture.height),pixels=Math.hypot(screen[i].x-screen[j].x,screen[i].y-screen[j].y);if(pixels>1)ratio=Math.max(ratio,texels/pixels);}sampled=levels[Math.min(levels.length-1,Math.max(0,Math.floor(Math.log2(ratio))))];}
      const uv=sampled?triangle.map(p=>({x:p.u*sampled.width,y:(mat.map?.flipY===false?p.v:1-p.v)*sampled.height})):undefined;
      faces.push({texture:sampled,uv,points:screen,color,opacity:mat.opacity});
    }
   }
  }
 });
 const w=Math.max(1,Math.round(width)),h=Math.max(1,Math.round(height));let frame=frameBuffers.get(ctx);
 if(!frame||frame.width!==w||frame.height!==h){frame={image:ctx.createImageData(w,h),depth:new Float32Array(w*h),width:w,height:h};frameBuffers.set(ctx,frame);}
 rasterShipFaces(faces,w,h,frame.image.data,frame.depth);ctx.putImageData(frame.image,x,y);return faces.length;
}

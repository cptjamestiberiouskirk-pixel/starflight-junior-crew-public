export type RasterPoint={x:number;y:number;z:number;reciprocalW:number};
export type RasterTexture={data:Uint8ClampedArray;width:number;height:number;filter?:'linear';opaque?:boolean};
export type RasterFace={points:RasterPoint[];color:number[];texture?:RasterTexture;uv?:{x:number;y:number}[];opacity?:number};
export type ClipVertex={x:number;y:number;z:number;w:number;u:number;v:number};
const clipPlanes=[(p:ClipVertex)=>p.w+p.x,(p:ClipVertex)=>p.w-p.x,(p:ClipVertex)=>p.w+p.y,(p:ClipVertex)=>p.w-p.y,(p:ClipVertex)=>p.w+p.z,(p:ClipVertex)=>p.w-p.z];
const clipCode=(p:ClipVertex)=>(p.x< -p.w?1:0)|(p.x>p.w?2:0)|(p.y< -p.w?4:0)|(p.y>p.w?8:0)|(p.z< -p.w?16:0)|(p.z>p.w?32:0);
/** Homogeneous clipping retains walls/floors crossing the camera plane. */
export function clipRasterTriangle(triangle:ClipVertex[]){
  for(const p of triangle)if(!Number.isFinite(p.x+p.y+p.z+p.w+p.u+p.v))return [];
  const c0=clipCode(triangle[0]),c1=clipCode(triangle[1]),c2=clipCode(triangle[2]);
  if(c0&c1&c2)return [];
  if(!(c0|c1|c2))return [triangle];
  let polygon=triangle;
  for(const distance of clipPlanes){
    if(polygon.every(p=>distance(p)>=0))continue;
    const next:ClipVertex[]=[];
    for(let i=0;i<polygon.length;i++){
      const current=polygon[i],previous=polygon[(i+polygon.length-1)%polygon.length],dc=distance(current),dp=distance(previous);
      if((dc>=0)!==(dp>=0)){const t=dp/(dp-dc);next.push({x:previous.x+(current.x-previous.x)*t,y:previous.y+(current.y-previous.y)*t,z:previous.z+(current.z-previous.z)*t,w:previous.w+(current.w-previous.w)*t,u:previous.u+(current.u-previous.u)*t,v:previous.v+(current.v-previous.v)*t});}
      if(dc>=0)next.push(current);
    }
    polygon=next;if(polygon.length<3)return [];
  }
  return polygon.slice(1,-1).map((p,i)=>[polygon[0],p,polygon[i+2]]);
}

/** Per-pixel depth avoids the triangular holes that centroid-sorted polygons
 * create where ceramic overlays and large underlying hull triangles overlap. */
export function rasterShipFaces(faces:RasterFace[],width:number,height:number,rgba:Uint8ClampedArray=new Uint8ClampedArray(width*height*4),depth:Float32Array=new Float32Array(width*height)){
  rgba.fill(0);depth.fill(Infinity);
  const ordered=[...faces.filter(f=>(f.opacity??1)>=1),...faces.filter(f=>(f.opacity??1)<1).sort((a,b)=>b.points.reduce((s,p)=>s+p.z,0)-a.points.reduce((s,p)=>s+p.z,0))];
  for(const f of ordered){
    const [a,b,c]=f.points,den=(b.y-c.y)*(a.x-c.x)+(c.x-b.x)*(a.y-c.y);
    if(!Number.isFinite(den)||Math.abs(den)<1e-9)continue;
    const minX=Math.max(0,Math.floor(Math.min(a.x,b.x,c.x))),maxX=Math.min(width-1,Math.ceil(Math.max(a.x,b.x,c.x)));
    const minY=Math.max(0,Math.floor(Math.min(a.y,b.y,c.y))),maxY=Math.min(height-1,Math.ceil(Math.max(a.y,b.y,c.y)));
    const dx0=(b.y-c.y)/den,dy0=(c.x-b.x)/den,dx1=(c.y-a.y)/den,dy1=(a.x-c.x)/den;
    const dx2=-dx0-dx1,epsilon=1e-8;
    const az=a.z,bz=b.z,cz=c.z,za=az-cz,zb=bz-cz,zStep=dx0*za+dx1*zb;
    const texture=f.texture,uv=f.uv,textured=!!(texture&&uv),opacity=f.opacity??1;
    const ar=a.reciprocalW,br=b.reciprocalW,cr=c.reciprocalW,ra=ar-cr,rb=br-cr,rStep=dx0*ra+dx1*rb;
    const uc=textured?uv![2].x*cr:0,ua=textured?uv![0].x*ar-uc:0,ub=textured?uv![1].x*br-uc:0;
    const vc=textured?uv![2].y*cr:0,va=textured?uv![0].y*ar-vc:0,vb=textured?uv![1].y*br-vc:0;
    const uStep=dx0*ua+dx1*ub,vStep=dx0*va+dx1*vb;
    for(let y=minY;y<=maxY;y++){
     const row0=dx0*(minX+.5-c.x)+dy0*(y+.5-c.y),row1=dx1*(minX+.5-c.x)+dy1*(y+.5-c.y);
     // Restrict each row to the triangle span before expensive depth/UV work.
     // Conservative rounding keeps the original pixel-center edge test authoritative.
     let start=0,end=maxX-minX;
     if(dx0>0)start=Math.max(start,Math.floor((-epsilon-row0)/dx0));
     else if(dx0<0)end=Math.min(end,Math.ceil((-epsilon-row0)/dx0));
     else if(row0< -epsilon)continue;
     if(dx1>0)start=Math.max(start,Math.floor((-epsilon-row1)/dx1));
     else if(dx1<0)end=Math.min(end,Math.ceil((-epsilon-row1)/dx1));
     else if(row1< -epsilon)continue;
     const row2=1-row0-row1;
     if(dx2>0)start=Math.max(start,Math.floor((-epsilon-row2)/dx2));
     else if(dx2<0)end=Math.min(end,Math.ceil((-epsilon-row2)/dx2));
     else if(row2< -epsilon)continue;
     if(start>end)continue;
     let w0=row0+start*dx0,w1=row1+start*dx1;
     let z=cz+w0*za+w1*zb,inv=cr+w0*ra+w1*rb,uNumerator=uc+w0*ua+w1*ub,vNumerator=vc+w0*va+w1*vb;
     for(let x=minX+start;x<=minX+end;x++,w0+=dx0,w1+=dx1,z+=zStep,inv+=rStep,uNumerator+=uStep,vNumerator+=vStep){
      const w2=1-w0-w1;
      if(w0< -1e-8||w1< -1e-8||w2< -1e-8)continue;
      const index=y*width+x;
      if(!Number.isFinite(z)||z>depth[index]+1e-8)continue;
      let red=f.color[0],green=f.color[1],blue=f.color[2],alpha=opacity;
      if(textured){
        if(inv<=0||!Number.isFinite(inv))continue;
        const reciprocal=1/inv,u=uNumerator*reciprocal,v=vNumerator*reciprocal;
        const tex=texture!;
        if(tex.filter==='linear'){
          const sx=Math.max(0,Math.min(tex.width-1,u-.5)),sy=Math.max(0,Math.min(tex.height-1,v-.5)),x0=Math.floor(sx),y0=Math.floor(sy),fx=sx-x0,fy=sy-y0;
          const i00=(y0*tex.width+x0)*4,i10=(y0*tex.width+Math.min(tex.width-1,x0+1))*4,i01=(Math.min(tex.height-1,y0+1)*tex.width+x0)*4,i11=(Math.min(tex.height-1,y0+1)*tex.width+Math.min(tex.width-1,x0+1))*4;
          const p00=(1-fx)*(1-fy),p10=fx*(1-fy),p01=(1-fx)*fy,p11=fx*fy,d=tex.data;
          red=d[i00]*p00+d[i10]*p10+d[i01]*p01+d[i11]*p11;
          green=d[i00+1]*p00+d[i10+1]*p10+d[i01+1]*p01+d[i11+1]*p11;
          blue=d[i00+2]*p00+d[i10+2]*p10+d[i01+2]*p01+d[i11+2]*p11;
          if(!tex.opaque)alpha*=(d[i00+3]*p00+d[i10+3]*p10+d[i01+3]*p01+d[i11+3]*p11)/255;
        }else{
          const tx=Math.max(0,Math.min(tex.width-1,Math.floor(u))),ty=Math.max(0,Math.min(tex.height-1,Math.floor(v))),ti=(ty*tex.width+tx)*4;
          red=tex.data[ti];green=tex.data[ti+1];blue=tex.data[ti+2];if(!tex.opaque)alpha*=tex.data[ti+3]/255;
        }
      }
      if(alpha<=0)continue;const i=index*4;
      if(alpha>=1){rgba[i]=red;rgba[i+1]=green;rgba[i+2]=blue;rgba[i+3]=255;depth[index]=z;}
      else {const old=rgba[i+3]/255,next=alpha+old*(1-alpha);rgba[i]=(red*alpha+rgba[i]*old*(1-alpha))/next;rgba[i+1]=(green*alpha+rgba[i+1]*old*(1-alpha))/next;rgba[i+2]=(blue*alpha+rgba[i+2]*old*(1-alpha))/next;rgba[i+3]=next*255;}
    }
    }
  }
  return {rgba,depth};
}

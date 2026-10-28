// Frozen pre-optimization oracle; test-only, never imported by runtime.
import type {RasterFace} from '../utils/software-ship-raster';
export function referenceRasterShipFaces(faces:RasterFace[],width:number,height:number,rgba:Uint8ClampedArray=new Uint8ClampedArray(width*height*4),depth:Float32Array=new Float32Array(width*height)){
  rgba.fill(0);depth.fill(Infinity);
  const ordered=[...faces.filter(f=>(f.opacity??1)>=1),...faces.filter(f=>(f.opacity??1)<1).sort((a,b)=>b.points.reduce((s,p)=>s+p.z,0)-a.points.reduce((s,p)=>s+p.z,0))];
  for(const f of ordered){
    const [a,b,c]=f.points,den=(b.y-c.y)*(a.x-c.x)+(c.x-b.x)*(a.y-c.y);
    if(!Number.isFinite(den)||Math.abs(den)<1e-9)continue;
    const minX=Math.max(0,Math.floor(Math.min(a.x,b.x,c.x))),maxX=Math.min(width-1,Math.ceil(Math.max(a.x,b.x,c.x)));
    const minY=Math.max(0,Math.floor(Math.min(a.y,b.y,c.y))),maxY=Math.min(height-1,Math.ceil(Math.max(a.y,b.y,c.y)));
    const dx0=(b.y-c.y)/den,dy0=(c.x-b.x)/den,dx1=(c.y-a.y)/den,dy1=(a.x-c.x)/den;
    for(let y=minY;y<=maxY;y++){
     let w0=dx0*(minX+.5-c.x)+dy0*(y+.5-c.y),w1=dx1*(minX+.5-c.x)+dy1*(y+.5-c.y);
     for(let x=minX;x<=maxX;x++,w0+=dx0,w1+=dx1){
      const w2=1-w0-w1;
      if(w0< -1e-8||w1< -1e-8||w2< -1e-8)continue;
      const z=w0*a.z+w1*b.z+w2*c.z,index=y*width+x;
      if(!Number.isFinite(z)||z>depth[index]+1e-8)continue;
      let red=f.color[0],green=f.color[1],blue=f.color[2],alpha=f.opacity??1;
      if(f.texture&&f.uv){
        const inv=w0*a.reciprocalW+w1*b.reciprocalW+w2*c.reciprocalW;if(inv<=0||!Number.isFinite(inv))continue;
        const u=(w0*f.uv[0].x*a.reciprocalW+w1*f.uv[1].x*b.reciprocalW+w2*f.uv[2].x*c.reciprocalW)/inv;
        const v=(w0*f.uv[0].y*a.reciprocalW+w1*f.uv[1].y*b.reciprocalW+w2*f.uv[2].y*c.reciprocalW)/inv;
        const tex=f.texture;
        if(tex.filter==='linear'){
          const sx=Math.max(0,Math.min(tex.width-1,u-.5)),sy=Math.max(0,Math.min(tex.height-1,v-.5)),x0=Math.floor(sx),y0=Math.floor(sy),fx=sx-x0,fy=sy-y0;
          const i00=(y0*tex.width+x0)*4,i10=(y0*tex.width+Math.min(tex.width-1,x0+1))*4,i01=(Math.min(tex.height-1,y0+1)*tex.width+x0)*4,i11=(Math.min(tex.height-1,y0+1)*tex.width+Math.min(tex.width-1,x0+1))*4;
          const p00=(1-fx)*(1-fy),p10=fx*(1-fy),p01=(1-fx)*fy,p11=fx*fy,d=tex.data;
          red=d[i00]*p00+d[i10]*p10+d[i01]*p01+d[i11]*p11;
          green=d[i00+1]*p00+d[i10+1]*p10+d[i01+1]*p01+d[i11+1]*p11;
          blue=d[i00+2]*p00+d[i10+2]*p10+d[i01+2]*p01+d[i11+2]*p11;
          alpha*=(d[i00+3]*p00+d[i10+3]*p10+d[i01+3]*p01+d[i11+3]*p11)/255;
        }else{
          const tx=Math.max(0,Math.min(tex.width-1,Math.floor(u))),ty=Math.max(0,Math.min(tex.height-1,Math.floor(v))),ti=(ty*tex.width+tx)*4;
          red=tex.data[ti];green=tex.data[ti+1];blue=tex.data[ti+2];alpha*=tex.data[ti+3]/255;
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

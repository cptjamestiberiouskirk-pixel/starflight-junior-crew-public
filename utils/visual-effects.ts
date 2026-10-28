import {miningPulse} from './surface-presentation';
/** Finished canvas effects share the scene lighting and never paint an opaque plate. */
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
export function explosionEnvelope(life:number,maxLife:number) {
  const progress=clamp(life/Math.max(.001,maxLife));
  return {progress,expansion:1-Math.pow(1-progress,3),fire:Math.pow(1-progress,1.6),smoke:Math.sin(Math.PI*progress)*(1-progress*.5)};
}

export function drawCelExplosion(ctx:CanvasRenderingContext2D,x:number,y:number,maxRadius:number,life:number,maxLife:number,color:string,shockwave:boolean) {
  const e=explosionEnvelope(life,maxLife);
  if(e.progress>=1||maxRadius<=0)return;
  const r=maxRadius*(.12+.88*e.expansion);
  ctx.save();ctx.translate(x,y);
  // Smoke follows the fire, with a stable silhouette rather than per-frame noise.
  for(let i=0;i<9;i++) {
    const a=i*2.39996,rr=r*(.45+.12*Math.sin(i*7));
    ctx.globalAlpha=e.smoke*.48;
    ctx.fillStyle=i%2?'#25334b':'#111c32';ctx.beginPath();
    ctx.arc(Math.cos(a)*rr,Math.sin(a)*rr,r*(.27+.07*Math.sin(i*2)),0,Math.PI*2);ctx.fill();
  }
  ctx.globalCompositeOperation='screen';
  for(let layer=0;layer<3;layer++) {
    ctx.globalAlpha=e.fire*(layer===0?.6:.9);
    ctx.fillStyle=layer===0?color:layer===1?(shockwave?'#ffbe4d':'#98e8ff'):'#fff5c2';
    const size=r*(1-layer*.25);
    ctx.beginPath();
    for(let i=0;i<=48;i++) {
      const a=i/48*Math.PI*2;
      const lobes=1+.13*Math.sin(a*7+e.progress*4)+.07*Math.sin(a*11-e.progress*3);
      const px=Math.cos(a)*size*lobes,py=Math.sin(a)*size*lobes*.86;
      if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
    }ctx.closePath();ctx.fill();
  }
  // Short flash, cooling fragments, and a separate expanding pressure ring.
  if(e.progress<.13) {
    ctx.globalAlpha=(1-e.progress/.13)*.9;ctx.fillStyle='#ffffff';
    ctx.beginPath();ctx.arc(0,0,r*.65,0,Math.PI*2);ctx.fill();
  }
  for(let i=0;i<12;i++) {
    const a=i*2.39996+.2,rr=maxRadius*(.15+e.progress*(1.05+(i%3)*.15));
    ctx.globalAlpha=Math.pow(1-e.progress,2);ctx.strokeStyle=i%2?'#ffe6ad':color;
    ctx.lineWidth=Math.max(.8,maxRadius*.025);ctx.beginPath();
    ctx.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);ctx.lineTo(Math.cos(a)*(rr-r*.13),Math.sin(a)*(rr-r*.13));ctx.stroke();
  }
  if(shockwave) {
    ctx.globalAlpha=Math.pow(1-e.progress,2)*.75;ctx.strokeStyle='#b9ebff';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.ellipse(0,0,maxRadius*(.2+e.progress*1.6),maxRadius*(.12+e.progress*.8),-.2,0,Math.PI*2);ctx.stroke();
  }
  ctx.restore();
}

/** The illustrated rover faces +Y. Its roof emitter is 0.32 body lengths aft. */
export function roverMuzzle(x:number,y:number,heading:number,bodyHeight=52) {
  return {x:x-Math.cos(heading)*bodyHeight*.32,y:y-Math.sin(heading)*bodyHeight*.32};
}
export function drawMiningBeam(ctx:CanvasRenderingContext2D,sx:number,sy:number,ex:number,ey:number,time:number,strength=1) {
  const pulse=miningPulse(time);
  ctx.save();ctx.globalAlpha=clamp(strength)*(.45+.55*pulse);
  const line=(width:number,color:string)=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(ex,ey);ctx.stroke();};
  ctx.lineCap='round';ctx.shadowColor='#51e8ff';ctx.shadowBlur=12;
  line(10+5*pulse,'#12bbdf33');line(3+3*pulse,'#56f3ff');line(1+pulse,'#efffff');ctx.shadowBlur=0;
  const length=Math.hypot(ex-sx,ey-sy),nx=-(ey-sy)/(length||1),ny=(ex-sx)/(length||1);
  for(let i=0;i<9;i++){const t=(time*1.25+i/9)%1,x=sx+(ex-sx)*t,y=sy+(ey-sy)*t,w=(2+2*Math.sin(t*Math.PI))*pulse;ctx.strokeStyle='#e4ffff';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x+nx*w,y+ny*w);ctx.lineTo(x-nx*w,y-ny*w);ctx.stroke();}
  if(ctx.canvas?.dataset)ctx.canvas.dataset.miningPulse=pulse.toFixed(3);
  const glow=ctx.createRadialGradient(ex,ey,0,ex,ey,20);
  glow.addColorStop(0,'#fff7b0aa');glow.addColorStop(.4,'#ffbb4866');glow.addColorStop(1,'#ffbb4800');
  ctx.fillStyle=glow;ctx.beginPath();ctx.ellipse(ex,ey,20,11,0,0,Math.PI*2);ctx.fill();
  for(let i=0;i<8;i++) {
    const t=(time*2.5+i/8)%1,a=i*2.39996;
    const px=ex+Math.cos(a)*t*15,py=ey+Math.sin(a)*t*8-t*(1-t)*18;
    ctx.globalAlpha=(1-t)*strength;ctx.strokeStyle=i%2?'#ffd577':'#e4ffff';ctx.lineWidth=1.3;
    ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px-Math.cos(a)*2,py+2);ctx.stroke();
  }
  ctx.restore();
}

const tinted=new WeakMap<HTMLImageElement,Map<string,HTMLCanvasElement>>();
const groundTiles=new WeakMap<HTMLImageElement,HTMLCanvasElement>();
/** Mirrored neighbours meet at identical edges; the source artwork stays intact. */
export function drawGroundTile(ctx:CanvasRenderingContext2D,image:HTMLImageElement,column:number,row:number,x:number,y:number,size:number) {
  let tile=groundTiles.get(image);
  if(!tile){
    tile=document.createElement('canvas');tile.width=tile.height=512;
    const c=tile.getContext('2d');if(!c)return;
    for(let ix=0;ix<2;ix++)for(let iy=0;iy<2;iy++){
      c.save();c.translate(ix?512:0,iy?512:0);c.scale(ix?-1:1,iy?-1:1);c.drawImage(image,0,0,256,256);c.restore();
    }groundTiles.set(image,tile);
  }
  const col=((column%2)+2)%2,r=((row%2)+2)%2;
  ctx.drawImage(tile,col*256,r*256,256,256,x,y,size,size);
}
/** Isolate compositing so sprite tints cannot color the opaque terrain beneath. */
export function tintedSprite(image:HTMLImageElement,color:string):CanvasImageSource {
  let cache=tinted.get(image);if(!cache){cache=new Map();tinted.set(image,cache);}
  const previous=cache.get(color);if(previous)return previous;
  const c=document.createElement('canvas');c.width=image.naturalWidth;c.height=image.naturalHeight;
  const x=c.getContext('2d');if(!x)return image;
  x.drawImage(image,0,0);x.globalCompositeOperation='source-atop';x.fillStyle=color;x.fillRect(0,0,c.width,c.height);
  cache.set(color,c);return c;
}

export function wildlifeRotation(spriteKey:string,vx:number,vy:number) {
  if(spriteKey.includes('floater'))return 0;
  const heading=Math.atan2(vy,vx);
  return spriteKey.includes('hunter')?heading-Math.PI:heading-Math.PI/2;
}

/** Articulated legs use the existing finished art. The carapace covers the hip seams. */
export function drawWalkingWildlife(ctx:CanvasRenderingContext2D,image:HTMLImageElement,width:number,height:number,key:string,time:number,speed:number,phase:number) {
  const iw=image.naturalWidth,ih=image.naturalHeight,walking=speed>.02;
  ctx.save();
  if(key.includes('floater')) {
    ctx.translate(0,Math.sin(time*2+phase)*2);
    // Bell stays anchored; flexible tentacles undulate below it, with contiguous rows.
    for(let row=0;row<32;row++) {
      const y=row/32,weight=Math.max(0,(y-.38)/.62);
      const offset=Math.sin(time*3-y*5+phase)*width*.045*weight;
      ctx.drawImage(image,0,ih*y,iw,ih/32, -width/2+offset,-height/2+height*y,width,height/32+.1);
    }
  } else if(walking) {
    const horizontal=key.includes('hunter');
    for(let side=0;side<2;side++)for(let leg=0;leg<3;leg++) {
      const p=time*(key.includes('crawler')?10:7)+phase+leg*Math.PI*.8+side*Math.PI;
      const offset=Math.sin(p)*height*.025;
      ctx.save();
      if(horizontal) {
        const x=iw*leg/3,y=ih*(side===0?0:.65),h=ih*.35;
        ctx.translate(offset,Math.cos(p)*height*.015);
        ctx.drawImage(image,x,y,iw/3,h,-width/2+width*leg/3,-height/2+height*(side===0?0:.65),width/3,height*.35);
      } else {
        const x=iw*(side===0?0:.65),y=ih*leg/3,w=iw*.35;
        ctx.translate(Math.cos(p)*width*.015,offset);
        ctx.drawImage(image,x,y,w,ih/3,-width/2+width*(side===0?0:.65),-height/2+height*leg/3,width*.35,height/3);
      }
      ctx.restore();
    }
    if(horizontal)ctx.drawImage(image,0,ih*.28,iw,ih*.44,-width/2,-height*.22,width,height*.44);
    else ctx.drawImage(image,iw*.28,0,iw*.44,ih,-width*.22,-height/2,width*.44,height);
  } else ctx.drawImage(image,-width/2,-height/2,width,height);
  ctx.restore();
}

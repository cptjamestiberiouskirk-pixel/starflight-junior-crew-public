/** A readable map symbol; visual scale never alters world positions or collision. */
export function systemShipLength(zoom:number, minimumPlanetRadius=6) {const z=Number.isFinite(zoom)?Math.max(.1,zoom):1;const diameter=Math.max(30,2*Math.max(1,minimumPlanetRadius)*z);return Math.min(diameter*.62,Math.max(18,Math.min(60,28*Math.sqrt(z))));}
export function orbitShipSize(width:number,height:number) {return Math.max(44,Math.min(72,Math.min(width,height)*.12));}
export function hyperspaceShipSize(zoom:number) {return Math.max(32,Math.min(72,24*Math.sqrt(Math.max(.1,zoom))));}

export function starAppearance(radius: number, seconds: number, unstable: boolean) {
  return {
    radius,
    coronaAlpha: unstable ? 0.78 + Math.sin(seconds * 7) * 0.16 : 0.94 + Math.sin(seconds * 1.7) * 0.04,
    rotation: seconds * 0.15,
  };
}

export function trailScreenRadius(size: number, life: number, maxLife: number) {
  return Math.max(0, Math.min(2, size) * (1 - Math.max(0, life) / maxLife));
}

export function interpolatePosition(previous: number, current: number, alpha: number) {
  // A teleport or save restore must not animate across the whole star system.
  return Math.abs(current - previous) > 20 ? current : previous + (current - previous) * Math.max(0, Math.min(1, alpha));
}

/** Frame the tactical fleet in the visible canvas, including room for hulls and labels. */
export function tacticalCameraTarget(width:number,height:number,player:{x:number;y:number},ships:{x:number;y:number}[]) {
  const vessels=[player,...ships];
  const xs=vessels.map(v=>v.x), ys=vessels.map(v=>v.y);
  const minX=Math.min(...xs), maxX=Math.max(...xs), minY=Math.min(...ys), maxY=Math.max(...ys);
  const padding=Math.min(65,Math.min(width,height)/4);
  const availableWidth=Math.max(1,width-padding*2), availableHeight=Math.max(1,height-padding*2);
  // A fixed minimum zoom can push the player off a short or narrow viewport.
  const cellSize=Math.min(60,availableWidth/Math.max(2.4,maxX-minX+2.4),availableHeight/Math.max(2.4,maxY-minY+2.4));
  return {x:(minX+maxX)/2,y:(minY+maxY)/2,cellSize};
}

/** Project adjacent texels only when needed, then blend at every render frame.
 * Quantizing the only visible globe made slow rotation visibly freeze and jump. */
const orbitFrames=new WeakMap<HTMLCanvasElement,{from:HTMLCanvasElement;to:HTMLCanvasElement;blend:HTMLCanvasElement;bucket:number;size:number}>();
export function orbitTexturePhase(rotation:number) {
  const u=(((Number.isFinite(rotation)?rotation:0)*.06)%1+1)%1,position=u*512,frame=Math.floor(position);
  return {frame,nextFrame:(frame+1)%512,alpha:position-frame};
}
function projectTexture(texture:HTMLCanvasElement,canvas:HTMLCanvasElement,bucket:number) {
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const size=canvas.width;ctx.clearRect(0,0,size,size);const radius=size/2;ctx.save();ctx.beginPath();ctx.arc(radius,radius,radius,0,Math.PI*2);ctx.clip();
  for(let row=0;row<size;row++) {
    const latitude=(row+.5-radius)/radius,halfChord=radius*Math.sqrt(Math.max(0,1-latitude*latitude));if(halfChord<.25)continue;
    const start=radius-halfChord,offset=(bucket/512)*halfChord;
    for(let x=start-offset;x<radius+halfChord;x+=halfChord)ctx.drawImage(texture,0,row/size*texture.height,texture.width,Math.max(1,texture.height/size),x-.2,row,halfChord+.4,1.3);
  }ctx.restore();
}
export function projectedOrbitTexture(texture:HTMLCanvasElement,rotation:number,resolution=512) {
  let entry=orbitFrames.get(texture);const phase=orbitTexturePhase(rotation);
  if(!entry||entry.size!==resolution){const create=()=>{const c=document.createElement('canvas');c.width=c.height=resolution;return c;};entry={from:create(),to:create(),blend:create(),bucket:-1,size:resolution};orbitFrames.set(texture,entry);}
  if(entry.bucket!==phase.frame){
    if((entry.bucket+1)%512===phase.frame&&entry.bucket>=0){const old=entry.from;entry.from=entry.to;entry.to=old;}
    else projectTexture(texture,entry.from,phase.frame);
    projectTexture(texture,entry.to,phase.nextFrame);entry.bucket=phase.frame;
  }
  const ctx=entry.blend.getContext('2d');if(!ctx)return texture;
  ctx.clearRect(0,0,resolution,resolution);ctx.globalAlpha=1;ctx.drawImage(entry.from,0,0);ctx.globalAlpha=phase.alpha;ctx.drawImage(entry.to,0,0);ctx.globalAlpha=1;
  return entry.blend;
}
/** Painted nozzle mouths in ship_hull_bare_topdown (1087 x 602).
 * Class upgrades change thrust, not the hull artwork or number of openings. */
export function shipExhaustNozzles(length:number) {
  const height=length*602/1087;
  return [[0,106],[48,300],[0,511]].map(([x,y])=>({x:(x/1087-.5)*length,y:(y/602-.5)*height}));
}

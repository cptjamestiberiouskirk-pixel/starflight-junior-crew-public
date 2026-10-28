export function scanSweepPosition(progress:number){return Math.max(0,Math.min(1,Number.isFinite(progress)?progress:0));}
/** Reveal only the instrument sweep; contact discovery remains analysis-gated. */
export function drawSensorSweep(ctx:CanvasRenderingContext2D,b:{x:number;y:number;width:number;height:number},progress:number,seconds:number){
 const x=b.x+scanSweepPosition(progress)*b.width,trail=Math.max(30,b.width*.16);
 ctx.save();ctx.beginPath();ctx.rect(b.x,b.y,b.width,b.height);ctx.clip();
 const g=ctx.createLinearGradient(x-trail,0,x+2,0);g.addColorStop(0,'#48e7f500');g.addColorStop(.9,'#48e7f52a');g.addColorStop(1,'#d5ffffa0');ctx.fillStyle=g;ctx.fillRect(x-trail,b.y,trail+2,b.height);
 ctx.strokeStyle='#c8ffff';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x,b.y);ctx.lineTo(x,b.y+b.height);ctx.stroke();
 ctx.strokeStyle='#53dff422';ctx.lineWidth=.7;for(let y=b.y+(seconds*24)%12;y<b.y+b.height;y+=12){ctx.beginPath();ctx.moveTo(b.x,y);ctx.lineTo(b.x+b.width,y);ctx.stroke();}ctx.restore();
}

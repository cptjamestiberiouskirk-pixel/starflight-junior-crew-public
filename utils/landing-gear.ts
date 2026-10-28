/** Finished metal hardware around the preserved hull; no cyan proxy outlines. */
export function drawLandingGear(ctx:CanvasRenderingContext2D,w:number,h:number) {
  ctx.save();ctx.lineCap='round';
  for(const side of [-1,1])for(const fore of [-1,1]) {
    const x1=w*(fore<0?-.28:.22),y1=h*.3*side,x2=w*(fore<0?-.41:.37),y2=h*.57*side;
    ctx.strokeStyle='rgba(0,0,0,.45)';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(x1+2,y1+3);ctx.lineTo(x2+2,y2+3);ctx.stroke();
    ctx.strokeStyle='#273543';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
    ctx.strokeStyle='#b6c4cf';ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
    ctx.fillStyle='#526374';ctx.beginPath();ctx.arc((x1+x2)/2,(y1+y2)/2,3.2,0,Math.PI*2);ctx.fill();
    ctx.save();ctx.translate(x2,y2);ctx.rotate(Math.atan2(y2-y1,x2-x1)+Math.PI/2);
    ctx.fillStyle='rgba(0,0,0,.4)';ctx.beginPath();ctx.ellipse(2,3,11,5,0,0,Math.PI*2);ctx.fill();
    const metal=ctx.createLinearGradient(0,-4,0,4);metal.addColorStop(0,'#d2dbe0');metal.addColorStop(.4,'#82939f');metal.addColorStop(1,'#3e4e5a');ctx.fillStyle=metal;ctx.strokeStyle='#26333e';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(-9,-3);ctx.lineTo(7,-3);ctx.lineTo(10,1);ctx.lineTo(7,4);ctx.lineTo(-8,4);ctx.lineTo(-10,1);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.strokeStyle='#415362';ctx.lineWidth=1;for(const x of [-5,0,5]){ctx.beginPath();ctx.moveTo(x,-2);ctx.lineTo(x,3);ctx.stroke();}ctx.restore();
  }
  ctx.restore();
}
export function drawLandingRamp(ctx:CanvasRenderingContext2D,h:number) {
  const top=h*.25,bottom=h*.55;ctx.save();
  ctx.fillStyle='rgba(0,0,0,.4)';ctx.beginPath();ctx.moveTo(-11,top+4);ctx.lineTo(14,top+4);ctx.lineTo(19,bottom+4);ctx.lineTo(-13,bottom+4);ctx.closePath();ctx.fill();
  const metal=ctx.createLinearGradient(-16,0,16,0);metal.addColorStop(0,'#a5b4be');metal.addColorStop(.18,'#485866');metal.addColorStop(.82,'#485866');metal.addColorStop(1,'#a5b4be');ctx.fillStyle=metal;ctx.strokeStyle='#26333e';ctx.lineWidth=1.2;
  ctx.beginPath();ctx.moveTo(-12,top);ctx.lineTo(12,top);ctx.lineTo(16,bottom);ctx.lineTo(-16,bottom);ctx.closePath();ctx.fill();ctx.stroke();
  for(let i=1;i<=6;i++){const t=i/7,y=top+(bottom-top)*t,half=12+4*t;ctx.strokeStyle=i===6?'#cda95c':'#86959f';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-half+3,y);ctx.lineTo(half-3,y);ctx.stroke();}ctx.restore();
}

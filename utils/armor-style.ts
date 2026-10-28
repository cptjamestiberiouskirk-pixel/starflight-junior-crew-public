/** Visual strength only: purchased class, protection and economics are unchanged. */
export function armorAppearance(value:number){
 const tier=Number.isFinite(value)?Math.max(0,Math.min(5,Math.floor(value))):0;
 const accents=['#ffffff','#67e8f9','#60a5fa','#c4b5fd','#fb923c','#facc15'];
 return {tier,coveragePercent:tier*20,accent:accents[tier],tintOpacity:tier?.37+tier*.05:0,glow:tier*.45};
}
const tintTables=new Map<number,Uint8Array[]>();
export function armorTintTables(value:number){
 const style=armorAppearance(value);let tables=tintTables.get(style.tier);if(tables)return tables;
 const rgb=[1,3,5].map(i=>parseInt(style.accent.slice(i,i+2),16)/255);
 tables=rgb.map(c=>{const linear=c<=.04045?c/12.92:((c+.055)/1.055)**2.4,multiplier=1-style.tintOpacity+style.tintOpacity*linear;
  return Uint8Array.from({length:256},(_,n)=>{const s=n/255,l=(s<=.04045?s/12.92:((s+.055)/1.055)**2.4)*multiplier;return Math.round(255*(l<=.0031308?12.92*l:1.055*l**(1/2.4)-.055));});});
 tintTables.set(style.tier,tables);return tables;
}
/** Tint the plated skin only. Pixels changed by fitted hardware/shadows are
 * occluders, and the approved armor mask already excludes illustrated glazing. */
export function armorTintLayer(fitted:Uint8ClampedArray,bare:Uint8ClampedArray,mask:Uint8ClampedArray,tier:number){
 const out=new Uint8ClampedArray(fitted.length),tables=armorTintTables(tier);if(!armorAppearance(tier).tier)return out;
 for(let i=0;i<fitted.length;i+=4){
  if(!mask[i+3]||fitted[i]!==bare[i]||fitted[i+1]!==bare[i+1]||fitted[i+2]!==bare[i+2]||fitted[i+3]!==bare[i+3])continue;
  for(let c=0;c<3;c++)out[i+c]=tables[c][fitted[i+c]];out[i+3]=Math.min(mask[i+3],fitted[i+3]);
 }
 return out;
}
const overlays=new WeakMap<object,Map<number,HTMLCanvasElement>>();
/** Reuse the approved tactical masks, never a nose-to-aft tile fill. */
export function tacticalArmorCanvas(image:HTMLImageElement|null|undefined,value:number){
 const style=armorAppearance(value);
 if(!style.tier||!image?.complete||image.naturalWidth!==1087||image.naturalHeight!==602||typeof document==='undefined')return null;
 let tiers=overlays.get(image);if(!tiers){tiers=new Map();overlays.set(image,tiers);}
 const cached=tiers.get(style.tier);if(cached)return cached;
 const canvas=document.createElement('canvas');canvas.width=1087;canvas.height=602;
 const ctx=canvas.getContext('2d');if(!ctx)return null;
 ctx.drawImage(image,0,0);ctx.globalCompositeOperation='source-atop';ctx.globalAlpha=style.tintOpacity;
 ctx.fillStyle=style.accent;ctx.fillRect(0,0,1087,602);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
 tiers.set(style.tier,canvas);return canvas;
}
export function drawTacticalArmor(ctx:CanvasRenderingContext2D,image:HTMLImageElement|null|undefined,tier:number,x:number,y:number,w:number,h:number){
 const canvas=tacticalArmorCanvas(image,tier);if(!canvas)return false;
 const style=armorAppearance(tier);ctx.save();ctx.shadowColor=style.accent;ctx.shadowBlur=style.glow;
 ctx.drawImage(canvas,x,y,w,h);ctx.restore();return true;
}

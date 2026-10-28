export function starmapView(zoom:number,center:{x:number;y:number}){
 const z=Number.isFinite(zoom)?Math.max(1,Math.min(8,zoom)):1;
 const x=Math.max(125/z,Math.min(250-125/z,center.x)),y=Math.max(110/z,Math.min(220-110/z,center.y)),scale=3.2*z;
 return {zoom:z,center:{x,y},tx:400-x*scale,ty:352-(220-y)*scale,project:(p:{x:number;y:number})=>({x:400+(p.x-x)*scale,y:352+(y-p.y)*scale}),unproject:(p:{x:number;y:number})=>({x:x+(p.x-400)/scale,y:y-(p.y-352)/scale})};
}

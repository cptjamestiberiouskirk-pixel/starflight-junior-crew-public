/** Use the same rectangle for painting and pointer conversion at every viewport size. */
export function landingMapBounds(width:number,height:number){
  if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)return {x:0,y:0,width:0,height:0};
  const padding=Math.min(60,Math.max(24,width*.04),width*.15),top=Math.min(width<600?80:70,height*.42),bottom=Math.min(24,height*.1);
  const mapHeight=Math.max(0,Math.min((width-padding*2)/2,height-top-bottom));
  const mapWidth=mapHeight*2;
  return {x:(width-mapWidth)/2,y:top+Math.max(0,(height-top-bottom-mapHeight)/2),width:mapWidth,height:mapHeight};
}
export function landingMapPoint(width:number,height:number,x:number,y:number){
  const b=landingMapBounds(width,height);
  if(b.width<1||b.height<1||!Number.isFinite(x)||!Number.isFinite(y)||x<b.x||x>b.x+b.width||y<b.y||y>b.y+b.height)return null;
  return {lat:Math.round(90-(y-b.y)/b.height*180),lon:Math.round(-180+(x-b.x)/b.width*360)};
}
/** Shadows change illumination, never material opacity. */
export function orbitHullLighting(sunFactor:number){
  const light=Number.isFinite(sunFactor)?Math.max(0,Math.min(1,sunFactor)):0;
  return {alpha:1,brightness:.7+.3*light};
}

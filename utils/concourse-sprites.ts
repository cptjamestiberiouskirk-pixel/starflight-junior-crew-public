/** The original 934x940 atlas has five dance poses above four, not a 5x2 grid.
 * Bounds include the complete pose and its motion lines, with clear gutters.
 * Do not resize individual poses: a raised arm must not shrink the astronaut. */
export const CONCOURSE_DANCE_RECTS = [
  {x:0,y:484,width:142,height:216},
  {x:160,y:458,width:158,height:244},
  {x:334,y:484,width:216,height:200},
  {x:572,y:475,width:166,height:222},
  {x:769,y:473,width:165,height:220},
  {x:15,y:721,width:150,height:218},
  {x:260,y:723,width:190,height:210},
  {x:542,y:700,width:154,height:240},
  {x:767,y:732,width:167,height:202},
] as const;

export function concourseDanceSprite(frame:number,width=934,height=940) {
  if(!Number.isInteger(frame)||frame<0||frame>=CONCOURSE_DANCE_RECTS.length||!Number.isFinite(width)||width<=0||!Number.isFinite(height)||height<=0)return null;
  const rect=CONCOURSE_DANCE_RECTS[frame],xScale=width/934,yScale=height/940;
  return {x:rect.x*xScale,y:rect.y*yScale,width:rect.width*xScale,height:rect.height*yScale,
    renderWidth:rect.width*66/235,renderHeight:rect.height*66/235};
}

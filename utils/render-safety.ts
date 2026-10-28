/** A precision guard, not a gameplay/map boundary. This retains fractional
 * coordinates far beyond any normal voyage while leaving headroom for the
 * renderer's pixel transforms. Never clamp hostile saves into a valid mission. */
export const MAX_RENDER_COORDINATE = 2 ** 40;
export const isRenderCoordinate = (value:unknown):value is number =>
  typeof value==='number' && Number.isFinite(value) && Math.abs(value)<=MAX_RENDER_COORDINATE;

const record=(value:unknown):value is Record<string,unknown> =>
  !!value && typeof value==='object' && !Array.isArray(value);
const point=(value:unknown) => record(value) && isRenderCoordinate(value.x) && isRenderCoordinate(value.y);
function fleet(value:unknown):boolean {
  return record(value) && ['x','y','homeX','homeY'].every(key=>value[key]===undefined||isRenderCoordinate(value[key]))
    && Array.isArray(value.ships) && value.ships.every(point);
}

/** Shared by external imports and legacy slot restoration. Only inspect the
 * render-driving coordinates; do not impose the new save schema on old slots. */
export function saveRenderCoordinatesAreSafe(value:unknown):boolean {
  if(!record(value))return false;
  for(const key of ['concourseAstronautX','concourseAstronautY','galaxyShipX','galaxyShipY',
    'systemShipX','systemShipY','vehicleX','vehicleY']) {
    if(value[key]!==undefined && !isRenderCoordinate(value[key]))return false;
  }
  if(value.encounterShipPos!=null && !point(value.encounterShipPos))return false;
  if(value.activeEncounterGroup!=null && !fleet(value.activeEncounterGroup))return false;
  if(value.fleetChanges!==undefined && (!record(value.fleetChanges)||!Object.values(value.fleetChanges).every(fleet)))return false;
  return true;
}

/** Absolute world indices must never be loop induction variables: ++ can stop
 * progressing at large magnitudes, and tiny zoom can imply trillions of nodes.
 * Preserve every ordinary index exactly; omit only a non-renderable grid layer.
 * The independent local counter bounds both single and nested drawing work. */
export const MAX_GRID_AXIS_ITEMS = 128;
export function boundedGridIndices(first:number,last:number,step=1):number[] {
  if(!Number.isSafeInteger(first)||!Number.isSafeInteger(last)||last<first
    ||!Number.isSafeInteger(step)||step<=0)return [];
  const count=Math.floor((last-first)/step)+1;
  if(!Number.isSafeInteger(count)||count>MAX_GRID_AXIS_ITEMS)return [];
  return Array.from({length:count},(_,index)=>first+index*step);
}

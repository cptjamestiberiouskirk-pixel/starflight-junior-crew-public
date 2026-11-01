/** A precision guard, not a gameplay/map boundary. This retains fractional
 * coordinates far beyond any normal voyage while leaving headroom for the
 * renderer's pixel transforms. Never clamp hostile saves into a valid mission. */
export const MAX_RENDER_COORDINATE = 2 ** 40;
export const isRenderCoordinate = (value:unknown):value is number =>
  typeof value==='number' && Number.isFinite(value) && Math.abs(value)<=MAX_RENDER_COORDINATE;
/** Allow historical zooms beyond today's UI presets, but never a collapsed or
 * overflowing projection. The margin covers symbols, reciprocal pixel widths
 * and transforming every accepted world coordinate. */
export const isRenderZoom=(value:unknown):value is number=>
  typeof value==='number'&&Number.isFinite(value)&&value>0
  &&Number.isFinite(64/value)&&Number.isFinite(value*MAX_RENDER_COORDINATE*64);

const record=(value:unknown):value is Record<string,unknown> =>
  !!value && typeof value==='object' && !Array.isArray(value);
const point=(value:unknown) => record(value) && isRenderCoordinate(value.x) && isRenderCoordinate(value.y);
function fleet(value:unknown):boolean {
  return record(value) && ['x','y','homeX','homeY'].every(key=>value[key]===undefined||isRenderCoordinate(value[key]))
    && Array.isArray(value.ships) && value.ships.every(point);
}
function surfaceVelocities(value:unknown):boolean {
  return record(value)&&Array.isArray(value.lifeforms)&&value.lifeforms.every(lifeform=>record(lifeform)
    &&['vx','vy'].every(key=>lifeform[key]===undefined||isRenderCoordinate(lifeform[key])));
}

/** Shared by external imports and legacy slot restoration. Only inspect the
 * render-driving coordinates and view scales; do not impose new schema fields
 * or today's UI zoom presets on old slots. */
export function saveRenderCoordinatesAreSafe(value:unknown):boolean {
  if(!record(value))return false;
  for(const key of ['concourseAstronautX','concourseAstronautY','galaxyShipX','galaxyShipY',
    'systemShipX','systemShipY','vehicleX','vehicleY']) {
    if(value[key]!==undefined && !isRenderCoordinate(value[key]))return false;
  }
  if(value.encounterShipPos!=null && !point(value.encounterShipPos))return false;
  if(value.activeEncounterGroup!=null && !fleet(value.activeEncounterGroup))return false;
  if(value.fleetChanges!==undefined && (!record(value.fleetChanges)||!Object.values(value.fleetChanges).every(fleet)))return false;
  for(const key of ['systemZoom','hyperZoom'])if(value[key]!==undefined&&!isRenderZoom(value[key]))return false;
  if(value.projectiles!==undefined&&(!Array.isArray(value.projectiles)||!value.projectiles.every(p=>record(p)
    &&['x','y','targetX','targetY','playerLaunchX','playerLaunchY'].every(key=>p[key]===undefined||isRenderCoordinate(p[key])))))return false;
  // Surface restoration can retain dormant wildlife in many visited regions.
  // Bound its integration inputs too; finite initial positions alone cannot
  // prevent an imported velocity from overflowing on the next simulation step.
  if(value.currentSurfaceState!=null&&!surfaceVelocities(value.currentSurfaceState))return false;
  if(value.planetSurfaces!==undefined&&(!record(value.planetSurfaces)||!Object.values(value.planetSurfaces).every(surfaceVelocities)))return false;
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

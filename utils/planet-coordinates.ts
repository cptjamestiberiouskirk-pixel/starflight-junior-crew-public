export const SURFACE_DEGREES_PER_KM = 0.2;
export const wrapLongitude = (longitude:number) => ((longitude+180)%360+360)%360-180;

export function surfaceCoordinates(latitude:number,longitude:number,x:number,y:number) {
  return {lat:Math.max(-89.9,Math.min(89.9,latitude-y*SURFACE_DEGREES_PER_KM)),lon:wrapLongitude(longitude+x*SURFACE_DEGREES_PER_KM)};
}

export function localSurfacePosition(latitude:number,longitude:number,worldLatitude:number,worldLongitude:number) {
  return {x:wrapLongitude(worldLongitude-longitude)/SURFACE_DEGREES_PER_KM,y:(latitude-worldLatitude)/SURFACE_DEGREES_PER_KM};
}

export function landingRegion(latitude:number,longitude:number) {
  return `${Math.floor((latitude+90)/5)}:${Math.floor((wrapLongitude(longitude)+180)/5)}`;
}

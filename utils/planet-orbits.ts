/** Circular, coplanar two-body orbits: omega = sqrt(mu / r^3).
 * Map distances have no AU calibration or stellar masses. One shared display
 * scale sets the 60-unit reference orbit to 0.05 rad/s; relative periods obey
 * Kepler's third law exactly. Planet gameplay mass is not an astronomical mass.
 * No invented eccentricity, stellar mass or orbital save fields are required. */
export function planetAngularSpeed(radius:number) {
  if(!Number.isFinite(radius)||radius<=0)return 0;
  const speed=.05*Math.pow(60/radius,1.5);
  return Number.isFinite(speed)?speed:0;
}

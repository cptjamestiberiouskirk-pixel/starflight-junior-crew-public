import {RUIN_LORE_DATABASE, type RuinLore} from '../surface';

function ruinCoordinates(ruin:RuinLore):string {
  if (ruin.lat===undefined || ruin.long===undefined) return 'Surface';
  return `${Math.abs(ruin.lat)}${ruin.lat<0?'S':'N'} ${Math.abs(ruin.long)}${ruin.long<0?'W':'E'}`;
}

const nexus = RUIN_LORE_DATABASE.find(ruin=>ruin.isControlNexus)!;
export const CONTROL_NEXUS_COORDINATES = ruinCoordinates(nexus);

/** Both instruments report the position of the same physical surface site. */
export function ruinSensorOverlay(starX:number,starY:number,planetOrderIndex:number,redCylinder:boolean,crystalCone:boolean):string {
  let overlay='';
  if (redCylinder) {
    const sites=RUIN_LORE_DATABASE.filter(ruin=>ruin.starX===starX && ruin.starY===starY && ruin.planetOrderIndex===planetOrderIndex);
    const reading=sites.length
      ? sites.map(site=>`[${site.title} at ${ruinCoordinates(site)}]`).join(', ')
      : 'No subterranean precursor ruins detected on this body.';
    overlay+=' • RED CYLINDER OVERLAY: '+reading;
  }
  if (crystalCone && starX===nexus.starX && starY===nexus.starY && planetOrderIndex===nexus.planetOrderIndex) {
    overlay+=` • CRYSTAL CONE HARMONICS: Control Nexus pinpointed at ${CONTROL_NEXUS_COORDINATES}!`;
  }
  return overlay;
}

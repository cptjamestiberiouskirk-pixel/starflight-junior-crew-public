import type {PlanetSurfaceState} from '../surface';
import {scanReady,type PlanetaryScanState} from './planet-scans';
import {visibleSurveyContacts} from './planet-survey';
/** Retain saved discoveries, but do not present them as a current analyzed
 * sensor result before this reading completes both scan and analysis. */
export function scienceContacts(surface:PlanetSurfaceState|undefined,scan:PlanetaryScanState|null){
 return scanReady(scan)&&scan?.analysis?visibleSurveyContacts(surface):[];
}

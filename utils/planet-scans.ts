import type {StarPlanet} from '../galaxy';

// Original PLANET mass units are 10^18 tons. The three-second sweep is a
// presentation choice; it does not advance the campaign clock artificially.
export const PLANET_SCAN_SECONDS = 3;
export type PlanetaryScanState = {
  planetKey: string;
  elapsed: number;
  analysis: {known: boolean[]} | null;
};
export const scanPlanetKey = (starId:number, slot:number) => `${starId}:${slot}`;
export const beginPlanetScan = (planetKey:string):PlanetaryScanState => ({planetKey,elapsed:0,analysis:null});
export const scanReady = (scan:PlanetaryScanState|null) => !!scan && scan.elapsed === PLANET_SCAN_SECONDS;
export function advancePlanetScan(scan:PlanetaryScanState, seconds:number, paused=false):PlanetaryScanState {
  if(paused || !Number.isFinite(seconds) || seconds<=0 || scanReady(scan)) return scan;
  return {...scan,elapsed:Math.min(PLANET_SCAN_SECONDS,scan.elapsed+seconds)};
}
export function analyzePlanetScan(scan:PlanetaryScanState|null, officer:{alive:boolean;vitality:number;skills:{science:number}}|undefined, random= Math.random):PlanetaryScanState|null {
  if(!scanReady(scan) || !scan || scan.analysis || !officer?.alive || officer.vitality<=0) return null;
  // Recovered SCIENCE / ANALYZE-OV compares each field against RRND(0,200).
  // Object and raw orbit slot are always identified; the five conclusions roll independently.
  return {...scan,analysis:{known:Array.from({length:5},()=>officer.skills.science > Math.floor(Math.max(0,Math.min(.999999999,random()))*200))}};
}
export function validPlanetScan(value:unknown, expectedKey:string|null):value is PlanetaryScanState {
  if(!value || typeof value!=='object' || Array.isArray(value))return false;
  const s=value as PlanetaryScanState;
  return expectedKey!==null && s.planetKey===expectedKey && Number.isFinite(s.elapsed) && s.elapsed>=0 && s.elapsed<=PLANET_SCAN_SECONDS
    && (s.analysis===null || s.elapsed===PLANET_SCAN_SECONDS && !!s.analysis && typeof s.analysis==='object'
      && Array.isArray(s.analysis.known) && s.analysis.known.length===5 && s.analysis.known.every(v=>typeof v==='boolean'));
}
export function planetMassTons(mass:number) {
  if(!Number.isFinite(mass)||mass<=0)return 'Unknown';
  const exponent=Math.floor(Math.log10(mass));
  return `${Number((mass/10**exponent).toPrecision(4))} × 10^${18+exponent} tons`;
}
export function planetAnalysisFields(p:StarPlanet) {
  const surfaces:Record<StarPlanet['type'],string>={Rock:'Rock',Frozen:'Ice',Liquid:'Liquid',Molten:'Molten',Crystal:'Unknown','Gas Giant':'Gas'};
  return [
    {label:'Predominant surface',value:surfaces[p.type]},
    {label:'Gravity',value:`${p.gravity} g`},
    {label:'Atmospheric density',value:p.atmosphereDensity},
    {label:'Temperature range',value:p.tempMin===p.tempMax?p.tempMin:p.temperatureRange||p.temperature},
    {label:'Global weather',value:p.weather},
  ];
}
export function planetSensorSummary(p:StarPlanet) {
  return `Mass: ${planetMassTons(p.mass)} • Bio density: ${p.bioDensity}% • Mineral density: ${p.mineralDensity}% • Atmosphere: ${p.gases.join(', ')||'None'} • Hydrosphere: ${p.hydrosphereCompound||'None'} • Lithosphere: ${p.minerals.map(m=>m.name).join(', ')||'None'}`;
}

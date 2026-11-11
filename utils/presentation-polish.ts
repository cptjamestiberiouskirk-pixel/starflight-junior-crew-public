// Presentation only: these helpers never advance a mission or change simulation state.
export function compassBearing(dx: number, dy: number): string {
  const degrees = (Math.round(Math.atan2(dx, -dy) * 180 / Math.PI) + 360) % 360;
  const direction = ['N','NE','E','SE','S','SW','W','NW'][Math.round(degrees / 45) % 8];
  return degrees + '° ' + direction;
}

export interface HintContext {location:string; fuel:number; engines:number; hull:number; nearby?:{name:string;isHomeworld?:boolean}|null; canReturn?:boolean; readyToUnload?:boolean; mining?:boolean; missingPosts?:number;unreadBulletins?:number; investigation?:boolean; surveyLead?:string; landingReason?:string; borderApproach?:boolean; awaitingDroneHail?:boolean; uhlekEncounter?:boolean; surfaceLead?:string; orbitLead?:string; scanStage?:'scanning'|'ready'|'analyzed';}
export function nextActionHint(c:HintContext):string {
  if(c.hull<=0)return 'Review the ship status and recovery options.';
  if(c.location==='Starport'||c.location==='Docking Bay'){
    if(c.engines<1)return 'Visit Ship Configuration to install an engine before departure.';
    if(c.missingPosts)return 'Visit Personnel to review vacant posts or unavailable officers before departure.';
    if(c.fuel<=0)return 'Visit the Trade Depot to replenish Endurium before departure.';
    if(c.investigation)return 'Open the Black Egg case file in Operations or the Ship’s Log for the next step in the flare investigation.';
    if(c.unreadBulletins)return 'Read the new bulletin in Corporate Operations.';
    if(c.surveyLead)return 'Open the Ship’s Log to review your recorded ruin site.';
    return 'Review fuel and the ship configuration, then proceed to the docking bay when ready.';
  }
  if(c.surfaceLead && (c.location==='On Planet'||c.location==='Terrain Vehicle'))return c.surfaceLead;
  if(c.location==='Terrain Vehicle' && c.readyToUnload && !c.mining)return 'Choose Board Ship to unload the rover. Mined Endurium transfers to the ship’s fuel supply.';
  if(c.location==='Terrain Vehicle')return c.canReturn?'Return to the ship to unload cargo or finish the excursion.':c.mining?'Mining is in progress. Use Stop before moving to another deposit.':'Use [Scan] [Q] to check local terrain, then choose a visible contact. Watch vehicle fuel and hold capacity.';
  if(c.location==='On Planet')return 'Deploy the terrain vehicle to explore, or launch when the crew is ready.';
  if(c.location==='Landing')return 'Choose a landing site on the map and review the planet conditions before descending.';
  if(c.location==='In Orbit'){
    if(c.landingReason)return c.landingReason;
    if(c.orbitLead)return c.orbitLead;
    if(c.scanStage==='analyzed')return 'Science → choose a contact → Set landing site. Use Command → Log Planet for a colony nomination.';
    if(c.scanStage==='ready')return 'Science → Analyze reading to locate survey contacts.';
    if(c.scanStage==='scanning')return 'Sensor sweep in progress. When it finishes, choose Analyze reading in Science.';
    return 'Use Science → Scan planet before choosing a landing site.';
  }
  if(c.location==='Encounter' && c.awaitingDroneHail)return 'The Veloxi drone controls orbit clearance. Open Comms and choose Hail to hear its instructions.';
  if(c.location==='Encounter' && c.uhlekEncounter)return 'Hails cannot stop this attack. Pause to plan, then use Navigation → Maneuver to flee. Follow the escape guidance above the bridge.';
  if(c.location==='Encounter')return 'Review the encounter on the bridge; Communications and Maneuver offer different responses.';
  if(c.fuel<=0)return 'Endurium is depleted. Review the available recovery options on the bridge.';
  if(c.engines<1)return 'No engine is installed. Review ship status and available recovery options.';
  if(c.location==='Star System' && c.borderApproach)return 'Focus Planet 1 in Navigation focus. Choose Navigation → Maneuver and follow its bearing. Choose Orbit planet when Nearby action names Planet 1.';
  if(c.location==='Star System'&&c.nearby)return c.nearby.isHomeworld?`Dock is available near ${c.nearby.name}.`:`Orbit is available near ${c.nearby.name}.`;
  return c.location==='Hyperspace'?'Use the Starmap to choose your route; monitor Endurium while traveling.':'Use Maneuver to approach a planet. Orbit or Dock becomes available at the existing approach range.';
}

export type LabelBox={x:number;y:number;width:number;height:number};
const overlaps=(a:LabelBox,b:LabelBox)=>a.x<b.x+b.width+5&&a.x+a.width+5>b.x&&a.y<b.y+b.height+4&&a.y+a.height+4>b.y;
/** Find a readable on-screen label without covering an earlier, higher priority label. */
export function placePlanetLabel(anchor:{x:number;y:number},width:number,height:number,viewport:{width:number;height:number},occupied:LabelBox[]):LabelBox|null {
  const w=Math.min(width,viewport.width-16);
  if(w<=0||viewport.height<height+16)return null;
  for(const offset of [0,20,-20,40,-40,60,-60,80,-80]){
    const box={x:Math.max(8,Math.min(viewport.width-w-8,anchor.x-w/2)),y:Math.max(8,Math.min(viewport.height-height-8,anchor.y+offset)),width:w,height};
    if(!occupied.some(b=>overlaps(box,b))){occupied.push(box);return box;}
  }
  return null;
}

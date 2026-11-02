/** An encounter's tactical grid retains the physical location of its intercept. */
export function isInStarSystemAtFlare(location:string,encounterOrigin:string):boolean {
  const physicalLocation=location==='Encounter'?encounterOrigin:location;
  return ['Star System','In Orbit','Landing','On Planet','Terrain Vehicle'].includes(physicalLocation);
}

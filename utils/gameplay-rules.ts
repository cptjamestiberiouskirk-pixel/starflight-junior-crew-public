/** Keep sub-frame fuel use precise; round only the displayed value. */
export function consumeFuel(available: number, amount: number): number {
  return Math.max(0, available - Math.max(0, amount));
}

/** Cargo lots use tenths, but the balance may contain a smaller remainder. */
export function adjustCargoStock(available: number, change: number): number {
  return Math.max(0, +(available + change).toFixed(10));
}

export function planetKey(x: number, y: number, orderIndex: number): string {
  return `${x}-${y}-${orderIndex}`;
}

export function survivingPlanets<T extends { orderIndex: number; destroyed?: boolean }>(planets: T[], x: number, y: number, destroyed: string[]) {
  return planets.filter(planet => !planet.destroyed && !destroyed.includes(planetKey(x, y, planet.orderIndex)));
}

export function shipCargoVolume(fuel: number, minerals: Record<string, number>, artifacts: {volume: number}[], specimens: {volume: number}[]) {
  return fuel + Object.entries(minerals).reduce((sum,[name,volume]) => sum + (name === 'Endurium' ? 0 : volume),0)
    + artifacts.reduce((sum,item)=>sum+item.volume,0) + specimens.reduce((sum,item)=>sum+item.volume,0);
}

export function canRemoveCargoPod(pods: number, occupied: number) {
  return pods > 0 && occupied <= 50 + 50 * (pods - 1) + 1e-9;
}

export function newMissionDestination<T extends string>(slots: {slot:T;empty:boolean}[], active: T) {
  const free = slots.find(slot=>slot.slot === active && slot.empty) ?? slots.find(slot=>slot.empty);
  return free ? {slot:free.slot,replace:false} : {slot:active,replace:slots.some(slot=>slot.slot === active && !slot.empty)};
}

export function roverCommand(key: string) {
  return ({ ' ': 'fire', f: 'fire', c: 'cargo', l: 'look', q: 'scan', m: 'map', r: 'weapon', v: 'move', b: 'board', Enter: 'board' } as Record<string, string>)[key.length === 1 ? key.toLowerCase() : key];
}

/** Minerals can be split; artifacts and specimens must fit as whole items. */
export function fitCargo<T extends { type: string; volume: number; value?: number }>(items: T[], freeVolume: number) {
  let free = Math.max(0, freeVolume);
  const accepted: T[] = [], remaining: T[] = [];
  for (const item of items) {
    const volume = Math.max(0, item.volume);
    const amount = item.type === 'mineral' || item.type === 'endurium'
      ? Math.min(volume, Math.floor((free + 1e-9) * 10) / 10)
      : volume <= free + 1e-9 ? volume : 0;
    if (amount > 0) {
      accepted.push({ ...item, volume: amount, ...(item.value === undefined ? {} : { value: item.value * amount / volume }) });
      free = Math.max(0, free - amount);
    }
    if (volume > amount + 1e-9) remaining.push({ ...item, volume: +(volume - amount).toFixed(10), ...(item.value === undefined ? {} : { value: item.value * (volume - amount) / volume }) });
  }
  return { accepted, remaining };
}

export function isCrystalArtifact(item: { id?: string; name?: string; realName?: string; codeName?: string } | null | undefined, kind: 'orb' | 'cone'): boolean {
  if (!item) return false;
  const id = (item.id ?? '').toLowerCase().replace(/^art-/, '').replace(/_/g, '-');
  if (id === `crystal-${kind}`) return true;
  const aliases = kind === 'orb' ? ['crystal orb', 'shining prismatic orb'] : ['crystal cone', 'crystalline tapered cone'];
  return [item.name, item.realName, item.codeName].some(name => {
    const normalized = (name ?? '').toLowerCase().replace(/^the /, '').trim();
    return aliases.includes(normalized);
  });
}

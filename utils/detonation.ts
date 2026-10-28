export interface DetonationTarget {
  systemCoords: [number, number];
  planetIndex: number;
  lat: number;
  lon: number;
  isArmed: boolean;
}

export interface DetonationSequence {
  target: DetonationTarget;
  elapsed: number;
}

const timeline = [
  [1, 'signal'], [2, '5'], [3, '4'], [4, '3'],
  [5, '2'], [6, '1'], [7, 'blast'], [10, 'resolve'],
] as const;

/** Advance only with simulation time. The serialized elapsed value is the cursor. */
export function advanceDetonation(sequence: DetonationSequence, dt: number) {
  const elapsed = Math.min(10, sequence.elapsed + Math.max(0, dt));
  const events = timeline.filter(([time]) => sequence.elapsed < time && elapsed >= time).map(([, event]) => event);
  return { sequence: elapsed >= 10 ? null : { ...sequence, elapsed }, events };
}

export function detonationResult(target: DetonationTarget) {
  const [x, y] = target.systemCoords;
  if (x === 192 && y === 152 && target.planetIndex === 0) {
    return Math.abs(target.lat - 47) <= 5 && Math.abs(target.lon - 45) <= 5 ? 'victory' : 'damaged';
  }
  if (x === 55 && y === 32 && target.planetIndex === 1) return 'uhlek';
  if (x === 148 && y === 63 && target.planetIndex === 1) return 'elowan';
  return 'destroyed';
}

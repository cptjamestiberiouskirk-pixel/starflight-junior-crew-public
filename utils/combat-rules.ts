/** Expiration removes a shot; only reaching its target can cause damage. */
export function projectileArrival(distance: number, remainingSeconds: number) {
  if (distance < 0.8) return 'hit' as const;
  return remainingSeconds <= 0 ? 'expired' as const : 'travel' as const;
}

export interface ShipDefense {
  shields: number;
  armor: number;
  hull: number;
  shieldClass: number;
  armorClass: number;
  shieldsRaised: boolean;
  inNebula: boolean;
}

/** Resolve one hit against the current pools, ready for another hit this step. */
export function resolveShipHit(state: ShipDefense, damage: number) {
  let remaining = damage > 0 && state.hull > 0 ? Math.max(10, damage) : 0;
  let shields = state.shields;
  let armor = state.armor;
  if (remaining && state.shieldsRaised && shields > 0 && !state.inNebula) {
    const multiplier = (6 - state.shieldClass) / 5;
    const loss = Math.max(1, Math.round(remaining * multiplier));
    remaining = shields >= loss ? 0 : Math.max(0, remaining - Math.round(shields / multiplier));
    shields = Math.max(0, shields - loss);
  }
  if (remaining && armor > 0) {
    const multiplier = (6 - state.armorClass) / 5;
    const loss = Math.max(1, Math.round(remaining * multiplier));
    remaining = armor >= loss ? 0 : Math.max(0, remaining - Math.round(armor / multiplier));
    armor = Math.max(0, armor - loss);
  }
  return {
    ...state, shields, armor, hull: Math.max(0, state.hull - remaining),
    shieldLoss: state.shields - shields,
    armorLoss: state.armor - armor,
    hullDamage: remaining,
  };
}

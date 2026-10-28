export interface CrystalHeat {
  ticks:number;
  remainder:number;
}

/** Simulated exposure resumes at the same point after pause or save/load. */
export function advanceCrystalHeat(state:CrystalHeat,seconds:number,interval=2) {
  const elapsed=state.remainder+Math.max(0,seconds);
  const count=Math.min(280-state.ticks,Math.floor((elapsed+1e-9)/interval));
  const ticks=state.ticks+count;
  return {
    ticks,
    remainder:ticks===280 ? 0 : Math.max(0,elapsed-count*interval),
    pulses:Array.from({length:count},(_,index)=>state.ticks+index+1),
  };
}

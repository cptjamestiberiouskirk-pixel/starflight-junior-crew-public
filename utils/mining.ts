// The port's ground tool follows planet.txt's continuous, tenth-unit extraction.
// Range uses this game's existing surface kilometres; quantities and values stay intact.
export const MINING_RANGE=6;
export const MINING_RATE=1.5; // m³/second (15 tenths)
export const MINING_ENERGY_PER_TENTH=1000/30767; // percent of the rover tank
export interface MiningSession {depositId:string;extracted:number;credit:number;checkpointIn:number}
export function miningStep(volume:number,free:number,fuel:number,dt:number,credit:number) {
  const budget=Math.max(0,credit)+Math.max(0,dt)*MINING_RATE;
  const tenthBudget=Math.floor((budget+1e-9)*10)/10;
  const energyVolume=Math.floor((Math.max(0,fuel)/MINING_ENERGY_PER_TENTH+1e-9))/10;
  const amount=Math.max(0,Math.min(volume,tenthBudget,Math.floor((Math.max(0,free)+1e-9)*10)/10,energyVolume));
  return {amount:+amount.toFixed(10),fuelCost:amount*10*MINING_ENERGY_PER_TENTH,credit:Math.max(0,budget-amount)};
}

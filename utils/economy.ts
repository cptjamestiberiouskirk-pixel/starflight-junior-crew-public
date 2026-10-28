export interface TradeCommodity {
  name: string;
  symbol: string;
  buyPrice: number;
  sellPrice: number;
  color: string;
  desc: string;
}

const baseMinerals: { name: string; symbol: string; price: number; color: string; desc: string }[] = [
  { name: 'Endurium', symbol: 'En', price: 1000, color: '#00f0ff', desc: 'Crystalline fuel indispensable for hyperdrive and tactical systems.' },
  { name: 'Aluminum', symbol: 'Al', price: 440, color: '#cbd5e1', desc: 'Structural alloy essential for starship hull maintenance.' },
  { name: 'Cobalt', symbol: 'Co', price: 160, color: '#3b82f6', desc: 'Magnetic transition metal for field coils.' },
  { name: 'Molybdenum', symbol: 'Mo', price: 320, color: '#a855f7', desc: 'Refractory metal for thruster nozzles.' },
  { name: 'Promethium', symbol: 'Pm', price: 600, color: '#ec4899', desc: 'Rare radioactive lanthanide for energy cores.' },
  { name: 'Titanium', symbol: 'Ti', price: 480, color: '#94a3b8', desc: 'Lightweight high-tensile metal used for shields and chassis.' },
  { name: 'Copper', symbol: 'Cu', price: 240, color: '#f97316', desc: 'Superconducting metal for sensor arrays.' },
  { name: 'Silver', symbol: 'Ag', price: 720, color: '#e2e8f0', desc: 'Subspace transceiver waveguides.' },
  { name: 'Iron', symbol: 'Fe', price: 120, color: '#64748b', desc: 'Heavy ordnance casings and missile rails.' },
  { name: 'Platinum', symbol: 'Pt', price: 800, color: '#e0e7ff', desc: 'Pulse laser focusing array prisms.' },
  { name: 'Gold', symbol: 'Au', price: 760, color: '#eab308', desc: 'Corrosion-proof circuit interconnects.' },
  { name: 'Plutonium', symbol: 'Pu', price: 840, color: '#22c55e', desc: 'Heavy actinide reactor fuel.' },
];

export function getEnduriumPrice(day: number, month: number, year: number): number {
  const absDay = (year - 4620) * 300 + (month - 1) * 30 + day - 1;
  if (absDay < 49) return 1000;
  if (absDay < 134) return 1500;
  return 2000;
}

// Pristine GOG ELEMENT table: each stored value prices one tenth-unit.
// TDEPOT-OV buys at 100%, sells at 50% (Endurium is doubled before sale).
// Evidence: artifacts/extended-acceptance-20261024/original-reference/gog-element-values.json.
const extraElements: [string,string,number][] = [
  ['Antimony','Sb',56],['Chromium','Cr',52],['Lead','Pb',8],['Magnesium','Mg',40],
  ['Mercury','Hg',64],['Nickel','Ni',20],['Rodnium','Rd',88],['Tin','Sn',36],
  ['Tungsten','W',68],['Zinc','Zn',28],
];
export const MINERAL_CATALOG = [
  ...baseMinerals,
  ...extraElements.map(([name,symbol,value])=>({name,symbol,price:value*10,color:'#9ca3af',desc:'Survey mineral accepted by the Trade Depot.'})),
];

export function marketCommodities(day: number, month: number, year: number): TradeCommodity[] {
  return MINERAL_CATALOG.map(mineral => {
    const buyPrice = mineral.name === 'Endurium' ? getEnduriumPrice(day,month,year) : mineral.price;
    return {...mineral,buyPrice,sellPrice:mineral.name === 'Endurium' ? buyPrice : Math.floor(buyPrice/2)};
  });
}

export const TRADE_COMMODITIES = marketCommodities(1,1,4620);

export function clampPurchaseQuantity(requested: number, credits: number, price: number, freeSpace: number): number {
  if (![requested,credits,price,freeSpace].every(Number.isFinite) || price <= 0) return 0;
  return Math.max(0, Math.floor((Math.min(requested, credits/price, freeSpace) + 1e-9) * 10) / 10);
}

export function saleQuantity(requested: number, available: number): number {
  return Math.max(0, Math.floor((Math.min(requested,available) + 1e-9) * 10) / 10);
}

/** BANK-OV's integer divisions: 12% per 300-day year, including debt. */
export function accruedInterest(balance: number, elapsedDays: number) {
  return Math.trunc(Math.trunc(balance*12/100)*Math.max(0,elapsedDays)/300);
}

export function interestCheckpoint(balance:number,lastDay:number,today:number,restart:boolean) {
  const amount=accruedInterest(balance,Math.max(0,today-lastDay));
  return {amount,nextDay:amount!==0||restart?today:lastDay};
}


/** Fuel occupies the space released by the exchanged relic as well as free hold space. */
export function thrynnFuelOffer(value:number,capacity:number,occupied:number,artifactVolume:number) {
  const priceTenths = Math.max(10, Math.floor(value * 2 / 33));
  const freeTenths = Math.max(0, Math.floor((capacity - occupied + artifactVolume + 1e-9) * 10));
  return Math.min(priceTenths,freeTenths) / 10;
}

/** Fulfil exactly the quoted deal, once, without discarding other copies of a relic. */
export function exchangeArtifactForFuel<T extends {id:string;volume:number}>(artifacts:T[],id:string|undefined,fuel:number,offer:number,capacity:number,occupied:number) {
  const index=artifacts.findIndex(item=>item.id===id);
  if (index<0 || !Number.isFinite(offer) || offer<=0 || offer>capacity-occupied+artifacts[index].volume+1e-9) return null;
  return {artifacts:artifacts.filter((_,i)=>i!==index),fuel:+(fuel+offer).toFixed(10)};
}

export function payFuelTribute(fuel:number,tribute:number) {
  return Number.isFinite(tribute) && tribute>0 && fuel+1e-9>=tribute ? +Math.max(0,fuel-tribute).toFixed(10) : null;
}

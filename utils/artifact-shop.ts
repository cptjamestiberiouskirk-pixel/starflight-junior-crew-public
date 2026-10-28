import {CANONICAL_ARTIFACTS,type ArtifactData} from '../surface';
import {specialArtifactIds} from './surface-progress';

export interface DepotArtifact {stockId:string;artifact:ArtifactData & {appraised:boolean};price:number}

/** The original starting depot has one Flat Device and one Whining Orb.
 * Prices and tenths-of-a-cubic-meter volumes come from its artifact records. */
export function initialArtifactStock():DepotArtifact[] {
  return [
    {id:'flat-device',name:'Flat Device',volume:.3,value:15000},
    {id:'whining-orb',name:'Whining Orb',volume:.2,value:3000},
  ].map(item=>({stockId:`initial-${item.id}`,price:item.value*2,artifact:{
    ...structuredClone(CANONICAL_ARTIFACTS.find(a=>a.id===item.id)!),
    codeName:item.name,realName:item.name,name:item.name,volume:item.volume,basePrice:item.value,value:item.value,appraised:true,
  }}));
}

export function depotSale(artifact:ArtifactData & {appraised:boolean},stockId:string):DepotArtifact {
  return {stockId,artifact:structuredClone(artifact),price:Math.max(1,Math.round(artifact.basePrice*2))};
}

export function buyDepotArtifact(stock:DepotArtifact[],stockId:string,credits:number,freeSpace:number) {
  const index=stock.findIndex(item=>item.stockId===stockId);
  if(index<0) return {ok:false as const,reason:'This artifact has already been purchased.'};
  const entry=stock[index];
  if(credits<entry.price) return {ok:false as const,reason:`Not enough funds: ${entry.price.toLocaleString()} M.U. required.`};
  if(entry.artifact.volume>freeSpace+1e-9) return {ok:false as const,reason:`Not enough cargo space: ${entry.artifact.volume} m³ required.`};
  return {ok:true as const,spent:entry.price,artifact:structuredClone(entry.artifact),stock:stock.filter((_,i)=>i!==index)};
}

/** TDEPOT-OV <TDART retains every special artifact and the ten newest curios. */
export function limitArtifactStock(stock:DepotArtifact[]) {
  let curios=0;
  return stock.slice().reverse().filter(entry=>specialArtifactIds.has(entry.artifact.id.replace(/^art-(?=[a-z])/,'').replaceAll('_','-')) || ++curios<=10).reverse();
}

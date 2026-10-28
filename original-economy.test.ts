import assert from 'node:assert/strict';
import { marketCommodities, clampPurchaseQuantity, saleQuantity } from './utils/economy';
import { fieldRepairCost } from './utils/maintenance';

// Independently transcribed pristine GOG ELEMENT values, not the runtime table.
const values: Record<string,number> = { Aluminum:44, Antimony:56, Chromium:52, Cobalt:16, Copper:24, Endurium:100, Gold:76, Iron:12, Lead:8, Magnesium:40, Mercury:64, Molybdenum:32, Nickel:20, Platinum:80, Plutonium:84, Promethium:60, Rodnium:88, Silver:72, Tin:36, Titanium:48, Tungsten:68, Zinc:28 };
export function runOriginalEconomyTests() {
 let passed=0; const check=(ok:boolean,label:string)=>{assert(ok,label);passed++;};
 const market=marketCommodities(1,1,4620);
 check(market.length===22&&new Set(market.map(m=>m.name)).size===22,'All 22 original elements have exactly one market entry');
 for(const [name,value] of Object.entries(values)) {
  const item=market.find(m=>m.name===name)!;
  check(item?.buyPrice===value*10,`${name}: original per-tenth purchase normalization`);
  check(item?.sellPrice===value*(name==='Endurium'?10:5),`${name}: original resale normalization`);
  const quantity=clampPurchaseQuantity(.3,item.buyPrice*.3,item.buyPrice,1);
  check(quantity===.3,`${name}: affordable fractional purchase`);
  check(saleQuantity(.3,.2)===.2,`${name}: fractional sale cannot exceed the hold`);
  check(Math.abs(quantity*(item.buyPrice-item.sellPrice)-(name==='Endurium'?0:value*1.5))<1e-8,`${name}: round trips cannot mint credits`);
 }
 for(const name of ['Aluminum','Molybdenum','Copper','Silver','Iron','Platinum']) {
  const item=market.find(m=>m.name===name)!; const required=fieldRepairCost(50);
  check(required===5&&clampPurchaseQuantity(required,item.buyPrice*5,item.buyPrice,10)===5,`${name}: five units of repair material remain purchasable at exact credits`);
  check(clampPurchaseQuantity(required,item.buyPrice*4.9,item.buyPrice,10)===4.9,`${name}: repair material budget is enforced to the tenth`);
 }
 check(marketCommodities(20,2,4620).find(m=>m.name==='Endurium')?.sellPrice===1500,'Existing dated Endurium buyback is preserved');
 return {passed,failed:0,results:[] as string[]};
}

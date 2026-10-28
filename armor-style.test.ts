import {armorAppearance,tacticalArmorCanvas} from './utils/armor-style';
export function runArmorStyleTests(){
 let passed=0,failed=0;const results:string[]=[];
 const check=(ok:boolean,name:string)=>{ok?passed++:failed++;results.push(`${ok?'PASS':'FAIL'} ${name}`);};
 const styles=[0,1,2,3,4,5].map(armorAppearance);
 check(styles.map(s=>s.coveragePercent).join(',')==='0,20,40,60,80,100','Purchased tiers retain twenty-percent progression');
 check(new Set(styles.slice(1).map(s=>s.accent)).size===5,'All five tiers have distinct accents');
 for(let i=1;i<5;i++)check(styles[i+1].glow>styles[i].glow&&styles[i+1].tintOpacity>styles[i].tintOpacity,'Higher class has stronger restrained visual treatment');
 for(const input of [NaN,Infinity,-1])check(armorAppearance(input).tier===0,'Invalid class cannot request unpurchased visual armor');
 check(armorAppearance(99).tier===5&&armorAppearance(2.9).tier===2,'Out-of-range tiers bounded');
 check(tacticalArmorCanvas(null,5)===null,'Unavailable tactical art never falls back to fabricated coverage');
 return {passed,failed,results};
}

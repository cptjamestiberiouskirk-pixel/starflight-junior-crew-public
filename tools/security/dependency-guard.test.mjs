import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../..');
const lock=JSON.parse(fs.readFileSync(path.join(root,'package-lock.json'),'utf8'));
let passed=0,copies=0;
for(const [relative,info] of Object.entries(lock.packages)){
 if(!relative.endsWith('/picomatch')||!fs.existsSync(path.join(root,relative)))continue;
 copies++;assert.equal(info.version,'4.0.7','Review the guard when dependency version changes');
 const file=path.join(root,relative,'index.js'),pm=createRequire(import.meta.url)(file);
 for(const pattern of ['+(*)b','+(*a)b','*(*)b','+(@(*))b','x+(*a)y','+(*a|b)c','+(*a|*b)c','+(a*|b)c','+(a|aa)b','+(|ab)c','+(ab|abab)c'])for(const options of [{},{maxExtglobRecursion:false}]){
  const result=spawnSync(process.execPath,['-e',`const pm=require(${JSON.stringify(file)});try {pm(${JSON.stringify(pattern)},${JSON.stringify(options)})('a'.repeat(34)+'!');process.exitCode=2;}catch(e){if(e.code!=='ERR_UNSAFE_REPEATED_EXTGLOB')throw e;}`],{timeout:1200,windowsHide:true,encoding:'utf8'});
  assert.equal(result.error,undefined,'Attack must reject without blocking: '+pattern);assert.equal(result.status,0,result.stderr||'Attack pattern was accepted: '+pattern);passed++;
 }
 for(const [pattern,yes,no] of [['**/*.{ts,tsx}','src/App.tsx','asset.png'],['assets/**/*.png','assets/crew/a.png','assets/a.mp3'],['!**/*.test.ts','src/main.ts','src/main.test.ts'],['+(ab|cd)','abcd','ax'],['+(ab)','abab','ax'],['**/!(*.test).ts','src/main.ts','src/main.test.ts']]){assert.equal(pm(pattern)(yes),true,pattern);assert.equal(pm(pattern)(no),false,pattern);passed+=2;}
}
assert(copies>=2,'Both direct and transitive Vite copies must be tested');
console.log(JSON.stringify({status:'passed',copies,passed}));

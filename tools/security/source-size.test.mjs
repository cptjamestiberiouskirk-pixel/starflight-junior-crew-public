import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'../..');
const files=execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(p=>/\.(?:tsx?|[cm]?jsx?|cs|py)$/.test(p)&&!p.startsWith('assets/'));
const seen=new Set();let checked=0;
for(const file of files){if(seen.has(file))continue;seen.add(file);const bytes=fs.statSync(path.join(root,file)).size;assert(bytes<900000,`${file}: ${bytes} bytes approaches Snyk Code's 1 MB limit; extract a coherent module`);checked++;}
assert(seen.has('App.tsx')&&seen.has('GameInterface.tsx'),'State/controller and presentation modules must both be included');
console.log(JSON.stringify({status:'passed',checked,maxSourceBytes:900000}));

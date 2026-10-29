import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {shipRuntimePlan} from './ship-runtime.mjs';
const temporary=mkdtempSync(join(tmpdir(),'junior-crew-ship-cache-'));
const root=pathToFileURL(temporary+'/');
const sha=data=>createHash('sha256').update(data).digest('hex');
const name='ship-c00-a0-l0-m0.png',webp=name.replace('.png','.webp');
const source=Buffer.from('original fixture'),optimized=Buffer.from('runtime fixture');
const cache={version:1,images:[{source:name,file:webp,sourceSha256:sha(source),sha256:sha(optimized),bytes:optimized.length}]};
const manifest=()=>writeFileSync(new URL('artifacts/ship-runtime/manifest.json',root),JSON.stringify(cache));
try{
 mkdirSync(new URL('assets/ships/configurations/',root),{recursive:true});mkdirSync(new URL('artifacts/ship-runtime/',root),{recursive:true});
 writeFileSync(new URL('assets/ships/configurations/'+name,root),source);
 writeFileSync(new URL('assets/ships/manifest.json',root),JSON.stringify({images:[{file:name,sha256:sha(source),bytes:source.length}]}));
 assert.equal(shipRuntimePlan(root)[0].file,name,'No cache uses approved original');
 writeFileSync(new URL('artifacts/ship-runtime/'+webp,root),optimized);manifest();
 assert.equal(shipRuntimePlan(root)[0].file,webp,'Verified derivative selected');
 cache.images[0].sourceSha256='stale';manifest();assert.throws(()=>shipRuntimePlan(root),/Stale/);
 cache.images[0].sourceSha256=sha(source);cache.images[0].file='../outside.webp';manifest();assert.throws(()=>shipRuntimePlan(root),/filename/);
 cache.images[0].file=webp;manifest();writeFileSync(new URL('artifacts/ship-runtime/'+webp,root),'corrupted');assert.throws(()=>shipRuntimePlan(root),/checksum/);
 cache.images=[];manifest();assert.throws(()=>shipRuntimePlan(root),/Invalid/);
 console.log('PASS: 6 ship runtime fallback, selection, stale-cache, path, corruption and completeness checks');
}finally{rmSync(temporary,{recursive:true,force:true});}

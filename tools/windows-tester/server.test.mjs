import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {createTesterServer,APP_PATH,STATUS_PATH,SERVER_ID,singleRange} from './server.mjs';

const evidence=path.resolve('artifacts/windows-tester-20261025');
await fs.mkdir(evidence,{recursive:true});
const dir=await fs.mkdtemp(path.join(evidence,'server-fixture-')),game=path.join(dir,'game');await fs.mkdir(game);
await fs.writeFile(path.join(dir,'secret.txt'),'OUTSIDE-ROOT-SECRET');
await fs.writeFile(path.join(game,'index.html'),'<h1>Game</h1>');
await fs.writeFile(path.join(game,'test.m4a'),Buffer.from(Array.from({length:256},(_,i)=>i)));
await fs.writeFile(path.join(game,'empty.wav'),'');
await fs.mkdir(path.join(game,'directory'));
await fs.symlink(dir,path.join(game,'escape'),'junction');
const types={'.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.m4a':'audio/mp4','.mp3':'audio/mpeg','.wav':'audio/wav','.webm':'video/webm','.mp4':'video/mp4','.glb':'model/gltf-binary','.woff2':'font/woff2','.txt':'text/plain'};
for(const ext of Object.keys(types))await fs.writeFile(path.join(game,'mime'+ext),'test');
const server=await createTesterServer(game,'a'.repeat(64));await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const port=server.address().port,report={cases:[]};
function request(url,options={}){return new Promise((resolve,reject)=>{const req=http.request({hostname:'127.0.0.1',port,path:url,...options},res=>{const chunks=[];res.on('data',x=>chunks.push(x));res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body:Buffer.concat(chunks)}));});req.on('error',reject);req.end();});}
async function check(name,fn){await fn();report.cases.push({name,passed:true});}
try {
 await check('loopback-listener',async()=>assert.equal(server.address().address,'127.0.0.1'));
 await check('root-route',async()=>{const r=await request('/');assert.equal(r.status,302);assert.equal(r.headers.location,APP_PATH);});
 await check('canonical-trailing-slash',async()=>assert.equal((await request(APP_PATH.slice(0,-1))).headers.location,APP_PATH));
 await check('game-and-head',async()=>{const get=await request(APP_PATH),head=await request(APP_PATH,{method:'HEAD'});assert.equal(get.body.toString(),'<h1>Game</h1>');assert.equal(head.body.length,0);assert.equal(Number(head.headers['content-length']),get.body.length);assert.equal(get.headers['cache-control'],'no-store');assert.equal(get.headers['x-content-type-options'],'nosniff');});
 await check('health-identity',async()=>{const r=await request(STATUS_PATH);assert.equal(r.status,200);const s=JSON.parse(r.body);assert.equal(s.server,SERVER_ID);assert.equal(s.build,'a'.repeat(64));});
 for(const [ext,type] of Object.entries(types))await check('mime-'+ext,async()=>assert((await request(APP_PATH+'mime'+ext)).headers['content-type'].startsWith(type)));
 for(const [range,start,end] of [['bytes=0-31',0,31],['bytes=-20',236,255],['bytes=250-',250,255],['bytes=250-999',250,255]])await check('range-'+range,async()=>{const r=await request(APP_PATH+'test.m4a',{headers:{Range:range}});assert.equal(r.status,206);assert.equal(r.body.length,end-start+1);assert.equal(r.body[0],start);assert.equal(r.body.at(-1),end);assert.equal(r.headers['content-range'],`bytes ${start}-${end}/256`);});
 for(const range of ['bytes=999-','bytes=2-1','bytes=-0','bytes=0-1,4-5','bytes=9007199254740993-','nonsense'])await check('reject-range-'+range,async()=>assert.equal((await request(APP_PATH+'test.m4a',{headers:{Range:range}})).status,416));
 await check('empty-file-range',async()=>assert.equal((await request(APP_PATH+'empty.wav',{headers:{Range:'bytes=0-'}})).status,416));
 await check('head-range',async()=>{const r=await request(APP_PATH+'test.m4a',{method:'HEAD',headers:{Range:'bytes=10-19'}});assert.equal(r.status,206);assert.equal(r.body.length,0);assert.equal(r.headers['content-length'],'10');});
 for(const method of ['POST','PUT','PATCH','DELETE','OPTIONS'])await check('read-only-'+method,async()=>{const r=await request(APP_PATH,{method});assert.equal(r.status,405);assert.equal(r.headers.allow,'GET, HEAD');});
 await check('reject-rebinding-host',async()=>assert.equal((await request(APP_PATH,{headers:{Host:'attacker.invalid:'+port}})).status,403));
 await check('localhost-host',async()=>assert.equal((await request(APP_PATH,{headers:{Host:'localhost:'+port}})).status,200));
 for(const url of ['/runtime/node.exe','/BUILD-INFO.json',APP_PATH+'directory',APP_PATH+'missing',APP_PATH+'%2e%2e%2fsecret.txt',APP_PATH+'..%5csecret.txt',APP_PATH+'test.m4a%3Asecret',APP_PATH+'..%20/secret.txt',APP_PATH+'%00',APP_PATH+'%XX',APP_PATH+'escape/secret.txt',APP_PATH+'%252e%252e/secret.txt'])await check('containment-'+url,async()=>{const r=await request(url);assert([400,403,404].includes(r.status));assert(!r.body.includes('OUTSIDE-ROOT-SECRET'));});
 await check('long-url-rejected',async()=>assert.equal((await request(APP_PATH+'a'.repeat(8300))).status,414));
 await check('query-is-not-a-file-path',async()=>assert.equal((await request(APP_PATH+'index.html?../../secret.txt')).status,200));
 await check('concurrent-streams',async()=>{const results=await Promise.all(Array.from({length:12},()=>request(APP_PATH+'test.m4a')));assert(results.every(r=>r.status===200&&r.body.length===256));});
 await check('suffix-longer-than-file',async()=>assert.deepEqual(singleRange('bytes=-1000',10),{start:0,end:9}));
 report.status='passed';
}catch(e){report.status='failed';report.error=String(e.stack??e);process.exitCode=1;}
finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));await fs.writeFile(path.join(evidence,'server-tests.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,passed:report.cases.length,error:report.error}));}

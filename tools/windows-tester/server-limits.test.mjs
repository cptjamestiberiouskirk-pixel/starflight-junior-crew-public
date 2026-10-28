import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import streams from 'node:fs';
import {createTesterServer,APP_PATH,STATUS_PATH} from './server.mjs';

const root=await fs.mkdtemp(path.join(os.tmpdir(),'junior-server-limits-'));
await fs.writeFile(path.join(root,'index.html'),'game');
// A slow consumer must hold a stream long enough to exercise admission limits.
const file=await fs.open(path.join(root,'large.bin'),'w');await file.truncate(32*1024*1024);await file.close();
let now=0,passed=0;
const server=await createTesterServer(root,'a'.repeat(64),{burst:4,requestsPerSecond:2,maxActiveResponses:1,maxConnections:8,clock:()=>now});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const port=server.address().port;
const request=(url,method='GET',headers={})=>new Promise((resolve,reject)=>{const q=http.request({hostname:'127.0.0.1',port,path:url,method,headers,agent:false},r=>{const chunks=[];r.on('data',b=>chunks.push(b));r.on('end',()=>resolve({status:r.statusCode,headers:r.headers,body:Buffer.concat(chunks)}));});q.on('error',reject);q.end();});
const check=async(name,fn)=>{await fn();passed++;console.log('PASS '+name);};
let slow;
try{
 await check('connection-and-idle-limits',()=>{assert.equal(server.maxConnections,8);assert.equal(server.maxRequestsPerSocket,256);assert.equal(server.timeout,15000);});
 await check('burst-bounds-all-routes-before-filesystem-work',async()=>{for(const route of [STATUS_PATH,'/',APP_PATH+'missing',APP_PATH])assert.notEqual((await request(route)).status,429);const r=await request(APP_PATH);assert.equal(r.status,429);assert.equal(r.headers['retry-after'],'1');});
 await check('head-cannot-bypass-bucket',async()=>{const r=await request(APP_PATH,'HEAD');assert.equal(r.status,429);assert.equal(r.body.length,0);});
 await check('clock-refill-allows-legitimate-recovery',async()=>{now+=500;assert.equal((await request(APP_PATH)).status,200);assert.equal((await request(STATUS_PATH)).status,429);});
 await check('invalid-host-and-method-do-not-spend-valid-admission',async()=>{now+=2000;assert.equal((await request(APP_PATH,'GET',{Host:'attacker.invalid'})).status,403);assert.equal((await request(APP_PATH,'POST')).status,405);for(let i=0;i<4;i++)assert.equal((await request(STATUS_PATH)).status,200);assert.equal((await request(STATUS_PATH)).status,429);});
 await check('active-streams-cap-head-status-and-redirects',async()=>{now+=2000;slow=await new Promise((resolve,reject)=>{const q=http.get({hostname:'127.0.0.1',port,path:APP_PATH+'large.bin',agent:false},r=>{r.pause();resolve(r);});q.on('error',reject);});for(const [route,method] of [[STATUS_PATH,'GET'],['/','GET'],[APP_PATH,'HEAD']])assert.equal((await request(route,method)).status,503);});
 await check('abort-releases-slot-without-token-or-counter-leak',async()=>{slow.destroy();await new Promise(r=>setTimeout(r,60));now+=2000;assert.equal((await request(APP_PATH)).status,200);});
 await check('counter-release-occurs-once-for-finish-and-close',async()=>{for(let i=0;i<10;i++){now+=1000;assert.equal((await request(APP_PATH,'HEAD')).status,200);}now+=1000;assert.equal((await request(APP_PATH+'large.bin','HEAD',{Range:'bytes=0-15'})).status,206);});
 await check('aborted-filesystem-await-retains-admission-and-never-opens-stream',async()=>{
  now+=2000;const realpath=fs.realpath,createStream=streams.createReadStream;let entered,release,opened=0;
  const waiting=new Promise(r=>entered=r),gate=new Promise(r=>release=r);
  fs.realpath=async(...args)=>{if(args[0]===path.join(root,'index.html')){entered();await gate;}return realpath(...args);};
  streams.createReadStream=(...args)=>{opened++;return createStream(...args);};
  const q=http.get({hostname:'127.0.0.1',port,path:APP_PATH,agent:false});q.on('error',()=>{});
  try{await waiting;q.destroy();await new Promise(r=>setTimeout(r,60));assert.equal((await request(STATUS_PATH)).status,503,'Aborted but outstanding filesystem work must retain its slot');release();await new Promise(r=>setTimeout(r,60));assert.equal(opened,0,'No stream may open after the response closes');assert.equal((await request(STATUS_PATH)).status,200);}
  finally{release();fs.realpath=realpath;streams.createReadStream=createStream;}
 });
 for(const options of [{burst:0},{maxConnections:Infinity},{requestsPerSecond:NaN},{maxActiveResponses:-1},{clock:null}])await check('invalid-limit-options-fail-closed-'+JSON.stringify(options),async()=>{await assert.rejects(()=>createTesterServer(root,'a'.repeat(64),options),/Invalid server/);});
 console.log(JSON.stringify({status:'passed',passed}));
}finally{slow?.destroy();server.closeAllConnections();await new Promise(r=>server.close(r));await fs.rm(root,{recursive:true,force:true});}

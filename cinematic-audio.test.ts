import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
import ts from 'typescript';

/** Each case runs in a bounded child: a microtask loop cannot freeze the runner.
 * Web Audio and fetch are mocked; no sound, browser profile or network is used. */
export async function runCinematicAudioTests(){
 const results:string[]=[];let passed=0,failed=0;
 const directory=await fs.mkdtemp(path.join(os.tmpdir(),'junior-cinematic-audio-'));
 try{
  const source=await fs.readFile(fileURLToPath(new URL('./utils/cinematic-audio.ts',import.meta.url)),'utf8');
  const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
  const modulePath=path.join(directory,'cinematic-audio.mjs');await fs.writeFile(modulePath,compiled);
  const setup=`
   import assert from 'node:assert/strict';
   import {BayLaunchSound} from ${JSON.stringify(pathToFileURL(modulePath).href)};
   let requests=0,decodes=0,warnings=0;const sources=[],gains=[];
   const ctx={state:'running',currentTime:0,
    createGain(){const node={gain:{value:0,changes:[],setTargetAtTime(...args){this.changes.push(args)}},connect(to){this.output=to}};gains.push(node);return node},
    async decodeAudioData(){decodes++;return {duration:8}},
    createBufferSource(){const node={playbackRate:{value:0},starts:[],stops:0,disconnects:0,connect(to){this.output=to},start(...args){this.starts.push(args)},stop(){this.stops++},disconnect(){this.disconnects++}};sources.push(node);return node}};
   globalThis.fetch=async()=>{requests++;return {ok:true,arrayBuffer:async()=>new ArrayBuffer(0)}};
   console.warn=()=>{warnings++};const output={};
   const sound=new BayLaunchSound(ctx,output,'https://invalid.test/authored.wav');
   const turn=()=>new Promise(resolve=>setTimeout(resolve,10));
  `;
  const cases:[string,string][]=[
   ['failed fetch yields to timers and repeated active frames stay silent',`
    globalThis.fetch=async()=>{requests++;throw Error('offline')};
    sound.sync(true,.25,8);await turn();for(let i=0;i<100;i++)sound.sync(true,.5,8);await turn();
    assert.equal(requests,1);assert.equal(warnings,1);assert.equal(sources.length,0);`],
   ['HTTP failure yields without decoding or retrying',`
    globalThis.fetch=async()=>{requests++;return {ok:false,status:404}};
    sound.sync(true,0,8);await turn();sound.sync(true,.5,8);await turn();
    assert.equal(requests,1);assert.equal(decodes,0);assert.equal(warnings,1);assert.equal(sources.length,0);`],
   ['decode failure yields and does not replay a settled load',`
    ctx.decodeAudioData=async()=>{decodes++;throw Error('corrupt audio')};
    sound.sync(true,.2,8);await turn();sound.sync(true,.4,8);await turn();
    assert.equal(requests,1);assert.equal(decodes,1);assert.equal(warnings,1);assert.equal(sources.length,0);`],
   ['failed preload followed by active playback stays responsive',`
    globalThis.fetch=async()=>{requests++;throw Error('offline')};
    await sound.prepare();sound.sync(true,0,8);await turn();assert.equal(requests,1);assert.equal(sources.length,0);`],
   ['inactive failure control does not load or play',`
    globalThis.fetch=async()=>{requests++;throw Error('offline')};
    sound.sync(false,.5,8);await turn();assert.equal(requests,0);assert.equal(sources.length,0);`],
   ['successful load preserves progress, duration and SFX routing',`
    sound.sync(true,.25,4);await turn();assert.equal(requests,1);assert.equal(decodes,1);
    assert.equal(sources.length,1);assert.deepEqual(sources[0].starts,[[0,2]]);
    assert.equal(sources[0].playbackRate.value,2);assert.equal(sources[0].output,gains[0]);
    assert.equal(gains[0].output,output);assert.equal(gains[0].gain.value,.72);`],
   ['pending load uses latest active frame and shares one request',`
    let resolveFetch;globalThis.fetch=()=>{requests++;return new Promise(resolve=>resolveFetch=resolve)};
    sound.sync(true,.1,8);sound.sync(true,.6,4);
    resolveFetch({ok:true,arrayBuffer:async()=>new ArrayBuffer(0)});await turn();
    assert.equal(requests,1);assert.equal(sources.length,1);assert.deepEqual(sources[0].starts,[[0,4.8]]);assert.equal(sources[0].playbackRate.value,2);`],
   ['pause during pending load prevents late playback; resume seeks',`
    let resolveFetch;globalThis.fetch=()=>{requests++;return new Promise(resolve=>resolveFetch=resolve)};
    sound.sync(true,.2,8);sound.sync(false,.3,8);
    resolveFetch({ok:true,arrayBuffer:async()=>new ArrayBuffer(0)});await turn();assert.equal(sources.length,0);
    sound.sync(true,.5,8);assert.deepEqual(sources[0].starts,[[0,4]]);assert.equal(requests,1);`],
   ['playing pause and resume preserve game-clock position',`
    sound.sync(true,.25,8);await turn();sound.sync(false,.25,8);
    assert.equal(sources[0].stops,1);assert.equal(sources[0].disconnects,1);
    sound.sync(true,.5,8);assert.equal(sources.length,2);assert.deepEqual(sources[1].starts,[[0,4]]);assert.equal(requests,1);`],
   ['continuous playback avoids restart and changed duration reseeks',`
    sound.sync(true,.25,8);await turn();ctx.currentTime=.1;sound.sync(true,.2625,8);assert.equal(sources.length,1);
    sound.sync(true,.5,4);assert.equal(sources.length,2);assert.equal(sources[0].stops,1);assert.equal(sources[1].playbackRate.value,2);assert.deepEqual(sources[1].starts,[[0,4]]);`],
   ['suspended context waits for normal running sync',`
    ctx.state='suspended';sound.sync(true,.2,8);await turn();assert.equal(sources.length,0);
    ctx.state='running';sound.sync(true,.5,8);assert.deepEqual(sources[0].starts,[[0,4]]);`],
   ['completed clip stops and speech ducking is unchanged',`
    sound.sync(true,.25,8);await turn();sound.duck(true);sound.duck(false);
    assert.deepEqual(gains[0].gain.changes,[[.35,0,.04],[.72,0,.04]]);
    sound.sync(true,1,8);assert.equal(sources[0].stops,1);assert.equal(sources.length,1);`],
  ];
  for(const [name,body]of cases){
   const child=spawnSync(process.execPath,['--input-type=module','-e',setup+body],{cwd:directory,encoding:'utf8',windowsHide:true,timeout:3000});
   try{assert.ifError(child.error);assert.equal(child.status,0,child.stderr);passed++;results.push('PASS '+name);}
   catch(error){failed++;results.push('FAIL '+name+': '+error);}
  }
 }finally{await fs.rm(path.join(directory,'cinematic-audio.mjs'),{force:true});await fs.rmdir(directory);}
 return{passed,failed,results};
}

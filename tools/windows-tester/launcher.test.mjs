import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {spawn} from 'node:child_process';

const evidence=path.resolve(process.env.JUNIOR_TESTER_EVIDENCE_DIR??'artifacts/windows-tester-20261026');
const {build:expectedBuild}=JSON.parse(await fs.readFile(new URL('./accepted-build.json',import.meta.url),'utf8'));
const packageRoot=path.resolve(process.argv[2]??path.join(evidence,'package/Starflight Junior Crew'));
const exe=path.join(packageRoot,'Launch Starflight Junior Crew.exe');
const url='http://127.0.0.1:4188/__junior_tester__/status';
const report={packageRoot,cases:[]};let active;
const pause=ms=>new Promise(r=>setTimeout(r,ms));
function run(args=[],options={}){const p=spawn(exe,args,{cwd:evidence,windowsHide:true,stdio:'ignore',...options});p.finished=new Promise((resolve,reject)=>{p.once('exit',(code,signal)=>resolve({code,signal}));p.once('error',reject);});return p;}
async function status(){try{const r=await fetch(url,{signal:AbortSignal.timeout(1000)});if(!r.ok)return null;return await r.json();}catch{return null;}}
async function until(check,label,ms=15000){const end=Date.now()+ms;while(Date.now()<end){const v=await check();if(v)return v;await pause(100);}throw Error('Timed out: '+label);}
async function check(name,fn){await fn();report.cases.push({name,passed:true});console.log('PASS '+name);}
async function stop(){const s=run(['--stop']);assert.equal((await s.finished).code,0);if(active){assert.equal((await active.finished).code,0);active=null;}await until(async()=>!(await status()),'server stopped');}
try{
 assert.equal(await status(),null,'Do not interfere with an existing tester server.');
 await check('native-exe-starts-bundled-runtime-without-path-or-node-preloads',async()=>{
  active=run(['--no-browser'],{env:{...process.env,PATH:'',NODE_OPTIONS:'--require C:/this-test-module-must-not-load.cjs'}});
  const s=await until(status,'native launcher ready');assert.equal(s.server,'starflight-junior-crew-windows-tester-v1');assert.equal(s.build,expectedBuild.sha256);report.serverPid=s.pid;report.build=s.build;
  const html=await(await fetch('http://127.0.0.1:4188/starflight-junior-crew/')).text();assert(html.includes(expectedBuild.entry));
 });
 await check('second-double-click-reuses-server',async()=>{const first=await status(),p=run(['--no-browser']);assert.equal((await p.finished).code,0);assert.equal((await status()).pid,first.pid);});
 await check('stop-shuts-down-owned-server',stop);
 await check('abrupt-launcher-exit-cannot-leave-hidden-server',async()=>{active=run(['--no-browser']);const s=await until(status,'ready after restart');active.kill();await active.finished;active=null;await until(async()=>!(await status()),'orphan server exit');await until(()=>{try{process.kill(s.pid,0);return false;}catch{return true;}},'node process exits');});
 await check('unrelated-port-occupant-is-preserved',async()=>{
  const other=http.createServer((_req,res)=>res.end(JSON.stringify({server:'unrelated-local-app'})));await new Promise((resolve,reject)=>{other.once('error',reject);other.listen(4188,'127.0.0.1',resolve);});
  try{const p=run(['--no-browser']);assert([3,5].includes((await p.finished).code));assert.equal((await status()).server,'unrelated-local-app');}finally{other.closeAllConnections();await new Promise(resolve=>other.close(resolve));}
 });
 await check('missing-game-files-have-safe-noninstall-error',async()=>{
  const missing=await fs.mkdtemp(path.join(evidence,'missing-package-'));await fs.copyFile(exe,path.join(missing,path.basename(exe)));await fs.copyFile(path.join(packageRoot,'BUILD-INFO.json'),path.join(missing,'BUILD-INFO.json'));
  const p=spawn(path.join(missing,path.basename(exe)),['--no-browser'],{windowsHide:true,stdio:'ignore'});assert.equal(await new Promise((resolve,reject)=>{p.once('exit',resolve);p.once('error',reject);}),4);assert.equal(await status(),null);
 });
 // Exercise the same browser-opening branch as the normal double-click, while
 // directing it to a physically muted headless profile owned by this test.
 await check('native-launcher-opens-real-muted-edge',async()=>{
  const profile=await fs.mkdtemp(path.join(evidence,'edge-profile-'));
  active=run(['--test-browser','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','--test-profile',profile]);await until(status,'browser launcher ready');
  const lines=await until(async()=>{try{return (await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).trim().split('\n');}catch{return null;}},'isolated Edge DevTools');
  report.browserEndpoint='http://127.0.0.1:'+lines[0];report.profile=profile;
 });
 report.status='passed';
}catch(e){report.status='failed';report.error=String(e.stack??e);process.exitCode=1;}
finally{
 // The browser smoke driver connects before this process closes the launcher.
 if(report.status==='passed'&&process.env.JUNIOR_TESTER_KEEP_BROWSER==='1'){
  await fs.writeFile(path.join(evidence,'launcher-ready.json'),JSON.stringify(report,null,2));
  await until(async()=>{try{return (await fs.readFile(path.join(evidence,'browser-finished.flag'),'utf8'))==='done';}catch{return false;}},'browser smoke finishes',180000);
 }
 if(report.browserEndpoint){try{await fetch(report.browserEndpoint+'/json/close/'+(await(await fetch(report.browserEndpoint+'/json/list')).json())[0]?.id);}catch{}}
 if(active){try{await stop();}catch{active.kill();}}
 await fs.writeFile(path.join(evidence,'launcher-tests.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,passed:report.cases.length,error:report.error}));
}

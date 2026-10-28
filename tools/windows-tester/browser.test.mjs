import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const out=path.resolve(process.env.JUNIOR_TESTER_EVIDENCE_DIR??'artifacts/windows-tester-20261026');
const {build:expectedBuild}=JSON.parse(await fs.readFile(new URL('./accepted-build.json',import.meta.url),'utf8'));
const pause=ms=>new Promise(r=>setTimeout(r,ms));let ready;
for(let i=0;i<80;i++){try{ready=JSON.parse(await fs.readFile(path.join(out,'launcher-ready.json'),'utf8'));break;}catch{await pause(250);}}
assert(ready,'Native launcher must open its own isolated Edge first.');
assert.equal(ready.build,expectedBuild.sha256,'Native launcher must serve the accepted build');
// Optional developer tooling: install Playwright locally or provide its module path.
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE_PATH
 ? pathToFileURL(path.resolve(process.env.PLAYWRIGHT_MODULE_PATH)).href
 : 'playwright');
const browser=await chromium.connectOverCDP(ready.browserEndpoint),context=browser.contexts()[0];
const report={buildSHA256:ready.build,source:'Real native launcher browser branch, physically muted Edge profile',cases:[],pageErrors:[],localRequestFailures:[]};
await context.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
const page=context.pages().find(p=>p.url().startsWith('http://127.0.0.1:4188'))??await context.newPage();
let reloading=false;
page.on('pageerror',e=>report.pageErrors.push(e.message));page.on('requestfailed',r=>{if(r.url().startsWith('http://127.0.0.1:4188'))report.localRequestFailures.push({url:r.url(),error:r.failure()?.errorText,reloading});});page.setDefaultTimeout(20000);
const button=name=>page.getByRole('button',{name,exact:typeof name==='string'});
async function check(name,fn){await fn();assert.deepEqual(report.pageErrors,[]);report.cases.push({name,passed:true});console.log('PASS '+name);}
try {
 await check('native-browser-opens-packaged-title',async()=>{await button('IMPORT SAVE').waitFor();assert((await page.locator('script[src]').getAttribute('src')).includes(expectedBuild.entry));await page.screenshot({path:path.join(out,'tester-title.jpg')});});
 const fixture=JSON.parse(await fs.readFile('test-fixtures/commissioned-mission.json','utf8'));Object.assign(fixture.data.snapshot,{inRoom:false,starportRoomIndex:0,settings:{...fixture.data.snapshot.settings,musicVolume:0,soundVolume:0,voicesVolume:0,banterEnabled:false}});
 await check('packaged-import-rejects-corrupt-data',async()=>{await button('IMPORT SAVE').click();await button(/^Slot E/).click();const bad=structuredClone(fixture);bad.data.snapshot.bridgeLog=[null];await page.getByRole('textbox').fill(JSON.stringify(bad));await button('Restore Mission to Slot E').click();await page.getByText('Invalid or corrupted save code. No changes made.',{exact:true}).waitFor();});
 await check('packaged-mission-import-and-native-launch',async()=>{await page.getByRole('textbox').fill(JSON.stringify(fixture));await button('Restore Mission to Slot E').click();await button(/^Launch Mission/).click();await button('PAUSE').waitFor();await page.waitForLoadState('networkidle');});
 await check('packaged-dance-frames-actually-advance',async()=>{await page.waitForFunction(()=>document.querySelector('canvas[data-concourse-pose]')?.dataset.concoursePose==='dancing',null,{timeout:16000});const frames=new Set();for(let i=0;i<12;i++){frames.add(await page.locator('canvas[data-concourse-pose]').getAttribute('data-concourse-dance-frame'));await page.waitForTimeout(150);}assert(frames.size>=5);await page.screenshot({path:path.join(out,'tester-dance.jpg')});});
 await check('packaged-browser-save-and-reload',async()=>{await button('PAUSE').click();await button('Mission').click();await button('Save Mission (Slot E)').click();reloading=true;await page.reload();await button('CONTINUE MISSION').click();await button('PAUSE').waitFor();await page.waitForLoadState('networkidle');reloading=false;});
 await check('range-audio-and-all-local-loads',async()=>{const html=await(await fetch('http://127.0.0.1:4188/starflight-junior-crew/')).text();assert(html.includes(expectedBuild.entry));const info=JSON.parse(await fs.readFile(path.join(ready.packageRoot,'PACKAGE-MANIFEST.json'),'utf8'));const media=info.files.find(f=>f.file.endsWith('.m4a'));assert(media);const r=await fetch('http://127.0.0.1:4188/starflight-junior-crew/'+media.file.slice(5),{headers:{Range:'bytes=0-1023'}});assert.equal(r.status,206);assert.equal((await r.arrayBuffer()).byteLength,1024);
  for(const glb of info.files.filter(f=>f.file.endsWith('.glb'))){const response=await fetch('http://127.0.0.1:4188/starflight-junior-crew/'+glb.file.slice(5));assert.equal(response.status,200);assert.equal((await response.arrayBuffer()).byteLength,glb.bytes);}
  assert(report.localRequestFailures.every(r=>r.reloading&&r.error==='net::ERR_ABORTED'),JSON.stringify(report.localRequestFailures));});
 report.status='passed';
}catch(e){report.status='failed';report.error=String(e.stack??e);process.exitCode=1;await page.screenshot({path:path.join(out,'browser-failed.jpg')}).catch(()=>{});}
finally{await fs.writeFile(path.join(out,'browser-tests.json'),JSON.stringify(report,null,2));await browser.close();await fs.writeFile(path.join(out,'browser-finished.flag'),'done');console.log(JSON.stringify({status:report.status,passed:report.cases.length,error:report.error}));}

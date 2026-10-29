import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
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
const report={buildSHA256:ready.build,source:'Real native launcher browser branch, physically muted Edge profile',cases:[],pageErrors:[],localRequestFailures:[],completedModels:[]};
await context.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
const page=context.pages().find(p=>p.url().startsWith('http://127.0.0.1:4188'))??await context.newPage();
let transition=null,networkOrder=0;
const transferObservations=[];
page.on('pageerror',e=>report.pageErrors.push(e.message));page.on('requestfailed',r=>{
 if(!r.url().startsWith('http://127.0.0.1:4188'))return;
 const failure={url:r.url(),error:r.failure()?.errorText,transition,order:networkOrder++,timing:null};report.localRequestFailures.push(failure);
 transferObservations.push(page.evaluate(url=>{const entry=performance.getEntriesByName(url).at(-1);return entry?{encodedBodySize:entry.encodedBodySize,decodedBodySize:entry.decodedBodySize}:null;},r.url()).then(timing=>{failure.timing=timing;}).catch(()=>{}));
});
page.on('requestfinished',async request=>{if(!request.url().endsWith('.glb'))return;const order=networkOrder++,response=await request.response();if(response?.status()===200)report.completedModels.push({url:request.url(),order});});page.setDefaultTimeout(20000);
const button=name=>page.getByRole('button',{name,exact:typeof name==='string'});
async function check(name,fn){await fn();assert.deepEqual(report.pageErrors,[]);report.cases.push({name,passed:true});console.log('PASS '+name);}
try {
 await check('native-browser-opens-packaged-title',async()=>{await button('IMPORT SAVE').waitFor();await page.waitForLoadState('networkidle');assert((await page.locator('script[src]').getAttribute('src')).includes(expectedBuild.entry));await page.screenshot({path:path.join(out,'tester-title.jpg')});});
 const fixture=JSON.parse(await fs.readFile('test-fixtures/commissioned-mission.json','utf8'));Object.assign(fixture.data.snapshot,{inRoom:false,starportRoomIndex:0,settings:{...fixture.data.snapshot.settings,musicVolume:0,soundVolume:0,voicesVolume:0,banterEnabled:false}});
 await check('packaged-import-rejects-corrupt-data',async()=>{transition='mission-import';await button('IMPORT SAVE').click();await button(/^Slot E/).click();const bad=structuredClone(fixture);bad.data.snapshot.bridgeLog=[null];await page.getByRole('textbox').fill(JSON.stringify(bad));await button('Restore Mission to Slot E').click();await page.getByText('Invalid or corrupted save code. No changes made.',{exact:true}).waitFor();});
 await check('packaged-mission-import-and-native-launch',async()=>{await page.getByRole('textbox').fill(JSON.stringify(fixture));await button('Restore Mission to Slot E').click();await button(/^Launch Mission/).click();await button('PAUSE').waitFor();await page.waitForLoadState('networkidle');transition=null;});
 await check('packaged-dance-frames-actually-advance',async()=>{await page.waitForFunction(()=>document.querySelector('canvas[data-concourse-pose]')?.dataset.concoursePose==='dancing',null,{timeout:16000});const frames=new Set();for(let i=0;i<12;i++){frames.add(await page.locator('canvas[data-concourse-pose]').getAttribute('data-concourse-dance-frame'));await page.waitForTimeout(150);}assert(frames.size>=5);await page.screenshot({path:path.join(out,'tester-dance.jpg')});});
 await check('packaged-browser-save-and-reload',async()=>{await button('PAUSE').click();await button('Mission').click();await button('Save Mission (Slot E)').click();transition='reload';await page.reload();await button('CONTINUE MISSION').click();await button('PAUSE').waitFor();await page.waitForLoadState('networkidle');transition=null;});
 await check('range-audio-and-all-local-loads',async()=>{const html=await(await fetch('http://127.0.0.1:4188/starflight-junior-crew/')).text();assert(html.includes(expectedBuild.entry));const info=JSON.parse(await fs.readFile(path.join(ready.packageRoot,'PACKAGE-MANIFEST.json'),'utf8'));const media=info.files.find(f=>f.file.endsWith('.m4a'));assert(media);const r=await fetch('http://127.0.0.1:4188/starflight-junior-crew/'+media.file.slice(5),{headers:{Range:'bytes=0-1023'}});assert.equal(r.status,206);assert.equal((await r.arrayBuffer()).byteLength,1024);
  const models=info.files.filter(f=>f.file.endsWith('.glb'));
  for(const glb of models){const response=await fetch('http://127.0.0.1:4188/starflight-junior-crew/'+glb.file.slice(5));assert.equal(response.status,200);const body=Buffer.from(await response.arrayBuffer());assert.equal(body.byteLength,glb.bytes);assert.equal(createHash('sha256').update(body).digest('hex'),glb.sha256);}
  // A recovered model fetch is acceptable only when the browser subsequently
  // finishes that exact URL; Node's direct resource checks cannot satisfy this.
  await Promise.all(transferObservations);
  // Edge may emit ERR_ABORTED after streaming the entire model into Three.js.
  // Accept that signal only with exact browser body-size evidence for a model
  // whose HTTP bytes also match the package SHA-256; truncated loads still fail.
  const fullyTransferred=r=>models.some(m=>r.url.endsWith('/'+m.file.slice(5))&&r.timing?.encodedBodySize===m.bytes&&r.timing?.decodedBodySize===m.bytes);
  assert(report.localRequestFailures.every(r=>r.error==='net::ERR_ABORTED'&&(['mission-import','reload'].includes(r.transition)||report.completedModels.some(m=>m.url===r.url&&m.order>r.order)||fullyTransferred(r))),JSON.stringify({failures:report.localRequestFailures,completedModels:report.completedModels}));});
 report.status='passed';
}catch(e){report.status='failed';report.error=String(e.stack??e);process.exitCode=1;await page.screenshot({path:path.join(out,'browser-failed.jpg')}).catch(()=>{});}
finally{await fs.writeFile(path.join(out,'browser-tests.json'),JSON.stringify(report,null,2));await browser.close();await fs.writeFile(path.join(out,'browser-finished.flag'),'done');console.log(JSON.stringify({status:report.status,passed:report.cases.length,error:report.error}));}

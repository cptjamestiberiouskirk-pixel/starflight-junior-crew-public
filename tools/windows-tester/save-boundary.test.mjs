// Real-browser responsiveness and preservation at the decoded save-size limit.
// Always launch a disposable, physically muted browser; never attach to a user.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {createServer} from 'vite';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const out=path.resolve(root,process.env.JUNIOR_SAVE_TEST_EVIDENCE??'artifacts/save-boundary-test');
assert(out.startsWith(path.join(root,'artifacts')+path.sep));await fs.mkdir(out,{recursive:true});
const url=process.env.JUNIOR_SAVE_TEST_URL??'http://127.0.0.1:4188/starflight-junior-crew/';
assert.equal(new URL(url).hostname,'127.0.0.1');
const status=await(await fetch(new URL('/__junior_tester__/status',url))).json();assert.equal(status.server,'starflight-junior-crew-windows-tester-v1');
const vite=await createServer({root,configFile:false,cacheDir:path.join(out,'ssr-cache'),optimizeDeps:{noDiscovery:true,include:[],entries:[]},server:{middlewareMode:true,hmr:false,watch:null},appType:'custom'});
const {MAX_SAVE_JSON_BYTES}=await vite.ssrLoadModule('/utils/save-validation.ts');await vite.close();
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE_PATH?pathToFileURL(path.resolve(process.env.PLAYWRIGHT_MODULE_PATH)).href:'playwright');
const browser=await chromium.launch({channel:'msedge',headless:true,args:['--mute-audio']});
const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();page.setDefaultTimeout(15000);
await context.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
const report={url,build:status.build,scope:'Fresh muted nonpersistent Edge context; synthetic Slot E; no owner profile access',cases:[],timings:[],pageErrors:[]};page.on('pageerror',e=>report.pageErrors.push(e.message));
const button=name=>page.getByRole('button',{name,exact:typeof name==='string'}),text=page.getByRole('textbox');
const fixture=JSON.parse(await fs.readFile(path.join(root,'test-fixtures/commissioned-mission.json'),'utf8'));
fixture.data.snapshot.settings={...fixture.data.snapshot.settings,musicVolume:0,soundVolume:0,voicesVolume:0,banterEnabled:false};
async function test(name,fn){await fn();assert.deepEqual(report.pageErrors,[]);report.cases.push({name,passed:true});console.log('PASS '+name);}
async function paste(code,label){
 const start=performance.now();await text.fill(code);await page.evaluate(()=>document.querySelector('textarea')?.value.length);
 const milliseconds=Math.round(performance.now()-start);report.timings.push({label,milliseconds});
 assert(milliseconds<8000,`${label}: ${milliseconds} ms blocks the UI (8-second test ceiling)`);
}
const stored=()=>page.evaluate(()=>localStorage.getItem('starflight_save_slot_E'));
try{
 await page.goto(url);await button('IMPORT SAVE').click();await button(/^Slot E/).click();await text.fill(JSON.stringify(fixture));await button('Restore Mission to Slot E').click();const original=await stored();assert(original);
 const json=JSON.stringify(fixture),padding=MAX_SAVE_JSON_BYTES-Buffer.byteLength(json);
 await test('oversize-decoded-base64-rejects-responsively-and-preserves-slot',async()=>{
  await paste('SFSAVE1_'+Buffer.from(json+' '.repeat(padding+1)).toString('base64'),'over-limit Base64');await button('Restore Mission to Slot E').click();await page.getByText('Invalid or corrupted save code. No changes made.',{exact:true}).waitFor();assert.equal(await stored(),original);
 });
 await test('exact-decoded-limit-base64-restores-and-launches',async()=>{
  await paste('SFSAVE1_'+Buffer.from(json+' '.repeat(padding)).toString('base64'),'at-limit Base64');await button('Restore Mission to Slot E').click();await button(/^Launch Mission/).waitFor();await button(/^Launch Mission/).click();await button('PAUSE').click();await button('Mission').click();
 });
 await test('exported-save-code-remains-selectable-and-unchanged',async()=>{
  await button('Save Slots').click();await button('Export Save').click();const exported=page.locator('#export-code-textarea');await exported.waitFor();const code=await exported.inputValue();assert(code.startsWith('SFSAVE1_'));assert.equal(await exported.getAttribute('readonly'),'');assert((await stored()).includes('QA EXPLORER'));await page.screenshot({path:path.join(out,'export-recovery.jpg')});
 });
 report.status='passed';
}catch(e){report.status='failed';report.error=String(e.stack??e);await page.screenshot({path:path.join(out,'failure.jpg')}).catch(()=>{});throw e;}
finally{await fs.writeFile(path.join(out,'save-boundary.json'),JSON.stringify(report,null,2));await browser.close();console.log(JSON.stringify(report,null,2));}

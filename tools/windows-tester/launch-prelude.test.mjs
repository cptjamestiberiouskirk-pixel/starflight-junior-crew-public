import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';

const url=process.env.JUNIOR_PRELUDE_URL??'http://127.0.0.1:5216/starflight-junior-crew/';
assert.equal(new URL(url).hostname,'127.0.0.1');assert.notEqual(new URL(url).port,'4174');
const out=path.resolve(process.env.JUNIOR_PRELUDE_EVIDENCE??'artifacts/launch-prelude-check');await fs.mkdir(out,{recursive:true});
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE_PATH?pathToFileURL(path.resolve(process.env.PLAYWRIGHT_MODULE_PATH)).href:'playwright');
const browser=await chromium.launch({channel:'msedge',headless:true,args:['--mute-audio']});
const health=await(await fetch(new URL('/__junior_tester__/status',url))).json();
const report={build:health.build,scope:'Ordinary controls and fictional imports in muted disposable profiles; phases selected and verified explicitly',cases:[]};
let context,page,errors;
const button=name=>page.getByRole('button',{name,exact:typeof name==='string'});
const fixture=JSON.parse(await fs.readFile('test-fixtures/commissioned-mission.json','utf8'));
function mission(slot='E'){
  const f=structuredClone(fixture);f.slot=slot;f.data.slot=slot;
  Object.assign(f.data.snapshot,{location:'Starport',inRoom:true,starportRoomIndex:6,flaresStopped:true,cinematicState:'none',cinematicRemaining:0,credits:10000,stardateDay:11,stardateMonth:1,stardateYear:4620,lastInterestAbsDay:0});
  Object.assign(f.data.snapshot.settings,{musicVolume:0,soundVolume:0,voicesVolume:0,banterEnabled:false});return f;
}
async function start(phase){
  await context?.close();context=await browser.newContext({viewport:{width:1440,height:1000}});
  await context.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
  page=await context.newPage();page.setDefaultTimeout(15000);errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url);await button('IMPORT SAVE').click();await button(/^Slot E/).click();await page.getByRole('textbox').fill(JSON.stringify(mission()));await button('Restore Mission to Slot E').click();await button(/^Launch Mission/).click();
  await button('CLEAR GANTRY & LAUNCH TO SPACE').click();
  if(phase==='transporter')await page.waitForFunction(()=>document.querySelector('[data-flight-hud]')?.textContent.includes('10,040 M.U.'));
  await page.keyboard.press('p');await button('RESUME MISSION').waitFor();
  const before=await saved();assert.equal(before.cinematicState,'none');assert.equal(before.inRoom,phase==='clamps');assert.equal(before.credits,phase==='clamps'?10000:10040);
  return before;
}
async function saved(slot='E'){
  await button('Mission').click();await button(`Save Mission (Slot ${slot})`).click();await page.waitForTimeout(100);
  assert.equal(await page.getByText(/Save blocked.*previous checkpoint preserved/).count(),0);
  return page.evaluate(slot=>JSON.parse(localStorage.getItem('starflight_save_slot_'+slot)).snapshot,slot);
}
const prelude=s=>({cinematic:s.cinematicState,remaining:s.cinematicRemaining,inRoom:s.inRoom,credits:s.credits,interest:s.bankLedger.filter(e=>e.desc==='12% p.a. accrued interest').length});
async function check(name,fn){
  if(process.env.JUNIOR_PRELUDE_CASE&&!name.includes(process.env.JUNIOR_PRELUDE_CASE))return;
  try{await fn();assert.deepEqual(errors,[]);report.cases.push({name,passed:true});}
  catch(error){report.cases.push({name,passed:false,error:String(error.stack??error),pageErrors:errors});await page?.screenshot({path:path.join(out,name+'-failed.png')}).catch(()=>{});}
  await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report.cases.at(-1)));
}
try{
  for(const phase of ['clamps','transporter']){
    await check(phase+'-pause-resume-save-reload-once',async()=>{
      const before=await start(phase);await page.waitForTimeout(2100);assert.deepEqual(prelude(await saved()),prelude(before));
      await button('RESUME MISSION').click();await button('Navigation').waitFor({timeout:30000});await button('PAUSE').click();
      const finished=await saved();assert.equal(finished.location,'Star System');assert.equal(finished.credits,10040);assert.equal(prelude(finished).interest,1);
      await page.reload();await page.getByTestId('resume-slot-E').click();await button('PAUSE').click();const again=await saved();assert.equal(again.location,'Star System');assert.equal(again.credits,10040);assert.equal(prelude(again).interest,1);
    });
    await check(phase+'-quit-title-freezes-and-continues-checkpoint',async()=>{
      const before=await start(phase);await button('Quit to Title Screen').click();await button('Continue to Title Screen').click();await button('START NEW MISSION').waitFor();
      const hud=await page.locator('[data-flight-hud]').innerText(),raw=await page.evaluate(()=>localStorage.getItem('starflight_save_slot_E'));await page.waitForTimeout(2300);
      assert.equal(await page.locator('[data-flight-hud]').innerText(),hud);assert.equal(await page.evaluate(()=>localStorage.getItem('starflight_save_slot_E')),raw);
      await button('CONTINUE MISSION').click();await button('PAUSE').click();const after=await saved();assert.equal(after.credits,before.credits);assert.equal(prelude(after).interest,prelude(before).interest);assert.equal(after.cinematicState,'none');
    });
    await check(phase+'-other-mission-cancels-old-launch',async()=>{
      await start(phase);await button('Save Slots').click();await button('Import Save (.sfsave)').click();await button(/^Slot D/).click();const other=mission('D');Object.assign(other.data.snapshot,{credits:5432,starportRoomIndex:3,shipName:'CLEAN SLOT D'});
      await page.getByRole('textbox').fill(JSON.stringify(other));await button('Restore Mission to Slot D').click();await button(/^Launch Mission/).click();await button('PAUSE').waitFor();await page.waitForTimeout(2100);await button('PAUSE').click();const after=await saved('D');assert.equal(after.location,'Starport');assert.equal(after.cinematicState,'none');assert.equal(after.credits,5432);assert.equal(after.shipName,'CLEAN SLOT D');
    });
  }
  report.status=report.cases.length>0&&report.cases.every(c=>c.passed)?'passed':'failed';if(report.status==='failed')process.exitCode=1;
}finally{await context?.close();await browser.close();await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));}

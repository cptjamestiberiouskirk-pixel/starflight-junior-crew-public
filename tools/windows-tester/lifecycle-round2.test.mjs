import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const url = process.env.JUNIOR_LIFECYCLE_URL ?? 'http://127.0.0.1:5491/starflight-junior-crew/';
const target = new URL(url);
assert.equal(target.hostname,'127.0.0.1');
assert.notEqual(target.port,'4174','Owner preview is out of scope');
const out = path.resolve(process.env.JUNIOR_LIFECYCLE_EVIDENCE ?? 'artifacts/lifecycle-round2');
await fs.mkdir(out,{recursive:true});
const {build} = await (await fetch(new URL('/__junior_tester__/status',url))).json();
const playwright = process.env.PLAYWRIGHT_MODULE_PATH ? pathToFileURL(path.resolve(process.env.PLAYWRIGHT_MODULE_PATH)).href : 'playwright';
const {chromium} = await import(playwright);
const browser = await chromium.launch({channel:'msedge',headless:true,args:['--mute-audio']});
const fixture = JSON.parse(await fs.readFile('test-fixtures/commissioned-mission.json','utf8'));
const manifest = 'STARFLIGHT_DISPATCH_STEP11_SAVES';
const key = slot => 'starflight_save_slot_' + slot;
const lastSlot = 'starflight_last_save_slot';
const report = {build,scope:'Muted disposable Edge, ordinary controls, synthetic slot and legacy storage fixtures.',cases:[]};
let context, page, errors;
const button = name => page.getByRole('button',{name,exact:typeof name === 'string'});
const readKey = id => page.evaluate(id=>localStorage.getItem(id),id);
const readSlot = async slot => JSON.parse(await readKey(key(slot)));
function mission(slot,shipName,patch={}) {
  const data=structuredClone(fixture.data);
  Object.assign(data,{slot,shipName});
  Object.assign(data.snapshot,{location:'Starport',inRoom:true,starportRoomIndex:6,flaresStopped:true,shipName,cinematicState:'none',cinematicRemaining:0,...patch});
  Object.assign(data.snapshot.settings,{musicVolume:0,soundVolume:0,voicesVolume:0,banterEnabled:false});
  return data;
}
async function open(seed={}) {
  await context?.close();
  context=await browser.newContext({viewport:{width:1440,height:1000}});
  await context.route('**/*',route=>new URL(route.request().url()).origin===target.origin ? route.continue() : route.abort());
  await context.addInitScript(seed=>{
    if (sessionStorage.getItem('qa-seeded'))return;
    sessionStorage.setItem('qa-seeded','1');
    for (const [key,value] of Object.entries(seed))localStorage.setItem(key,value);
  },seed);
  page=await context.newPage();
  page.setDefaultTimeout(8000);
  errors=[];
  page.on('pageerror',error=>errors.push(String(error)));
  await page.goto(url);
}
async function loadA(patch={},extra={}) {
  await open({[key('A')]:JSON.stringify(mission('A','RUNNING A',patch)),[lastSlot]:'A',...extra});
  await page.getByTestId('resume-slot-A').click();
}
async function prepareImport(slot,shipName,fromTitle=false) {
  if (!fromTitle) {
    await button('PAUSE').click();
    await button('Save Slots').click();
  }
  await button(fromTitle?'IMPORT SAVE':'Import Save (.sfsave)').click();
  await button(new RegExp('^Slot '+slot)).click();
  await page.getByRole('textbox').fill(JSON.stringify(mission(slot,shipName)));
}
async function saveAndRead(slot) {
  await button('Mission').click();
  await button('Save Mission (Slot '+slot+')').click();
  return readSlot(slot);
}
async function check(name,run) {
  if (process.env.JUNIOR_LIFECYCLE_CASE && !name.includes(process.env.JUNIOR_LIFECYCLE_CASE))return;
  try {
    await run();
    assert.deepEqual(errors,[]);
    report.cases.push({name,passed:true});
  } catch (error) {
    report.cases.push({name,passed:false,error:String(error.stack??error),errors});
    await page?.screenshot({path:path.join(out,name+'-failed.png')}).catch(()=>{});
  }
  console.log(JSON.stringify(report.cases.at(-1)));
  await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));
}
try {
  await check('paused-import-other-slot-dismiss-retains-both-missions',async()=>{
    await loadA();
    await prepareImport('B','IMPORTED B');
    await button('Restore Mission to Slot B').click();
    const bBytes=await readKey(key('B'));
    assert.equal(JSON.parse(bBytes).snapshot.shipName,'IMPORTED B');
    await button('Cancel').last().click();
    assert.equal(await readKey(lastSlot),'A');
    assert.equal((await saveAndRead('A')).snapshot.shipName,'RUNNING A');
    assert.equal(await readKey(key('B')),bBytes);
  });
  await check('paused-import-active-slot-adopts-import-before-next-save',async()=>{
    await loadA();
    await prepareImport('A','REPLACEMENT A');
    const direct=button('Restore and load active Slot A');
    const explicit=await direct.count()>0;
    await (explicit?direct:button('Restore Mission to Slot A')).click();
    if (explicit) await button('PAUSE').click();
    else await button('Cancel').last().click();
    await button('Crew Assignments').click();
    await page.getByRole('combobox',{name:'Doctor assignment',exact:true}).last().selectOption('');
    await page.waitForFunction(key=>JSON.parse(localStorage.getItem(key)).snapshot.assignedPosts.Doctor===null,key('A'));
    assert.equal((await saveAndRead('A')).snapshot.shipName,'REPLACEMENT A');
    assert.equal(await readKey(lastSlot),'A');
    assert.ok(explicit);
  });
  await check('title-import-and-deliberate-slot-switch',async()=>{
    await open();
    await prepareImport('A','TITLE A',true);
    await button('Restore Mission to Slot A').click();
    await button(/^Launch Mission/).click();
    await prepareImport('B','SWITCH B');
    await button('Restore Mission to Slot B').click();
    await button(/^Launch Mission/).click();
    await button('PAUSE').click();
    assert.equal((await saveAndRead('B')).snapshot.shipName,'SWITCH B');
    assert.equal(await readKey(lastSlot),'B');
    assert.equal((await readSlot('A')).snapshot.shipName,'TITLE A');
  });
  await check('copy-only-destination-retains-quarantined-primary-legacy-manifest',async()=>{
    const primary='{"snapshot":{"shipName":"Unfinished file"}';
    const legacy='{"snapshot":{"shipName":"Second repair candidate"}';
    const manifestOnly={slot:'D',snapshot:{shipName:'Unrecoverable without original fields'},privateExtension:'QA marker'};
    await loadA({}, {[key('C')]:primary,starflight_dispatch_slot_C:legacy,[manifest]:JSON.stringify([manifestOnly])});
    await button('PAUSE').click();
    await button('Save Slots').click();
    await button('Copy Slot A').click();
    await page.getByLabel('Destination slot').selectOption('B');
    await button('Copy to Slot B').click();
    assert.equal((await readSlot('B')).snapshot.shipName,'RUNNING A');
    assert.equal(await readKey(key('C')),primary);
    assert.equal(await readKey('starflight_dispatch_slot_C'),legacy);
    assert.deepEqual(JSON.parse(await readKey(manifest)).find(entry=>entry.slot==='D'),manifestOnly);
  });
  await check('owner-copy-protects-running-slot-and-title-allows-replacement',async()=>{
    await loadA({},{[key('B')]:JSON.stringify(mission('B','OTHER B'))});
    await button('PAUSE').click();
    await button('Save Slots').click();
    const originalA=await readKey(key('A')),originalB=await readKey(key('B'));
    await button('Copy Slot B').click();
    const destinations=page.getByLabel('Destination slot');
    assert.equal(await destinations.locator('option[value="A"]').isDisabled(),true);
    assert.notEqual(await destinations.inputValue(),'A');
    await destinations.selectOption('C');await button('Copy to Slot C').click();
    assert.equal((await readSlot('C')).snapshot.shipName,'OTHER B');
    assert.equal(await readKey(key('A')),originalA);
    assert.equal(await readKey(key('B')),originalB);
    assert.equal(await readKey(lastSlot),'A');
    await page.reload();
    await button('Copy Slot B').click();
    assert.equal(await destinations.locator('option[value="A"]').isEnabled(),true);
    await destinations.selectOption('A');await button('Copy to Slot A').click();
    assert.equal((await readSlot('A')).snapshot.shipName,'OTHER B');
    assert.equal(await readKey(key('B')),originalB);
  });
  await check('owner-save-as-during-clearance-aborts-only-new-active-slot',async()=>{
    await loadA();
    await button('CLEAR GANTRY & LAUNCH TO SPACE').click();
    await page.keyboard.press('p');
    await button('Save Slots').click();
    const originalA=await readKey(key('A'));
    await button('Save').nth(1).click();
    await page.waitForFunction(()=>localStorage.getItem('starflight_last_save_slot')==='B');
    await button('Crew Assignments').click();
    await page.getByRole('combobox',{name:'Doctor assignment',exact:true}).last().selectOption('');
    await button('Close pause menu').click();
    await page.waitForFunction(key=>{
      const s=JSON.parse(localStorage.getItem(key)).snapshot;
      return s.inRoom && s.assignedPosts.Doctor===null && s.bridgeLog.some(line=>line.text.includes('Launch cancelled'));
    },key('B'),{timeout:12000});
    assert.equal(await readKey(lastSlot),'B');
    assert.equal(await readKey(key('A')),originalA);
  });
  for (const phase of ['clamps','transporter']) await check(phase+'-vacancy-cancels-launch-and-restaffing-permits-retry',async()=>{
    await loadA({credits:10000,stardateDay:11,stardateMonth:1,stardateYear:4620,lastInterestAbsDay:0});
    await button('CLEAR GANTRY & LAUNCH TO SPACE').click();
    if(phase==='transporter')await page.waitForFunction(()=>document.querySelector('[data-flight-hud]')?.textContent.includes('10,040 M.U.'));
    await page.keyboard.press('p');
    await button('Crew Assignments').click();
    const doctor=page.getByRole('combobox',{name:'Doctor assignment',exact:true}).last();
    const previous=await doctor.inputValue();
    await doctor.selectOption('');
    await button('Close pause menu').click();
    await page.waitForFunction(key=>{
      const s=JSON.parse(localStorage.getItem(key)).snapshot;
      return s.bridgeLog.some(m=>m.text.includes('Launch cancelled')) && s.location==='Starport' && s.inRoom && s.starportRoomIndex===6 && s.cinematicState==='none';
    },key('A'),{timeout:12000});
    const cancelled=(await readSlot('A')).snapshot;
    assert.equal(cancelled.assignedPosts.Doctor,null);
    assert.equal(cancelled.credits,phase==='clamps'?10000:10040);
    await button('PAUSE').click();
    await button('Crew Assignments').click();
    await doctor.selectOption(previous);
    await button('Close pause menu').click();
    await button('CLEAR GANTRY & LAUNCH TO SPACE').click();
    await button('Navigation').waitFor({timeout:30000});
    await button('PAUSE').click();
    const after=(await saveAndRead('A')).snapshot;
    assert.equal(after.location,'Star System');
    assert.equal(after.credits,10040);
    assert.equal(after.bankLedger.filter(entry=>entry.desc==='12% p.a. accrued interest').length,1);
  });
  await check('cancel-review-then-resume-metadata-slot-isolates-crew-and-reenables-save',async()=>{
    const metadata={slot:'B',timestamp:'QA synthetic legacy',shipName:'PROTOTYPE B',credits:4321,location:'Starport',stardate:'06-01-4620',empty:false};
    const posts=Object.fromEntries(Object.keys(fixture.data.snapshot.assignedPosts).map(post=>[post,fixture.data.snapshot.crewRoster[0].id]));
    await loadA({assignedPosts:posts},{[key('B')]:JSON.stringify(metadata)});
    const oldA=await readKey(key('A'));
    await button('Cancel review and return to title without saving').click();
    await page.getByTestId('resume-slot-B').click();
    await page.keyboard.press('p');
    await saveAndRead('B');
    await page.waitForFunction(key=>!!JSON.parse(localStorage.getItem(key)).snapshot,key('B'));
    const after=(await readSlot('B')).snapshot;
    assert.equal(after.shipName,'PROTOTYPE B');
    assert.equal(after.credits,4321);
    assert.equal(after.stardateDay,6);
    assert.deepEqual(after.crewRoster,[]);
    assert.deepEqual(Object.values(after.assignedPosts),Array(6).fill(null));
    assert.equal(await readKey(key('A')),oldA);
  });
  report.status=report.cases.length>0&&report.cases.every(item=>item.passed)?'passed':'failed';
  if(report.status==='failed')process.exitCode=1;
} finally {
  await context?.close();
  await browser.close();
  await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));
}

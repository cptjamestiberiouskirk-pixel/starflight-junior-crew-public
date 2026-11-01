import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const url=process.env.JUNIOR_CREW_URL??'http://127.0.0.1:5221/starflight-junior-crew/';
const out=path.resolve(process.env.JUNIOR_CREW_EVIDENCE??'artifacts/crew-assignments-20261101/browser');
assert.equal(new URL(url).hostname,'127.0.0.1');assert.notEqual(new URL(url).port,'4174','Never test owner server');
await fs.mkdir(out,{recursive:true});
const health=await(await fetch(new URL('/__junior_tester__/status',url))).json();
const fixture=JSON.parse(await fs.readFile('test-fixtures/commissioned-mission.json','utf8'));
const roles=['Captain','Science Officer','Navigator','Engineer','Communications','Doctor'];
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE_PATH?pathToFileURL(path.resolve(process.env.PLAYWRIGHT_MODULE_PATH)).href:'playwright');
const browser=await chromium.launch({channel:'msedge',headless:true,args:['--mute-audio']});
let context,page,errors,imported;
const report={build:health.build,scope:'Compiled game, fictional UI imports, physically muted disposable Edge; no owner profile or saves',cases:[]};
const button=name=>page.getByRole('button',{name,exact:typeof name==='string'});
const select=role=>page.getByRole('combobox',{name:`${role} assignment`,exact:true}).last();
const raw=()=>page.evaluate(()=>localStorage.getItem('starflight_save_slot_E'));
const snapshot=async()=>JSON.parse(await raw()).snapshot;
async function load(patch={},size={width:1440,height:1000}) {
  await context?.close();context=await browser.newContext({viewport:size});
  await context.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  page=await context.newPage();page.setDefaultTimeout(10000);errors=[];const ownErrors=errors;page.on('pageerror',error=>ownErrors.push(error.message));
  const f=structuredClone(fixture);
  Object.assign(f.data.snapshot,{location:'Starport',inRoom:true,starportRoomIndex:2,cinematicState:'none',cinematicRemaining:0,encounterCooldown:99999,flaresStopped:true,...patch});
  Object.assign(f.data.snapshot.settings,{musicVolume:0,soundVolume:0,voicesVolume:0,banterEnabled:false,textSpeed:'Instant'});
  await page.goto(url);await button('IMPORT SAVE').click();await button(/^Slot E/).click();await page.getByRole('textbox').fill(JSON.stringify(f));
  await button('Restore Mission to Slot E').click();imported=await raw();await button(/^Launch Mission/).click();await button('PAUSE').waitFor();
}
async function openCrew(){await button('PAUSE').click();await button('Crew Assignments').click();await select('Captain').waitFor();}
async function persist(){await button('Mission').click();await button('Save Mission (Slot E)').click();await page.waitForTimeout(100);return snapshot();}
async function check(name,fn){console.log('START '+name);try{await fn();assert.deepEqual(errors,[]);report.cases.push({name,passed:true});}catch(error){report.cases.push({name,passed:false,error:String(error.stack??error),pageErrors:errors});await page?.screenshot({path:path.join(out,name+'-failed.png')}).catch(()=>{});}console.log(JSON.stringify(report.cases.at(-1)));await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));}
try {
  await check('six-distinct-roles-disabled-options-and-handler-guard',async()=>{
    await load();const posts=fixture.data.snapshot.assignedPosts;
    for(const role of roles) for(const other of roles) {
      const option=select(role).locator('option').filter({hasText:fixture.data.snapshot.crewRoster.find(c=>c.id===posts[other]).name});
      assert.equal(await option.isDisabled(),role!==other,`${role} / ${other}`);
    }
    // Bypass the disabled option in the disposable DOM. The event handler must still reject it.
    const before=await raw();await select('Navigator').evaluate((element,id)=>{const option=[...element.options].find(option=>option.value===id);option.disabled=false;const setter=Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set;setter.call(element,id);element.dispatchEvent(new Event('change',{bubbles:true}));},posts.Captain);
    await page.waitForTimeout(150);assert.equal(await raw(),before);
    // A valid follow-up update proves the rejected DOM edit never changed the model.
    await select('Doctor').selectOption('');const after=await snapshot();assert.equal(after.assignedPosts.Navigator,posts.Navigator);assert.equal(after.assignedPosts.Doctor,null);
  });
  await check('vacate-move-and-swap-persist-after-reload',async()=>{
    await load();const posts=fixture.data.snapshot.assignedPosts;
    await select('Captain').selectOption('');await select('Doctor').selectOption('');
    await select('Doctor').selectOption(posts.Captain);await select('Captain').selectOption(posts.Doctor);
    const saved=await snapshot();assert.equal(saved.assignedPosts.Doctor,posts.Captain);assert.equal(saved.assignedPosts.Captain,posts.Doctor);assert.equal(new Set(Object.values(saved.assignedPosts)).size,6);
    await page.reload();await page.getByTestId('resume-slot-E').click();assert.equal(await select('Captain').inputValue(),posts.Doctor);assert.equal(await select('Doctor').inputValue(),posts.Captain);
    await page.screenshot({path:path.join(out,'starport-assignments.png')});
  });
  await check('legacy-all-roles-same-officer-no-write-until-confirmation',async()=>{
    const id=fixture.data.snapshot.assignedPosts.Captain,duplicates=Object.fromEntries(roles.map(role=>[role,id]));
    await load({location:'In Orbit',inRoom:false,currentStarId:1,orbitPlanetIndex:0,assignedPosts:duplicates});
    await page.getByRole('alert').filter({hasText:'older mission'}).waitFor();
    assert.equal(await raw(),imported);assert.equal(await select('Captain').inputValue(),id);for(const role of roles.slice(1))assert.equal(await select(role).inputValue(),'');
    assert(await button('Close pause menu').isDisabled());assert(await button('Mission').isDisabled());
    await page.keyboard.press('Escape');await page.waitForTimeout(250);assert(await button('Confirm crew assignments and save').isVisible());
    for(const role of roles.slice(1)) await select(role).selectOption(fixture.data.snapshot.assignedPosts[role]);
    await page.waitForTimeout(500);assert.equal(await raw(),imported,'Review changes must not autosave');
    await page.screenshot({path:path.join(out,'legacy-review.png')});
    await button('Confirm crew assignments and save').click();await page.waitForTimeout(100);const after=await snapshot(),before=JSON.parse(imported).snapshot;
    assert.deepEqual(after.assignedPosts,fixture.data.snapshot.assignedPosts);for(const key of ['location','galaxyShipX','galaxyShipY','credits','stardateDay','engineClass','artifactsInHold'])assert.deepEqual(after[key],before[key],key);
    assert.deepEqual(after.cargoHold,{...before.cargoHold,Endurium:0});assert.deepEqual(after.crewRoster.map(({portraitId,...member})=>member),before.crewRoster.map(({portraitId,...member})=>member));
    assert(await button('Close pause menu').isEnabled());await button('Close pause menu').click();await button('Science').click();assert(await page.getByRole('region',{name:'Planetary sensors'}).isVisible());
    await page.reload();await page.getByTestId('resume-slot-E').click();assert.equal(await button('Confirm crew assignments and save').count(),0);
  });
  await check('legacy-one-person-mission-can-continue-with-vacancies',async()=>{
    const member=fixture.data.snapshot.crewRoster[0];await load({location:'Hyperspace',inRoom:false,currentStarId:1,crewRoster:[member],assignedPosts:Object.fromEntries(roles.map(role=>[role,member.id]))});
    await select('Captain').selectOption('');await select('Navigator').selectOption(member.id);assert.equal(await raw(),imported);
    await button('Confirm crew assignments and save').click();await page.waitForTimeout(100);const after=await snapshot();assert.equal(after.crewRoster.length,1);assert.equal(after.assignedPosts.Navigator,member.id);assert.equal(Object.values(after.assignedPosts).filter(Boolean).length,1);
    await button('Close pause menu').click();await button('Navigation').click();assert(await button('[Maneuver]').isEnabled());
  });
  await check('legacy-review-can-be-cancelled-without-changing-checkpoint',async()=>{
    const id=fixture.data.snapshot.assignedPosts.Captain;
    await load({assignedPosts:Object.fromEntries(roles.map(role=>[role,id]))});
    await select('Doctor').selectOption(fixture.data.snapshot.assignedPosts.Doctor);
    await button('Cancel review and return to title without saving').click();
    await button('IMPORT SAVE').waitFor();await page.waitForTimeout(500);assert.equal(await raw(),imported);
    await page.getByTestId('resume-slot-E').click();assert(await button('Confirm crew assignments and save').isVisible());
    assert.equal(await select('Doctor').inputValue(),'');assert.equal(await raw(),imported);
  });
  for(const location of ['Hyperspace','Star System','In Orbit','Terrain Vehicle']) await check('paused-reassignment-'+location.replaceAll(' ','-'),async()=>{
    const currentStarId=1;
    await load({location,inRoom:false,currentStarId,orbitPlanetIndex:location==='In Orbit'||location==='Terrain Vehicle'?0:null});
    await openCrew();await select('Navigator').selectOption('');
    const captain=fixture.data.snapshot.assignedPosts.Captain;assert(await select('Navigator').locator(`option[value="${captain}"]`).isDisabled());
    await select('Navigator').selectOption(fixture.data.snapshot.assignedPosts.Navigator);const saved=await persist();assert.equal(saved.location,location);assert.equal(new Set(Object.values(saved.assignedPosts)).size,6);
  });
  await check('incomplete-crew-blocks-launch-and-six-unique-launches',async()=>{
    const posts={...fixture.data.snapshot.assignedPosts,Doctor:null};await load({starportRoomIndex:6,assignedPosts:posts});
    assert(await button('CLEAR GANTRY & LAUNCH TO SPACE').isDisabled());assert.match(await button('CLEAR GANTRY & LAUNCH TO SPACE').getAttribute('title'),/Crew Assignment/);
    assert.equal((await snapshot()).location,'Starport');
    // Open the paused assignment controls without moving the ship or hiring anyone.
    if(!await button('Crew Assignments').isVisible())await button('PAUSE').click();await button('Crew Assignments').click();await select('Doctor').selectOption(fixture.data.snapshot.assignedPosts.Doctor);
    await button('Close pause menu').click();await button('CLEAR GANTRY & LAUNCH TO SPACE').click();await button('Navigation').waitFor({timeout:25000});
    const saved=await snapshot();assert.equal(saved.location,'Star System');assert.equal(new Set(Object.values(saved.assignedPosts)).size,6);
  });
  await check('compact-paused-crew-controls-visible-and-usable',async()=>{
    await load({location:'In Orbit',inRoom:false,currentStarId:1,orbitPlanetIndex:0},{width:390,height:844});await openCrew();
    for(const role of roles){await select(role).scrollIntoViewIfNeeded();assert(await select(role).isVisible());const box=await select(role).boundingBox();assert(box.x>=0&&box.x+box.width<=391);}
    await select('Doctor').selectOption('');await select('Doctor').selectOption(fixture.data.snapshot.assignedPosts.Doctor);await page.screenshot({path:path.join(out,'compact-crew.png')});
  });
  report.status=report.cases.length>0&&report.cases.every(test=>test.passed)?'passed':'failed';if(report.status!=='passed')process.exitCode=1;
} finally {await context?.close();await browser.close();await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,passed:report.cases.filter(test=>test.passed).length,failed:report.cases.filter(test=>!test.passed).length}));}

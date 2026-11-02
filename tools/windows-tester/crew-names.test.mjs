import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';import {pathToFileURL} from 'node:url';import {createServer} from 'vite';
const url=process.env.JUNIOR_NAMES_URL??'http://127.0.0.1:5240/starflight-junior-crew/',out=path.resolve(process.env.JUNIOR_NAMES_EVIDENCE??'artifacts/crew-names-20261101/browser');assert.equal(new URL(url).hostname,'127.0.0.1');assert.notEqual(new URL(url).port,'4174');await fs.mkdir(out,{recursive:true});
const ssr=await createServer({configFile:false,optimizeDeps:{noDiscovery:true,entries:[]},cacheDir:path.join(out,'ssr'),server:{middlewareMode:true,hmr:false,ws:false,watch:null},appType:'custom'});
const {NAME_POOLS}=await ssr.ssrLoadModule('/utils/personnel.ts'),{RACE_SPECS}=await ssr.ssrLoadModule('/App.tsx');await ssr.close();
const sources=Object.keys(NAME_POOLS),races=['Human','Velox','Thrynn','Elowan','Android'],allNames=Object.values(NAME_POOLS).flat().map(name=>name.toLowerCase());
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE_PATH?pathToFileURL(path.resolve(process.env.PLAYWRIGHT_MODULE_PATH)).href:'playwright'),browser=await chromium.launch({channel:'msedge',headless:true,args:['--mute-audio']});
const health=await(await fetch(new URL('/__junior_tester__/status',url))).json(),report={build:health.build,scope:'Compiled recruitment form, physically muted disposable Edge and fictional imports; no owner profile/saves',cases:[]};let context,page,errors;
const button=name=>page.getByRole('button',{name,exact:typeof name==='string'}),source=()=>page.getByRole('combobox',{name:'Name source',exact:true}),mode=()=>page.getByRole('combobox',{name:'Name mode',exact:true}),style=()=>page.getByRole('combobox',{name:'Name and portrait style',exact:true}),race=()=>page.locator('#recruit-species'),name=()=>page.locator('#recruit-name'),portrait=()=>page.getByRole('region',{name:'Recruit portrait preview'}).locator('[data-portrait-id]');
const raw=()=>page.evaluate(()=>localStorage.getItem('starflight_save_slot_E')),snapshot=async()=>JSON.parse(await raw()).snapshot;
async function load(patch={},width=1440,height=1000){await context?.close();context=await browser.newContext({viewport:{width,height}});await context.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());page=await context.newPage();page.setDefaultTimeout(12000);errors=[];const ownErrors=errors;page.on('pageerror',error=>ownErrors.push(error.message));const f=JSON.parse(await fs.readFile('test-fixtures/commissioned-mission.json','utf8'));Object.assign(f.data.snapshot,{location:'Starport',inRoom:true,starportRoomIndex:1,cinematicState:'none',cinematicRemaining:0,flaresStopped:true,...patch});Object.assign(f.data.snapshot.settings,{musicVolume:0,soundVolume:0,voicesVolume:0,banterEnabled:false});await page.goto(url);await button('IMPORT SAVE').click();await button(/^Slot E/).click();await page.getByRole('textbox').fill(JSON.stringify(f));await button('Restore Mission to Slot E').click();await button(/^Launch Mission/).click();await button('[Create]').waitFor();}
async function check(label,fn){try{await fn();assert.deepEqual(errors,[]);report.cases.push({name:label,passed:true});console.log('PASS '+label);}catch(error){report.cases.push({name:label,passed:false,error:String(error.stack??error),pageErrors:errors});await page?.screenshot({path:path.join(out,label.replaceAll(/[^a-z0-9-]/gi,'-')+'-failed.png')}).catch(()=>{});console.log('FAIL '+label+' '+error.message);}await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));}
try{
 await load();
 // Establish the ordinary migrated checkpoint first: the legacy fixture has no
 // portrait IDs, and the existing loader assigns them once before any recruit.
 await button('PAUSE').click();await button('Mission').click();await button('Save Mission (Slot E)').click();await button('RESUME MISSION').click();
 await button('[Create]').click();const unchanged=await raw();
 await check('recruit-dialog-uses-full-game-overlay-without-parent-clipping',async()=>{
  const dialog=page.getByRole('dialog',{name:'ENLIST CREW RECRUIT (FREE)',exact:true});const box=await dialog.boundingBox();assert(box.x>=0&&box.y>=0&&box.width===1440&&box.height===1000);
  const action=await button('Enlist Recruit').boundingBox();assert(action.y>=0&&action.y+action.height<=1000,'Desktop enlist action is visible without scrolling the Personnel panel');
 });
 for(const category of sources)for(const kind of ['existing','unique'])await check(category+'-'+kind+'-all-five-species',async()=>{
  await source().selectOption(category);await mode().selectOption(kind);await style().selectOption('auto');
  for(const species of races){await race().selectOption(species);await button('Generate name').click();const first=await name().inputValue();assert(first.length>0&&first.length<=14);if(kind==='existing')assert(NAME_POOLS[category].includes(first));else assert(!allNames.includes(first.toLowerCase()));assert.equal(await portrait().getAttribute('data-portrait-race'),species);await button('Generate name').click();assert.notEqual(await name().inputValue(),first);}
 });
 await check('preferred-style-matches-human-portrait-for-every-source',async()=>{
  await race().selectOption('Human');await mode().selectOption('unique');
  for(const category of sources)for(const presentation of ['masculine','feminine']){await source().selectOption(category);await style().selectOption(presentation);await button('Generate name').click();const id=await portrait().getAttribute('data-portrait-id');assert((presentation==='feminine'?['human-02','human-04','human-05','human-07','human-09']:['human-01','human-03','human-06','human-08','human-10']).includes(id));}
 });
 await check('known-name-matches-portrait-even-with-conflicting-preference',async()=>{
  await race().selectOption('Human');await style().selectOption('masculine');await name().fill('Leia Organa');assert(['human-02','human-04','human-05','human-07','human-09'].includes(await portrait().getAttribute('data-portrait-id')));
  await name().fill('Spock');await style().selectOption('feminine');assert(['human-01','human-03','human-06','human-08','human-10'].includes(await portrait().getAttribute('data-portrait-id')));
  await name().fill('Custom Recruit');assert(['human-02','human-04','human-05','human-07','human-09'].includes(await portrait().getAttribute('data-portrait-id')));
  await page.screenshot({path:path.join(out,'desktop-recruit.png')});
 });
 await check('draft-generation-does-not-write-saved-mission',async()=>{assert.equal(await raw(),unchanged);});
 for(const species of races)await check('preview-enlist-reload-preserves-'+species,async()=>{
  if(!await name().isVisible())await button('[Create]').click();await race().selectOption(species);await mode().selectOption('unique');await source().selectOption('Starflight 2');await style().selectOption('feminine');await button('Generate name').click();
  const selected=await name().inputValue(),face=await portrait().getAttribute('data-portrait-id'),before=await snapshot();await button('Enlist Recruit').click();await page.waitForFunction(selected=>JSON.parse(localStorage.getItem('starflight_save_slot_E')).snapshot.crewRoster.some(member=>member.name===selected),selected);const after=await snapshot(),member=after.crewRoster.find(member=>member.name===selected);
  assert.equal(member.portraitId,face);assert.equal(member.race,species);assert.deepEqual(member.skills,RACE_SPECS[species].baseSkills);assert.equal(after.credits,before.credits);assert.deepEqual(after.assignedPosts,before.assignedPosts);assert.deepEqual(after.crewRoster.slice(0,-1),before.crewRoster);
  await page.reload();await page.getByTestId('resume-slot-E').click();assert.equal((await snapshot()).crewRoster.find(member=>member.name===selected).portraitId,face);
  await page.getByRole('button').filter({has:page.getByText(selected,{exact:true})}).click();
  const resumedFace=page.getByRole('img',{name:`${selected}, ${species}, ready`,exact:true});
  await resumedFace.waitFor();assert.equal(await resumedFace.getAttribute('data-portrait-id'),face);
 });
 await check('source-and-preferred-style-drive-all-species-spelling',async()=>{
  await load();await button('[Create]').click();await mode().selectOption('unique');
  // Deterministic fictional draft only; the fresh campaign never seeds randomness.
  await page.evaluate(()=>{window.__qaNameRandom=Math.random;Math.random=()=>0;});
  const samples=[];
  try{
   for(const species of races)for(const category of sources)for(const preferred of ['masculine','feminine','neutral']){
    await race().selectOption(species);await source().selectOption(category);await style().selectOption(preferred);await name().fill('');await button('Generate name').click();
    samples.push({species,category,preferred,name:await name().inputValue()});
   }
   for(const species of races)for(const category of sources)assert.equal(new Set(samples.filter(s=>s.species===species&&s.category===category).map(s=>s.name)).size,3,category+'/'+species+' styles');
   for(const preferred of ['masculine','feminine','neutral']){
    assert.equal(new Set(samples.filter(s=>s.species==='Human'&&s.preferred===preferred).map(s=>s.name.split(' ')[0])).size,sources.length,'Source-specific human given names');
    for(const species of races)assert.equal(new Set(samples.filter(s=>s.species===species&&s.preferred===preferred).map(s=>s.name)).size,sources.length,'Source-specific spelling for '+species+'/'+preferred);
   }
   await fs.writeFile(path.join(out,'source-style-samples.json'),JSON.stringify(samples,null,2));
  }finally{await page.evaluate(()=>{Math.random=window.__qaNameRandom;delete window.__qaNameRandom;});}
 });
 await check('exhausted-canonical-list-disabled-without-fake-names-or-save-write',async()=>{
  const f=JSON.parse(await fs.readFile('test-fixtures/commissioned-mission.json','utf8')),roster=f.data.snapshot.crewRoster;
  await load({crewRoster:[...roster,...NAME_POOLS['Starflight 2'].map((name,index)=>({...roster[0],id:`lore-${index}`,name}))]});await button('[Create]').click();await source().selectOption('Starflight 2');await mode().selectOption('existing');const before=await raw();assert(!await button('Generate name').isEnabled());await page.getByText('All matching existing names are in use.',{exact:false}).waitFor();
  await button('Generate name').evaluate(element=>{element.disabled=false;element.click();});assert.equal(await name().inputValue(),'');assert.equal(await raw(),before);await mode().selectOption('unique');assert(await button('Generate name').isEnabled());await button('Generate name').click();assert(!NAME_POOLS['Starflight 2'].includes(await name().inputValue()));
 });
 await check('compact-form-all-controls-preview-and-enlist-accessible',async()=>{
  await load({},390,844);await button('[Create]').click();
  for(const field of [source(),mode(),style(),race(),name()]){await field.scrollIntoViewIfNeeded();const box=await field.boundingBox();assert(box.x>=0&&box.x+box.width<=391);}
  await source().selectOption('Starflight 1');await mode().selectOption('unique');await style().selectOption('feminine');await button('Generate name').click();await portrait().scrollIntoViewIfNeeded();assert(await portrait().isVisible());await button('Enlist Recruit').scrollIntoViewIfNeeded();assert(await button('Enlist Recruit').isVisible());await page.screenshot({path:path.join(out,'compact-recruit.png')});
 });
 report.status=report.cases.length>0&&report.cases.every(test=>test.passed)?'passed':'failed';if(report.status!=='passed')process.exitCode=1;
}finally{await context?.close();await browser.close();await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,passed:report.cases.filter(test=>test.passed).length,failed:report.cases.filter(test=>!test.passed).length}));}

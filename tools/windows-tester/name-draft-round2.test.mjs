import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const url = new URL(process.env.JUNIOR_DRAFT_URL ?? 'http://127.0.0.1:5491/starflight-junior-crew/');
assert.equal(url.hostname,'127.0.0.1');
assert.notEqual(url.port,'4174','Use the disposable tester server');
const out = path.resolve(process.env.JUNIOR_DRAFT_EVIDENCE ?? 'artifacts/independent-pass-20261101/name-draft-baseline');
await fs.mkdir(out,{recursive:true});
const health = await (await fetch(new URL('/__junior_tester__/status',url))).json();
assert.equal(health.server,'starflight-junior-crew-windows-tester-v1');
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE_PATH ? pathToFileURL(path.resolve(process.env.PLAYWRIGHT_MODULE_PATH)).href : 'playwright');
const fixture = JSON.parse(await fs.readFile('test-fixtures/commissioned-mission.json','utf8'));
const report = {build:health.build,url:url.href,scope:'Disposable, muted Edge. Public recruitment UI and fictional Slot E.',cases:[]};
const browser = await chromium.launch({channel:'msedge',headless:true,args:['--mute-audio']});
const androidFaces = {masculine:['01','03','05','07','10'],feminine:['02','04','06','08']};

async function test(name,run,makeRoster) {
  const context = await browser.newContext({viewport:{width:1440,height:1000}});
  const errors = [];
  const page = await context.newPage();
  try {
    await context.route('**/*',route=>new URL(route.request().url()).origin===url.origin ? route.continue() : route.abort());
    page.setDefaultTimeout(12000);
    page.on('pageerror',error=>errors.push(error.message));
    const mission = structuredClone(fixture);
    const snapshot = mission.data.snapshot;
    Object.assign(snapshot,{location:'Starport',inRoom:true,starportRoomIndex:1,cinematicState:'none',cinematicRemaining:0,flaresStopped:true});
    Object.assign(snapshot.settings,{musicVolume:0,soundVolume:0,voicesVolume:0,banterEnabled:false});
    if (makeRoster) {
      snapshot.crewRoster = makeRoster(snapshot.crewRoster);
      snapshot.assignedPosts = Object.fromEntries(Object.keys(snapshot.assignedPosts).map(post=>[post,null]));
    }
    const button = name=>page.getByRole('button',{name,exact:typeof name==='string'});
    await page.goto(url.href);
    await button('IMPORT SAVE').click();
    await button(/^Slot E/).click();
    await page.getByRole('textbox').fill(JSON.stringify(mission));
    await button('Restore Mission to Slot E').click();
    await button(/^Launch Mission/).click();
    await button('[Create]').click();
    const field = name=>page.getByRole('combobox',{name,exact:true});
    const draft = page.locator('#recruit-name');
    const preview = page.getByRole('region',{name:'Recruit portrait preview'}).getByRole('img');
    const generate = button('Generate name');
    const ui = {page,button,draft,preview,source:field('Name source'),mode:field('Name mode'),style:field('Name and portrait style'),species:page.locator('#recruit-species'),generate};
    await run(ui);
    assert.deepEqual(errors,[]);
    report.cases.push({name,passed:true});
    console.log('PASS '+name);
  } catch (error) {
    report.cases.push({name,passed:false,error:error.message,pageErrors:errors});
    await page.screenshot({path:path.join(out,name+'-failed.png')}).catch(()=>{});
    console.error('FAIL '+name+' '+error.message);
  } finally {
    await context.close();
    await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
  }
}

async function assertFace(preview,style) {
  const id = await preview.getAttribute('data-portrait-id');
  assert(androidFaces[style].some(index=>'android-'+index===id),`Expected a ${style} Android face, got ${id}`);
}

async function generateAndroid({page,source,mode,style,species,generate,draft,preview}) {
  await source.selectOption('Starflight 2');
  await mode.selectOption('unique');
  await species.selectOption('Android');
  await style.selectOption('feminine');
  // Only this single draft action receives a fixed roll. Restore game randomness before proceeding.
  await page.evaluate(()=>{window.__qaOriginalRandom=Math.random;Math.random=()=>0;});
  try {await generate.click();}
  finally {await page.evaluate(()=>{Math.random=window.__qaOriginalRandom;delete window.__qaOriginalRandom;});}
  assert.equal(await draft.inputValue(),'Phalia-PX101');
  await assertFace(preview,'feminine');
}

try {
  await test('cancelled-generated-name-retyped-as-new-recruit',async ui=>{
    await generateAndroid(ui);
    await ui.button('Cancel').click();
    await ui.button('[Create]').click();
    assert.equal(await ui.draft.inputValue(),'');
    await ui.style.selectOption('masculine');
    await ui.draft.fill('Phalia-PX101');
    await assertFace(ui.preview,'masculine');
  });
  await test('manual-edit-clears-generated-presentation-in-same-draft',async ui=>{
    await generateAndroid(ui);
    await ui.style.selectOption('masculine');
    await ui.draft.fill('Custom');
    await assertFace(ui.preview,'masculine');
    await ui.draft.fill('Phalia-PX101');
    await assertFace(ui.preview,'masculine');
  });
  for (const source of ['Star Trek','The Expanse']) {
    await test('no-neutral-style-matches-'+source.replaceAll(' ','-').toLowerCase(),async ui=>{
      await ui.mode.selectOption('existing');
      await ui.source.selectOption(source);
      await ui.style.selectOption('neutral');
      assert(await ui.generate.isDisabled());
      const explanation = await ui.page.getByRole('dialog').getByRole('status').innerText();
      assert.match(explanation,/style/i);
      assert.doesNotMatch(explanation,/in use|used up|exhaust/i,'The roster and draft are empty');
      await ui.style.selectOption('auto');
      assert(await ui.generate.isEnabled(),'Changing style makes existing names available');
    },()=>[]);
  }
  await test('used-existing-pool-distinct-from-no-style-matches',async ui=>{
    await ui.mode.selectOption('existing');
    await ui.source.selectOption('Starflight 2');
    await ui.style.selectOption('auto');
    assert(await ui.generate.isDisabled());
    assert.match(await ui.page.getByRole('dialog').getByRole('status').innerText(),/in use|used up|exhaust/i);
  },roster=>['Phloon de Lux','Slim','Ptexok','Rrexolixi','Cionia','Nix Killjoy','Xenopotex']
    .map((name,index)=>({...roster[0],id:'lore-'+index,name})));
  await test('enlisted-portrait-rendered-in-resumed-personnel-dossier',async ui=>{
    await generateAndroid(ui);
    const face = await ui.preview.getAttribute('data-portrait-id');
    await ui.button('Enlist Recruit').click();
    await ui.page.waitForFunction(()=>JSON.parse(localStorage.getItem('starflight_save_slot_E')).snapshot.crewRoster.some(member=>member.name==='Phalia-PX101'));
    await ui.page.reload();
    await ui.page.getByTestId('resume-slot-E').click();
    await ui.page.getByRole('button').filter({has:ui.page.getByText('Phalia-PX101',{exact:true})}).click();
    const portrait = ui.page.getByRole('img',{name:'Phalia-PX101, Android, ready',exact:true});
    await portrait.waitFor();
    assert.equal(await portrait.getAttribute('data-portrait-id'),face);
    assert((await portrait.evaluate(node=>getComputedStyle(node).backgroundImage)).includes('/'+face+'.webp'));
  });
} finally {
  await browser.close();
  report.status = report.cases.length===6 && report.cases.every(row=>row.passed) ? 'passed' : 'failed';
  await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
  if (report.status !== 'passed') process.exitCode=1;
}

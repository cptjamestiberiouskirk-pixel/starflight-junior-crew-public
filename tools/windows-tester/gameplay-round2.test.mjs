import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createServer} from 'vite';

const url = new URL(process.env.JUNIOR_ROUND2_URL ?? 'http://127.0.0.1:5491/starflight-junior-crew/');
assert.equal(url.hostname,'127.0.0.1');
assert(!['4174','4188'].includes(url.port),'Use a disposable tester server');
const out=path.resolve(process.env.JUNIOR_ROUND2_EVIDENCE ?? 'artifacts/independent-pass-20261101/gameplay-round2');
assert(out.startsWith(path.resolve('artifacts')+path.sep));
await fs.mkdir(out,{recursive:true});
const ssr=await createServer({configFile:false,cacheDir:path.join(out,'cache'),optimizeDeps:{noDiscovery:true,entries:[]},server:{middlewareMode:true,ws:false,watch:null},appType:'custom'});
const {UNIVERSE}=await ssr.ssrLoadModule('/galaxy.ts');
const {CANONICAL_ARTIFACTS}=await ssr.ssrLoadModule('/surface.ts');
const {createAlienShip}=await ssr.ssrLoadModule('/alien.ts');
const {isPlayableSave}=await ssr.ssrLoadModule('/utils/save-codec.ts');
await ssr.close();
const health=await (await fetch(new URL('/__junior_tester__/status',url))).json();
assert.equal(health.server,'starflight-junior-crew-windows-tester-v1');
const fixture=JSON.parse(await fs.readFile('test-fixtures/commissioned-mission.json','utf8'));
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE_PATH?pathToFileURL(path.resolve(process.env.PLAYWRIGHT_MODULE_PATH)).href:'playwright');
const browser=await chromium.launch({channel:'msedge',headless:true,args:['--mute-audio']});
let context,page,errors;
const report={build:health.build,scope:'Physically muted Edge, zero-volume fictional imports in fresh contexts, real compiled UI',cases:[]};
const button=name=>page.getByRole('button',{name,exact:typeof name==='string'});
async function load(patch) {
  await context?.close();
  context=await browser.newContext({viewport:{width:1200,height:820}});
  await context.route('**/*',route=>new URL(route.request().url()).origin===url.origin?route.continue():route.abort());
  page=await context.newPage();
  page.setDefaultTimeout(25000);
  const sessionErrors=[];
  errors=sessionErrors;
  page.on('pageerror',error=>sessionErrors.push(error.message));
  const f=structuredClone(fixture),s=f.data.snapshot;
  Object.assign(s,{inRoom:false,cinematicState:'none',cinematicRemaining:0,encounterCooldown:9999,flaresStopped:true,...patch});
  Object.assign(s.settings,{musicVolume:0,soundVolume:0,voicesVolume:0,banterEnabled:false,textSpeed:'Instant'});
  assert(isPlayableSave(f.data),'Fixture must be playable through the ordinary import UI');
  await page.goto(url.href);
  await button('IMPORT SAVE').click();
  await button(/^Slot E/).click();
  await page.getByRole('textbox').fill(JSON.stringify(f));
  await button('Restore Mission to Slot E').click();
  await button(/^Launch Mission/).click();
  await button('PAUSE').waitFor();
}
async function run(name,fn) {
  if(process.env.JUNIOR_ROUND2_CASE&&!name.includes(process.env.JUNIOR_ROUND2_CASE))return;
  const observed={};
  try {
    await fn(observed);
    assert.deepEqual(errors,[]);
    report.cases.push({name,passed:true,observed});
  } catch(error) {
    report.cases.push({name,passed:false,error:String(error.stack??error),observed,pageErrors:errors});
    await page?.screenshot({path:path.join(out,name+'-failed.png'),timeout:4000}).catch(()=>{});
  }
  console.log(name,report.cases.at(-1).passed?'PASS':'FAIL',JSON.stringify(observed));
  await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));
}
const crystal=UNIVERSE.stars.find(s=>s.x===192&&s.y===152);
const earth=UNIVERSE.stars.find(s=>s.x===215&&s.y===86);
async function readSensors(star,index,ids) {
  const items=ids.map(id=>{const item=CANONICAL_ARTIFACTS.find(a=>a.id===id);assert(item,id);return structuredClone(item);});
  await load({location:'In Orbit',currentStarId:star.id,galaxyShipX:star.x,galaxyShipY:star.y,orbitPlanetIndex:index,artifactsInHold:items,flaresStopped:false});
  await button('Science').click();
  await button('Scan planet').click();
  await page.waitForFunction(()=>document.querySelector('progress[aria-label="Planetary scan progress"]')?.value===3);
  await button('[Return to Bridge]').click();
  return page.getByRole('log',{name:'Filtered bridge messages'}).getByText(/SENSOR READING:/).first().innerText();
}
try {
  await run('both-instruments-identify-the-real-nexus',async o=>{
    o.reading=await readSensors(crystal,0,['crystal-orb','crystal-cone','red-cylinder']);
    assert.match(o.reading,/Nexus at 47N 45E\]/);
    assert.match(o.reading,/Control Nexus pinpointed at 47N 45E!/);
  });
  await run('west-longitude-without-a-minus-sign',async o=>{
    o.reading=await readSensors(earth,2,['red-cylinder','crystal-cone']);
    assert.match(o.reading,/Ruins of Ancient Earth at 11N 104W\]/);
    assert.doesNotMatch(o.reading,/CONE HARMONICS/);
  });
  await run('absent-instruments-keep-the-nexus-hidden',async o=>{
    o.reading=await readSensors(crystal,0,['crystal-orb']);
    assert.doesNotMatch(o.reading,/CONE HARMONICS|RED CYLINDER OVERLAY|Control Nexus/);
  });
  await run('release-direction-after-focusing-log-search',async o=>{
    await load({location:'Hyperspace',galaxyShipX:10,galaxyShipY:1,orbitPlanetIndex:null,engineClass:5});
    await button('Navigation').click();await button('[Maneuver]').click();
    const selector='[data-flight-hud] [title^="POS"]',pos=page.locator(selector);o.start=await pos.innerText();
    await page.keyboard.down('d');await page.waitForFunction(([selector,start])=>document.querySelector(selector)?.innerText!==start,[selector,o.start]);
    await page.getByRole('searchbox',{name:'Bridge log search'}).focus();await page.keyboard.up('d');await page.waitForTimeout(250);
    o.released=await pos.innerText();await page.waitForTimeout(1200);o.after=await pos.innerText();assert.equal(o.after,o.released,'Releasing movement over an editing control stops the ship');
  });
  const releases=[
    {name:'release-shift-before-direction',code:'KeyD',down:'D',up:'d',vk:68,shiftOnPress:true},
    {name:'ordinary-direction-release',code:'KeyD',down:'d',up:'d',vk:68},
    {name:'release-digit-with-shift-held',code:'Digit6',down:'6',up:'^',vk:54,shiftOnRelease:true},
  ];
  for(const action of releases)await run(action.name,async o=>{
    await load({location:'Hyperspace',galaxyShipX:10,galaxyShipY:1,orbitPlanetIndex:null,engineClass:5});
    await button('Navigation').click(); await button('[Maneuver]').click();
    const posSelector='[data-flight-hud] [title^="POS"]';
    const pos=page.locator(posSelector);
    o.start=await pos.innerText();
    await page.evaluate(()=>{
      window.observedRound2Keys=[];
      for(const type of ['keydown','keyup'])window.addEventListener(type,e=>window.observedRound2Keys.push({type,key:e.key,code:e.code,trusted:e.isTrusted}));
    });
    // Explicit trusted protocol descriptors reproduce a physical key whose
    // text changes when Shift is pressed or released.
    const cdp=await context.newCDPSession(page);
    const key=(type,key,code,virtualKey,modifiers=0)=>cdp.send('Input.dispatchKeyEvent',{type,key,code,windowsVirtualKeyCode:virtualKey,modifiers});
    if(action.shiftOnPress)await key('keyDown','Shift','ShiftLeft',16,8);
    await key('keyDown',action.down,action.code,action.vk,action.shiftOnPress?8:0);
    await page.waitForFunction(([selector,start])=>document.querySelector(selector)?.innerText!==start,[posSelector,o.start]);
    if(action.shiftOnPress)await key('keyUp','Shift','ShiftLeft',16);
    if(action.shiftOnRelease)await key('keyDown','Shift','ShiftLeft',16,8);
    await key('keyUp',action.up,action.code,action.vk,action.shiftOnRelease?8:0);
    if(action.shiftOnRelease)await key('keyUp','Shift','ShiftLeft',16);
    o.events=await page.evaluate(()=>window.observedRound2Keys);
    assert(o.events.every(e=>e.trusted));
    o.release=await pos.innerText();
    const clock=page.locator('[data-flight-hud] [data-expedition-clock]');
    const initialHour=await clock.innerText();
    // Compare positions across a simulated star-hour, independently of FPS.
    await page.waitForFunction(initial=>document.querySelector('[data-flight-hud] [data-expedition-clock]')?.innerText!==initial,initialHour,{timeout:90000});
    o.after=await pos.innerText();
    assert.equal(o.after,o.release);
    assert(await page.locator('[data-flight-hud]').getByText('LOC: Hyperspace',{exact:true}).isVisible());
  });
  for(const origin of ['Star System','In Orbit','Hyperspace'])await run('flare-while-intercepted-from-'+origin.replaceAll(' ','-'),async o=>{
    const ship=createAlienShip('Derelict','Derelict','round2-ship',2,6);
    const group={id:'round2-encounter',race:'Derelict',x:125,y:100,homeX:125,homeY:100,currentMood:25,baseMood:25,posture:'Neutral',ships:[ship],encounterLocation:origin,starX:125,starY:100,orbitSlot:1};
    await load({location:'Encounter',prevLocation:origin,currentStarId:1,galaxyShipX:125,galaxyShipY:100,orbitPlanetIndex:origin==='In Orbit'?0:null,activeEncounterGroup:group,combatActive:false,encounterShipPos:{x:0,y:0},stardateYear:4620,stardateMonth:10,stardateDay:30,stardateHour:23,flaresStopped:false});
    o.before=await page.locator('[data-flight-hud] [data-expedition-clock]').innerText();
    await page.waitForFunction(()=>document.body.innerText.includes('GAME OVER: INCINERATED')||document.querySelector('[data-flight-hud] [data-expedition-clock]')?.textContent.includes('01-01-4621 00:00'),undefined,{timeout:90000});
    o.incinerated=await page.getByRole('heading',{name:'GAME OVER: INCINERATED',exact:true}).isVisible();
    o.after=await page.locator('[data-flight-hud] [data-expedition-clock]').allTextContents();
    if(!o.incinerated)assert(await page.locator('[data-flight-hud]').getByText('LOC: Encounter',{exact:true}).isVisible());
    assert.equal(o.incinerated,origin!=='Hyperspace');
  });
}finally{
  await context?.close();await browser.close();
  report.status=report.cases.length&&report.cases.every(c=>c.passed)?'passed':'failed';
  if(report.status==='failed')process.exitCode=1;
  await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));
}

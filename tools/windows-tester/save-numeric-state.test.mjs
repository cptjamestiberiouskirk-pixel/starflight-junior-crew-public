import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {createServer} from 'vite';

const url=process.env.JUNIOR_NUMERIC_URL??'http://127.0.0.1:5212/starflight-junior-crew/';
assert.equal(new URL(url).hostname,'127.0.0.1');
assert.notEqual(new URL(url).port,'4174','Numeric save testing must never use the owner preview');
const out=path.resolve(process.env.JUNIOR_NUMERIC_EVIDENCE??'artifacts/second-pass-20261101/numeric-state');
await fs.mkdir(out,{recursive:true});
const ssr=await createServer({configFile:false,optimizeDeps:{noDiscovery:true,entries:[]},cacheDir:path.join(out,'ssr'),server:{middlewareMode:true,hmr:false,ws:false,watch:null},appType:'custom'});
let createAlienShip,generatePlanetSurface,UNIVERSE,isPlayableSave;
try{
  ({createAlienShip}=await ssr.ssrLoadModule('/alien.ts'));
  ({generatePlanetSurface}=await ssr.ssrLoadModule('/surface.ts'));
  ({UNIVERSE}=await ssr.ssrLoadModule('/galaxy.ts'));
  ({isPlayableSave}=await ssr.ssrLoadModule('/utils/save-codec.ts'));
}finally{await ssr.close();}
const fixture=JSON.parse(await fs.readFile('test-fixtures/commissioned-mission.json','utf8'));
const health=await(await fetch(new URL('/__junior_tester__/status',url))).json();
assert.equal(health.server,'starflight-junior-crew-windows-tester-v1');
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE_PATH?pathToFileURL(path.resolve(process.env.PLAYWRIGHT_MODULE_PATH)).href:'playwright');
const browser=await chromium.launch({channel:'msedge',headless:true,args:['--mute-audio']});
const report={build:health.build,scope:'Native public import/Continue controls; physically muted fresh disposable contexts; fictional Slot E only, no owner profile or saves',cases:[]};
let context,page,errors;
const button=name=>page.getByRole('button',{name,exact:typeof name==='string'});
function mission(patch={}){
  const value=structuredClone(fixture);
  Object.assign(value.data.snapshot,{location:'Starport',inRoom:true,starportRoomIndex:1,flaresStopped:true,cinematicState:'none',cinematicRemaining:0,...patch});
  Object.assign(value.data.snapshot.settings,{musicVolume:0,soundVolume:0,voicesVolume:0,banterEnabled:false});
  return value;
}
const star=UNIVERSE.stars[0],planet=star.planets[0],surfaceKey=`${star.x}-${star.y}-${planet.orderIndex}`;
function surfacePatch(where,velocity={}){
  const ground=generatePlanetSurface(star.x,star.y,planet,{lat:0,lon:0});
  ground.minerals=[];ground.ruins=[];ground.droppedCargo=[];
  // Stunned controls hold their imported velocity unchanged, making readback
  // independent of random wander resets. Invalid input must be rejected even
  // when currently dormant; it can become active later in the mission.
  ground.lifeforms=[{id:'qa-numeric-lifeform',speciesName:'Survey Crawler',size:'Small',volume:1,bountyValue:40,temperament:'passive',color:'#a3e635',x:0,y:.6,stunned:true,dead:false,recorded:false,captured:false,...velocity}];
  if(where==='latent')return {planetSurfaces:{[surfaceKey]:ground}};
  return {location:'Terrain Vehicle',inRoom:false,currentStarId:star.id,galaxyShipX:star.x,galaxyShipY:star.y,orbitPlanetIndex:planet.orderIndex,landingLat:0,landingLong:0,vehicleX:0,vehicleY:.6,vehicleFuel:100,currentSurfaceState:ground};
}
function projectilePatch(speed){return {location:'Encounter',inRoom:false,orbitPlanetIndex:null,activeEncounterGroup:{id:'qa-numeric-projectile',race:'Spemin',x:125,y:100,homeX:125,homeY:100,baseMood:100,currentMood:100,posture:'Hostile',attackedByPlayer:true,ships:[{...createAlienShip('Spemin','Scout','qa-numeric-target',3,18),laserClass:0,missileClass:0,isStationary:true}]},projectiles:[{id:'qa-numeric-beam',fromPlayer:false,type:'laser',x:-3,y:0,targetX:0,targetY:0,speed,damage:0,duration:30,color:'#ff2244'}]};}
const unsafe=[
  ['unsafe-positive-money',{credits:Number.MAX_VALUE/10}],
  ['unsafe-negative-money',{credits:-Number.MAX_VALUE}],
  ['unsafe-ledger-amount',{bankLedger:[{date:'01-01-4620',desc:'Fictional invalid ledger',amount:Number.MAX_VALUE,balance:11700}]}],
  ['unsafe-interest-absolute-day',{lastInterestAbsDay:-Number.MAX_VALUE}],
  ['unsafe-interest-legacy-day',{lastInterestAbsDay:undefined,lastInterestStardateDays:-Number.MAX_VALUE}],
  ['negative-projectile-speed',projectilePatch(-Number.MAX_VALUE)],
  ...['current','latent'].flatMap(where=>['vx','vy'].map(axis=>[`${where}-unsafe-${axis}`,surfacePatch(where,{[axis]:axis==='vx'?Number.MAX_VALUE:-Number.MAX_VALUE})])),
];
async function fresh(storedRaw){
  await context?.close();context=await browser.newContext({viewport:{width:1280,height:900}});
  await context.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  if(storedRaw)await context.addInitScript(raw=>{localStorage.setItem('starflight_save_slot_E',raw);localStorage.setItem('starflight_last_save_slot','E');},storedRaw);
  page=await context.newPage();page.setDefaultTimeout(9000);const pageErrors=[];errors=pageErrors;page.on('pageerror',error=>pageErrors.push(error.message));
  await page.goto(url);
}
async function importPayload(payload){await button('IMPORT SAVE').click();await button(/^Slot E/).click();await page.getByRole('textbox').fill(JSON.stringify(payload));await button('Restore Mission to Slot E').click();}
async function saved(){
  await button('PAUSE').click();await button('Mission').click();await button('Save Mission (Slot E)').click();
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('starflight_save_slot_E')));
  assert(isPlayableSave(stored),'Normal public save remains playable');return stored.snapshot;
}
async function run(name,fn){
  if(process.env.JUNIOR_NUMERIC_CASE&&!name.includes(process.env.JUNIOR_NUMERIC_CASE))return;
  try{await fn();assert.deepEqual(errors,[]);report.cases.push({name,passed:true});}
  catch(error){report.cases.push({name,passed:false,error:String(error.stack??error),pageErrors:errors});await page?.screenshot({path:path.join(out,name+'-failed.png')}).catch(()=>{});}
  await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report.cases.at(-1)));
}
try{
  for(const [name,patch] of unsafe){
    await run('import-'+name,async()=>{
      await fresh();await importPayload(mission());
      const before=await page.evaluate(()=>localStorage.getItem('starflight_save_slot_E'));assert(before,'Occupied fictional destination is required');
      await page.getByRole('textbox').fill(JSON.stringify(mission(patch)));await button('Restore Mission to Slot E').click();
      await page.getByText('Invalid or corrupted save code. No changes made.',{exact:true}).waitFor();
      assert.equal(await page.evaluate(()=>localStorage.getItem('starflight_save_slot_E')),before,'Rejected import preserves the exact occupied slot bytes');
    });
    await run('stored-'+name,async()=>{
      const raw=JSON.stringify(mission(patch).data);await fresh(raw);await button('CONTINUE MISSION').click();
      await page.getByText(/Slot E contains invalid or oversized saved mission data/).waitFor();
      assert.equal(await page.evaluate(()=>localStorage.getItem('starflight_save_slot_E')),raw,'Legacy restoration preserves invalid raw bytes for recovery');
    });
  }
  for(const credits of [0,-.5,1000000,-15000,Number.MAX_SAFE_INTEGER])await run('valid-money-'+String(credits).replace('.','-'),async()=>{
    await fresh();await importPayload(mission({credits}));await button(/^Launch Mission/).click();await button('PAUSE').waitFor();
    assert.equal((await saved()).credits,credits,'Signed/fractional and large precise historical balances survive normal import, launch and save');
  });
  await run('valid-legacy-interest-day-alias-launch-and-save',async()=>{
    await fresh();await importPayload(mission({starportRoomIndex:6,credits:10000,stardateDay:11,lastInterestAbsDay:undefined,lastInterestStardateDays:0}));
    await button(/^Launch Mission/).click();await button('PAUSE').waitFor();await button('CLEAR GANTRY & LAUNCH TO SPACE').click();await button('Navigation').waitFor({timeout:25000});
    const snapshot=await saved();assert.equal(snapshot.credits,10040,'An alias-only old slot earns exactly the original ten-day interest');
    assert.equal(snapshot.lastInterestAbsDay,10);assert.equal(snapshot.lastInterestStardateDays,10);
  });
  for(const [name,where,velocity]of [
    ['current-missing','current',{}],['current-ordinary','current',{vx:1.6,vy:-.5}],['current-large-historical','current',{vx:24000,vy:-24000}],
    ['latent-missing','latent',{}],['latent-ordinary','latent',{vx:-1.6,vy:.5}],
  ])await run('valid-'+name,async()=>{
    await fresh();await importPayload(mission(surfacePatch(where,velocity)));await button(/^Launch Mission/).click();await button('PAUSE').waitFor();
    const snapshot=await saved(),surface=where==='current'?snapshot.currentSurfaceState:snapshot.planetSurfaces[surfaceKey];
    const lifeform=surface.lifeforms.find(l=>l.id==='qa-numeric-lifeform');assert(lifeform);
    for(const axis of ['vx','vy'])assert.equal(lifeform[axis],velocity[axis],'Missing defaults and supplied historical velocities are preserved without clamping');
  });
  await run('valid-zero-projectile-speed',async()=>{
    await fresh();await importPayload(mission(projectilePatch(0)));await button(/^Launch Mission/).click();await button('PAUSE').waitFor();
    const snapshot=await saved(),projectile=snapshot.projectiles.find(p=>p.id==='qa-numeric-beam');assert(projectile,'A zero-speed non-arrived legacy beam remains present');assert.equal(projectile.speed,0);assert.equal(projectile.x,-3);
  });
  report.status=report.cases.length>0&&report.cases.every(c=>c.passed)?'passed':'failed';if(report.status!=='passed')process.exitCode=1;
}finally{
  await context?.close();await browser.close();await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify({status:report.status,passed:report.cases.filter(c=>c.passed).length,failed:report.cases.filter(c=>!c.passed).length}));
}

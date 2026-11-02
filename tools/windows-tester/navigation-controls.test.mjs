import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const out=path.resolve(process.env.JUNIOR_NAV_EVIDENCE??'artifacts/navigation-controls-20261030');await fs.mkdir(out,{recursive:true});
const url=process.env.JUNIOR_NAV_URL??'http://127.0.0.1:5197/starflight-junior-crew/';assert.equal(new URL(url).hostname,'127.0.0.1');
const health=await(await fetch(new URL('/__junior_tester__/status',url))).json();assert.equal(health.server,'starflight-junior-crew-windows-tester-v1');
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE_PATH?pathToFileURL(path.resolve(process.env.PLAYWRIGHT_MODULE_PATH)).href:'playwright');
const browser=await chromium.launch({channel:'msedge',headless:true,args:['--mute-audio']});let context,page;
const report={url,build:health.build,scope:'Muted disposable missions only; no owner browser or storage',cases:[],errors:[]};
const button=name=>page.getByRole('button',{name,exact:typeof name==='string'});
const check=(name,value)=>{assert(value,name);report.cases.push({name,passed:true});};
async function load(patch){await context?.close();context=await browser.newContext({viewport:{width:1440,height:1000}});await context.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());page=await context.newPage();page.setDefaultTimeout(20000);page.on('pageerror',e=>report.errors.push(e.message));
 const f=JSON.parse(await fs.readFile('test-fixtures/commissioned-mission.json','utf8'));Object.assign(f.data.snapshot,{flaresStopped:true,engineClass:5,laserClass:1,missileClass:1,shieldClass:1,enduriumFuel:500,encounterCooldown:9999,alienGroups:[],cinematicState:'none',...patch});f.data.snapshot.settings={...f.data.snapshot.settings,musicVolume:0,soundVolume:0,voicesVolume:0,banterEnabled:false};
 await page.goto(url);await button('IMPORT SAVE').click();await button(/^Slot E/).click();await page.getByRole('textbox').fill(JSON.stringify(f));await button('Restore Mission to Slot E').click();await button(/^Launch Mission/).click();await button('PAUSE').waitFor();
}
async function snapshot(){await button('PAUSE').click();await button('Mission').click();await button('Save Mission (Slot E)').click();const s=await page.evaluate(()=>JSON.parse(localStorage.getItem('starflight_save_slot_E')).snapshot);await button('RESUME MISSION').click();return s;}
try{
 await load({location:'Hyperspace',galaxyShipX:125.4,galaxyShipY:100,hyperspaceDepartureStarId:null});
 await button(/^ENTER \[125, 100\]/).click();
 await page.getByText('MANEUVER ACTIVE (Arrow Keys / WASD)',{exact:true}).waitFor();let a=await snapshot();await page.waitForTimeout(800);let b=await snapshot();
 check('system-entry-selects-maneuver-and-stays-stopped',a.location==='Star System'&&a.systemShipX===b.systemShipX&&a.systemShipY===b.systemShipY);
 await page.keyboard.down('ArrowLeft');await page.waitForTimeout(200);await page.keyboard.up('ArrowLeft');let c=await snapshot();check('fresh-movement-key-starts-system-flight',c.systemShipX!==b.systemShipX);
 await load({location:'Hyperspace',currentStarId:2,galaxyShipX:125.8,galaxyShipY:100,hyperspaceDepartureStarId:2});await button('Navigation').click();await button('[Maneuver]').click();await page.keyboard.down('ArrowLeft');await page.locator('[data-flight-hud]').getByText('LOC: Star System',{exact:true}).waitFor();
 const entry=await page.evaluate(()=>JSON.parse(localStorage.getItem('starflight_save_slot_E')).snapshot);await page.keyboard.down('ArrowLeft');await page.waitForTimeout(500);await page.keyboard.up('ArrowLeft');c=await snapshot();check('automatic-system-entry-clears-held-direction-and-repeat',c.systemShipX===entry.systemShipX&&c.systemShipY===entry.systemShipY);
 await load({location:'Star System',systemShipX:379,systemShipY:0,galaxyShipX:125,galaxyShipY:100});await button('Navigation').click();await button('[Maneuver]').click();await page.keyboard.down('ArrowRight');
 await page.locator('[data-flight-hud]').getByText('LOC: Hyperspace',{exact:true}).waitFor();await page.keyboard.down('ArrowRight');await page.waitForTimeout(800);
 // Reading the transition autosave avoids pausing/clearing the held-key case.
 const pos=await page.locator('[data-flight-hud]').innerText();check('system-exit-selects-maneuver-and-ignores-old-key-repeat',await page.getByText('MANEUVER ACTIVE (Arrow Keys / WASD)',{exact:true}).isVisible()&&pos.includes('[125, 100]'));
 await page.keyboard.up('ArrowRight');a=await snapshot();await page.waitForTimeout(600);b=await snapshot();check('hyperspace-exit-remains-stationary',a.galaxyShipX===125&&a.galaxyShipY===100&&a.galaxyShipX===b.galaxyShipX&&a.galaxyShipY===b.galaxyShipY);
 await page.keyboard.down('ArrowRight');await page.waitForTimeout(400);await page.keyboard.up('ArrowRight');c=await snapshot();check('fresh-movement-key-starts-hyperspace-flight',c.galaxyShipX>b.galaxyShipX);
 await load({location:'Star System'});await button('Navigation').click();check('peaceful-system-combat-disabled-and-not-pulsing',await button('[Combat]').isDisabled()&&!(await button('[Combat]').getAttribute('class')).includes('animate-pulse'));
 await button('[Arm Weapons]').click();check('armed-weapons-do-not-pretend-combat-is-active',!(await button('[Disarm Weapons]').getAttribute('class')).includes('animate-pulse'));
 const titles=await page.locator('[data-flight-hud] [title]').evaluateAll(nodes=>nodes.map(n=>n.title));check('header-acronyms-have-expansions',['ISS','M.U.','LOC','POS','H —','S —','A —','F —'].every(t=>titles.some(x=>x.includes(t))));
 await button('[Starmap]').click();check('home-guidance-visible',await page.getByLabel('Route home to Starport Arth').isVisible());await button('Plot course home').click();check('home-course-selects-Arth',await page.getByLabel('Star telemetry').getByText('Class G Star System [125, 100]',{exact:true}).isVisible());
 await page.screenshot({path:path.join(out,'home-course.jpg')});await page.setViewportSize({width:390,height:844});check('home-guidance-fits-compact-width',await page.getByLabel('Route home to Starport Arth').isVisible()&&await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(out,'home-course-compact.jpg')});
 await load({location:'Star System',engineClass:0,shieldClass:0,laserClass:0,missileClass:0});await button('Navigation').click();check('missing-equipment-controls-disabled',(await Promise.all(['[Maneuver]','[Raise Shields]','[Arm Weapons]','[Combat]'].map(n=>button(n).isDisabled()))).every(Boolean));await button('Bridge ↩').click();await button('Comms').click();check('hail-disabled-without-an-encounter',await button('[Hail]').isDisabled());
 assert.deepEqual(report.errors,[]);report.status='passed';
}catch(e){report.status='failed';report.error=String(e.stack??e);process.exitCode=1;await page?.screenshot({path:path.join(out,'failed.jpg')}).catch(()=>{});}finally{await context?.close();await browser.close();await fs.writeFile(path.join(out,'browser.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}

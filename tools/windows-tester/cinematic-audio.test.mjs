import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';import {pathToFileURL} from 'node:url';
const url=process.env.JUNIOR_AUDIO_URL??'http://127.0.0.1:5233/starflight-junior-crew/',out=path.resolve(process.env.JUNIOR_AUDIO_EVIDENCE??'artifacts/audio-load-fix-20261101/browser');assert.equal(new URL(url).hostname,'127.0.0.1');assert.notEqual(new URL(url).port,'4174');await fs.mkdir(out,{recursive:true});
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE_PATH?pathToFileURL(path.resolve(process.env.PLAYWRIGHT_MODULE_PATH)).href:'playwright');
const browser=await chromium.launch({channel:'msedge',headless:true,args:['--mute-audio']});
const health=await(await fetch(new URL('/__junior_tester__/status',url))).json(),report={build:health.build,scope:'Physically muted disposable contexts, zero-volume fictional save settings, authored-audio failure routes; owner saves never accessed',cases:[]};let context,page;
const button=name=>page.getByRole('button',{name,exact:typeof name==='string'});
try{
 for(const [shot,failure]of [['launch','http'],['launch','decode'],['dock','network'],['launch','none']]){
  const name=shot+'-'+failure;await context?.close();context=await browser.newContext({viewport:{width:1440,height:1000}});let requests=0;const errors=[];
  await context.route('**/*',route=>{
   const requestURL=new URL(route.request().url());if(requestURL.hostname!=='127.0.0.1')return route.abort();
   if(requestURL.pathname.includes(shot==='launch'?'docking-bay-mirelo':'docking-arrival-mirelo')){
    requests++;if(failure==='http')return route.fulfill({status:404,body:'synthetic missing audio'});
    if(failure==='decode')return route.fulfill({status:200,contentType:'audio/wav',body:'synthetic invalid WAV'});
    if(failure==='network')return route.abort('failed');
   }return route.continue();
  });
  page=await context.newPage();page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));
  try{
   const fixture=JSON.parse(await fs.readFile('test-fixtures/commissioned-mission.json','utf8'));
   Object.assign(fixture.data.snapshot,{location:shot==='launch'?'Starport':'Star System',inRoom:shot==='launch',starportRoomIndex:6,flaresStopped:true,cinematicState:shot==='launch'?'none':'dock',cinematicRemaining:shot==='launch'?0:6});
   Object.assign(fixture.data.snapshot.settings,{musicVolume:0,soundVolume:0,voicesVolume:0,banterEnabled:false});
   await page.goto(url);await button('IMPORT SAVE').click();await button(/^Slot E/).click();await page.getByRole('textbox').fill(JSON.stringify(fixture));await button('Restore Mission to Slot E').click();await button(/^Launch Mission/).click();
   if(shot==='launch'){await button('CLEAR GANTRY & LAUNCH TO SPACE').click();await button('Navigation').waitFor({timeout:30000});}
   else await page.waitForFunction(()=>document.querySelector('[data-flight-hud]')?.textContent.includes('Starport'),{},{timeout:30000});
   assert(requests>0,'The target audio request was actually exercised');
   assert(await page.evaluate(()=>new Promise(resolve=>setTimeout(()=>resolve(true),25))),'Browser timers remain responsive');
   await button('PAUSE').click();await button('Mission').click();await button('Save Mission (Slot E)').click();
   const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('starflight_save_slot_E')).snapshot);
   assert.equal(saved.location,shot==='launch'?'Star System':'Starport');assert.equal(saved.cinematicState,'none');
   assert.equal(saved.shipName,fixture.data.snapshot.shipName);assert.deepEqual(saved.crewRoster.map(c=>[c.id,c.name,c.race]),fixture.data.snapshot.crewRoster.map(c=>[c.id,c.name,c.race]));
   await page.reload();await button('CONTINUE MISSION').waitFor();await button('CONTINUE MISSION').click();await button('PAUSE').waitFor();assert.deepEqual(errors,[]);
   report.cases.push({name,passed:true,targetRequests:requests});console.log('PASS '+name);
  }catch(error){report.cases.push({name,passed:false,error:String(error.stack??error),targetRequests:requests,pageErrors:errors});process.exitCode=1;await page.screenshot({path:path.join(out,name+'-failed.png'),timeout:3000}).catch(()=>{});console.error('FAIL '+name+' '+error);}
  await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));
 }
}finally{await context?.close();await browser.close();report.status=report.cases.length===4&&report.cases.every(c=>c.passed)?'passed':'failed';await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));}

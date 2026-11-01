import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const url=process.env.JUNIOR_DANCE_URL??'http://127.0.0.1:5231/starflight-junior-crew/';
assert.equal(new URL(url).hostname,'127.0.0.1');assert.notEqual(new URL(url).port,'4174');
const out=path.resolve(process.env.JUNIOR_DANCE_EVIDENCE??'artifacts/concourse-dance-20261101/browser');await fs.mkdir(out,{recursive:true});
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE_PATH?pathToFileURL(path.resolve(process.env.PLAYWRIGHT_MODULE_PATH)).href:'playwright');
const browser=await chromium.launch({channel:'msedge',headless:true,args:['--mute-audio']});
const health=await(await fetch(new URL('/__junior_tester__/status',url))).json();
const report={build:health.build,scope:'Actual production Canvas draw calls and rendered pose captures; fictional save in muted disposable Edge; owner saves untouched',cases:[]};
// Independently measured complete body bounds from the original PNG, including limbs.
const bodies=[[0,489,135,205],[165,462,148,238],[339,489,205,189],[577,480,156,211],[774,478,160,210],[20,726,140,208],[266,742,179,185],[547,704,144,234],[772,737,158,191]];
let context,page;
try {
 for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
  await context?.close();context=await browser.newContext({viewport});await context.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
  await context.addInitScript(()=>{
   window.__danceDraws={};window.__danceCaptures={};const draw=CanvasRenderingContext2D.prototype.drawImage;
   CanvasRenderingContext2D.prototype.drawImage=function(image,...args){
    const result=draw.call(this,image,...args);
    if(this.canvas.dataset.concoursePose==='dancing'&&image?.src?.includes('astronaut_topdown_spritesheet')&&args.length===8){
     const frame=this.canvas.dataset.concourseDanceFrame,m=this.getTransform();
     window.__danceDraws[frame]={frame:Number(frame),source:args.slice(0,4),destination:args.slice(4),matrix:[m.a,m.b,m.c,m.d,m.e,m.f]};
     window.__lastDanceCanvas=this.canvas;window.__lastDanceFrame=frame;
    }return result;
   };
   function sample(){
    const canvas=window.__lastDanceCanvas,frame=window.__lastDanceFrame,record=window.__danceDraws[frame];
    if(canvas&&record&&!window.__danceCaptures[frame]&&canvas.dataset.concoursePose==='dancing'){
     const [x,y,w,h]=record.destination,[a,b,c,d,e,f]=record.matrix;
     const points=[[x,y],[x+w,y],[x,y+h],[x+w,y+h]].map(([px,py])=>[a*px+c*py+e,b*px+d*py+f]);
     const left=Math.max(0,Math.floor(Math.min(...points.map(p=>p[0])))-12),top=Math.max(0,Math.floor(Math.min(...points.map(p=>p[1])))-12);
     const width=Math.min(canvas.width-left,Math.ceil(Math.max(...points.map(p=>p[0])))-left+12),height=Math.min(canvas.height-top,Math.ceil(Math.max(...points.map(p=>p[1])))-top+12);
     const crop=document.createElement('canvas');crop.width=width;crop.height=height;crop.getContext('2d').drawImage(canvas,left,top,width,height,0,0,width,height);
     window.__danceCaptures[frame]=crop.toDataURL('image/png');
    }requestAnimationFrame(sample);
   }requestAnimationFrame(sample);
  });
  page=await context.newPage();page.setDefaultTimeout(15000);const errors=[];page.on('pageerror',error=>errors.push(error.message));
  const f=JSON.parse(await fs.readFile('test-fixtures/commissioned-mission.json','utf8'));
  Object.assign(f.data.snapshot,{location:'Starport',inRoom:false,starportRoomIndex:0,cinematicState:'none',cinematicRemaining:0});Object.assign(f.data.snapshot.settings,{musicVolume:0,soundVolume:0,voicesVolume:0,banterEnabled:false});
  const button=name=>page.getByRole('button',{name,exact:typeof name==='string'});
  await page.goto(url);await button('IMPORT SAVE').click();await button(/^Slot E/).click();await page.getByRole('textbox').fill(JSON.stringify(f));await button('Restore Mission to Slot E').click();await button(/^Launch Mission/).click();
  await page.waitForFunction(()=>document.querySelector('canvas[data-concourse-pose]')?.dataset.concoursePose==='dancing',null,{timeout:20000});await page.waitForTimeout(2300);
  const records=await page.evaluate(()=>Object.values(window.__danceDraws));const captures=await page.evaluate(()=>window.__danceCaptures);
  const dir=path.join(out,String(viewport.width));await fs.mkdir(dir,{recursive:true});await fs.writeFile(path.join(dir,'draws.json'),JSON.stringify(records,null,2));
  for(const [frame,data]of Object.entries(captures))await fs.writeFile(path.join(dir,`pose-${frame}.png`),Buffer.from(data.split(',')[1],'base64'));
  await page.screenshot({path:path.join(dir,'actual-game.png')});
  const checks=[
   ['exactly-nine-real-poses',records.length===9],
   ['every-body-and-limb-included',bodies.every(([x,y,w,h])=>records.some(({source:[sx,sy,sw,sh]})=>sx<=x&&sy<=y&&sx+sw>=x+w&&sy+sh>=y+h))],
   ['no-neighboring-body-fragments',records.every(({source:[sx,sy,sw,sh]})=>bodies.every(([x,y,w,h])=>sx+sw<=x||sx>=x+w||sy+sh<=y||sy>=y+h||sx<=x&&sy<=y&&sx+sw>=x+w&&sy+sh>=y+h))],
   ['constant-original-scale',records.every(({source:[,,sw,sh],destination:[,,dw,dh]})=>Math.abs(dw/sw-66/235)<1e-10&&Math.abs(dh/sh-66/235)<1e-10)],
   ['no-browser-errors',errors.length===0],
  ];
  await button('PAUSE').click();const frozen=await page.locator('canvas[data-concourse-pose]').getAttribute('data-concourse-dance-frame');
  await page.waitForTimeout(450);checks.push(['pause-freezes-dance',await page.locator('canvas[data-concourse-pose]').getAttribute('data-concourse-dance-frame')===frozen]);
  await button('Mission').click();await button('RESUME MISSION').click();await page.keyboard.down('ArrowRight');
  await page.waitForFunction(()=>document.querySelector('canvas[data-concourse-pose]')?.dataset.concoursePose==='walking');await page.keyboard.up('ArrowRight');await page.waitForTimeout(300);
  checks.push(['movement-stops-dance-and-resets-idle',await page.locator('canvas[data-concourse-pose]').getAttribute('data-concourse-pose')==='idle']);
  // Inspect the original rendered frames enlarged, without changing game assets.
  const contact=await context.newPage();await contact.setContent(`<html><body style="background:#081321;color:white;font-family:sans-serif"><h1>Actual game dance poses · ${viewport.width}px viewport</h1><div style="display:grid;grid-template-columns:repeat(3,260px);gap:12px">${Object.entries(captures).map(([frame,data])=>`<div style="background:#10283a;padding:12px">Pose ${frame}<br><img src="${data}" style="width:220px;image-rendering:pixelated"></div>`).join('')}</div></body></html>`);await contact.setViewportSize({width:850,height:1300});await contact.screenshot({path:path.join(dir,'contact-sheet.png'),fullPage:true});await contact.close();
  for(const [name,passed]of checks)report.cases.push({name:`${viewport.width}-${name}`,passed});
  assert.deepEqual(errors,[]);
 }
 report.status=report.cases.length>0&&report.cases.every(test=>test.passed)?'passed':'failed';if(report.status!=='passed')process.exitCode=1;
}catch(error){report.status='failed';report.error=String(error.stack??error);process.exitCode=1;}
finally{await context?.close();await browser.close();await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));}

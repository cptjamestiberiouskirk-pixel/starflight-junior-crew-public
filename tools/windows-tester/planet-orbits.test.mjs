import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {createServer} from 'vite';
const url=process.env.JUNIOR_ORBIT_URL??'http://127.0.0.1:5204/starflight-junior-crew/';
assert.equal(new URL(url).hostname,'127.0.0.1');
const out=path.resolve(process.env.JUNIOR_ORBIT_EVIDENCE??'artifacts/planet-orbits-20261031');await fs.mkdir(out,{recursive:true});
const ssr=await createServer({configFile:false,optimizeDeps:{noDiscovery:true,entries:[]},server:{middlewareMode:true,hmr:false,watch:null},appType:'custom'});
const {UNIVERSE}=await ssr.ssrLoadModule('/galaxy.ts');await ssr.close();
const star=UNIVERSE.stars.find(s=>s.planets.length>=5&&s.planets.some(p=>p.atmosphereDensity==='None')&&s.planets.some(p=>p.atmosphereDensity==='Very Thick'));
assert(star,'Mixed airless/dense-atmosphere test system exists');
const health=await(await fetch(new URL('/__junior_tester__/status',url))).json();
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE_PATH?pathToFileURL(path.resolve(process.env.PLAYWRIGHT_MODULE_PATH)).href:'playwright');
const browser=await chromium.launch({channel:'msedge',headless:true,args:['--mute-audio']});
const context=await browser.newContext({viewport:{width:1600,height:1100}});
await context.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
// Observe real production canvas calls, without exposing or changing game state.
await context.addInitScript(()=>{
 const arc=CanvasRenderingContext2D.prototype.arc,clear=CanvasRenderingContext2D.prototype.clearRect,stroke=CanvasRenderingContext2D.prototype.stroke,begin=CanvasRenderingContext2D.prototype.beginPath,lastArcs=new WeakMap();
 CanvasRenderingContext2D.prototype.beginPath=function(...args){lastArcs.delete(this);return begin.apply(this,args);};
 window.__orbitDraws={};window.__orbitRims={};
 CanvasRenderingContext2D.prototype.clearRect=function(...args){if(this.canvas.closest('.flight-scene')){window.__orbitDraws={};window.__orbitRims={};}return clear.apply(this,args);};
 CanvasRenderingContext2D.prototype.arc=function(x,y,r,a,b,...rest){
  lastArcs.set(this,{x,y,r,a,b});
  // The game paints its background rather than clearing it. The system boundary
  // is the first world-space arc each frame, so use it as the frame delimiter.
  if(this.canvas.closest('.flight-scene')&&x===0&&y===0&&r===380&&Math.abs(b-a-Math.PI*2)<.001){window.__orbitDraws={};window.__orbitRims={};}
  const distance=Math.hypot(x,y);
  if(this.canvas.closest('.flight-scene')&&distance>40&&distance<380&&Math.abs(b-a-Math.PI*2)<.001)
   window.__orbitDraws[Math.round(distance)]={x,y,r};
  return arc.call(this,x,y,r,a,b,...rest);
 };
 CanvasRenderingContext2D.prototype.stroke=function(...args){
  const a=lastArcs.get(this);
  if(this.canvas.closest('.flight-scene')&&a&&Math.abs(a.b-a.a-(Math.PI*2/64+.002))<1e-8){
   const key=Math.round(Math.hypot(a.x,a.y)),m=this.getTransform();
   (window.__orbitRims[key]??=[]).push({angle:(a.a+a.b-.002)/2,alpha:this.globalAlpha,width:this.lineWidth*Math.hypot(m.a,m.b),blur:this.shadowBlur});
  }
  return stroke.apply(this,args);
 };
});
const page=await context.newPage(),errors=[],report={build:health.build,scope:'Muted disposable profile, fictional imported legacy-format mission; owner saves untouched',cases:[]};page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(15000);
const button=name=>page.getByRole('button',{name,exact:typeof name==='string'}),check=(name,ok)=>{assert(ok,name);report.cases.push({name,passed:true});};
const positions=()=>page.evaluate(()=>window.__orbitDraws);
try{
 const fixture=JSON.parse(await fs.readFile('test-fixtures/commissioned-mission.json','utf8'));
 Object.assign(fixture.data.snapshot,{location:'Star System',currentStarId:star.id,galaxyShipX:star.x,galaxyShipY:star.y,systemShipX:0,systemShipY:100,systemZoom:.9,orbitAnimPhase:120,flaresStopped:true,encounterCooldownTimer:999999,alienGroups:[],cinematicState:'none'});
 Object.assign(fixture.data.snapshot.settings,{musicVolume:0,soundVolume:0,voicesVolume:0,banterEnabled:false});
 await page.goto(url);await button('IMPORT SAVE').click();await button(/^Slot E/).click();await page.getByRole('textbox').fill(JSON.stringify(fixture));await button('Restore Mission to Slot E').click();await button(/^Launch Mission/).click();await button('PAUSE').waitFor();
 await page.waitForFunction(n=>Object.keys(window.__orbitDraws).length>=n,star.planets.length);
 check('legacy-mission-import-renders-every-planet',Object.keys(await positions()).length===star.planets.length);
 const before=await positions();await page.waitForTimeout(2400);const after=await positions();
 const movement=star.planets.map(p=>{const a=before[Math.round(p.orbitRadius)],b=after[Math.round(p.orbitRadius)];assert(a&&b);return {radius:p.orbitRadius,delta:Math.atan2(a.x*b.y-a.y*b.x,a.x*b.x+a.y*b.y)};});
 report.movement=movement;
 check('all-planets-advance-prograde',movement.every(p=>p.delta>0));
 check('rendered-motion-obeys-kepler-ratios',movement.every(p=>Math.abs(p.delta/movement[0].delta-Math.pow(movement[0].radius/p.radius,1.5))<1e-6));
 check('inner-planets-overtake-outer-planets',movement.slice(1).every((p,i)=>p.delta<movement[i].delta));
 check('rendering-retains-circular-radii',star.planets.every(p=>Math.abs(Math.hypot(after[Math.round(p.orbitRadius)].x,after[Math.round(p.orbitRadius)].y)-p.orbitRadius)<1e-8));
 const rimFrame=await page.evaluate(()=>({rims:window.__orbitRims,planets:window.__orbitDraws}));
 report.rims=Object.fromEntries(Object.entries(rimFrame.rims).map(([r,segments])=>[r,{segments:segments.length,maxWidth:Math.max(...segments.map(s=>s.width)),maxAlpha:Math.max(...segments.map(s=>s.alpha))}]));
 check('airless-planets-have-no-rim',star.planets.filter(p=>p.atmosphereDensity==='None').every(p=>!rimFrame.rims[p.orbitRadius]));
 check('one-thin-atmosphere-per-air-bearing-planet',star.planets.filter(p=>p.atmosphereDensity!=='None').every(p=>{const rim=rimFrame.rims[p.orbitRadius];return rim?.length===64&&rim.every(s=>s.width<=1.10001&&s.blur===0&&s.alpha<=.48001);}));
 check('brightest-atmosphere-faces-the-star',Object.entries(rimFrame.rims).every(([r,segments])=>{const p=rimFrame.planets[r],sun=Math.atan2(-p.y,-p.x),bright=segments.reduce((a,b)=>a.alpha>b.alpha?a:b);return Math.cos(bright.angle-sun)>.99;}));
 await page.screenshot({path:path.join(out,'system-desktop.jpg')});
 await button('PAUSE').click();await page.waitForTimeout(200);const paused=await positions();await page.waitForTimeout(1100);
 check('paused-planets-remain-exactly-still',JSON.stringify(paused)===JSON.stringify(await positions()));
 await button('Mission').click();await button('Save Mission (Slot E)').click();const saved=await page.evaluate(()=>localStorage.getItem('starflight_save_slot_E'));assert(saved);const snapshot=JSON.parse(saved).snapshot;
 check('save-retains-existing-orbit-clock-and-ship-position',snapshot.orbitAnimPhase>120&&snapshot.systemShipX===0&&snapshot.systemShipY===100&&snapshot.currentStarId===star.id);
 await button('RESUME MISSION').click();await page.waitForTimeout(500);check('resuming-restarts-motion',JSON.stringify(paused)!==JSON.stringify(await positions()));
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(200);check('compact-view-has-no-page-overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(out,'system-compact.jpg')});
 // Reload only this disposable profile, verifying the ordinary slot path.
 await page.reload();await page.getByTestId('resume-slot-E').click();await button('PAUSE').waitFor();
 check('saved-mission-continues-through-normal-slot',await page.locator('[data-flight-hud]').getByText('LOC: Star System',{exact:true}).isVisible());
 await button('PAUSE').click();await button('Mission').click();await button('Save Mission (Slot E)').click();const resumed=await page.evaluate(()=>JSON.parse(localStorage.getItem('starflight_save_slot_E')).snapshot);
 check('continued-save-keeps-orbit-time-and-position',resumed.orbitAnimPhase>=snapshot.orbitAnimPhase&&resumed.systemShipX===snapshot.systemShipX&&resumed.systemShipY===snapshot.systemShipY);
 check('no-production-audit-hooks',await page.evaluate(()=>typeof window.__buttonAuditScope==='undefined'));
 assert.deepEqual(errors,[]);report.status='passed';
}catch(e){report.status='failed';report.error=String(e.stack??e);process.exitCode=1;await page.screenshot({path:path.join(out,'failed.jpg')}).catch(()=>{});
}finally{report.errors=errors;await context.close();await browser.close();await fs.writeFile(path.join(out,'browser.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}

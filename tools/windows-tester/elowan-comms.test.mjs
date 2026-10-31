import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {createServer} from 'vite';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),out=path.resolve(root,process.env.JUNIOR_COMMS_TEST_EVIDENCE??'artifacts/elowan-comms-check'),phase=process.env.JUNIOR_COMMS_TEST_PHASE??'checked',url=process.env.JUNIOR_COMMS_TEST_URL??'http://127.0.0.1:4174/starflight-junior-crew/';
assert(out.startsWith(path.join(root,'artifacts')+path.sep));assert.equal(new URL(url).hostname,'127.0.0.1');await fs.mkdir(out,{recursive:true});
const serverStatus=await(await fetch(new URL('/__junior_tester__/status',url))).json();assert.equal(serverStatus.server,'starflight-junior-crew-windows-tester-v1');
const ssr=await createServer({root,configFile:false,cacheDir:path.join(out,'ssr-cache'),optimizeDeps:{noDiscovery:true,include:[],entries:[]},server:{middlewareMode:true,hmr:false,watch:null},appType:'custom'});
const {createAlienShip}=await ssr.ssrLoadModule('/alien.ts');const {newConversationClock}=await ssr.ssrLoadModule('/utils/communications.ts');await ssr.close();
const fixture=JSON.parse(await fs.readFile(path.join(root,'test-fixtures/commissioned-mission.json'),'utf8'));
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE_PATH?pathToFileURL(path.resolve(process.env.PLAYWRIGHT_MODULE_PATH)).href:'playwright');
const browser=await chromium.launch({channel:'msedge',headless:true,args:['--mute-audio']});
const report={phase,url,build:serverStatus.build,portraits:[],scope:'Muted disposable contexts and fictional missions; no owner browser/storage access',cases:[],errors:[]};let context,page;
const button=name=>page.getByRole('button',{name,exact:typeof name==='string'});
async function load(connected,mood=25,instant=false,question=null,patch={}){
 await context?.close();context=await browser.newContext({viewport:{width:1440,height:1000}});await context.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
 await context.addInitScript(()=>{
  window.elowanFrames={frames:0,changed:0,maxChangedPixels:0,positions:[],artifact:null,reference:null};
  const original=CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.drawImage=function(source,...args){
   const result=original.call(this,source,...args);
   if(this.canvas.width===180&&this.canvas.height===160&&source.naturalWidth===702&&source.naturalHeight===959){
    const expected=this.getImageData(60,45,70,80).data.slice(),serial=(this.elowanSerial??0)+1;this.elowanSerial=serial;
    const reference=this.canvas.toDataURL();const position=Math.round(args[1]*100)/100;
    queueMicrotask(()=>{if(this.elowanSerial!==serial||!this.canvas.isConnected)return;const actual=this.getImageData(60,45,70,80).data;let differences=0;for(let i=0;i<actual.length;i+=4)if(actual[i]!==expected[i]||actual[i+1]!==expected[i+1]||actual[i+2]!==expected[i+2]||actual[i+3]!==expected[i+3])differences++;
     const stats=window.elowanFrames;stats.frames++;stats.maxChangedPixels=Math.max(stats.maxChangedPixels,differences);if(!stats.positions.includes(position))stats.positions.push(position);if(differences){stats.changed++;if(!stats.artifact){stats.artifact=this.canvas.toDataURL();stats.reference=reference;}}
    });
   }return result;
  };
 });
 page=await context.newPage();page.setDefaultTimeout(20000);page.on('pageerror',e=>report.errors.push(e.message));
 const f=structuredClone(fixture),s=f.data.snapshot;
 const group={id:'elowan-visual-qa',race:'Elowan',x:125,y:100,homeX:125,homeY:100,baseMood:44,currentMood:mood,posture:mood>=60?'Obsequious':'Friendly',ships:[{...createAlienShip('Elowan','Transport','elowan-qa',2,18),isStationary:true}]};
 group.conversation=newConversationClock(mood>=60?'Obsequious':'Friendly',false,false,()=>.9);group.conversation.disconnected=!connected;
 Object.assign(s,{location:'Encounter',activeEncounterGroup:group,combatActive:false,projectiles:[],armorClass:5,shieldClass:5,laserClass:5,missileClass:5,flaresStopped:true,cinematicState:'none',cinematicRemaining:0,alienCommsState:{...s.alienCommsState,active:connected,connected,alienMood:mood,alienPosture:mood>=60?'Obsequious':'Friendly',pendingAlienQuestion:question,lastAlienSpeakerText:question?question.text:connected?'Synthetic visual regression transmission. '.repeat(30):''}});
 s.questionCountdownTimer=question?.timer??60;s.questionTotalTime=20;
 Object.assign(s,patch);
 s.crewRoster.forEach(c=>Object.keys(c.skills).forEach(k=>c.skills[k]=250));s.settings={...s.settings,musicVolume:0,soundVolume:0,voicesVolume:0,banterEnabled:false,textSpeed:instant?'Instant':'Slow'};
 await page.goto(url);await button('IMPORT SAVE').click();await button(/^Slot E/).click();await page.getByRole('textbox').fill(JSON.stringify(f));await button('Restore Mission to Slot E').click();await button(/^Launch Mission/).click();
}
try{
 if(process.env.JUNIOR_COMMS_TEST_CASE!=='last-reminder'){
 for(const mode of ['talking','idle']){
 await load(true,25,mode==='idle');await page.getByRole('heading',{name:/SUBSPACE TRANSMISSION/}).waitFor();await page.waitForTimeout(5200);
 const stats=await page.evaluate(()=>window.elowanFrames);
 for(const [name,data] of [['artifact',stats.artifact],['reference',stats.reference]])if(data)await fs.writeFile(path.join(out,phase+'-'+mode+'-'+name+'.png'),Buffer.from(data.split(',')[1],'base64'));
 report.portraits.push({mode,frames:stats.frames,changedFrames:stats.changed,maxChangedPixels:stats.maxChangedPixels,breathingPositions:stats.positions.length});
 assert(stats.frames>20,'Portrait must really render');assert(stats.positions.length>5,'Existing breathing motion must remain');
 await page.screenshot({path:path.join(out,phase+'-'+mode+'-portrait-screen.jpg')});report.cases.push({name:mode+'-face-has-no-synthetic-pixel-overlays',passed:stats.changed===0});
 }
 await load(false,94);await button('Comms').click();await button('[Hail]').click();const log=await page.getByRole('log',{name:'Filtered bridge messages'}).innerText();
 report.refusal=log.split('\n').filter(t=>/Transmission refused/.test(t)).slice(0,2);await page.screenshot({path:path.join(out,phase+'-refusal.jpg')});report.cases.push({name:'non-firing-refusal-does-not-claim-hostile-fire',passed:log.includes('have broken off communications')&&!log.includes('jammed by hostile fire')});
 }
 await load(true,52,true,{id:9,text:'Art thou friends or allies of the Thrynn?',remindersLeft:0,timer:10});
 await button('NO').waitFor();report.cases.push({name:'final-reminder-does-not-announce-premature-impatience',passed:!(await page.getByText('The aliens have lost patience.',{exact:true}).isVisible())});
 await button('NO').click();await button('NO').waitFor({state:'hidden'});
 const answerLog=await page.getByRole('log',{name:'Filtered bridge messages'}).innerText();
 report.cases.push({name:'reply-during-final-reminder-time-is-accepted',passed:(await page.getByRole('heading',{name:/SUBSPACE TRANSMISSION/}).isVisible())&&/\[Captain [^\]]+\]:\s*No\./.test(answerLog)&&!answerLog.includes('have lost patience waiting')});
 await page.screenshot({path:path.join(out,phase+'-final-reminder.jpg')});
 if(process.env.JUNIOR_COMMS_TEST_CASE!=='last-reminder'){
  for(const [name,patch,laser,missile] of [
   ['ready',{weaponsArmed:true,enduriumFuel:5},true,true],
   ['fuel-shortage',{weaponsArmed:true,enduriumFuel:.05},false,false],
   ['insufficient-missile-fuel',{weaponsArmed:true,enduriumFuel:.2},true,false],
   ['damaged',{weaponsArmed:true,subsystems:{...fixture.data.snapshot.subsystems,Lasers:0,Missiles:0}},false,false],
  ]){
   await load(false,25,true,null,patch);await button('Navigation').click();assert(await button('[Combat]').isEnabled());assert(!(await button('[Combat]').getAttribute('class')).includes('animate-pulse'));
   await button('[Combat]').click();report.cases.push({name:'encounter-weapon-controls-'+name,passed:await button('Laser (0.1m³)').isEnabled()===laser&&await button('Missile (0.5m³)').isEnabled()===missile});
  }
 }
 assert.deepEqual(report.errors,[]);assert(report.cases.every(c=>c.passed),JSON.stringify(report));report.status='passed';
}catch(e){report.status='failed';report.error=String(e.stack??e);process.exitCode=1;}finally{await context?.close();await browser.close();await fs.writeFile(path.join(out,phase+'-browser.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}

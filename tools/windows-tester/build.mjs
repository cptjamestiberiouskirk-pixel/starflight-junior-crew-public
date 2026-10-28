import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const source=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(source,'../..');
const evidence=path.resolve(root,process.env.JUNIOR_TESTER_EVIDENCE_DIR??'artifacts/windows-tester-20261026');
if(!evidence.startsWith(path.join(root,'artifacts')+path.sep))throw Error('Tester output must remain inside project artifacts.');
const output=path.join(evidence,'package','Starflight Junior Crew');
const sha=buffer=>crypto.createHash('sha256').update(buffer).digest('hex');
if(process.platform!=='win32'||process.arch!=='x64')throw Error('Build on Windows x64 with the verified Node runtime.');
await fs.mkdir(evidence,{recursive:true});
await fs.mkdir(path.dirname(output),{recursive:true});
await fs.mkdir(output); // Preserve existing packages; choose a fresh output directory.
const acceptance=JSON.parse(await fs.readFile(path.join(source,'accepted-build.json'),'utf8'));
const html=await fs.readFile(path.join(root,'dist/index.html'),'utf8');
if(!html.includes(acceptance.build.entry))throw Error('Dist differs from the accepted build.');
if(sha(await fs.readFile(path.join(root,'dist',acceptance.build.entry)))!==acceptance.build.sha256)throw Error('Build hash mismatch.');
const runtime=process.execPath;
const license=path.join(path.dirname(runtime),'LICENSE');
if(!(await fs.readFile(license,'utf8')).startsWith('Node.js is licensed'))throw Error('Runtime license is missing.');
console.log('Copying accepted game assets into portable package...');
await fs.cp(path.join(root,'dist'),path.join(output,'game'),{recursive:true});
await fs.mkdir(path.join(output,'runtime'),{recursive:true});
await fs.copyFile(runtime,path.join(output,'runtime/node.exe'));
await fs.copyFile(license,path.join(output,'runtime/NODE-LICENSE.txt'));
await fs.copyFile(path.join(source,'server.mjs'),path.join(output,'runtime/server.mjs'));
await fs.copyFile(path.join(source,'READ ME FIRST.txt'),path.join(output,'READ ME FIRST.txt'));
const info={game:'Starflight: Junior Crew',package:'Windows x64 portable tester',createdUTC:new Date().toISOString(),
  build:acceptance.build.entry,buildSHA256:acceptance.build.sha256,runtime:{version:process.version,arch:process.arch,sha256:sha(await fs.readFile(runtime))},
  url:'http://127.0.0.1:4188/starflight-junior-crew/',voicesRequireInternet:true,published:false};
await fs.writeFile(path.join(output,'BUILD-INFO.json'),JSON.stringify(info,null,2)+'\n');
const compiler=path.join(process.env.WINDIR??'C:/Windows','Microsoft.NET/Framework64/v4.0.30319/csc.exe');
const launcher=path.join(output,'Launch Starflight Junior Crew.exe');
console.log('Compiling native Windows GUI launcher (asInvoker; no installer)...');
const compile=execFileSync(compiler,['/nologo','/target:winexe','/platform:x64','/optimize+',
  '/reference:System.Windows.Forms.dll','/reference:System.Drawing.dll','/reference:System.Web.Extensions.dll',
  '/win32manifest:'+path.join(source,'launcher.manifest'),'/out:'+launcher,path.join(source,'Launcher.cs')],{encoding:'utf8',windowsHide:true});
await fs.writeFile(path.join(evidence,'compile.log'),compile);
const entries=[];
async function walk(directory) {
 for(const item of (await fs.readdir(directory,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))) {
  const file=path.join(directory,item.name);
  if(item.isSymbolicLink())throw Error('Do not package symbolic links: '+file);
  if(item.isDirectory())await walk(file);
  else if(item.isFile()) {
   const relative=path.relative(output,file).split(path.sep).join('/');
   if(relative==='PACKAGE-MANIFEST.json')continue;
   const bytes=await fs.readFile(file);entries.push({file:relative,bytes:bytes.length,sha256:sha(bytes)});
  }
 }
}
await walk(output);
await fs.writeFile(path.join(output,'PACKAGE-MANIFEST.json'),JSON.stringify({build:info.build,buildSHA256:info.buildSHA256,files:entries},null,2)+'\n');
await fs.writeFile(path.join(evidence,'build.json'),JSON.stringify({output,files:entries.length+1,bytes:entries.reduce((s,f)=>s+f.bytes,0),info},null,2)+'\n');
console.log(JSON.stringify({output,files:entries.length+1,build:info.build,buildSHA256:info.buildSHA256},null,2));

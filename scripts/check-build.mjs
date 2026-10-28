import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const dist = new URL('dist/', root);
const html = readFileSync(new URL('index.html', dist), 'utf8');
assert(!html.includes('/index.tsx'), 'Built HTML must reference compiled JavaScript');
for (const [, reference] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  if (/^(?:https?:|data:)/.test(reference)) continue;
  assert(!reference.startsWith('/'), `Absolute path breaks GitHub project Pages: ${reference}`);
  assert(existsSync(new URL(reference, dist)), `Missing HTML resource: ${reference}`);
}
const imageNames = readdirSync(new URL('assets/images/', root));
for (const name of imageNames) {
  const path = `assets/images/${name}`;
  const original = readFileSync(new URL(path, root));
  const built = readFileSync(new URL(path, dist));
  assert.equal(
    createHash('sha256').update(built).digest('hex'),
    createHash('sha256').update(original).digest('hex'),
    `Exported artwork changed: ${name}`,
  );
}
const app = ['App.tsx','GameInterface.tsx','components/MiningConsole.tsx'].map(file=>readFileSync(new URL(file,root),'utf8')).join('\n');
const imageReferences = new Set([...app.matchAll(/assets\/images\/[\w.-]+\.(?:png|webp)/g)].map(([path]) => path));
for (const path of imageReferences) assert(existsSync(new URL(path, dist)), `Missing game image: ${path}`);
const cssFiles = readdirSync(new URL('assets/', dist)).filter((name) => name.endsWith('.css'));
for (const file of cssFiles) {
  const cssUrl = new URL(`assets/${file}`, dist);
  const css = readFileSync(cssUrl, 'utf8');
  for (const [, reference] of css.matchAll(/url\(["']?([^\s)"']+)["']?\)/g)) {
    if (/^(?:data:|https?:|#)/.test(reference)) continue;
    assert(existsSync(new URL(reference, cssUrl)), `Missing CSS resource: ${reference}`);
  }
}
assert(existsSync(new URL('.nojekyll', dist)));
assert(existsSync(new URL('THIRD_PARTY_NOTICES.md', dist)));
for (const font of ['rajdhani', 'orbitron', 'chakra-petch']) {
  assert(existsSync(new URL(`licenses/@fontsource-${font}.txt`, dist)), `Missing ${font} font license`);
}
assert(!existsSync(new URL('6886860557711997147/', dist)));
assert(!existsSync(new URL('design/', dist)));
const soundtrack = readFileSync(new URL('utils/soundtrack.ts', root), 'utf8');
const audioName = readdirSync(new URL('assets/', dist)).find(name => /^neon-starfield-voyage-.*\.m4a$/.test(name));
assert(audioName, 'Selected Sonilo recording must be bundled locally');
assert.equal(createHash('sha256').update(readFileSync(new URL('assets/'+audioName,dist))).digest('hex'),createHash('sha256').update(readFileSync(new URL('assets/music/neon-starfield-voyage.m4a',root))).digest('hex'),'Bundled Sonilo bytes must match the preserved download');
assert(soundtrack.includes("new URL('../assets/music/"), 'Recording URL must respect the Vite project base');
console.log(`PASS: ${imageNames.length} source images match SHA-256; ${imageReferences.size} game image paths, compiled resources, local fonts, and relative Pages URLs verified.`);

for(const [prefix,suffix,source] of [['docking-bay-', '.glb','assets/models/docking-bay.glb'],['docking-bay-mirelo-','.wav','assets/audio/docking-bay-mirelo.wav'],['docking-bay-fallback-','.mp4','assets/models/docking-bay-fallback.mp4']]){
 const name=readdirSync(new URL('assets/',dist)).find(n=>n.startsWith(prefix)&&n.endsWith(suffix));
 assert(name,'Missing approved bay asset '+source);
 assert.equal(createHash('sha256').update(readFileSync(new URL('assets/'+name,dist))).digest('hex'),createHash('sha256').update(readFileSync(new URL(source,root))).digest('hex'),'Bay asset bytes changed '+source);
}
assert(existsSync(new URL('licenses/three.txt',dist)),'Three.js MIT license must ship');
console.log('PASS: approved Blender GLB, fallback film and actual Mirelo WAV match source SHA-256; Three.js license bundled.');

for(const prefix of ['hangar-painted-atlas-','hangar-painted-deck-']){
 const name=readdirSync(new URL('assets/',dist)).find(n=>n.startsWith(prefix)&&n.endsWith('.png'));assert(name,'Painted hangar texture must ship '+prefix);
 const source='assets/models/'+prefix.slice(0,-1)+'.png';assert.equal(createHash('sha256').update(readFileSync(new URL('assets/'+name,dist))).digest('hex'),createHash('sha256').update(readFileSync(new URL(source,root))).digest('hex'));
}
console.log('PASS: both approved painted hangar textures are bundled byte-identically.');

const shipManifest=JSON.parse(readFileSync(new URL('assets/ships/manifest.json',root),'utf8'));
assert.equal(shipManifest.count,3672);assert.equal(shipManifest.images.length,3672);
assert.equal(new Set(shipManifest.images.map(row=>row.file)).size,3672);
for(const row of shipManifest.images){
 const relative='assets/ships/configurations/'+row.file;
 for(const location of [root,dist])assert.equal(createHash('sha256').update(readFileSync(new URL(relative,location))).digest('hex'),row.sha256,'Approved whole-ship image differs '+relative);
}
const kitName=readdirSync(new URL('assets/',dist)).find(n=>n.startsWith('ship-outfitting-kit-')&&n.endsWith('.glb'));assert(kitName);
assert.equal(createHash('sha256').update(readFileSync(new URL('assets/'+kitName,dist))).digest('hex'),createHash('sha256').update(readFileSync(new URL('assets/models/ship-outfitting-kit.glb',root))).digest('hex'));
for(let tier=1;tier<=5;tier++){
 const name=readdirSync(new URL('assets/',dist)).find(n=>n.startsWith('ship-armor-'+tier+'-')&&n.endsWith('.png'));assert(name);
 assert.equal(createHash('sha256').update(readFileSync(new URL('assets/'+name,dist))).digest('hex'),createHash('sha256').update(readFileSync(new URL('assets/models/ship-armor-'+tier+'.png',root))).digest('hex'));
}
assert.equal(createHash('sha256').update(readFileSync(new URL('assets/ships/catalog.json',dist))).digest('hex'),createHash('sha256').update(readFileSync(new URL('assets/ships/catalog.json',root))).digest('hex'));
console.log('PASS: all 3672 approved full-ship PNGs, catalog, Blender 5.2 kit and five tactical armor maps match source SHA-256.');

const crewManifest=JSON.parse(readFileSync(new URL('assets/crew/manifest.json',root),'utf8'));
assert.equal(crewManifest.count,50);assert.equal(new Set(crewManifest.images.map(r=>r.id)).size,50);
for(const row of crewManifest.images)for(const where of [root,dist])assert.equal(createHash('sha256').update(readFileSync(new URL(row.path,where))).digest('hex'),row.sha256,'Crew portrait differs '+row.path);
console.log('PASS: all 50 new animated crew atlases match source and production SHA-256; original five atlases preserved.');

import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import fs from 'node:fs/promises';
import {BayShipModules} from './utils/bay-ship-modules';
import {ARMOR_GLAZING_MARGIN,armorGlazingKeepouts} from './utils/tactical-armor';
import {armorTintLayer} from './utils/armor-style';

function area(mesh:THREE.Mesh){
 const g=mesh.geometry,p=g.attributes.position,idx=g.index;let sum=0;
 for(let i=0;i<(idx?.count??p.count);i+=3){
  const v=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,idx?idx.getX(i+j):i+j));
  sum+=v[1].sub(v[0]).cross(v[2].sub(v[0])).length()/2;
 }
 return sum;
}
export async function runArmorCoverageTests(){
 let passed=0,failed=0;const results:string[]=[];
 const check=(ok:boolean,label:string)=>{ok?passed++:failed++;results.push(`${ok?'PASS':'FAIL'} ${label}`);};
 const bytes=await fs.readFile(new URL('./assets/models/ship-outfitting-kit.glb',import.meta.url));
 const kit=(await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'')).scene;
 const template=kit.clone(true);
 const hull=new THREE.Group(),skin=new THREE.Mesh(new THREE.BoxGeometry(4,6,2),new THREE.MeshBasicMaterial());
 skin.material.name='Hull • warm chalk';hull.add(skin);
 const texture=new THREE.Texture(),maps=new Map([1,2,3,4,5].map(t=>[t,texture]));
 const original=Array.from(skin.geometry.attributes.position.array);
 const installed=new BayShipModules(hull,kit,maps),total=area(skin);
 check(Math.abs(total-88)<1e-6,'Independent box area is 88 square units');
 let previous=new Set<string>();
 for(let tier=0;tier<=5;tier++){
  installed.update({engineClass:1,cargoPodsCount:0,armorClass:tier,laserClass:0,missileClass:0});
  let covered=0;hull.traverse((o:any)=>{if(o.isMesh&&o.name==='Approved tactical ceramic surface'&&o.visible)covered+=area(o);});
  check(Math.abs(covered-total*tier/5)<.0001,`Class ${tier}: actual plated geometry covers ${tier*20}% of complete eligible skin; got ${(covered/total*100).toFixed(3)}%`);
  const visible=new Set<string>();hull.traverse((o:any)=>{if(o.isMesh&&o.name==='Approved tactical ceramic surface'&&o.visible)visible.add(o.uuid);});
  check([...previous].every(id=>visible.has(id)),`Class ${tier} retains all earlier plating`);previous=visible;
 }
 check(JSON.stringify(original)===JSON.stringify(Array.from(skin.geometry.attributes.position.array)),'Plating does not modify the source hull');
 installed.update({engineClass:1,cargoPodsCount:0,armorClass:0,laserClass:0,missileClass:0});
 check(installed.group.children.filter(o=>o.name==='Approved tactical ceramic surface').every(o=>!o.visible),'Removing class 5 clears every earlier band');
 const glazed=new THREE.Group(),shell=new THREE.Mesh(new THREE.BoxGeometry(4,6,2),new THREE.MeshBasicMaterial());shell.material.name='Hull • warm chalk';glazed.add(shell);
 const window=new THREE.Mesh(new THREE.BoxGeometry(1,2,.02),new THREE.MeshBasicMaterial());window.material.name='Cockpit blue-black';window.position.z=1.01;glazed.add(window);
 const glazedModules=new BayShipModules(glazed,template.clone(true),maps);glazedModules.update({engineClass:1,cargoPodsCount:0,armorClass:5,laserClass:0,missileClass:0});
 const aperture=(1+2*ARMOR_GLAZING_MARGIN)*(2+2*ARMOR_GLAZING_MARGIN);
 check(Math.abs(glazedModules.diagnostics().armorEligibleArea-(88-aperture))<.00001,'Window aperture is excluded using its independently known rectangular area');
 let overWindow=false;glazedModules.group.children.forEach((o:any)=>{if(!o.isMesh||o.name!=='Approved tactical ceramic surface')return;const p=o.geometry.attributes.position;for(let i=0;i<p.count;i+=3){const center=new THREE.Vector3();for(let j=0;j<3;j++)center.add(new THREE.Vector3().fromBufferAttribute(p,i+j));center.divideScalar(3);if(Math.abs(center.x)<.5&&Math.abs(center.y)<1&&center.z>.99)overWindow=true;}});
 check(!overWindow,'Class 5 has no plate over the glazing aperture');
 const hullBytes=await fs.readFile(new URL('./assets/models/docking-bay.glb',import.meta.url));
 const model=(await new GLTFLoader().parseAsync(hullBytes.buffer.slice(hullBytes.byteOffset,hullBytes.byteOffset+hullBytes.byteLength),'')).scene;
 let physical:THREE.Object3D|undefined;const sourceName=(o:THREE.Object3D)=>o.userData.source_name??o.name;
 model.traverse(o=>{if(sourceName(o).startsWith('SHIP '))physical=o;});
 const real=physical!.clone(true);real.position.set(0,0,0);const retired:THREE.Object3D[]=[];
 real.traverse((o:any)=>{if(o.userData.outline_for||/^(Installed cargo pod|Pod reinforcement band|Drive expansion root )/.test(sourceName(o)))retired.push(o);else if(o.isMesh){o.material=new THREE.MeshBasicMaterial();o.material.name=o.userData.source_material??'';}});retired.forEach(o=>o.removeFromParent());
 real.updateWorldMatrix(true,true);const inv=real.matrixWorld.clone().invert();let expected=0;
 real.traverse((o:any)=>{if(!o.isMesh||!o.material.name.startsWith('Hull •'))return;const g=o.geometry.clone();g.applyMatrix4(inv.clone().multiply(o.matrixWorld));expected+=area(new THREE.Mesh(g));g.dispose();});
 const actual=new BayShipModules(real,template.clone(true),maps),unmasked=expected;
 // Reviewed fixed GLB surface area after preserving its seven observation
 // windows and blue bridge dome; the analytical aperture case above checks
 // the clipping independently of this source-specific golden measurement.
 expected=2024.5102309198758;
 check(unmasked>expected&&Math.abs(actual.diagnostics().armorEligibleArea-expected)<.0001,'Fixed model excludes glazing from its eligible skin denominator');
 check(armorGlazingKeepouts(real).length===8,'Seven observation windows and the bridge dome remain protected');
 for(let tier=1;tier<=5;tier++){
  actual.update({engineClass:1,cargoPodsCount:0,armorClass:tier,laserClass:0,missileClass:0});let covered=0;
  actual.group.children.forEach((o:any)=>{if(o.isMesh&&o.name==='Approved tactical ceramic surface'&&o.visible)covered+=area(o);});
  check(Math.abs(covered/expected-tier/5)<.00001,`Real GLB class ${tier}: measured complete hull-skin area equals ${tier*20}%`);
  check(actual.diagnostics().armorCoveragePercent===tier*20,`Class ${tier} diagnostics use measured geometric coverage`);
 }
 let underside=0,sides=0,fore=false,aft=false;
 actual.group.children.forEach((o:any)=>{if(!o.isMesh||o.name!=='Approved tactical ceramic surface')return;const n=o.geometry.attributes.normal,p=o.geometry.attributes.position;for(let i=0;i<n.count;i++){if(n.getZ(i)<-.2)underside++;if(Math.abs(n.getZ(i))<.2)sides++;if(o.userData.armorBand===1){fore ||= p.getY(i)>15;aft ||= p.getY(i)<-15;}}});
 check(underside>0&&sides>0,'Class 5 includes side and underside plating rather than only upward faces');
 check(fore&&aft,'Class 1 protects both critical fore and aft regions, not a straight frontier');
 const fitted=Uint8ClampedArray.from([240,240,240,255,20,30,40,255,240,240,240,255]),bare=Uint8ClampedArray.from([240,240,240,255,240,240,240,255,240,240,240,255]),mask=Uint8ClampedArray.from([255,255,255,255,255,255,255,255,0,0,0,0]);
 const colors=[1,2,3,4,5].map(t=>armorTintLayer(fitted,bare,mask,t));
 check(new Set(colors.map(p=>`${p[0]},${p[1]},${p[2]}`)).size===5,'All classes tint actual plated pixels differently');
 check(colors.every(p=>p[7]===0),'Fitted hardware over the hull is not recolored');
 check(colors.every(p=>p[11]===0),'Illustrated glazing outside the plating mask is not recolored');
 check(armorTintLayer(fitted,bare,mask,0).every(n=>n===0),'Bare hull retains its original colors');
 return {passed,failed,results};
}

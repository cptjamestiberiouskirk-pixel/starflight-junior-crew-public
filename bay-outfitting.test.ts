import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import fs from 'node:fs/promises';
import {BayShipModules} from './utils/bay-ship-modules';
import {bayOutfitting} from './utils/bay-outfitting';
import manifest from './assets/models/ship-outfitting-kit.json';
export async function runBayOutfittingTests(){
 let passed=0;const check=(v:boolean,label:string)=>{if(!v)throw new Error(label);passed++;};
 const bytes=await fs.readFile(new URL('./assets/models/ship-outfitting-kit.glb',import.meta.url));
 const kit=(await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'' )).scene;
 const template=kit.clone(true);
 const parent=new THREE.Group(),module=new BayShipModules(parent,kit);
 const base={cargoPodsCount:0,engineClass:1,armorClass:0,laserClass:0,missileClass:0};
 module.update(base);check(module.diagnostics().visibleModels.length===0,'Bare equipment has no stale fitted models');
 for(let tier=1;tier<=5;tier++){
  module.update({...base,cargoPodsCount:tier*3,armorClass:tier,laserClass:tier,missileClass:tier});const d=module.diagnostics();
  check(d.cargoPods===tier*3,'Actual authored cargo groups match the current count');
  check(d.armorRequestedCoveragePercent===tier*20&&d.armorCoveragePercent===0,'Installed class is distinct from measured coverage when the fixture has no hull skin');
  check(d.laserBarrels===(tier<3?2:4),'Actual source-verified GLB barrel count');
  check(d.missileTubes===2*(tier+1),'Actual source-verified GLB missile count');
  check(d.visibleModels.includes('laser-'+tier)&&d.visibleModels.includes('missile-'+tier),'Correct authored tier selected');
  const b=new THREE.Box3().setFromObject(module.group,true);
  // Hidden variants share the same envelope; all exported variants must fit.
  check(b.min.x>=-14.8625&&b.max.x<=14.8625&&b.min.y>=-28.47&&b.max.y<=27.324,'Exported 5.2 kit remains within approved flight clearance');
  check(b.min.z>-.8&&b.max.z<1.924,'Hardware does not exceed approved stowed height');
 }
 for(const row of manifest.groups){
  const object=module.group.getObjectByName(row.name)!;check(!!object,'Every authored group is loaded from the real GLB');
  check(object.children.some((o:any)=>o.geometry?.attributes.position.count>0),'Each authored group has actual mesh geometry');
 }
 for(const family of ['laser','missile']){
  const rows=manifest.groups.filter(g=>g.family===family);
  for(let i=1;i<rows.length;i++){
   const a=rows[i-1].bounds,b=rows[i].bounds;
   check(b[1][1]-b[0][1]>a[1][1]-a[0][1],'Higher authored class has a larger fitted fore-aft envelope');
  }
 }
 module.update({...base,cargoPodsCount:16,armorClass:5,laserClass:0,missileClass:4});let d=module.diagnostics();
 check(d.cargoPods===16&&d.laserBarrels===0&&d.missileTubes===10,'Mixed and absent equipment bind independently');
 module.update(base);check(module.diagnostics().visibleModels.length===0,'Downgrade removes all prior equipment');
 const c=bayOutfitting({...base,cargoPodsCount:99,armorClass:99,laserClass:-1});check(c.cargoPods===16&&c.armorClass===5&&c.laserClass===0,'Corrupt visual values safely bounded');
 // The orbit renderer keeps each original node transform instead of baking it
 // into a merged hull. Armor must use the same parent-space geometry in both.
 const projectionRoot=new THREE.Group();projectionRoot.position.set(50,-20,6);projectionRoot.rotation.z=.6;
 const bridge=new THREE.Mesh(new THREE.BoxGeometry(4,6,2),new THREE.MeshBasicMaterial());
 bridge.material.name='Hull • warm chalk';bridge.position.set(0,21,1.65);bridge.rotation.z=.2;projectionRoot.add(bridge);
 const originalPositions=Array.from(bridge.geometry.attributes.position.array);
 const texture=new THREE.Texture(),projection=new BayShipModules(projectionRoot,template.clone(true),new Map([[1,texture],[5,texture]]));
 projection.update({...base,armorClass:1});projectionRoot.updateWorldMatrix(true,true);
 const plates=projection.group.children.filter((o:any)=>o.isMesh&&o.name==='Approved tactical ceramic surface') as THREE.Mesh[];
 check(plates.length===5,'Translated hull generates five cumulative area bands');
 const plateBounds=new THREE.Box3();for(const p of plates)plateBounds.union(new THREE.Box3().setFromBufferAttribute(p.geometry.attributes.position as THREE.BufferAttribute));
 check(Math.abs((plateBounds.min.y+plateBounds.max.y)/2-21)<.001,'Armor remains on the forward bridge instead of collapsing onto the origin');
 check(Math.abs(plateBounds.max.z-2.658)<.001&&Math.abs(plateBounds.min.z-.642)<.001,'Armor retains transformed top and underside heights with the normal offset');
 check(JSON.stringify(originalPositions)===JSON.stringify(Array.from(bridge.geometry.attributes.position.array)),'Armor projection does not mutate the approved hull');
 projection.update(base);check(!plates[0].visible,'Removing armor hides its actual geometry');
 projection.update({...base,armorClass:5});check(plates[0].visible&&((plates[0].material as THREE.MeshBasicMaterial).map===texture),'Changing purchased class restores the actual surface map');
 const modelBytes=await fs.readFile(new URL('./assets/models/docking-bay.glb',import.meta.url));
 const bay=(await new GLTFLoader().parseAsync(modelBytes.buffer.slice(modelBytes.byteOffset,modelBytes.byteOffset+modelBytes.byteLength),'')).scene;
 let hull:THREE.Object3D|null=null;bay.traverse(o=>{if(String(o.userData.source_name??o.name).startsWith('SHIP '))hull=o;});
 check(!!hull,'Actual approved bay contains the fixed hull');
 const orbit=(hull! as THREE.Object3D).clone(true);orbit.position.set(0,0,0);
 const retired:THREE.Object3D[]=[];
 orbit.traverse((o:any)=>{const name=o.userData.source_name??o.name;if(o.userData.outline_for||/^(Installed cargo pod|Pod reinforcement band|Drive expansion root )/.test(name))retired.push(o);else if(o.isMesh){o.material=new THREE.MeshBasicMaterial();o.material.name=o.userData.source_material??'';}});
 retired.forEach(o=>o.removeFromParent());
 const actual=new BayShipModules(orbit,template.clone(true),new Map([[5,texture]]));actual.update({...base,armorClass:5});
 const actualPlates=actual.group.children.filter((o:any)=>o.isMesh&&o.name==='Approved tactical ceramic surface') as THREE.Mesh[];
 check(actualPlates.length===5,'Actual hull skin is batched into five cumulative area bands');
 const forwardVertices=actualPlates.reduce((sum,o)=>{const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)if(p.getY(i)>20)sum++;return sum;},0);
 check(forwardVertices>30,'Actual forward disc, bridge cap and rim keep their authored positions');
 return {passed,failed:0,results:[]};
}

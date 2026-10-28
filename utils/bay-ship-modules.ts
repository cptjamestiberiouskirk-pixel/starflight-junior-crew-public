import {armorAppearance} from './armor-style';
import {buildTacticalArmor,approvedCeramicAtlas} from './tactical-armor';
import * as THREE from 'three';
import {bayOutfitting,type BayOutfitting} from './bay-outfitting';
import kitManifest from '../assets/models/ship-outfitting-kit.json';

/** Authored Blender 5.2 fittings and the approved tactical ceramic surface maps. */
export class BayShipModules {
 readonly group=new THREE.Group();
 private models=new Map<string,THREE.Object3D>();
 private armor:THREE.Mesh[]=[];
 private armorMaterial=new THREE.MeshBasicMaterial({polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
 private armorCoverage:ReturnType<typeof buildTacticalArmor>;
 private ceramicAtlas:THREE.Texture|null;
 private value:BayOutfitting={cargoPods:0,armorClass:0,laserClass:0,missileClass:0,engineClass:0};
 private key='';
 constructor(parent:THREE.Object3D,kit:THREE.Group,private armorMaps:Map<number,THREE.Texture>=new Map()){
  this.group.name='Approved Blender 5.2 installed equipment';
  const materials=new Map<string,THREE.Material>();
  kit.traverse((o:any)=>{
   if(!o.isMesh)return;
   const name=o.userData.source_material as keyof typeof kitManifest.palette;
   if(!materials.has(name)){
    const p=kitManifest.palette[name];const color=new THREE.Color(...p.color as [number,number,number]);
    materials.set(name,p.unlit?new THREE.MeshBasicMaterial({color}):new THREE.MeshToonMaterial({color}));
   }
   o.material=materials.get(name);o.castShadow=true;o.receiveShadow=true;
  });
  for(const row of kitManifest.groups){
   const model=kit.getObjectByName(row.name);if(!model)throw new Error('Missing approved fitting '+row.name);
   model.visible=false;this.models.set(row.name,model);this.group.add(model);
  }
  // Allocate actual modeled skin area, including side and underside faces.
  // Reuse the approved ceramic artwork as the surface material, not its flat
  // silhouette as a substitute for a three-dimensional coverage calculation.
  this.armorCoverage=buildTacticalArmor(parent);
  this.ceramicAtlas=approvedCeramicAtlas(this.armorMaps.get(5)??this.armorMaps.values().next().value);
  this.armorCoverage.geometries.forEach((surface,index)=>{
   const overlay=new THREE.Mesh(surface,this.armorMaterial);overlay.name='Approved tactical ceramic surface';overlay.userData.armorBand=index+1;overlay.renderOrder=1;overlay.visible=false;this.armor.push(overlay);
  });
  if(this.armor.length)this.group.add(...this.armor);parent.add(this.group);
 }
 update(input:Parameters<typeof bayOutfitting>[0]){
  const cfg=bayOutfitting(input),key=JSON.stringify(cfg);if(key===this.key)return;this.key=key;this.value=cfg;
  for(const [name,model] of this.models){
   const [family,number]=name.split('-');const index=Number(number);
   model.visible=family==='cargo'?index<cfg.cargoPods:family==='laser'?index===cfg.laserClass:index===cfg.missileClass;
  }
  const appearance=armorAppearance(cfg.armorClass);
  this.armorMaterial.color.set('#ffffff').lerp(new THREE.Color(appearance.accent),appearance.tintOpacity);
  this.armorMaterial.map=this.ceramicAtlas;this.armorMaterial.needsUpdate=true;
  this.armor.forEach((mesh,index)=>mesh.visible=cfg.armorClass>index&&!!this.armorMaterial.map);
 }
 diagnostics(){
  const visible=[...this.models.entries()].filter(([,m])=>m.visible).map(([name])=>name);
  const laser=kitManifest.groups.find(g=>g.name===`laser-${this.value.laserClass}`);
  const missile=kitManifest.groups.find(g=>g.name===`missile-${this.value.missileClass}`);
  const covered=this.armor.reduce((n,m,i)=>n+(m.visible?this.armorCoverage.bandAreas[i]:0),0);
  return {...this.value,cargoPods:visible.filter(n=>n.startsWith('cargo-')).length,armorPlates:kitManifest.armorCoverage.find(c=>c.class===this.value.armorClass)?.coveredPixels??0,armorRequestedCoveragePercent:this.value.armorClass*20,armorEligibleArea:this.armorCoverage.totalArea,armorCoveredArea:covered,armorCoveragePercent:this.armorCoverage.totalArea?Number((covered/this.armorCoverage.totalArea*100).toFixed(6)):0,armorGlazingKeepouts:this.armorCoverage.keepouts.length,armorPlacement:'modeled-surface-area',armorStyle:'approved-tactical-white-ceramic',laserBarrels:laser?.primaryCount??0,missileTubes:missile?.primaryCount??0,weaponsStowed:true,source:'Blender 5.2.2 LTS',visibleModels:visible};
 }
}

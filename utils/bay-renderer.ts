import {drawConfiguredShipCPU} from './bay-cpu-renderer';
import {BayShipModules} from './bay-ship-modules';

import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import manifest from '../assets/models/docking-bay-manifest.json';
import {bayLaunchPose,bayDockPose,bayCameraFov} from './bay-flight';

const textures=new Map<string,THREE.Texture>();
const armorMaps=new Map<number,THREE.Texture>();
let approvedKit:THREE.Group;
let orbitKit:THREE.Group,orbitHull:THREE.Group|null=null,orbitOutfitting:BayShipModules|null=null;
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34.12,16/9,.1,600);
camera.up.set(0,0,1);scene.background=new THREE.Color('#050b18');
let renderer:THREE.WebGLRenderer|null=null,loading:Promise<void>|null=null,ready=false,error='';
let softwareLayer:HTMLCanvasElement|null=null;
// Retain the approved historical plate for provenance; configured software
// rendering now projects the actual room and hull together, avoiding misalignment.
const retainedPlate=new URL('../assets/models/docking-bay-fallback.mp4',import.meta.url).href;
let lastCpuFrame=-1,cpuFaces=0;
const roots=new Map<string,THREE.Group>(),materials=new Map<string,THREE.Material>();
const podGroups:THREE.Group[]=[],driveMaterials:THREE.MeshBasicMaterial[]=[];
let outfitting:BayShipModules|null=null;
let lastConfig='',lastTime=-1,lastWidth=0,lastHeight=0;
function material(name:string){
  if(materials.has(name))return materials.get(name)!;
  const m=(manifest.palette as any)[name]??{color:[.3,.4,.5],unlit:false};
  const color=new THREE.Color(...m.color);
  const map=m.texture?textures.get(m.texture):undefined;
  const value=m.unlit?new THREE.MeshBasicMaterial({color,map}):new THREE.MeshToonMaterial({color,map});
  if(m.proceduralNebula){
    const sky=new THREE.ShaderMaterial({vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader:`varying vec2 vUv;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){vec2 p=vUv*5.2;float n=noise(p)*.55+noise(p*2.0)*.27+noise(p*4.0)*.13;vec3 c=mix(vec3(.002,.004,.012),vec3(.045,.070,.095),smoothstep(.25,.72,n));gl_FragColor=vec4(c,1.0);
      #include <colorspace_fragment>
      }`});materials.set(name,sky);return sky;
  }
  if(name==='Drive glow')driveMaterials.push(value as THREE.MeshBasicMaterial);
  value.name=name;materials.set(name,value);return value;
}
const sourceName=(o:THREE.Object3D)=>o.userData.source_name??o.name;
// Glazing stays individually identifiable when static geometry is merged, so
// the armor allocator can preserve the same openings in bay and orbit views.
const moving=(o:THREE.Object3D)=>!o.userData.outline_for&&(/^(SHIP |Retracting clamp |Split blast door |Drive expansion root |Forward observation window )/.test(sourceName(o))||sourceName(o)==='Bridge cap');
function groupFor(owner:THREE.Object3D|null){
  if(!owner)return scene;
  const name=sourceName(owner);if(roots.has(name))return roots.get(name)!;
  const group=new THREE.Group();group.name=name;roots.set(name,group);
  let parent=owner.parent;while(parent&&!moving(parent))parent=parent.parent;
  const target=parent?groupFor(parent):scene;
  const matrix=parent?parent.matrixWorld.clone().invert().multiply(owner.matrixWorld):owner.matrixWorld;
  matrix.decompose(group.position,group.quaternion,group.scale);target.add(group);return group;
}
function loadModel(model:THREE.Group){
  model.updateMatrixWorld(true);
  // Retain individual hull meshes for the orbit camera. The bay's merged ink
  // bucket contains reverse-wound silhouette shells meant for its own view.
  // Those shells obscure the hull from orbital angles; ordinary panel seams,
  // pressure-hull geometry and the approved equipment remain intact here.
  let physical:THREE.Object3D|null=null;
  model.traverse(o=>{if(sourceName(o).startsWith('SHIP '))physical=o;});
  if(physical&&!orbitHull){
    orbitHull=(physical as THREE.Group).clone(true);orbitHull.position.set(0,0,0);
    const retired:THREE.Object3D[]=[];
    orbitHull.traverse((o:any)=>{
      const name=sourceName(o);
      if(o.userData.outline_for||/^(Installed cargo pod|Pod reinforcement band|Drive expansion root )/.test(name)){retired.push(o);return;}
      if(o.isMesh)o.material=material(o.userData.source_material??'Hull • warm chalk');
    });
    retired.forEach(o=>o.removeFromParent());
    orbitOutfitting=new BayShipModules(orbitHull,orbitKit,armorMaps);
  }
  const buckets=new Map<string,{target:THREE.Object3D,material:THREE.Material,geometries:THREE.BufferGeometry[]}>();
  // UUID strings can collide in seeded/disposable sessions. Group by actual
  // object identity so separate windows, doors and ship roots cannot collapse.
  const targetIdentities=new WeakMap<THREE.Object3D,number>();let nextTargetIdentity=0;
  const podTemplate=new THREE.Group();
  model.traverse((o:any)=>{
    if(!o.isMesh)return;
    // Inverse-wound silhouette shells need a depth buffer. Keep authored panel
    // seams, but omit those shells in the software painter to avoid black fans.
    if(!renderer&&o.userData.outline_for)return;
    const name=sourceName(o),parentName=o.userData.outline_for??name;
    // A finite sky quad exposes its edges when the camera leaves the hangar.
    // Use the existing full-view space painting without changing model bytes.
    if(o.userData.source_material==='Illustrated distant nebula'&&scene.background instanceof THREE.Texture)return;
    const pod=/^(Installed cargo pod|Pod reinforcement band) /.test(parentName);
    if(pod)return; // Retired prototype pods are replaced by the approved 5.2 capsule meshes.
    let owner=moving(o)?o:o.parent;while(owner&&!moving(owner))owner=owner.parent;
    const target=pod?podTemplate:groupFor(owner);
    const matrix=owner?owner.matrixWorld.clone().invert().multiply(o.matrixWorld):o.matrixWorld.clone();
    const g=(o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone());
    for(const key of Object.keys(g.attributes))if(key!=='position'&&key!=='normal'&&key!=='uv')g.deleteAttribute(key);
    if(!g.attributes.uv)g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));
    if(!g.attributes.normal)g.computeVertexNormals();g.applyMatrix4(matrix);
    const matName=o.userData.source_material??'Hull • warm chalk';
    let targetIdentity=targetIdentities.get(target);if(targetIdentity===undefined){targetIdentity=nextTargetIdentity++;targetIdentities.set(target,targetIdentity);}
    const key=(pod?'pod':targetIdentity)+'|'+matName;
    if(!buckets.has(key))buckets.set(key,{target,material:material(matName),geometries:[]});
    buckets.get(key)!.geometries.push(g);
  });
  for(const {target,material:mat,geometries} of buckets.values()){
    const merged=mergeGeometries(geometries,false);if(!merged)throw new Error('Cannot merge approved bay geometry');
    const mesh=new THREE.Mesh(merged,mat);mesh.castShadow=mat.type!=='MeshBasicMaterial';mesh.receiveShadow=mesh.castShadow;target.add(mesh);
    geometries.forEach(g=>g.dispose());
  }
  const ship=[...roots.values()].find(g=>g.name.startsWith('SHIP '))!;
  outfitting=new BayShipModules(ship,approvedKit,armorMaps);
  // Lighting is derived from the approved Blender fixture manifest.
  scene.add(new THREE.AmbientLight(0x9bb9db,.65));
  for(const fixture of manifest.lights){
    if(fixture.name.startsWith('Amber wall spill')){
      const light=new THREE.PointLight(new THREE.Color(...fixture.color),fixture.energy/40,30,2);light.position.set(...fixture.position);scene.add(light);continue;
    }
    const light=new THREE.DirectionalLight(new THREE.Color(...fixture.color),fixture.energy/60000);
    light.position.set(...fixture.position);light.target.position.set(...fixture.target);scene.add(light,light.target);
    if(fixture.name==='Ceiling soft key'){
      light.castShadow=true;light.shadow.mapSize.set(1024,1024);light.shadow.camera.left=-42;light.shadow.camera.right=42;
      light.shadow.camera.top=85;light.shadow.camera.bottom=-80;light.shadow.camera.far=200;light.shadow.normalBias=.12;light.shadow.bias=-.0002;
    }
  }
  ready=true;
}
export function prepareBay(){
  if(loading)return loading;
  loading=(async()=>{
    const gltf=new GLTFLoader();
    approvedKit=(await gltf.loadAsync(new URL('../assets/models/ship-outfitting-kit.glb',import.meta.url).href)).scene;
    orbitKit=approvedKit.clone(true);
    const armorLoader=new THREE.TextureLoader();
    const urls=[
      new URL('../assets/models/ship-armor-1.png',import.meta.url).href,
      new URL('../assets/models/ship-armor-2.png',import.meta.url).href,
      new URL('../assets/models/ship-armor-3.png',import.meta.url).href,
      new URL('../assets/models/ship-armor-4.png',import.meta.url).href,
      new URL('../assets/models/ship-armor-5.png',import.meta.url).href,
    ];
    await Promise.all(urls.map(async(url,i)=>{const map=await armorLoader.loadAsync(url);map.colorSpace=THREE.SRGBColorSpace;armorMaps.set(i+1,map);}));
      const loader=new THREE.TextureLoader();
      await Promise.all([
        ['hangar-painted-atlas.png',new URL('../assets/models/hangar-painted-atlas.png',import.meta.url).href],
        ['hangar-painted-deck.png',new URL('../assets/models/hangar-painted-deck.png',import.meta.url).href],
      ].map(async([name,url])=>{const texture=await loader.loadAsync(url);texture.colorSpace=THREE.SRGBColorSpace;texture.flipY=false;texture.anisotropy=4;textures.set(name,texture);}));
      const paintedSpace=await loader.loadAsync(new URL('../assets/images/space_bg_a.png',import.meta.url).href);
      paintedSpace.colorSpace=THREE.SRGBColorSpace;scene.background=paintedSpace;
    try{
      renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
      renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
      loadModel((await new GLTFLoader().loadAsync(new URL('../assets/models/docking-bay.glb',import.meta.url).href)).scene);
    }catch(e){
      error=String(e);renderer?.dispose();renderer=null;
      if(!roots.size)loadModel((await new GLTFLoader().loadAsync(new URL('../assets/models/docking-bay.glb',import.meta.url).href)).scene);
      ready=true;
    }
  })();return loading;
}
export const bayReady=()=>ready;
export function drawBayDeparture(ctx:CanvasRenderingContext2D,width:number,height:number,progress:number,ship:{engineClass:number,cargoPodsCount:number,armorClass?:number,missileClass?:number,laserClass?:number},quality='High',arrival=false){
  const pose=arrival?bayDockPose(progress):bayLaunchPose(progress);void prepareBay();
  ctx.fillStyle='#050b18';ctx.fillRect(0,0,width,height);
  if(ready&&roots.size){
    const key=JSON.stringify([ship,arrival]);
    if(key!==lastConfig){
      const count=Math.max(0,Math.min(16,Math.floor(ship.cargoPodsCount)));

      outfitting?.update(ship);
      const color=new THREE.Color(['#00f0ff','#38bdf8','#06b6d4','#d946ef','#facc15'][Math.max(0,Math.min(4,ship.engineClass-1))]);
      driveMaterials.forEach(mat=>mat.color.copy(color));lastConfig=key;lastTime=-1;lastCpuFrame=-1;
    }
    const pixelRatio=quality==='Low'?.65:quality==='Medium'?.85:1;
    const w=Math.max(1,Math.round(width*pixelRatio)),h=Math.max(1,Math.round(height*pixelRatio));
    if(w!==lastWidth||h!==lastHeight){renderer?.setSize(w,h,false);lastWidth=w;lastHeight=h;lastTime=-1;}
    if(pose.seconds!==lastTime){
      for(const [name,group] of roots){
        if(name.startsWith('SHIP '))group.position.set(0,pose.distance,6);
        else if(name.startsWith('Retracting clamp ')){
          const [side,y]=name.substring(17).split(' ').map(Number),initial=y===-12?6:11.5;
          group.position.x=side*(initial+(21.5-initial)*pose.clampOpen);
        }else if(name.startsWith('Split blast door '))group.position.x=Number(name.substring(17))*(14+30*pose.doorOpen);
        else if(name.startsWith('Drive expansion root ')){group.visible=ship.engineClass>0&&pose.mainThrust>0;group.scale.setScalar(Math.max(.001,pose.mainThrust));}
      }
      camera.aspect=width/height;
      camera.fov=bayCameraFov(camera.aspect);
      camera.position.set(...pose.camera);camera.lookAt(...pose.target);camera.updateProjectionMatrix();
      if(renderer){renderer.shadowMap.enabled=quality!=='Low';renderer.render(scene,camera);}
      else if(Math.round(pose.seconds*30)!==lastCpuFrame||key!==lastConfig){
        softwareLayer??=document.createElement('canvas');const cw=Math.min(640,Math.round(width)),ch=Math.max(1,Math.round(cw*height/width));
        if(softwareLayer.width!==cw||softwareLayer.height!==ch){softwareLayer.width=cw;softwareLayer.height=ch;}
        const context=softwareLayer.getContext('2d')!;context.clearRect(0,0,cw,ch);
        cpuFaces=drawConfiguredShipCPU(context,scene,camera,0,0,cw,ch);lastCpuFrame=Math.round(pose.seconds*30);
      }
      lastTime=pose.seconds;
    }
    if(renderer)ctx.drawImage(renderer.domElement,0,0,width,height);
    else {
      ctx.fillStyle='#050b18';ctx.fillRect(0,0,width,height);
      const space=scene.background instanceof THREE.Texture?scene.background.image:null;
      if(space)ctx.drawImage(space,0,0,width,height);
      if(softwareLayer)ctx.drawImage(softwareLayer,0,0,width,height);
    }
  }
  const invalidTransforms=[...roots.values()].filter(o=>![...o.position.toArray(),...o.quaternion.toArray(),...o.scale.toArray()].every(Number.isFinite)).length;
  ctx.canvas.dataset.bay=JSON.stringify({ready,arrival,mode:renderer?'3d':'cpu-3d-fallback',retainedPlate,cpuFaces,error,invalidTransforms,seconds:pose.seconds,altitude:pose.worldAltitude,camera:pose.camera,target:pose.target,fov:camera.fov,paintedSpace:scene.background instanceof THREE.Texture,distance:pose.distance,doors:pose.doorOpen,clamps:pose.clampOpen,thrust:pose.mainThrust,cargoPods:outfitting?.diagnostics().cargoPods??0,outfitting:outfitting?.diagnostics(),textures:textures.size,raster:[lastWidth,lastHeight],calls:renderer?.info.render.calls,triangles:renderer?.info.render.triangles});
  return pose;
}

/** Share the approved physical hull/fittings with orbital presentation. Geometry
 * and materials are reused; scene transforms/visibility are independent. */
export function configuredOrbitModel(config:{engineClass:number;cargoPodsCount:number;armorClass:number;laserClass:number;missileClass:number}){
 void prepareBay().catch(()=>{});
 if(!orbitHull||!orbitOutfitting)return null;
 orbitOutfitting.update(config);
 const model=orbitHull.clone(true);model.userData.armorCoverage=orbitOutfitting.diagnostics();return model;
}

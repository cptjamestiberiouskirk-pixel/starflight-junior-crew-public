import * as THREE from 'three';
import {configuredOrbitModel} from './bay-renderer';
import {drawConfiguredShipCPU} from './bay-cpu-renderer';
import {orbitShipAttitude} from './system-flight';
type Config={engineClass:number;cargoPodsCount:number;armorClass:number;laserClass:number;missileClass:number};
const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-38,38,38,-38,.1,400);
camera.up.set(0,0,1);const elevation=orbitShipAttitude(0).cameraElevation;
camera.position.set(0,-120*Math.cos(elevation),120*Math.sin(elevation));camera.lookAt(0,0,0);
scene.add(new THREE.AmbientLight(0xb5d6f6,1.7));const key=new THREE.DirectionalLight(0xfff3df,2);key.position.set(-45,-30,90);scene.add(key);
let renderer:THREE.WebGLRenderer|null=null,attempted=false,model:THREE.Group|null=null,configKey='',fallback:HTMLCanvasElement|null=null;
let cpuPhase=-Infinity;
/** Uses the existing approved bay hull and Blender 5.2 fittings in an orbital
 * camera; actual 3D geometry changes its apparent attitude, not sprite squashing. */
export function drawOrbitShip(ctx:CanvasRenderingContext2D,x:number,y:number,length:number,phase:number,config:Config){
 const pose=orbitShipAttitude(phase),nextKey=JSON.stringify(config);
 if(!model||configKey!==nextKey){const next=configuredOrbitModel(config);if(!next)return false;if(model)scene.remove(model);model=next;scene.add(model);configKey=nextKey;cpuPhase=-Infinity;}
 model.rotation.set(0,pose.bank,pose.heading,'ZYX');model.updateMatrixWorld(true);
 if(!attempted){attempted=true;try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});renderer.setSize(256,256,false);renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;}catch{renderer=null;}}
 let source:HTMLCanvasElement;
 if(renderer){renderer.render(scene,camera);source=renderer.domElement;}
 else {
  if(!fallback){fallback=document.createElement('canvas');fallback.width=256;fallback.height=256;}const cpu=fallback.getContext('2d');if(!cpu)return false;
  if(Math.abs(phase-cpuPhase)>.02){cpu.clearRect(0,0,256,256);drawConfiguredShipCPU(cpu,model,camera,0,0,256,256);cpuPhase=phase;}
  source=fallback;
 }
 const size=length*1.38;ctx.drawImage(source,x-size/2,y-size/2,size,size);
 if(ctx.canvas?.dataset){ctx.canvas.dataset.orbitShipMode=renderer?'modeled-perspective':'modeled-cpu';ctx.canvas.dataset.orbitShipHeading=pose.heading.toFixed(5);ctx.canvas.dataset.orbitShipBank=pose.bank.toFixed(5);ctx.canvas.dataset.orbitShipConfiguration=configKey;ctx.canvas.dataset.orbitShipArmor=JSON.stringify(model.userData.armorCoverage);}
 return true;
}

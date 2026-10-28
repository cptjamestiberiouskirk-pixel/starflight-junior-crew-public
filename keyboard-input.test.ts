import assert from 'node:assert/strict';
import {controlOwnsKey} from './utils/keyboard-input';

export function runKeyboardInputTests(){
 let passed=0;const check=(value:boolean,label:string)=>{assert(value,label);passed++;};
 const target=(tag:string,role='',nested=false)=>({closest(selector:string){if(selector.startsWith('input'))return ['input','textarea','select','editable'].includes(tag)?this:null;return tag==='button'||role?{getAttribute:()=>role}:null;},nested}) as unknown as EventTarget;
 for(const tag of ['button','svg-child'])for(const key of ['Enter',' ','Tab'])check(controlOwnsKey(target('button','',tag==='svg-child'),key),tag+' activation cannot board, fire or cycle tactical target');
 for(const tag of ['input','textarea','select','editable'])for(const key of ['ArrowLeft','Enter',' '])check(controlOwnsKey(target(tag),key),tag+' retains native editing');
 for(const role of ['tab','slider','combobox'])for(const key of ['ArrowLeft','ArrowRight','Home','End'])check(controlOwnsKey(target('div',role),key),role+' owns navigation '+key);
 for(const key of ['ArrowUp','ArrowDown','w','g'])check(!controlOwnsKey(target('button'),key),'Movement/hotkeys still work after clicking ordinary rover/Maneuver controls: '+key);
 check(!controlOwnsKey(null,'Enter'),'Background Enter still reaches game controls');
 check(!controlOwnsKey({} as EventTarget,'ArrowUp'),'Non-element event target is harmless');
 return {passed,failed:0,results:[]};
}

/** Native controls own their activation keys; roving tabs own navigation keys.
 * Ordinary movement keys still work after clicking Maneuver or rover buttons. */
export function controlOwnsKey(target:EventTarget|null,key:string):boolean {
 const element=target as Element|null;
 if(!element||typeof element.closest!=='function')return false;
 if(element.closest('input,textarea,select,[contenteditable="true"]'))return true;
 const control=element.closest('button,[role="button"],[role="tab"],[role="slider"],[role="combobox"]');
 if(!control)return false;
 if(key==='Enter'||key===' '||key==='Tab')return true;
 return ['tab','slider','combobox'].includes(control.getAttribute('role')??'')&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(key);
}

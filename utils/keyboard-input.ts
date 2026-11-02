type KeyPress = Pick<KeyboardEvent, 'code'|'key'>;

function keyName(key:string) {
  return key.length===1 ? key.toLowerCase() : key;
}

/** Keep the logical command selected on keydown until its physical key is released. */
export class HeldKeys {
  private bindings=new Map<string,string>();

  keyDown(event:KeyPress & {repeat:boolean},record:boolean):boolean {
    const physical=event.code || keyName(event.key);
    if (this.bindings.has(physical)) return true;
    if (event.repeat) return false; // Held across a pause or location change.
    if (record) this.bindings.set(physical,keyName(event.key));
    return true;
  }

  keyUp(event:KeyPress) {
    this.bindings.delete(event.code || keyName(event.key));
  }

  has(...commands:string[]):boolean {
    for (const command of this.bindings.values()) if (commands.includes(command)) return true;
    return false;
  }

  clear() { this.bindings.clear(); }
}

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

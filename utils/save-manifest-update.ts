import {parseSaveJSON,parseSaveManifest} from './save-codec';
import {MAX_SAVE_JSON_BYTES,MAX_SAVE_NODES,saveJSONTextWithinBudget} from './save-validation';

/** Locate an object element in an already validated JSON array. The span
 * excludes surrounding whitespace and the array's commas. */
function objectSpan(text:string,elementIndex:number):[number,number]|null {
  let depth=0, index=0, start=-1, quoted=false;
  for (let i=0;i<text.length;i++) {
    const char=text[i];
    if (quoted) {
      if (char==='\\') i++;
      else if (char==='"') quoted=false;
    } else if (char==='"') {
      quoted=true;
    } else if (char==='{' || char==='[') {
      if (depth===1 && index===elementIndex) start=i;
      depth++;
    } else if (char==='}' || char===']') {
      depth--;
      if (start!==-1 && depth===1) return [start,i+1];
    } else if (char===',' && depth===1) {
      index++;
    }
  }
  return null;
}

/** Primary slot writes are independent of the optional manifest backup. A
 * null result leaves the original manifest intact. */
export function updatedSaveManifest(rawManifest:string|null,serializedSlot:string):string|null {
  const target=parseSaveJSON(serializedSlot);
  if (!target || typeof target!=='object' || !('slot' in target) ||
      typeof target.slot!=='string' || !['A','B','C','D','E'].includes(target.slot)) return null;
  const original=rawManifest ?? '[]';
  const entries=parseSaveManifest(original);
  if (!entries) return null;

  const matches=(entry:unknown)=>entry!==null && typeof entry==='object' && 'slot' in entry && entry.slot===target.slot;
  const index=entries.findIndex(matches);
  let updated:string;
  if (index===-1) {
    if (entries.length===5) return null;
    const close=original.lastIndexOf(']');
    updated=original.slice(0,close)+(entries.length ? ',' : '')+serializedSlot+original.slice(close);
  } else {
    if (entries.slice(index+1).some(matches)) return null;
    const span=objectSpan(original,index);
    if (!span) return null;
    updated=original.slice(0,span[0])+serializedSlot+original.slice(span[1]);
  }
  return saveJSONTextWithinBudget(updated,MAX_SAVE_JSON_BYTES*5,MAX_SAVE_NODES*5) ? updated : null;
}

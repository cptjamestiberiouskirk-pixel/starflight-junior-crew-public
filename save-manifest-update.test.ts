import assert from 'node:assert/strict';
import {updatedSaveManifest} from './utils/save-manifest-update';
import {MAX_SAVE_DEPTH} from './utils/save-validation';

export function runSaveManifestUpdateTests() {
  let passed=0;
  const check=(actual:string|null,expected:string|null,label:string)=>{
    assert.equal(actual,expected,label);
    passed++;
  };
  const target=JSON.stringify({slot:'B',shipName:'New [B], "intact"',empty:false});
  const oldTarget='{"sl\\u006ft":"B","history":[{"slot":"D","name":"brackets [ ], commas"}]}';
  const opaque='{"slot":"D","sequence":9007199254740993,"overflow":1e400,"factor":-0.0000100e-050}';
  const punctuation=JSON.stringify({name:'braces [ } and a quote " after a slash \\',list:[[']',','],{slot:'B'}]});
  const before=' \n [\t', between=' \r\n,\t', after=' \r\n] \t';
  for (const input of [
    [oldTarget,opaque,punctuation],
    [opaque,oldTarget,punctuation],
    [opaque,punctuation,oldTarget],
    ['null','"string with [,] punctuation"','[false,{"slot":"B"}]','2',oldTarget],
    [oldTarget],
  ]) {
    const original=before+input.join(between)+after;
    const expected=before+input.map(entry=>entry===oldTarget ? target : entry).join(between)+after;
    check(updatedSaveManifest(original,target),expected,'Replace only the destination object, preserving the surrounding raw text');
  }
  check(updatedSaveManifest(null,target),'['+target+']','Create the first manifest');
  check(updatedSaveManifest(' \n [\t\r] \n',target),' \n [\t\r'+target+'] \n','Append to a formatted empty manifest');
  const partial='[ '+opaque+', '+punctuation+' \n] ';
  check(updatedSaveManifest(partial,target),'[ '+opaque+', '+punctuation+' \n,'+target+'] ','Append without rewriting opaque entries or trailing whitespace');
  for (const bad of ['','[1,]','{}','[null,null,null,null,null,null]','\uFEFF[]','[[],{},null,1,true]']) {
    check(updatedSaveManifest(bad,target),null,'Leave invalid or full unmatched manifests intact');
  }
  check(updatedSaveManifest('['+oldTarget+','+opaque+','+oldTarget+']',target),null,'An ambiguous target is left intact');
  for (const badTarget of ['null','[]','{}','{"slot":"Z"}','{"slot":"B","unknown":1e400}','{"slot":"B",}']) {
    check(updatedSaveManifest(partial,badTarget),null,'Invalid slot input cannot damage an existing backup');
  }
  // An empty innermost array keeps the standalone slot within the depth budget.
  // Wrapping it in a manifest adds one level beyond the manifest reader's limit.
  const deepTarget='{"slot":"B","data":'+'['.repeat(MAX_SAVE_DEPTH)+']'.repeat(MAX_SAVE_DEPTH)+'}';
  check(updatedSaveManifest('[]',deepTarget),null,'Skip writes when the resulting manifest exceeds the reader budget');
  return {passed,failed:0,results:[]};
}

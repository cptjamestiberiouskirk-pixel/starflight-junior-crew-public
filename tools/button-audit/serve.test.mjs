import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

// A missing build root makes every subprocess exit before creating a server.
// Protected ports must reject even earlier, without reading the build at all.
const fixture=fs.mkdtempSync(path.join(os.tmpdir(),'junior-audit-port-'));
try {
  const missing=path.join(fixture,'missing-build');
  let passed=0;
  for(const port of [4174,4188,5198,0]) {
    const result=spawnSync(process.execPath,[fileURLToPath(new URL('./serve.mjs',import.meta.url)),missing,String(port)],{encoding:'utf8',timeout:5000,windowsHide:true});
    assert.equal(result.error,undefined,'Audit helper must exit without binding or hanging');
    assert.equal(result.status,1);
    if([4174,4188].includes(port)) {
      assert.match(result.stderr,/Audit bridge must never use owner origin/);
      assert.doesNotMatch(result.stderr,/ENOENT/);
    } else {
      assert.match(result.stderr,/ENOENT/);
      assert.doesNotMatch(result.stderr,/Audit bridge must never use owner origin/);
    }
    passed++;
  }
  console.log(JSON.stringify({status:'passed',passed,ownerPortsBound:false}));
} finally {
  fs.rmdirSync(fixture);
}

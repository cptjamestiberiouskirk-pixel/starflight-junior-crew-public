// Temporary, checksum-bound mitigation for SNYK-JS-PICOMATCH-21248802.
// There is no fixed upstream release as of 2026-10-26. Do not disguise its version
// or suppress the advisory. Reject ambiguous repeat globs rather
// than silently interpreting them as literals. Ordinary repo globs are unchanged.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const lock=JSON.parse(fs.readFileSync(path.join(root,'package-lock.json'),'utf8'));
const hash=s=>createHash('sha256').update(s).digest('hex');
const expected='4e1e05447668aa1e94366c5516a2bcd8f5fff800cc92b1d0cd7d77703b8618c4';
const before='    const analysis = analyzeRepeatedExtglob(body, opts);';
const after=`    // Junior Crew: reject ambiguous repeated extglobs before
    // analysis, including when maxExtglobRecursion is explicitly disabled.
    const juniorBranches = splitTopLevel(body);
    if ((token.type === 'plus' || token.type === 'star') &&
        (juniorBranches.some(branch => /[*+?([\\]{}\\\\]/.test(branch)) ||
         juniorBranches.some((branch, index) => branch === '' ||
           juniorBranches.some((other, otherIndex) => index !== otherIndex && other.startsWith(branch))))) {
      const error = new SyntaxError('Unsafe ambiguous repeated extglob');
      error.code = 'ERR_UNSAFE_REPEATED_EXTGLOB';
      throw error;
    }
${before}`;
let checked=0,patched=0;
for(const [relative,info] of Object.entries(lock.packages)){
 if(!relative.endsWith('/picomatch'))continue;
 const directory=path.join(root,relative);if(!fs.existsSync(directory))continue; // optional/omit=dev install
 if(info.version!=='4.0.7')throw Error('Review picomatch mitigation for new version: '+info.version);
 const file=path.join(directory,'lib/parse.js'),source=fs.readFileSync(file,'utf8');
 const original=source.replace(/    \/\/ Junior Crew: reject[^]*?    const analysis = analyzeRepeatedExtglob\(body, opts\);/,before);
 if(hash(original)!==expected)throw Error('Unexpected picomatch parser; refusing unreviewed modification: '+relative);
 checked++;
 const guarded=original.replace(before,after);
 if(source!==guarded){fs.writeFileSync(file,guarded);patched++;}
}
console.log(JSON.stringify({mitigation:'SNYK-JS-PICOMATCH-21248802',checked,patched}));

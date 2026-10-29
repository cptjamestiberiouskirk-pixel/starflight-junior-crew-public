import {existsSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const digest=data=>createHash('sha256').update(data).digest('hex');
/** A missing cache is portable; an incomplete or stale cache fails closed. */
export function shipRuntimePlan(base=root){
  const root=base;
  const approved=JSON.parse(readFileSync(new URL('assets/ships/manifest.json',root),'utf8'));
  const cacheURL=new URL('artifacts/ship-runtime/manifest.json',root);
  const cached=existsSync(cacheURL)?JSON.parse(readFileSync(cacheURL,'utf8')):null;
  if(cached&&(cached.version!==1||cached.images?.length!==approved.images.length))throw new Error('Invalid ship runtime cache; rerun npm run optimize:ships');
  const bySource=new Map(cached?.images.map(row=>[row.source,row]));
  if(cached&&bySource.size!==approved.images.length)throw new Error('Duplicate ship runtime cache entry');
  return approved.images.map(source=>{
    const entry=bySource.get(source.file);
    if(cached&&(!entry||entry.sourceSha256!==source.sha256))throw new Error('Stale ship runtime cache: '+source.file);
    const file=entry?.file??source.file;
    if(file!==source.file&&file!==source.file.replace(/\.png$/,'.webp'))throw new Error('Invalid ship runtime filename');
    const from=new URL((file.endsWith('.webp')?'artifacts/ship-runtime/':'assets/ships/configurations/')+file,root);
    const sha256=entry?.sha256??source.sha256;
    const data=readFileSync(from);
    if(digest(data)!==sha256)throw new Error('Ship runtime checksum mismatch: '+file);
    return {source:source.file,file,sha256,from,bytes:data.length};
  });
}

import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const APP_PATH='/starflight-junior-crew/';
export const STATUS_PATH='/__junior_tester__/status';
export const SERVER_ID='starflight-junior-crew-windows-tester-v1';
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.txt':'text/plain; charset=utf-8','.md':'text/plain; charset=utf-8',
  '.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.svg':'image/svg+xml',
  '.ico':'image/x-icon','.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf','.glb':'model/gltf-binary',
  '.m4a':'audio/mp4','.mp3':'audio/mpeg','.wav':'audio/wav','.webm':'video/webm','.mp4':'video/mp4'};

export function singleRange(header,size) {
  if(header===undefined)return null;
  const m=/^bytes=(\d*)-(\d*)$/.exec(header);
  if(!m||(!m[1]&&!m[2])||size===0)return false;
  let start,end;
  if(!m[1]){const suffix=Number(m[2]);if(!Number.isSafeInteger(suffix)||suffix<=0)return false;start=Math.max(0,size-suffix);end=size-1;}
  else {start=Number(m[1]);end=m[2]?Math.min(Number(m[2]),size-1):size-1;}
  return Number.isSafeInteger(start)&&Number.isSafeInteger(end)&&start>=0&&start<size&&end>=start?{start,end}:false;
}

// One bounded bucket for the loopback server, not an attacker-keyed map. Defaults
// permit ordinary parallel asset loads while bounding filesystem work and sockets.
export async function createTesterServer(gameRoot,build,limits={}) {
  const {burst=512,requestsPerSecond=128,maxActiveResponses=64,maxConnections=128,clock=Date.now}=limits;
  for(const value of [burst,requestsPerSecond,maxActiveResponses,maxConnections])if(!Number.isSafeInteger(value)||value<1)throw new Error('Invalid server limit.');
  if(typeof clock!=='function')throw new Error('Invalid server clock.');
  let tokens=burst,last=clock(),active=0;
  const root=await fsp.realpath(gameRoot);
  const contained=file=>file===root||file.startsWith(root+path.sep);
  const server=http.createServer(async(req,res)=>{
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Cache-Control','no-store');
    const finish=(status,text,extra={})=>{res.writeHead(status,{'Content-Type':'text/plain; charset=utf-8',...extra});res.end(req.method==='HEAD'?undefined:text);};
    let admitted=false,operationDone=false,responseDone=false;
    const release=()=>{if(admitted&&operationDone&&responseDone){admitted=false;active--;}};
    try {
      const port=server.address()?.port;
      if(!['127.0.0.1:'+port,'localhost:'+port].includes(req.headers.host))return finish(403,'Local requests only.');
      if(!['GET','HEAD'].includes(req.method))return finish(405,'Read-only game server.',{Allow:'GET, HEAD'});
      // Reserve before every route and any await. Reject overload without opening
      // files; finish/close share one idempotent release, including aborted streams.
      if(active>=maxActiveResponses)return finish(503,'Game server is busy.',{'Retry-After':'1'});
      const current=clock();tokens=Math.min(burst,tokens+Math.max(0,current-last)*requestsPerSecond/1000);last=Math.max(last,current);
      if(tokens<1)return finish(429,'Too many game requests.',{'Retry-After':'1'});
      tokens--;active++;admitted=true;
      const responseFinished=()=>{responseDone=true;release();};
      res.once('finish',responseFinished);res.once('close',responseFinished);
      if(!req.url||req.url.length>8192)return finish(414,'Request path is too long.');
      const pathname=new URL(req.url,'http://127.0.0.1:'+port).pathname;
      if(pathname===STATUS_PATH){res.writeHead(200,{'Content-Type':'application/json; charset=utf-8'});return res.end(req.method==='HEAD'?undefined:JSON.stringify({server:SERVER_ID,build,port,pid:process.pid}));}
      if(pathname==='/'||pathname===APP_PATH.slice(0,-1)){res.writeHead(302,{Location:APP_PATH});return res.end();}
      if(!pathname.startsWith(APP_PATH))return finish(404,'Game file not found.');
      let relative;
      try {relative=decodeURIComponent(pathname.slice(APP_PATH.length))||'index.html';}catch{return finish(400,'Invalid path encoding.');}
      const parts=relative.split('/');
      if(parts.some(p=>!p||p==='.'||p==='..'||/[<>:"|?*\\\x00-\x1f]/.test(p)||/[. ]$/.test(p)))return finish(400,'Invalid game path.');
      const candidate=path.resolve(root,...parts);
      if(!contained(candidate))return finish(403,'Outside game folder.');
      const real=await fsp.realpath(candidate);
      if(res.destroyed)return;
      if(!contained(real))return finish(403,'Outside game folder.');
      const stat=await fsp.stat(real);
      if(res.destroyed)return;
      if(!stat.isFile())return finish(404,'Game file not found.');
      const range=singleRange(req.headers.range,stat.size);
      if(range===false)return finish(416,'Requested range is unavailable.',{'Content-Range':'bytes */'+stat.size});
      const start=range?.start??0,end=range?.end??stat.size-1;
      const headers={'Content-Type':MIME[path.extname(real).toLowerCase()]??'application/octet-stream','Accept-Ranges':'bytes',
        'Content-Length':range?end-start+1:stat.size};
      if(range)headers['Content-Range']=`bytes ${start}-${end}/${stat.size}`;
      res.writeHead(range?206:200,headers);
      if(req.method==='HEAD'||stat.size===0)return res.end();
      const stream=fs.createReadStream(real,{start,end});
      stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);
    }catch(e){if(res.destroyed)return;if(res.headersSent)res.destroy();else finish(e.code==='ENOENT'||e.code==='ENOTDIR'?404:500,'Game file could not be read.');}
    finally{operationDone=true;release();}
  });
  server.keepAliveTimeout=5000;server.headersTimeout=10000;server.requestTimeout=10000;
  server.maxConnections=maxConnections;server.maxRequestsPerSocket=256;
  server.setTimeout(15000,socket=>socket.destroy());
  server.on('clientError',(_error,socket)=>{if(socket.writable)socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n');});
  return server;
}

async function main() {
  const packageRoot=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
  const info=JSON.parse(await fsp.readFile(path.join(packageRoot,'BUILD-INFO.json'),'utf8'));
  if(!/^[a-f0-9]{64}$/.test(info.buildSHA256))throw Error('Missing tester build identity.');
  const server=await createTesterServer(path.join(packageRoot,'game'),info.buildSHA256);
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(4188,'127.0.0.1',resolve);});
  process.stdout.write(JSON.stringify({server:SERVER_ID,build:info.buildSHA256,port:4188,pid:process.pid})+'\n');
  const shutdown=()=>{server.close();server.closeAllConnections();process.exitCode=0;};
  if(process.argv.includes('--managed')){process.stdin.resume();process.stdin.once('end',shutdown);}
  process.once('SIGTERM',shutdown);process.once('SIGINT',shutdown);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(e=>{console.error(e.code??e.message);process.exitCode=1;});

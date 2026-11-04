import fs from 'node:fs/promises';import path from 'node:path';import {createHash} from 'node:crypto';import {createTesterServer} from '../windows-tester/server.mjs';
const root=path.resolve(process.argv[2]),port=Number(process.argv[3]??5198);if([4174,4188].includes(port))throw Error('Audit bridge must never use owner origin');
const html=await fs.readFile(path.join(root,'index.html'),'utf8'),entry=html.match(/src="\.\/([^"\s]+\.js)"/)[1],hash=createHash('sha256').update(await fs.readFile(path.join(root,entry))).digest('hex');
const server=await createTesterServer(root,hash);await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});console.log(JSON.stringify({port,pid:process.pid,root,hash}));

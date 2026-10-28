import assert from 'node:assert/strict';
import {ParentRpcClient,notifyParentReady,trustedParentOrigin} from './utils/parent-messaging';

export async function runParentMessagingTests() {
  let passed=0;
  const check=(condition:unknown,label:string)=>{assert(condition,label);passed++;};
  const local='http://127.0.0.1:5173',trusted='https://host.example:8443';
  for(const value of ['*','null','file:///tmp/a','data:text/html,test','javascript:alert(1)','//host.example','https://a.example/path','https://a.example?x=1','https://a.example#x','https://user:pass@a.example','not an origin'])
    check(trustedParentOrigin(value,local)===null,'Malformed/opaque/wildcard/credential/path origin fails closed: '+value);
  check(trustedParentOrigin(undefined,local)===local,'Default is exact local origin');
  check(trustedParentOrigin('',local)===local,'Empty build setting preserves same-origin preview');
  check(trustedParentOrigin('https://HOST.example:443/',local)==='https://host.example','Configured origin is canonicalized');
  check(trustedParentOrigin(trusted,local)===trusted,'Explicit port is retained');
  check(trustedParentOrigin(undefined,'null')===null,'Opaque default has no trusted parent');

  function fixture(){
    const listeners=new Set<(event:any)=>void>(),sent:any[]=[],counts:number[]=[];
    const parent={postMessage:(data:unknown,origin:string)=>sent.push({data,origin})};
    const host={parent,location:{origin:local},crypto:globalThis.crypto,addEventListener:(_type:string,fn:any)=>listeners.add(fn),removeEventListener:(_type:string,fn:any)=>listeners.delete(fn)} as unknown as Window;
    return {host,parent,sent,counts,listeners,emit:(data:unknown,origin=trusted,source:unknown=parent)=>{for(const fn of listeners)fn({data,origin,source});},client:(options={parentOrigin:trusted,timeoutMs:1000})=>new ParentRpcClient(host,options,count=>counts.push(count))};
  }
  const f=fixture(),client=f.client();let result:unknown='unresolved';
  const request=client.call('GET_TEST',{synthetic:true}).then(value=>{result=value;});
  const id=f.sent[0].data.messageId;
  check(f.sent[0].origin===trusted,'Outbound RPC never uses wildcard');
  check(f.sent[0].data.type==='GET_TEST'&&f.sent[0].data.payload.synthetic===true,'RPC envelope remains compatible');
  check(/^rpc-[0-9a-f]{32}$/.test(id),'Correlation ID uses128 random bits');
  f.emit({messageId:id,success:true,payload:'wrong-origin'},'https://attacker.example');
  f.emit({messageId:id,success:true,payload:'sibling'},trusted,{});
  for(const data of [null,[],true,{},'text',{messageId:id,success:'true'},{messageId:3,success:true},{messageId:'unknown',success:true},{messageId:id,success:false,error:{markup:'bad'}}]) {
    f.emit(data);await Promise.resolve();check(result==='unresolved','Untrusted/malformed message cannot settle request');
  }
  check(f.counts.at(-1)===1,'Rejected origins/sources cannot remove pending work');
  f.emit({messageId:id,success:true,payload:{value:0}});await request;
  check(JSON.stringify(result)==='{"value":0}','Genuine parent response settles');
  check(f.counts.at(-1)===0,'Settled request releases pending state');
  f.emit({messageId:id,success:true,payload:'replay'});check(JSON.stringify(result)==='{"value":0}','Response replay is ignored');

  const first=client.call('FIRST',1),second=client.call('SECOND',2);const [a,b]=f.sent.slice(-2).map(r=>r.data.messageId);
  check(a!==b&&a!==id,'Concurrent IDs differ');
  f.emit({messageId:b,success:true,payload:false});check(await second===false,'False response payload remains valid');
  check(f.counts.at(-1)===1,'Loading remains true until every request finishes');
  f.emit({messageId:a,success:true});check(await first===undefined,'Optional success payload remains compatible');
  check(f.counts.at(-1)===0,'Last completion clears loading');
  const failure=client.call('FAIL',null).catch(error=>error.message);f.emit({messageId:f.sent.at(-1).data.messageId,success:false,error:'denied'});
  check(await failure==='denied','Authenticated failure rejects the caller');
  client.dispose();check(f.listeners.size===0,'Disposal removes listener');
  check(await client.call('LATE',null).then(()=>false,()=>true),'Closed client rejects new work');

  const g=fixture(),closing=g.client(),closed=closing.call('PENDING',null).catch(error=>error.message);closing.dispose();closing.dispose();
  check(await closed==='Playground RPC closed','Unmount rejects pending work');
  check(g.counts.at(-1)===0&&g.listeners.size===0,'Unmount cleans timers, pending state and listener');
  const h=fixture(),timeout=h.client({parentOrigin:trusted,timeoutMs:10});
  check(await timeout.call('TIMEOUT',null).then(()=>false,error=>/timed out/.test(error.message)),'Deadline rejects missing response');
  check(h.counts.at(-1)===0,'Deadline releases loading');timeout.dispose();
  const s=fixture();s.parent.postMessage=()=>{throw new Error('clone failed');};const sendFailure=s.client();
  check(await sendFailure.call('CLONE',()=>{}).catch(error=>error.message)==='clone failed','Send exception rejects cleanly');
  check(s.counts.at(-1)===0,'Send exception releases pending state');sendFailure.dispose();

  const invalid=fixture(),invalidClient=invalid.client({parentOrigin:'*',timeoutMs:10});
  check(await invalidClient.call('PRIVATE',null).then(()=>false,()=>true),'Invalid origin sends no RPC');
  check(invalid.sent.length===0&&invalid.listeners.size===0,'Invalid origin creates no listener or disclosure');invalidClient.dispose();
  const standalone=fixture();Object.assign(standalone.host,{parent:standalone.host});const solo=new ParentRpcClient(standalone.host);
  check(await solo.call('PRIVATE',null).then(()=>false,()=>true),'Standalone cannot accidentally self-RPC');
  check(!notifyParentReady(standalone.host)&&standalone.sent.length===0,'Standalone sends no readiness message');solo.dispose();
  const ready=fixture();check(notifyParentReady(ready.host,trusted),'Configured preview sends readiness');
  check(ready.sent[0].origin===trusted&&JSON.stringify(ready.sent[0].data)==='{"type":"PREVIEW_READY"}','Readiness uses exact origin and constant payload');
  check(!notifyParentReady(ready.host,'*')&&ready.sent.length===1,'Invalid readiness origin has no fallback');
  check(notifyParentReady(ready.host)&&ready.sent.at(-1).origin===local,'Default preview is restricted to same origin');
  return {passed,failed:0,results:[]};
}

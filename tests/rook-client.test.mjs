import test from 'node:test';
import assert from 'node:assert/strict';
import { askRookAgent, generateFallbackResponse } from '../src/services/rookClient.js';

async function mocked(fetchImpl,run){const saved={fetch:globalThis.fetch,document:globalThis.document,window:globalThis.window};globalThis.fetch=fetchImpl;globalThis.window={matchMedia:()=>({matches:true})};globalThis.document={getElementById:()=>({scrollIntoView(){}})};try{await run();}finally{Object.assign(globalThis,saved);}}
const messages=[{role:'user',content:'What does Raj work on?'}];
test('live response is marked as DeepSeek and credential-free',async()=>{let mode,request;await mocked(async(url,init)=>{request={url,init};return new Response(JSON.stringify({answer:'Raj builds native iOS apps.',source:'deepseek',model:'deepseek-flash'}));},async()=>{const answer=await askRookAgent({messages,onMode:m=>mode=m});assert.equal(answer,'Raj builds native iOS apps.');});assert.equal(request.url,'/api/rook');assert.equal(request.init.headers.Authorization,undefined);assert.deepEqual(mode,{source:'deepseek',model:'deepseek-flash'});});
test('provider/server failure produces an explicitly marked local fallback',async()=>{for(const status of [401,429,502,504]){let mode;await mocked(async()=>new Response(JSON.stringify({error:'unavailable'}),{status}),async()=>{const answer=await askRookAgent({messages,onMode:m=>mode=m});assert.ok(answer.includes('Since May 2022'));});assert.equal(mode.source,'preset');}});
test('non-JSON or empty live responses do not masquerade as success',async()=>{for(const payload of ['<html>Missing backend</html>',JSON.stringify({answer:'',source:'deepseek'})]){let mode;await mocked(async()=>new Response(payload),async()=>{await askRookAgent({messages,onMode:m=>mode=m});});assert.equal(mode.source,'preset');}});
test('cancellation does not silently substitute a fallback answer',async()=>{const controller=new AbortController();controller.abort();let mode;await mocked(async()=>{throw new DOMException('Aborted','AbortError');},async()=>{await assert.rejects(()=>askRookAgent({messages,signal:controller.signal,onMode:m=>mode=m}),{name:'AbortError'});});assert.equal(mode,undefined);});


test('saved project answers treat Hermes as one project with both clients',()=>{
  const reply=generateFallbackResponse('Tell me about Hermes Companion Web');
  assert.ok(reply.startsWith('### Hermes Companion\n'));
  assert.ok(reply.includes('TypeScript'));
  assert.ok(reply.includes('hermes-companion-app'));
  assert.ok(reply.includes('hermes-companion-web'));
  const collection=generateFallbackResponse('List the projects');
  assert.equal((collection.match(/• /g)||[]).length,4);
  assert.ok(!collection.includes('FitPro'));
});

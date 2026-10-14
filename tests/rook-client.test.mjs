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
  assert.ok(!reply.includes('hermes-companion-web'));
  const collection=generateFallbackResponse('List the projects');
  assert.equal((collection.match(/• /g)||[]).length,5);
  assert.ok(!collection.includes('FitPro'));
});

test('private project answers explain architecture without inventing public links or unlimited memory',()=>{
  const nexus=generateFallbackResponse('How did Raj implement memory and orchestration in Nexus?');
  assert.match(nexus,/Personally implemented specialist agents/);
  assert.match(nexus,/Firestore/);
  assert.match(nexus,/model context limits still apply/);
  assert.match(nexus,/Source is private/);
  assert.doesNotMatch(nexus,/https?:\/\//);
  const tally=generateFallbackResponse('How does Tally import statements and recover data?');
  assert.match(tally,/column mapping, date review and duplicate detection/);
  assert.match(tally,/JSON backup, restore and migration/);
  assert.doesNotMatch(tally,/public soon|repository is currently private|Open-source release planned/);
  assert.match(tally,/https:\/\/github\.com\/coding-nyx\/tally/);
  assert.match(tally,/Source/);
  const integration=generateFallbackResponse('Can Hermes or ChatGPT upload statements through Tally MCP?');
  assert.match(integration,/stdio MCP bridge backed by a shared-ledger REST service/);
  assert.match(integration,/statement upload\/import/);
  assert.match(integration,/Supports compatible AI clients/);
  assert.doesNotMatch(integration,/in progress|intended Hermes/);
  assert.match(integration,/Hermes and ChatGPT workflows/);
});

test('iOS component questions return work evidence rather than a generic skill list',()=>{
  const reply=generateFallbackResponse('Tell me about Raj’s iOS spreadsheet work');
  assert.match(reply,/Kanban, spreadsheet and navigation/);
  assert.match(reply,/requirements analysis/);
  assert.match(reply,/UICollectionViewLayout/);
  assert.match(reply,/layout attributes/);
  assert.match(reply,/Xcode Instruments/);
  assert.match(reply,/reindexing/);
  assert.match(reply,/layout-item creation/);
  assert.match(reply,/SCROLL_TO:experience/);
  const kanban=generateFallbackResponse('What Kanban column background layout problem did Raj investigate?');
  assert.match(kanban,/refresh-control backgrounds/);
  assert.match(kanban,/variable card counts and heights/);
  assert.match(kanban,/separate measurement of the full column/);
  const navigation=generateFallbackResponse('How did Raj componentize product navigation for iPad and phone?');
  assert.match(navigation,/three-panel split view/);
  assert.match(navigation,/traitCollection/);
  assert.match(navigation,/parent layout supplied navigation items and callbacks/);
  const skills=generateFallbackResponse('What Swift skills does Raj have?');
  assert.match(skills,/SCROLL_TO:skills/);
});

test('component integration questions describe the MCP and anonymous adoption',()=>{
  const reply=generateFallbackResponse('How is the component integration MCP used?');
  assert.match(reply,/APIs and documentation/);
  assert.match(reply,/product team currently uses it/);
  assert.match(reply,/SCROLL_TO:experience/);
});

test('AI SDLC questions explain the workflow without naming internal examples',()=>{
  const reply=generateFallbackResponse('How does the AI SDLC framework generate components?');
  assert.match(reply,/AI SDLC for UI components/);
  assert.match(reply,/development tasks, test cases and accessibility identifiers/);
  assert.match(reply,/targeting iOS and Android/);
  assert.match(reply,/new version or feature addition/);
  assert.doesNotMatch(reply,/Kanban v2|bottom.bar|Used for/);
  assert.match(reply,/SCROLL_TO:experience/);
});

test('production delivery questions include release and maintenance contributions',()=>{
  const reply=generateFallbackResponse('What production releases and bug fixes did Raj work on?');
  assert.match(reply,/feature additions, bug fixes and minor releases/);
  assert.match(reply,/major product release/);
  assert.match(reply,/SCROLL_TO:experience/);
  const revamp=generateFallbackResponse('What API migration and middleware revamp did Raj plan?');
  assert.match(revamp,/Implemented integration with updated APIs/);
  assert.match(revamp,/middleware parsing to translate web API responses for mobile/);
  assert.match(revamp,/Contributed to revamp planning and led UI redesign and navigation improvements/);
  assert.match(revamp,/Early in the Member of Technical Staff role/);
});

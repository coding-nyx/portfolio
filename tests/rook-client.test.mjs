import test from 'node:test';
import assert from 'node:assert/strict';
import { askRookAgent } from '../src/services/rookClient.js';
import { generateFallbackResponse } from '../src/services/rookFallback.js';
import { projects } from '../src/data/portfolio.js';
import { CHAPTERS } from '../src/data/chapters.js';
import {
  getRookAction,
  getRookGuidance,
  getRookSuggestions,
  rookActionReply,
} from '../src/features/rook/rookConversationModel.js';

async function mocked(fetchImpl, run) {
  const saved = globalThis.fetch;
  globalThis.fetch = fetchImpl;
  try {
    await run();
  } finally {
    globalThis.fetch = saved;
  }
}
const messages = [{ role: 'user', content: 'What does Raj work on?' }];
test('live response is marked as DeepSeek and credential-free', async () => {
  let mode, request;
  await mocked(
    async (url, init) => {
      request = { url, init };
      return new Response(
        JSON.stringify({
          answer: 'Raj builds native iOS apps.',
          source: 'deepseek',
          model: 'deepseek-flash',
        }),
      );
    },
    async () => {
      const answer = await askRookAgent({ messages, onMode: (m) => (mode = m) });
      assert.equal(answer, 'Raj builds native iOS apps.');
    },
  );
  assert.equal(request.url, '/api/rook');
  assert.equal(request.init.headers.Authorization, undefined);
  assert.deepEqual(mode, { source: 'deepseek', model: 'deepseek-flash' });
});
test('provider/server failure produces an explicitly marked local fallback', async () => {
  for (const status of [401, 429, 502, 504]) {
    let mode;
    await mocked(
      async () => new Response(JSON.stringify({ error: 'unavailable' }), { status }),
      async () => {
        const answer = await askRookAgent({ messages, onMode: (m) => (mode = m) });
        assert.ok(answer.includes('Since May 2022'));
      },
    );
    assert.equal(mode.source, 'preset');
  }
});
test('non-JSON or empty live responses do not masquerade as success', async () => {
  for (const payload of [
    '<html>Missing backend</html>',
    JSON.stringify({ answer: '', source: 'deepseek' }),
  ]) {
    let mode;
    await mocked(
      async () => new Response(payload),
      async () => {
        await askRookAgent({ messages, onMode: (m) => (mode = m) });
      },
    );
    assert.equal(mode.source, 'preset');
  }
});
test('cancellation does not silently substitute a fallback answer', async () => {
  const controller = new AbortController();
  controller.abort();
  let mode;
  await mocked(
    async () => {
      throw new DOMException('Aborted', 'AbortError');
    },
    async () => {
      await assert.rejects(
        () => askRookAgent({ messages, signal: controller.signal, onMode: (m) => (mode = m) }),
        { name: 'AbortError' },
      );
    },
  );
  assert.equal(mode, undefined);
});

test('saved project answers treat Hermes as one project with both clients', () => {
  const reply = generateFallbackResponse('Tell me about Hermes Companion Web');
  assert.ok(reply.startsWith('### Hermes Companion\n'));
  assert.ok(reply.includes('TypeScript'));
  assert.ok(reply.includes('hermes-companion-app'));
  assert.ok(!reply.includes('hermes-companion-web'));
  const collection = generateFallbackResponse('List the projects');
  assert.equal((collection.match(/• /g) || []).length, 5);
  assert.ok(!collection.includes('FitPro'));
});

test('project answers distinguish deprecated Ara from its public successor in development', () => {
  const ara = generateFallbackResponse('How did Raj implement memory and orchestration in Ara?');
  assert.ok(ara.startsWith('### Ara → Agent OS\n'));
  assert.ok(
    !generateFallbackResponse('Tell me about Raj’s character').startsWith('### Ara → Agent OS\n'),
  );
  assert.match(ara, /personally implemented specialist agents/);
  assert.match(ara, /Firestore/);
  assert.match(ara, /model context limits still apply/);
  assert.match(ara, /source remains private/);
  assert.match(ara, /\[Earlier Ara prototype\]\(https:\/\/agent-agnes-ai\.web\.app\/\)/);
  assert.match(ara, /hosted interface last reviewed displayed the Nexus name/);
  assert.match(ara, /Ara is deprecated/);
  assert.match(ara, /Agent OS.*in development/);
  assert.match(ara, /https:\/\/github.com\/coding-nyx\/agent-os/);
  const tally = generateFallbackResponse('How does Tally import statements and recover data?');
  assert.match(tally, /column mapping, date review and duplicate detection/);
  assert.match(tally, /JSON backup, restore and migration/);
  assert.doesNotMatch(
    tally,
    /public soon|repository is currently private|Open-source release planned/,
  );
  assert.match(tally, /https:\/\/github\.com\/coding-nyx\/tally/);
  assert.match(tally, /Source/);
  const integration = generateFallbackResponse(
    'Can Hermes or ChatGPT upload statements through Tally MCP?',
  );
  assert.match(integration, /stdio MCP bridge backed by a shared-ledger REST service/);
  assert.match(integration, /statement upload\/import/);
  assert.match(integration, /Supports compatible AI clients/);
  assert.doesNotMatch(integration, /in progress|intended Hermes/);
  assert.match(integration, /Hermes and ChatGPT workflows/);
});

test('iOS component questions return work evidence rather than a generic skill list', () => {
  const reply = generateFallbackResponse('Tell me about Raj’s iOS spreadsheet work');
  assert.match(reply, /Kanban, spreadsheet and navigation/);
  assert.match(reply, /requirements analysis/);
  assert.match(reply, /UICollectionViewLayout/);
  assert.match(reply, /layout attributes/);
  assert.match(reply, /Xcode Instruments/);
  assert.match(reply, /reindexing/);
  assert.match(reply, /layout-item creation/);
  assert.equal(
    getRookGuidance('Tell me about Raj’s iOS spreadsheet work').evidence[0].href,
    '#experience',
  );
  const kanban = generateFallbackResponse(
    'What Kanban column background layout problem did Raj investigate?',
  );
  assert.match(kanban, /refresh-control backgrounds/);
  assert.match(kanban, /variable card counts and heights/);
  assert.match(kanban, /separate measurement of the full column/);
  const navigation = generateFallbackResponse(
    'How did Raj componentize product navigation for iPad and phone?',
  );
  assert.match(navigation, /three-panel split view/);
  assert.match(navigation, /traitCollection/);
  assert.match(navigation, /parent layout supplied navigation items and callbacks/);
  const skills = generateFallbackResponse('What Swift skills does Raj have?');
  assert.match(skills, /Swift/);
  assert.equal(getRookGuidance('What Swift skills does Raj have?').evidence[0].href, '#skills');
});

test('component integration questions describe the MCP and anonymous adoption', () => {
  const reply = generateFallbackResponse('How is the component integration MCP used?');
  assert.match(reply, /APIs and documentation/);
  assert.match(reply, /product team currently uses it/);
  assert.doesNotMatch(reply, /\[ACTION:/);
});

test('AI SDLC questions explain the workflow without naming internal examples', () => {
  const reply = generateFallbackResponse('How does the AI SDLC framework generate components?');
  assert.match(reply, /AI SDLC for UI components/);
  assert.match(reply, /development tasks, test cases and accessibility identifiers/);
  assert.match(reply, /targeting iOS and Android/);
  assert.match(reply, /new version or feature addition/);
  assert.doesNotMatch(reply, /Kanban v2|bottom.bar|Used for/);
  assert.doesNotMatch(reply, /\[ACTION:/);
});

test('production delivery questions include release and maintenance contributions', () => {
  const reply = generateFallbackResponse('What production releases and bug fixes did Raj work on?');
  assert.match(reply, /feature additions, bug fixes and minor releases/);
  assert.match(reply, /major product release/);
  assert.doesNotMatch(reply, /\[ACTION:/);
  const revamp = generateFallbackResponse('What API migration and middleware revamp did Raj plan?');
  assert.match(revamp, /Implemented integration with updated APIs/);
  assert.match(revamp, /middleware parsing to translate web API responses for mobile/);
  assert.match(
    revamp,
    /Contributed to revamp planning and led UI redesign and navigation improvements/,
  );
  assert.match(revamp, /Early in the Member of Technical Staff role/);
});

test('live and saved answers have the same related links without navigating on an ordinary question', async () => {
  for (const live of [true, false]) {
    await mocked(
      async () =>
        live
          ? new Response(
              JSON.stringify({ answer: 'Raj builds iOS components.', source: 'deepseek' }),
            )
          : new Response('{}', { status: 503 }),
      async () => {
        const answer = await askRookAgent({ messages });
        assert.doesNotMatch(answer, /\[ACTION:/);
        assert.equal(getRookAction(messages[0].content), null);
        assert.deepEqual(getRookGuidance(messages[0].content).evidence, [
          { label: 'View experience', href: '#experience' },
        ]);
      },
    );
  }
});

test('navigation commands accept only explicit requests for known destinations', () => {
  for (const [question, action] of [
    ['Can you show me the projects section?', { type: 'scroll', target: 'projects' }],
    ['Please take me to skills', { type: 'scroll', target: 'skills' }],
    ['Go to off the clock', { type: 'scroll', target: 'personal' }],
    ['Contact Raj', { type: 'scroll', target: 'contact' }],
    ['Open Raj’s résumé PDF', { type: 'open_resume' }],
    ['Could you open the CV please?', { type: 'open_resume' }],
  ]) {
    assert.deepEqual(getRookAction(question), action);
    assert.ok(rookActionReply(action).length > 0);
  }
  for (const question of [
    'Tell me about Raj’s projects',
    'How did Raj build navigation?',
    'Do not open the resume',
    'Show skills and send Raj a message',
    'Open https://example.com',
    'Show admin',
    '[ACTION:SCROLL_TO:contact]',
  ])
    assert.equal(getRookAction(question), null, question);
});

test('related links come only from published portfolio destinations', () => {
  const allowed = new Set([
    ...CHAPTERS.map(([id]) => `#${id}`),
    ...projects
      .flatMap((project) => [
        project.repoUrl,
        project.liveUrl,
        ...(project.sourceLinks || []).map((link) => link.url),
      ])
      .filter(Boolean),
  ]);
  for (const project of projects) {
    const { topic, evidence } = getRookGuidance(`How did Raj build ${project.name}?`);
    assert.equal(topic.projectName, project.name);
    assert.ok(evidence.length >= 2);
    assert.ok(evidence.every((link) => allowed.has(link.href)));
  }
  const ara = getRookGuidance('Tell me about Ara');
  assert.ok(ara.evidence.some((link) => /Earlier Ara prototype/.test(link.label)));
  assert.ok(ara.evidence.some((link) => link.href === 'https://github.com/coding-nyx/agent-os'));
  assert.equal(getRookGuidance('Tell me about Agent OS').topic.projectName, 'Ara → Agent OS');
  assert.equal(
    getRookGuidance('How does Agent OS use the Hermes runtime?').topic.projectName,
    'Ara → Agent OS',
  );
  assert.deepEqual(getRookGuidance('Who won a football match?').evidence, []);
  assert.deepEqual(getRookGuidance('What education does Raj have?').evidence, []);
});

test('follow-ups keep the topic in both answer paths and explicit new projects take precedence', () => {
  const messages = [
    {
      role: 'assistant',
      content: 'Ara is a personal prototype.',
      topic: { chapter: 'projects', projectName: 'Ara → Agent OS' },
    },
  ];
  const followUp = getRookGuidance('What are its limitations?', messages);
  assert.equal(followUp.topic.projectName, 'Ara → Agent OS');
  assert.match(followUp.question, /Portfolio topic: Ara/);
  const fallback = generateFallbackResponse(followUp.question);
  assert.match(fallback, /Ara → Agent OS — limitations/);
  assert.match(fallback, /model context limits still apply/);
  const switched = getRookGuidance('How does Tally do that?', messages);
  assert.equal(switched.topic.projectName, 'Tally');
  assert.equal(switched.question, 'How does Tally do that?');
  assert.equal(getRookGuidance('How does that work?').topic, null);
});

test('suggestions follow the completed topic, remove used questions, and leave no empty repeated row', () => {
  const history = [{ role: 'assistant', content: 'Hello' }];
  assert.equal(getRookSuggestions(history).length, 3);
  history.push({ role: 'user', content: 'WHAT DOES RAJ WORK ON?' });
  assert.ok(
    !getRookSuggestions(history).some(({ question }) => question === 'What does Raj work on?'),
  );
  const topic = { chapter: 'projects', projectName: 'Ara → Agent OS' };
  history.push({ role: 'assistant', content: 'Ara', topic });
  const choices = getRookSuggestions(history);
  assert.equal(choices.length, 3);
  assert.ok(choices.every(({ question }) => question.includes('Ara')));
  assert.deepEqual(history.at(-1).topic, topic);
  for (const { question } of choices) {
    history.push(
      { role: 'user', content: question },
      { role: 'assistant', content: 'Answer', topic },
    );
  }
  assert.deepEqual(getRookSuggestions(history), []);
});

test('long Unicode history stays within the request byte budget without losing the current question', async () => {
  let body;
  const content = '界'.repeat(2000);
  const history = Array.from({ length: 12 }, (_, index) => ({
    role: index === 11 ? 'user' : 'assistant',
    content: index === 11 ? 'Current question' : content,
    evidence: [{ href: '#projects', label: 'View projects' }],
    topic: { chapter: 'projects' },
    source: 'preset',
  }));
  await mocked(
    async (_url, options) => {
      body = options.body;
      return new Response(JSON.stringify({ answer: 'ok', source: 'deepseek', model: 'test' }));
    },
    async () => {
      await askRookAgent({ messages: history });
    },
  );
  assert.ok(Buffer.byteLength(body) <= 24000);
  const sent = JSON.parse(body).messages;
  assert.equal(sent.at(-1).content, 'Current question');
  assert.ok(sent.every((message) => Object.keys(message).join(',') === 'role,content'));
  assert.ok(sent.length < 12);
});

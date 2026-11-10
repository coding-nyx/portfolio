import test from 'node:test';
import assert from 'node:assert/strict';
import { createRookMetrics, createContactJourney } from '../src/services/footfallInteractions.js';
import { createEngagementMeter } from '../src/app/engagementModel.js';
import { validFootfallContext } from '../src/data/footfallContract.js';

function harness() {
  let time = 1000;
  let sequence = 0;
  let accepting = true;
  const events = [];
  const dependencies = {
    now: () => time,
    uuid: () => `${(++sequence).toString(16).padStart(8, '0')}-0000-4000-8000-000000000000`,
    track: (name, context) => {
      assert.equal(
        validFootfallContext(name, context),
        true,
        `${name} must satisfy the public schema`,
      );
      events.push({ name, context: { ...context }, accepted: accepting });
      return accepting;
    },
  };
  return {
    dependencies,
    events,
    advance: (milliseconds) => {
      time += milliseconds;
    },
    accepting: (value) => {
      accepting = value;
    },
  };
}
const names = (h) => h.events.map((event) => event.name);
const seconds = (h, module) =>
  h.events
    .filter(
      (event) => event.name === 'module_engagement' && (!module || event.context.module === module),
    )
    .reduce((total, event) => total + event.context.active_seconds, 0);
const tickSeconds = (h, meter, count) => {
  for (let i = 0; i < count; i++) {
    h.advance(1000);
    meter.tick();
  }
};

test('Rook correlates one terminal result with its submission and excludes input contents', () => {
  const h = harness(),
    metrics = createRookMetrics(h.dependencies);
  const attempt = metrics.begin({ input: 'typed', kind: 'question', question: 'private question' });
  h.advance(1250.4);
  attempt.finish('live_reply');
  attempt.finish('cancelled');
  attempt.finish('error');
  assert.deepEqual(names(h), ['rook_submit', 'rook_result']);
  assert.equal(h.events[0].context.interaction_id, h.events[1].context.interaction_id);
  assert.equal(h.events[1].context.duration_ms, 1250);
  assert.equal(JSON.stringify(h.events).includes('private question'), false);
  assert.deepEqual(Object.keys(h.events[1].context).sort(), [
    'duration_ms',
    'interaction_id',
    'result',
  ]);
});

test('Rook consent reset and rejected submissions prevent a later result from crossing the boundary', () => {
  const h = harness(),
    metrics = createRookMetrics(h.dependencies);
  const beforeReset = metrics.begin({ input: 'suggestion', kind: 'question' });
  metrics.reset();
  beforeReset.finish('saved_reply');
  h.accepting(false);
  const rejected = metrics.begin({ input: 'typed', kind: 'command' });
  h.accepting(true);
  rejected.finish('local_action');
  assert.deepEqual(names(h), ['rook_submit', 'rook_submit']);
  const afterReset = metrics.begin({ input: 'typed', kind: 'question' });
  h.advance(150000);
  afterReset.finish('error');
  assert.equal(h.events.at(-1).context.duration_ms, 120000);
  assert.notEqual(h.events[0].context.interaction_id, h.events.at(-1).context.interaction_id);
});

test('Rook cancellation remains a single result and negative clock movement cannot produce negative timing', () => {
  const h = harness(),
    metrics = createRookMetrics(h.dependencies);
  const attempt = metrics.begin({ input: 'typed', kind: 'question' });
  h.advance(-500);
  attempt.finish('cancelled');
  attempt.finish('live_reply');
  assert.equal(h.events.at(-1).context.result, 'cancelled');
  assert.equal(h.events.at(-1).context.duration_ms, 0);
  assert.equal(h.events.length, 2);
});

test('contact journeys deduplicate starts and exits, then correlate resumption and successful delivery', () => {
  const h = harness(),
    journey = createContactJourney(h.dependencies);
  journey.leave('page_exit');
  journey.edit({ name: 'private name', email: 'private@example.test', message: 'private message' });
  journey.edit();
  journey.leave('section_exit');
  journey.leave('page_exit');
  journey.edit();
  journey.submit(true, true);
  journey.leave('page_exit');
  journey.result('sent');
  journey.leave('page_exit');
  assert.deepEqual(names(h), [
    'contact_start',
    'contact_abandon',
    'contact_resume',
    'contact_submit',
    'contact_result',
  ]);
  assert.equal(new Set(h.events.map((event) => event.context.form_id)).size, 1);
  assert.equal(h.events.at(-1).context.result, 'sent');
  assert.equal(JSON.stringify(h.events).includes('private'), false);
  journey.edit();
  assert.equal(h.events.at(-1).name, 'contact_start');
  assert.notEqual(h.events[0].context.form_id, h.events.at(-1).context.form_id);
});

test('contact validation failures and failed delivery remain unfinished rather than successful', () => {
  const h = harness(),
    journey = createContactJourney(h.dependencies);
  journey.submit(false, true);
  assert.equal(h.events.at(-1).context.result, 'invalid');
  journey.leave('section_exit');
  journey.submit(true, true);
  journey.leave('section_exit');
  assert.equal(
    h.events.at(-1).name,
    'contact_submit',
    'pending delivery must not be marked abandoned',
  );
  journey.result('error');
  journey.leave('page_exit');
  assert.deepEqual(names(h), [
    'contact_start',
    'contact_submit',
    'contact_abandon',
    'contact_resume',
    'contact_submit',
    'contact_result',
    'contact_abandon',
  ]);
  assert.equal(h.events.at(-1).context.reason, 'page_exit');
});

test('contact clearing abandons only a started form and the next edit gets a fresh journey', () => {
  const h = harness(),
    journey = createContactJourney(h.dependencies);
  journey.clear();
  assert.equal(h.events.length, 0);
  journey.edit();
  journey.clear();
  journey.clear();
  journey.edit();
  assert.deepEqual(names(h), ['contact_start', 'contact_abandon', 'contact_start']);
  assert.equal(h.events[1].context.reason, 'cleared');
  assert.notEqual(h.events[0].context.form_id, h.events[2].context.form_id);
});

test('contact consent reset drops old journey state and rejected starts do not become sticky', () => {
  const h = harness(),
    journey = createContactJourney(h.dependencies);
  journey.edit();
  journey.reset();
  journey.result('sent');
  journey.leave('page_exit');
  assert.equal(h.events.length, 1);
  h.accepting(false);
  journey.edit();
  h.accepting(true);
  journey.edit();
  assert.equal(h.events.at(-1).name, 'contact_start');
  assert.notEqual(h.events.at(-2).context.form_id, h.events.at(-1).context.form_id);
  journey.result('unavailable');
  journey.leave('page_exit');
  assert.equal(h.events.at(-1).name, 'contact_abandon');
});

test('contact email-draft handoff suppresses abandonment and a later edit starts a new journey', () => {
  const h = harness(),
    journey = createContactJourney(h.dependencies);
  journey.edit();
  const originalId = h.events[0].context.form_id;
  journey.handoff();
  journey.leave('page_exit');
  journey.clear();
  assert.deepEqual(names(h), ['contact_start']);
  journey.edit();
  assert.deepEqual(names(h), ['contact_start', 'contact_start']);
  assert.notEqual(h.events.at(-1).context.form_id, originalId);
});

test('engagement emits bounded foreground chunks and stops at sixty seconds without interaction', () => {
  const h = harness(),
    meter = createEngagementMeter(h.dependencies);
  meter.activate('projects');
  tickSeconds(h, meter, 95);
  assert.equal(seconds(h), 60);
  assert.deepEqual(
    h.events.map((event) => event.context.active_seconds),
    [30, 30],
  );
  meter.activity();
  tickSeconds(h, meter, 10);
  meter.pause();
  assert.equal(seconds(h), 70);
});

test('engagement switching and pausing preserve module attribution without hidden time', () => {
  const h = harness(),
    meter = createEngagementMeter(h.dependencies);
  meter.activate('experience');
  tickSeconds(h, meter, 12);
  meter.activate('rook');
  tickSeconds(h, meter, 9);
  meter.pause();
  tickSeconds(h, meter, 120);
  meter.activity();
  meter.activate('contact');
  tickSeconds(h, meter, 5);
  meter.pause();
  assert.equal(seconds(h, 'experience'), 12);
  assert.equal(seconds(h, 'rook'), 9);
  assert.equal(seconds(h, 'contact'), 5);
  assert.equal(seconds(h), 26);
});

test('engagement does not backfill suspended timer gaps or consent-reset pending time', () => {
  const h = harness(),
    meter = createEngagementMeter(h.dependencies);
  meter.activate('bio');
  tickSeconds(h, meter, 4);
  h.advance(120000);
  meter.tick();
  meter.pause();
  assert.equal(seconds(h), 4);
  meter.activity();
  meter.activate('skills');
  tickSeconds(h, meter, 8);
  meter.reset();
  meter.pause();
  assert.equal(seconds(h, 'skills'), 0);
  meter.activate('skills');
  tickSeconds(h, meter, 3);
  meter.pause();
  assert.equal(seconds(h, 'skills'), 3);
});

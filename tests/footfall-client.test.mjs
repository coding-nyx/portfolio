import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
const storage = () => {
  const values = new Map();
  return { getItem: (k) => values.get(k) || null, setItem: (k, v) => values.set(k, v) };
};
import { createFootfallTracker } from '../src/services/footfallAnalytics.js';
import { FOOTFALL_EVENTS, validFootfallContext } from '../src/data/footfallContract.js';
function harness(send) {
  let time = 100000;
  const timers = new Map(),
    idle = new Map();
  let handle = 0;
  const win = Object.assign(new EventTarget(), {
    location: { pathname: '/' },
    localStorage: storage(),
    sessionStorage: storage(),
    setTimeout: (fn) => {
      const id = ++handle;
      timers.set(id, fn);
      return id;
    },
    clearTimeout: (id) => timers.delete(id),
    requestIdleCallback: (fn) => {
      const id = ++handle;
      idle.set(id, fn);
      return id;
    },
    cancelIdleCallback: (id) => idle.delete(id),
  });
  const doc = Object.assign(new EventTarget(), {
    referrer: 'https://ref.example/private?q=email',
    visibilityState: 'visible',
  });
  const navigator = {};
  const requests = [];
  const fetch = async (url, options) => {
    const body = JSON.parse(options.body);
    requests.push({ url, options, body });
    return send
      ? send(body, options)
      : { ok: true, json: async () => ({ accepted: body.events.map((event) => event.eventId) }) };
  };
  const tracker = createFootfallTracker({
    endpoint: 'https://collector.example/api/footfall/events?property=portfolio',
    win,
    doc,
    navigator,
    fetch,
    uuid: randomUUID,
    now: () => time,
  });
  return {
    tracker,
    win,
    doc,
    navigator,
    requests,
    timers,
    idle,
    setTime: (value) => {
      time = value;
    },
    runIdle: () => {
      for (const [id, fn] of idle) {
        idle.delete(id);
        fn();
      }
    },
  };
}
test('sender emits one document visit across restarts, batches valid actions and acknowledges delivery', async () => {
  const h = harness();
  h.tracker.start();
  h.runIdle();
  h.tracker.track('section_view', { chapter_id: 'projects' });
  h.tracker.track('project_open', { project_id: 'worktracker', entry_point: 'grid' });
  await h.tracker.flush();
  const events = h.requests[0].body.events;
  assert.deepEqual(
    events.map((event) => event.name),
    ['page_view', 'section_view', 'project_open'],
  );
  assert.equal(new Set(events.map((event) => event.visitorId)).size, 1);
  assert.equal(new Set(events.map((event) => event.sessionId)).size, 1);
  assert.equal(events[0].referrer, 'https://ref.example');
  assert.equal(h.requests[0].options.referrerPolicy, 'no-referrer');
  assert.deepEqual(Object.keys(events[0]).sort(), [
    'context',
    'eventId',
    'name',
    'occurredAt',
    'path',
    'referrer',
    'sessionId',
    'visitorId',
  ]);
  assert.equal(h.tracker.pending(), 0);
  h.tracker.stop();
  h.tracker.start();
  h.runIdle();
  assert.equal(h.tracker.pending(), 0);
  h.tracker.stop();
  assert.equal(h.timers.size, 0);
  assert.equal(h.idle.size, 0);
});
test('actions before idle enqueue a visit first, and interaction activity renews sessions only after inactivity', async () => {
  const h = harness();
  h.tracker.start();
  h.tracker.track('resume_open', { entry_point: 'hero' });
  await h.tracker.flush();
  const first = h.requests[0].body.events;
  assert.equal(first[0].name, 'page_view');
  assert.equal(first[1].name, 'resume_open');
  h.setTime(100000 + 1700000);
  h.tracker.track('rook_open', { entry_point: 'navigation' });
  await h.tracker.flush();
  const active = h.requests[1].body.events[0];
  assert.equal(active.sessionId, first[0].sessionId);
  h.setTime(100000 + 1700000 + 1800001);
  h.tracker.track('resume_open', { entry_point: 'rook' });
  await h.tracker.flush();
  const renewed = h.requests[2].body.events[0];
  assert.notEqual(renewed.sessionId, active.sessionId);
  assert.equal(renewed.visitorId, active.visitorId);
  h.tracker.stop();
});
test('network and acknowledgement failures retry identical IDs, with a finite attempt limit', async () => {
  let calls = 0;
  const h = harness(async (_body) => {
    calls++;
    if (calls === 1) throw Error('offline');
    return { ok: true, json: async () => ({ accepted: [] }) };
  });
  h.tracker.start();
  h.runIdle();
  for (let i = 0; i < 5; i++) await h.tracker.flush();
  assert.equal(h.requests.length, 5);
  assert.equal(new Set(h.requests.map((request) => request.body.events[0].eventId)).size, 1);
  assert.equal(h.tracker.pending(), 0);
  h.tracker.stop();
});
test('invalid requests are dropped, queue and batch sizes are bounded, and stale events expire', async () => {
  const h = harness(async () => ({ ok: false, status: 400 }));
  h.tracker.start();
  h.runIdle();
  assert.equal(h.tracker.track('contact_result', { result: 'sent', email: 'private' }), false);
  for (let i = 0; i < 150; i++) h.tracker.track('resume_open', { entry_point: 'resume' });
  assert.equal(h.tracker.pending(), 100);
  await h.tracker.flush();
  assert.equal(h.requests[0].body.events.length, 10);
  assert.equal(h.tracker.pending(), 90);
  h.setTime(500001);
  await h.tracker.flush();
  assert.equal(h.tracker.pending(), 0);
  h.tracker.stop();
});
test('hidden documents flush with keepalive; privacy opt-outs create no IDs or requests', async () => {
  const h = harness();
  h.tracker.start();
  h.runIdle();
  h.doc.visibilityState = 'hidden';
  h.doc.dispatchEvent(new Event('visibilitychange'));
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(h.requests[0].options.keepalive, true);
  h.tracker.stop();
  const blocked = harness();
  blocked.navigator.globalPrivacyControl = true;
  blocked.tracker.start();
  blocked.tracker.track('rook_open', { entry_point: 'navigation' });
  await blocked.tracker.flush();
  assert.equal(blocked.win.localStorage.getItem('footfall.visitor.v1'), null);
  assert.equal(blocked.requests.length, 0);
  blocked.tracker.stop();
  const opted = harness();
  opted.win.localStorage.setItem('footfall.optOut.v1', '1');
  opted.tracker.start();
  assert.equal(opted.tracker.pending(), 0);
  assert.equal(opted.win.localStorage.getItem('footfall.visitor.v1'), null);
  opted.tracker.stop();
});
test('ephemeral IDs stay stable within the current document and all event contexts are allowlisted', async () => {
  const h = harness();
  h.win.localStorage.getItem = () => {
    throw Error();
  };
  h.win.localStorage.setItem = () => {
    throw Error();
  };
  h.win.sessionStorage.getItem = () => {
    throw Error();
  };
  h.win.sessionStorage.setItem = () => {
    throw Error();
  };
  h.tracker.start();
  h.runIdle();
  h.tracker.track('rook_open', { entry_point: 'navigation' });
  await h.tracker.flush();
  assert.equal(new Set(h.requests[0].body.events.map((event) => event.visitorId)).size, 1);
  assert.equal(new Set(h.requests[0].body.events.map((event) => event.sessionId)).size, 1);
  h.tracker.stop();
  assert.equal(validFootfallContext('unknown', {}), false);
  assert.equal(validFootfallContext('contact_result', { result: 'draft' }), false);
  assert.ok(Object.hasOwn(FOOTFALL_EVENTS, 'contact_draft_open'));
});

test('opting out discards pending records and re-enabling never invents another document visit', async () => {
  const h = harness();
  h.tracker.start();
  h.runIdle();
  await h.tracker.flush();
  h.tracker.track('resume_open', { entry_point: 'resume' });
  assert.equal(h.tracker.pending(), 1);
  h.win.localStorage.setItem('footfall.optOut.v1', '1');
  h.win.dispatchEvent(new Event('footfall-preference-change'));
  h.tracker.stop();
  assert.equal(h.tracker.pending(), 0);
  h.win.localStorage.setItem('footfall.optOut.v1', '0');
  h.tracker.start();
  h.runIdle();
  assert.equal(h.tracker.pending(), 0);
  h.tracker.track('rook_open', { entry_point: 'navigation' });
  await h.tracker.flush();
  assert.deepEqual(
    h.requests[1].body.events.map((event) => event.name),
    ['rook_open'],
  );
  h.tracker.stop();
});
test('cleanup aborts an active request and releases all scheduled work', async () => {
  const h = harness(
    (_body, options) =>
      new Promise((_resolve, reject) =>
        options.signal.addEventListener('abort', () => reject(Error('aborted'))),
      ),
  );
  h.tracker.start();
  h.runIdle();
  const delivery = h.tracker.flush();
  h.tracker.stop();
  await delivery;
  assert.equal(h.requests[0].options.signal.aborted, true);
  assert.equal(h.timers.size, 0);
  assert.equal(h.idle.size, 0);
  assert.equal(h.tracker.pending(), 1);
});
import { chapterIsVisible } from '../src/app/usePortfolioAnalytics.js';
test('chapter reach uses the smaller of chapter and viewport, excluding partial glimpses and zero viewports', () => {
  assert.equal(chapterIsVisible({ top: -1000, bottom: 1000, height: 2000 }, 400), true);
  assert.equal(chapterIsVisible({ top: 390, bottom: 450, height: 60 }, 400), false);
  assert.equal(chapterIsVisible({ top: 180, bottom: 200, height: 20 }, 400), true);
  assert.equal(chapterIsVisible({ top: 400, bottom: 500, height: 100 }, 400), false);
  assert.equal(chapterIsVisible({ top: -100, bottom: 100, height: 200 }, 0), false);
});

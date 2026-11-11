import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGoogleAnalyticsTracker } from '../src/services/analytics.js';
import { analyticsOptedOut, setAnalyticsOptOut } from '../src/services/analyticsPreference.js';
import {
  googleAnalytics,
  resolveGoogleAnalyticsMeasurementId,
} from '../src/data/googleAnalytics.js';

const MEASUREMENT_ID = 'G-TEST123456';
function harness({
  hostname = 'iamnyx.dev',
  origin = `https://${hostname}`,
  development = false,
  idle = true,
  privacy = {},
} = {}) {
  let next = 0,
    optedOut = false;
  const timers = new Map(),
    idleCallbacks = new Map(),
    scripts = [];
  const win = {
    location: {
      hostname,
      origin,
      pathname: '/',
      search: '?email=private@example.test',
      hash: '#contact',
    },
    setTimeout(callback, delay) {
      const id = ++next;
      timers.set(id, { callback, delay });
      return id;
    },
    clearTimeout: (id) => timers.delete(id),
    ...(idle
      ? {
          requestIdleCallback(callback) {
            const id = ++next;
            idleCallbacks.set(id, callback);
            return id;
          },
          cancelIdleCallback: (id) => idleCallbacks.delete(id),
        }
      : {}),
  };
  const doc = {
    referrer: 'https://referrer.example/private?email=private@example.test#secret',
    head: { append: (script) => scripts.push(script) },
    createElement(name) {
      assert.equal(name, 'script');
      return {
        removed: false,
        remove() {
          this.removed = true;
        },
      };
    },
  };
  const browserNavigator = { userAgent: 'Mozilla/5.0 Desktop', ...privacy };
  const tracker = createGoogleAnalyticsTracker({
    win,
    doc,
    navigator: browserNavigator,
    measurementId: MEASUREMENT_ID,
    development,
    optedOut: () => optedOut || analyticsOptedOut(browserNavigator),
  });
  return {
    win,
    doc,
    tracker,
    scripts,
    timers,
    idleCallbacks,
    setOptedOut: (value) => {
      optedOut = value;
    },
    runIdle() {
      for (const [id, callback] of idleCallbacks) {
        idleCallbacks.delete(id);
        callback();
      }
    },
    runTimer(delay) {
      for (const [id, timer] of timers)
        if (timer.delay === delay) {
          timers.delete(id);
          timer.callback();
        }
    },
    commands: () => (win.dataLayer || []).map((command) => [...command]),
  };
}

test('GA4 uses the configured public measurement ID, with a validated environment fallback', () => {
  assert.equal(resolveGoogleAnalyticsMeasurementId('G-PUBLIC1234', 'G-ENV12345'), 'G-PUBLIC1234');
  assert.equal(resolveGoogleAnalyticsMeasurementId('', 'G-ENV12345'), 'G-ENV12345');
  for (const invalid of ['UA-123-1', 'G-../../secret', 'G-', undefined, {}, 123])
    assert.equal(resolveGoogleAnalyticsMeasurementId(invalid, invalid), null);
});

test('the tag loads only during idle and records one sanitized document visit across restarts', () => {
  const h = harness();
  const firstStop = h.tracker.start();
  assert.equal(h.scripts.length, 0);
  firstStop();
  assert.equal(h.idleCallbacks.size, 0);
  h.tracker.start();
  h.runIdle();
  assert.equal(h.scripts.length, 1);
  assert.equal(h.scripts[0].src, `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`);
  assert.equal(h.scripts[0].referrerPolicy, 'no-referrer');
  assert.deepEqual(h.commands(), []);
  h.scripts[0].onload();
  const commands = h.commands();
  assert.equal(commands[0][0], 'js');
  assert.deepEqual(commands[1], [
    'config',
    MEASUREMENT_ID,
    {
      page_location: 'https://iamnyx.dev/',
      page_referrer: 'https://referrer.example',
      send_page_view: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    },
  ]);
  assert.deepEqual(commands[2], [
    'event',
    'portfolio_visit',
    {
      page_location: 'https://iamnyx.dev/',
      page_referrer: 'https://referrer.example',
      send_to: MEASUREMENT_ID,
      device_type: 'Desktop',
    },
  ]);
  assert.ok(!JSON.stringify(commands).includes('private@example.test'));
  h.tracker.stop();
  h.win.location.hash = '#projects';
  h.tracker.start();
  h.runIdle();
  assert.equal(h.scripts.length, 1);
  assert.equal(h.commands().filter((command) => command[0] === 'config').length, 1);
  assert.equal(h.commands().filter((command) => command[0] === 'event').length, 1);
  h.tracker.stop();
  assert.equal(h.timers.size, 0);
  assert.equal(h.idleCallbacks.size, 0);
});

test('loopback visits and initial opt-outs cause no Google script or event request', () => {
  for (const hostname of [
    'localhost',
    'preview.localhost',
    '127.0.0.1',
    '127.0.0.2',
    '::1',
    '[::1]',
  ]) {
    const h = harness({ hostname });
    h.tracker.start();
    h.runIdle();
    assert.equal(h.scripts.length, 0, hostname);
    h.tracker.stop();
  }
  const h = harness();
  h.setOptedOut(true);
  h.tracker.start();
  h.runIdle();
  assert.equal(h.scripts.length, 0);
  h.tracker.stop();
});

test('development and unapproved production origins never load a Google tag or issue commands', () => {
  for (const options of [
    { development: true },
    { hostname: '192.168.1.10', origin: 'http://192.168.1.10:5173' },
    { hostname: 'preview.example' },
    { hostname: 'iamnyx.dev', origin: 'http://iamnyx.dev' },
    { hostname: 'iamnyx.dev', origin: 'https://iamnyx.dev:8443' },
    { hostname: 'preview--iamnyx.web.app' },
  ]) {
    const h = harness(options);
    h.tracker.start();
    h.runIdle();
    assert.equal(h.scripts.length, 0, JSON.stringify(options));
    assert.deepEqual(h.commands(), []);
    assert.equal(h.timers.size, 0);
    assert.equal(h.idleCallbacks.size, 0);
    h.tracker.stop();
  }
});

test('consent changes before idle or tag completion discard pending work and stale callbacks', () => {
  const h = harness();
  h.tracker.start();
  h.setOptedOut(true);
  h.runIdle();
  assert.equal(h.scripts.length, 0);
  h.tracker.stop();
  h.setOptedOut(false);
  h.tracker.start();
  h.runIdle();
  const staleLoad = h.scripts[0].onload,
    staleError = h.scripts[0].onerror;
  h.setOptedOut(true);
  h.tracker.stop();
  assert.equal(h.scripts[0].removed, true);
  assert.equal(h.win[`ga-disable-${MEASUREMENT_ID}`], true);
  staleLoad();
  assert.deepEqual(h.commands(), []);
  h.setOptedOut(false);
  h.tracker.start();
  h.runIdle();
  staleLoad();
  staleError();
  assert.equal(h.scripts[1].removed, false);
  h.scripts[1].onload();
  assert.equal(h.commands().filter((command) => command[0] === 'event').length, 1);
  h.tracker.stop();
});

test('fallback timers, blocked tags and optional integration failures release their resources', () => {
  const h = harness({ idle: false });
  h.tracker.start();
  assert.equal(h.scripts.length, 0);
  h.runTimer(1000);
  assert.equal(h.scripts.length, 1);
  h.runTimer(8000);
  assert.equal(h.scripts[0].removed, true);
  assert.equal(h.timers.size, 0);
  assert.deepEqual(h.commands(), []);
  h.tracker.stop();
  h.tracker.start();
  h.runTimer(1000);
  h.scripts[1].onerror();
  assert.equal(h.scripts[1].removed, true);
  h.tracker.stop();
  assert.equal(h.timers.size, 0);

  const broken = harness();
  broken.doc.head.append = () => {
    throw Error('blocked');
  };
  broken.tracker.start();
  assert.doesNotThrow(() => broken.runIdle());
  assert.equal(broken.timers.size, 0);
  broken.tracker.stop();
});

test('Do Not Track and Global Privacy Control suppress tag loading before any work is scheduled', () => {
  for (const privacy of [{ doNotTrack: '1' }, { globalPrivacyControl: true }]) {
    const h = harness({ privacy });
    h.tracker.start();
    assert.equal(h.idleCallbacks.size, 0);
    h.runIdle();
    assert.equal(h.scripts.length, 0);
    h.tracker.stop();
  }
});

test('the saved opt-out still wins when storage fails and clears the current disable flag on opt-in', () => {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const previousMeasurementId = googleAnalytics.measurementId;
  googleAnalytics.measurementId = MEASUREMENT_ID;
  const values = new Map(),
    events = [];
  const win = {
    localStorage: {
      getItem: (key) => values.get(key) || null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
    },
    sessionStorage: { removeItem: () => {} },
    dispatchEvent: (event) => events.push(event.type),
  };
  Object.defineProperty(globalThis, 'window', { configurable: true, value: win });
  try {
    setAnalyticsOptOut(true);
    assert.equal(win[`ga-disable-${MEASUREMENT_ID}`], true);
    assert.equal(analyticsOptedOut({}), true);
    win.localStorage.getItem = () => {
      throw Error('storage unavailable');
    };
    assert.equal(analyticsOptedOut({}), true);
    setAnalyticsOptOut(false);
    assert.equal(win[`ga-disable-${MEASUREMENT_ID}`], false);
    assert.equal(analyticsOptedOut({}), false);
    assert.deepEqual(events, ['footfall-preference-change', 'footfall-preference-change']);
  } finally {
    setAnalyticsOptOut(false);
    googleAnalytics.measurementId = previousMeasurementId;
    if (previousWindow) Object.defineProperty(globalThis, 'window', previousWindow);
    else delete globalThis.window;
  }
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { randomUUID } from 'node:crypto';
import { transform } from 'esbuild';
import {
  isLoopbackHostname,
  isProductionAnalyticsOrigin,
  resolveFootfallDestination,
} from '../src/services/analyticsEnvironment.js';
import {
  analyticsOptedOut,
  applyAnalyticsOptOutLink,
  setAnalyticsOptOut,
} from '../src/services/analyticsPreference.js';
import { createFootfallTracker } from '../src/services/footfallAnalytics.js';
import { createGoogleAnalyticsTracker } from '../src/services/analytics.js';

const OPT_OUT_KEY = 'footfall.optOut.v1';
const VISITOR_KEY = 'footfall.visitor.v1';
const SESSION_KEY = 'footfall.session.v1';
const publicOrigins = [
  'https://iamnyx.dev',
  'https://www.iamnyx.dev',
  'https://iamnyx.web.app',
  'https://iamnyx.firebaseapp.com',
];
const previewOrigins = [
  'http://localhost:5173',
  'http://preview.localhost:4176',
  'http://127.0.0.1:5173',
  'http://127.0.0.2:4176',
  'http://[::1]:4176',
  'http://192.168.1.10:5173',
  'http://10.0.0.2:4176',
  'https://preview.example',
  'https://iamnyx.dev:8443',
  'http://iamnyx.dev',
  'https://iamnyx.dev.example',
  'https://preview--iamnyx.web.app',
];

function storage(unavailable) {
  const values = new Map();
  const check = () => {
    if (unavailable) throw Error('Storage unavailable');
  };
  return {
    values,
    getItem(key) {
      check();
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      check();
      values.set(key, value);
    },
    removeItem(key) {
      check();
      values.delete(key);
    },
  };
}

function browserHarness({ search = '', unavailable = false } = {}) {
  let handle = 0;
  let uuidCalls = 0;
  const idle = new Map();
  const timers = new Map();
  const requests = [];
  const scripts = [];
  const win = Object.assign(new EventTarget(), {
    location: new URL(`https://iamnyx.dev/${search}`),
    localStorage: storage(unavailable),
    sessionStorage: storage(unavailable),
    requestIdleCallback(callback) {
      idle.set(++handle, callback);
      return handle;
    },
    cancelIdleCallback: (id) => idle.delete(id),
    setTimeout(callback) {
      timers.set(++handle, callback);
      return handle;
    },
    clearTimeout: (id) => timers.delete(id),
  });
  const doc = Object.assign(new EventTarget(), {
    referrer: '',
    visibilityState: 'visible',
    head: { append: (script) => scripts.push(script) },
    createElement(name) {
      assert.equal(name, 'script');
      return { remove() {} };
    },
  });
  const navigator = { userAgent: 'Test browser' };
  const footfall = createFootfallTracker({
    win,
    doc,
    navigator,
    endpoint: 'https://collector.example/events',
    uuid() {
      uuidCalls++;
      return randomUUID();
    },
    fetch: async (url, options) => {
      requests.push({ url, options });
      const body = JSON.parse(options.body);
      return {
        ok: true,
        json: async () => ({ accepted: body.events.map((event) => event.eventId) }),
      };
    },
  });
  const google = createGoogleAnalyticsTracker({
    win,
    doc,
    navigator,
    measurementId: 'G-EXCLUSION123',
    development: false,
  });
  return {
    win,
    doc,
    navigator,
    footfall,
    google,
    requests,
    scripts,
    idle,
    timers,
    uuidCalls: () => uuidCalls,
    runIdle() {
      for (const [id, callback] of [...idle]) {
        idle.delete(id);
        callback();
      }
    },
  };
}

async function withBrowser(options, check) {
  const h = browserHarness(options);
  const originals = new Map(
    ['window', 'navigator'].map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]),
  );
  Object.defineProperty(globalThis, 'window', { configurable: true, value: h.win });
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: h.navigator });
  setAnalyticsOptOut(false);
  try {
    await check(h);
  } finally {
    h.footfall.stop();
    h.google.stop();
    setAnalyticsOptOut(false);
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
}

async function exerciseExcludedLifecycle(h) {
  for (let restart = 0; restart < 3; restart++) {
    h.footfall.start();
    h.google.start();
    h.runIdle();
    assert.equal(
      h.footfall.track('project_open', { project_id: 'tally', entry_point: 'grid' }),
      false,
    );
    h.doc.visibilityState = 'hidden';
    h.doc.dispatchEvent(new Event('visibilitychange'));
    h.win.dispatchEvent(new Event('pagehide'));
    await h.footfall.flush(true);
    await Promise.resolve();
    h.footfall.stop();
    h.google.stop();
  }
  assert.equal(h.uuidCalls(), 0);
  assert.equal(h.footfall.pending(), 0);
  assert.equal(h.win.localStorage.values.has(VISITOR_KEY), false);
  assert.equal(h.win.sessionStorage.values.has(SESSION_KEY), false);
  assert.deepEqual(h.requests, []);
  assert.deepEqual(h.scripts, []);
  assert.deepEqual(h.win.dataLayer || [], []);
  assert.equal(h.win.gtag, undefined);
  assert.equal(h.idle.size, 0);
  assert.equal(h.timers.size, 0);
}

test('Footfall production destinations require an enabled build and an exact public HTTPS origin', () => {
  for (const origin of publicOrigins) {
    const location = new URL(origin);
    assert.equal(isProductionAnalyticsOrigin(location), true);
    assert.equal(
      resolveFootfallDestination({ development: false, enabled: true, location }),
      'production',
    );
    assert.equal(
      resolveFootfallDestination({ development: false, enabled: false, location }),
      null,
    );
  }
  for (const origin of previewOrigins) {
    const location = new URL(origin);
    assert.equal(isProductionAnalyticsOrigin(location), false, origin);
    assert.equal(
      resolveFootfallDestination({ development: false, enabled: true, location }),
      null,
      origin,
    );
  }
  assert.equal(resolveFootfallDestination({ development: false, enabled: true }), null);
});

test('development routes loopback exclusively to the emulator and never enables a production destination', () => {
  for (const origin of [...publicOrigins, ...previewOrigins]) {
    const location = new URL(origin);
    const expected = ['localhost', 'preview.localhost', '127.0.0.1', '127.0.0.2', '[::1]'].includes(
      location.hostname,
    )
      ? 'emulator'
      : null;
    for (const enabled of [true, false])
      assert.equal(
        resolveFootfallDestination({ development: true, enabled, location }),
        expected,
        origin,
      );
  }
  assert.equal(isLoopbackHostname('::1'), true);
  assert.equal(isLoopbackHostname('127.255.255.255'), true);
  assert.equal(isLoopbackHostname('localhost.example'), false);
  assert.equal(isLoopbackHostname(), false);
});

test('the real entry applies the QA opt-out before React can start either analytics tracker', async () => {
  const source = await readFile(new URL('../src/main.jsx', import.meta.url), 'utf8');
  const compiled = await transform(source, { loader: 'jsx', jsx: 'automatic', format: 'cjs' });
  await withBrowser({ search: '?analytics=off' }, async (h) => {
    h.win.localStorage.setItem(VISITOR_KEY, randomUUID());
    h.win.sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ id: randomUUID(), lastSeen: Date.now() }),
    );
    let roots = 0;
    let renders = 0;
    const imports = {
      './index.css': {},
      react: { StrictMode: 'StrictMode' },
      'react/jsx-runtime': { jsx: (type, props) => ({ type, props }) },
      'react-dom/client': {
        createRoot() {
          roots++;
          assert.equal(analyticsOptedOut(h.navigator), true);
          assert.equal(h.win.localStorage.values.get(OPT_OUT_KEY), '1');
          h.footfall.start();
          h.google.start();
          return { render: () => renders++ };
        },
      },
      './app/App.jsx': { default: 'App' },
      './app/AppProviders.jsx': { default: 'AppProviders' },
      './services/analyticsPreference.js': { applyAnalyticsOptOutLink },
    };
    runInNewContext(compiled.code, {
      require(name) {
        assert.ok(Object.hasOwn(imports, name), `Unexpected entry dependency: ${name}`);
        return imports[name];
      },
      module: { exports: {} },
      exports: {},
      document: { getElementById: () => ({}) },
    });
    assert.equal(roots, 1);
    assert.equal(renders, 1);
    await exerciseExcludedLifecycle(h);
  });
});

test('QA exclusion persists across documents and absent or on markers never silently opt back in', async () => {
  await withBrowser({}, async (h) => {
    assert.equal(applyAnalyticsOptOutLink(''), false);
    assert.equal(applyAnalyticsOptOutLink('?analytics=on'), false);
    assert.equal(analyticsOptedOut(h.navigator), false);
    assert.equal(applyAnalyticsOptOutLink('?analytics=off'), true);
    assert.equal(h.win.localStorage.values.get(OPT_OUT_KEY), '1');
    // A fresh module has no in-memory choice; it must honor the saved browser preference.
    const nextDocument = await import(
      '../src/services/analyticsPreference.js?exclusion-next-document'
    );
    try {
      assert.equal(nextDocument.analyticsOptedOut(h.navigator), true);
      assert.equal(nextDocument.applyAnalyticsOptOutLink(''), false);
      assert.equal(nextDocument.applyAnalyticsOptOutLink('?analytics=on'), false);
      assert.equal(nextDocument.analyticsOptedOut(h.navigator), true);
      assert.equal(h.win.localStorage.values.get(OPT_OUT_KEY), '1');
    } finally {
      nextDocument.setAnalyticsOptOut(false);
    }
  });
});

test('a QA link still suppresses all collection for the current document when browser storage fails', async () => {
  await withBrowser({ search: '?analytics=off', unavailable: true }, async (h) => {
    assert.equal(applyAnalyticsOptOutLink(), true);
    assert.equal(analyticsOptedOut(h.navigator), true);
    await exerciseExcludedLifecycle(h);
  });
});

test('applying the QA link before pending idle work cancels Footfall and prevents Google from loading', async () => {
  await withBrowser({}, async (h) => {
    h.footfall.start();
    h.google.start();
    assert.equal(h.idle.size, 2);
    applyAnalyticsOptOutLink('?analytics=off');
    h.runIdle();
    await exerciseExcludedLifecycle(h);
  });
});

import { analyticsOptedOut } from './analyticsPreference.js';
import { FOOTFALL_VERSION, validFootfallContext } from '../data/footfallContract.js';
import { footfallFirebase } from '../data/footfallFirebase.js';
import { browserContext, createFirestoreSender } from './footfallFirestore.js';
import { resolveFootfallDestination } from './analyticsEnvironment.js';

const environment = import.meta.env || {};
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SESSION_MS = 1800000;
const MAX_AGE = 300000;
const MAX_QUEUE = 100;
const MAX_BYTES = 60000;
const BATCH_BYTES = 16000;
const MAX_ATTEMPTS = 5;
const byteLength = (value) => new TextEncoder().encode(JSON.stringify(value)).length;
const safeStorage = (target, name) => {
  try {
    return target[name];
  } catch {
    return undefined;
  }
};
const optedOut = analyticsOptedOut;

function identity({ localStorage, sessionStorage, now, uuid, previous }) {
  let visitorId = previous?.visitorId;
  let session = previous?.session;
  try {
    visitorId ||= localStorage?.getItem('footfall.visitor.v1');
  } catch {
    /* Optional storage. */
  }
  if (!uuidPattern.test(visitorId || '')) visitorId = uuid();
  try {
    localStorage?.setItem('footfall.visitor.v1', visitorId);
  } catch {
    /* Keep the in-memory ID. */
  }
  try {
    session ||= JSON.parse(sessionStorage?.getItem('footfall.session.v1') || 'null');
  } catch {
    /* Optional storage. */
  }
  if (
    !session ||
    !uuidPattern.test(session.id || '') ||
    !Number.isFinite(session.lastSeen) ||
    now < session.lastSeen ||
    now - session.lastSeen >= SESSION_MS
  )
    session = { id: uuid() };
  session = { id: session.id, lastSeen: now };
  try {
    sessionStorage?.setItem('footfall.session.v1', JSON.stringify(session));
  } catch {
    /* Keep the in-memory session. */
  }
  return { visitorId, session };
}
const referrerOrigin = (referrer) => {
  try {
    const url = new URL(referrer);
    return ['http:', 'https:'].includes(url.protocol) ? url.origin : null;
  } catch {
    return null;
  }
};
// Dependencies are injectable so queue limits, acknowledgement, retries and cleanup can be tested.
export function createFootfallTracker({
  endpoint,
  win,
  doc,
  navigator,
  fetch: send,
  now = Date.now,
  uuid = () => globalThis.crypto.randomUUID(),
  localStorage = safeStorage(win, 'localStorage'),
  sessionStorage = safeStorage(win, 'sessionStorage'),
}) {
  let ids,
    timer,
    idleHandle,
    idleCallback,
    sequence = 0,
    running = false,
    visited = false;
  const queue = [];
  const requests = new Set();
  const clearTimer = () => {
    if (timer !== undefined) win.clearTimeout(timer);
    timer = undefined;
  };
  const cancelIdle = () => {
    if (idleHandle !== undefined) {
      if (idleCallback) win.cancelIdleCallback(idleHandle);
      else win.clearTimeout(idleHandle);
    }
    idleHandle = undefined;
  };
  const prune = () => {
    const time = now();
    for (let i = queue.length - 1; i >= 0; i--)
      if (
        !queue[i].inFlight &&
        (time - queue[i].queuedAt > MAX_AGE || queue[i].attempts >= MAX_ATTEMPTS)
      )
        queue.splice(i, 1);
    if (optedOut(navigator, localStorage)) queue.length = 0;
  };
  const schedule = (delay = 2000) => {
    if (!running || timer !== undefined || requests.size || !queue.length) return;
    timer = win.setTimeout(() => {
      timer = undefined;
      void flush();
    }, delay);
  };
  const track = (name, context = {}) => {
    if (!running || optedOut(navigator, localStorage) || !validFootfallContext(name, context))
      return false;
    if (name !== 'page_view' && !visited) visit();
    prune();
    const time = now();
    ids = identity({ localStorage, sessionStorage, now: time, uuid, previous: ids });
    const event = {
      eventId: uuid(),
      name,
      visitorId: ids.visitorId,
      sessionId: ids.session.id,
      occurredAt: time,
      order: sequence++,
      path: win.location.pathname.slice(0, 300),
      referrer: name === 'page_view' ? referrerOrigin(doc.referrer) : null,
      context: { ...context },
    };
    if (
      queue.length >= MAX_QUEUE ||
      byteLength(queue.map((item) => item.event)) + byteLength(event) > MAX_BYTES
    )
      return false;
    queue.push({ event, queuedAt: time, attempts: 0 });
    schedule();
    return true;
  };
  const visit = () => {
    if (!visited && track('page_view')) visited = true;
  };
  async function flush(final = false) {
    clearTimer();
    prune();
    if (!running || (requests.size && !final) || requests.size >= 2 || !queue.length) return;
    const batch = [];
    for (const item of queue.filter((entry) => !entry.inFlight).slice(0, 10)) {
      if (
        byteLength({
          version: FOOTFALL_VERSION,
          events: [...batch.map((entry) => entry.event), item.event],
        }) > BATCH_BYTES
      )
        break;
      batch.push(item);
    }
    if (!batch.length) return;
    batch.forEach((item) => {
      item.attempts++;
      item.inFlight = true;
    });
    const controller = new AbortController();
    const timeout = win.setTimeout(() => controller.abort(), 10000);
    requests.add(controller);
    let retry = true;
    try {
      const response = await send(endpoint, {
        method: 'POST',
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: FOOTFALL_VERSION,
          events: batch.map((item) => item.event),
        }),
        keepalive: final,
        signal: controller.signal,
      });
      if (response.ok) {
        const acknowledgement = await response.json();
        if (
          !Array.isArray(acknowledgement.accepted) ||
          !batch.every((item) => acknowledgement.accepted.includes(item.event.eventId))
        )
          throw Error('invalid_acknowledgement');
        retry = false;
      } else if (response.status !== 408 && response.status !== 429 && response.status < 500)
        retry = false;
    } catch {
      /* Bounded retries keep the same event IDs. */
    } finally {
      win.clearTimeout(timeout);
      requests.delete(controller);
      batch.forEach((item) => {
        item.inFlight = false;
      });
      if (!retry)
        for (const item of batch) {
          const index = queue.indexOf(item);
          if (index !== -1) queue.splice(index, 1);
        }
      prune();
      schedule(retry ? Math.min(30000, 1000 * 2 ** batch[0].attempts) : 1000);
    }
  }
  const hidden = () => {
    if (doc.visibilityState === 'hidden') {
      cancelIdle();
      visit();
      void flush(true);
    }
  };
  const pagehide = () => {
    cancelIdle();
    visit();
    // Other module lifecycle handlers can enqueue their final metadata first.
    queueMicrotask(() => void flush(true));
  };
  const preferenceChanged = () => {
    if (optedOut(navigator, localStorage)) {
      queue.length = 0;
      requests.forEach((controller) => controller.abort());
      ids = undefined;
      clearTimer();
      cancelIdle();
    }
  };
  const online = () => {
    clearTimer();
    schedule(0);
  };
  return {
    track,
    flush,
    pending: () => queue.length,
    start() {
      if (running) return;
      running = true;
      if (optedOut(navigator, localStorage)) return;
      doc.addEventListener('visibilitychange', hidden);
      win.addEventListener('pagehide', pagehide);
      win.addEventListener('online', online);
      win.addEventListener('footfall-preference-change', preferenceChanged);
      idleCallback = typeof win.requestIdleCallback === 'function';
      idleHandle = idleCallback
        ? win.requestIdleCallback(
            () => {
              idleHandle = undefined;
              visit();
              schedule(0);
            },
            { timeout: 3000 },
          )
        : win.setTimeout(() => {
            idleHandle = undefined;
            visit();
          }, 1000);
      schedule();
    },
    stop() {
      if (optedOut(navigator, localStorage)) {
        queue.length = 0;
        ids = undefined;
      }
      running = false;
      clearTimer();
      cancelIdle();
      requests.forEach((controller) => controller.abort());
      doc.removeEventListener('visibilitychange', hidden);
      win.removeEventListener('pagehide', pagehide);
      win.removeEventListener('online', online);
      win.removeEventListener('footfall-preference-change', preferenceChanged);
    },
  };
}
let tracker;
export function scheduleFootfallVisit() {
  if (optedOut(navigator)) return undefined;
  try {
    const destination = resolveFootfallDestination({
      development: environment.DEV === true,
      enabled: environment.VITE_FOOTFALL_ENABLED === 'true',
      location: window.location,
    });
    if (!destination) return undefined;
    const local = destination === 'emulator';
    const projectId = local ? 'demo-footfall' : footfallFirebase.projectId;
    const host = local ? 'http://127.0.0.1:8085' : 'https://firestore.googleapis.com';
    const endpoint = new URL(
      `${host}/v1/projects/${projectId}/databases/(default)/documents:commit`,
    );
    endpoint.searchParams.set('key', footfallFirebase.apiKey);
    const property = environment.VITE_FOOTFALL_PROPERTY_ID || 'portfolio';
    tracker ||= createFootfallTracker({
      endpoint: endpoint.href,
      win: window,
      doc: document,
      navigator,
      fetch: createFirestoreSender({
        projectId,
        property,
        origin: window.location.origin,
        client: browserContext(navigator),
        fetch: window.fetch.bind(window),
      }),
    });
    tracker.start();
    return () => tracker.stop();
  } catch {
    return undefined;
  }
}
export function trackFootfallEvent(name, context = {}) {
  try {
    return tracker?.track(name, context) || false;
  } catch {
    return false;
  }
}

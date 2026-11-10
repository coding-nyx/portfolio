import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS } from '../src/data/chapters.js';
import {
  activeChapterIndex,
  observeChapterLayout,
} from '../src/app/navigation/chapterNavigation.js';

function layoutHarness() {
  const sections = new Map(
    CHAPTERS.map(([id], index) => [
      id,
      {
        top: index * 1000,
        getBoundingClientRect() {
          return { top: this.top };
        },
      },
    ]),
  );
  const frames = new Map();
  const observers = [];
  let frameId = 0;
  const viewport = Object.assign(new EventTarget(), {
    innerHeight: 800,
    scrollY: 1000,
    visualViewport: new EventTarget(),
    requestAnimationFrame(callback) {
      frames.set(++frameId, callback);
      return frameId;
    },
    cancelAnimationFrame(id) {
      frames.delete(id);
    },
    ResizeObserver: class {
      sections = [];
      constructor(callback) {
        this.callback = callback;
        observers.push(this);
      }
      observe(section) {
        this.sections.push(section);
      }
      disconnect() {
        this.sections = [];
      }
      notify() {
        if (this.sections.length) this.callback();
      }
    },
  });
  const page = {
    getElementById: (id) => sections.get(id),
    documentElement: { scrollHeight: 10000 },
  };
  return {
    environment: { document: page, window: viewport },
    sections,
    frames,
    observers,
    flush() {
      const callbacks = [...frames.values()];
      frames.clear();
      for (const callback of callbacks) callback();
    },
  };
}

test('responsive chapter selection measures after layout, without scrolling the page', () => {
  const h = layoutHarness();
  const active = [];
  let selected = 5;
  const stop = observeChapterLayout(
    () => active.push(selected ?? activeChapterIndex(h.environment)),
    () => {
      selected = null;
    },
    h.environment,
  );
  h.flush();
  assert.deepEqual(active, [5]);

  h.environment.window.dispatchEvent(new Event('resize'));
  assert.equal(selected, null, 'a desktop jump must not pin the mobile indicator');
  assert.deepEqual(active, [5], 'resize must wait for the next rendered layout');
  for (let index = 0; index <= 6; index++) {
    h.sections.get(CHAPTERS[index][0]).top = (index - 6) * 500 + 80;
  }
  h.flush();
  assert.deepEqual(active, [5, 6]);
  assert.equal(h.environment.window.scrollY, 1000, 'measurement preserves reading position');
  stop();
});

test('chapter size changes refresh the indicator after responsive reflow without another scroll', () => {
  const h = layoutHarness();
  const active = [];
  const stop = observeChapterLayout(
    () => active.push(activeChapterIndex(h.environment)),
    () => {},
    h.environment,
  );
  h.flush();
  assert.deepEqual(active, [0]);
  assert.equal(h.observers[0].sections.length, CHAPTERS.length);
  h.sections.get('entry').top = -1500;
  h.sections.get('bio').top = -500;
  h.sections.get('experience').top = 80;
  h.observers[0].notify();
  h.flush();
  assert.deepEqual(active, [0, 2]);
  stop();
});

test('scroll and viewport changes share one measurement per animation frame', () => {
  const h = layoutHarness();
  let measurements = 0;
  let resizes = 0;
  const stop = observeChapterLayout(
    () => measurements++,
    () => resizes++,
    h.environment,
  );
  h.environment.window.dispatchEvent(new Event('scroll'));
  h.environment.window.dispatchEvent(new Event('resize'));
  h.environment.window.visualViewport.dispatchEvent(new Event('resize'));
  h.observers[0].notify();
  assert.equal(h.frames.size, 1);
  h.flush();
  assert.equal(measurements, 1);
  assert.equal(resizes, 2);
  stop();
});

test('unmount cancels pending chapter measurements and releases subscriptions', () => {
  const h = layoutHarness();
  let measurements = 0;
  const stop = observeChapterLayout(
    () => measurements++,
    () => {},
    h.environment,
  );
  stop();
  assert.equal(h.frames.size, 0);
  assert.deepEqual(h.observers[0].sections, []);
  h.environment.window.dispatchEvent(new Event('scroll'));
  h.environment.window.dispatchEvent(new Event('resize'));
  h.environment.window.visualViewport.dispatchEvent(new Event('resize'));
  h.observers[0].notify();
  h.observers[0].callback();
  h.flush();
  assert.equal(measurements, 0);
});

test('the last chapter stays active at the document bottom', () => {
  const h = layoutHarness();
  h.environment.window.scrollY = 9200;
  assert.equal(activeChapterIndex(h.environment), CHAPTERS.length - 1);
});

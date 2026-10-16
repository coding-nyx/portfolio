import { buildIslandWorld } from './buildIslandWorld.js';

// Scene geometry and walking mechanics ported from the approved Projects G3v2 reference.
// The reference's sample projects are replaced with the curated portfolio projects.
export function createIsland(stage, projects, { onSelect, onOpen, onFailure }) {
  let stopped = false,
    renderer,
    scene,
    resizeObserver,
    visibleObserver;
  const controller = new AbortController();
  const listen = (el, type, handler) =>
    el.addEventListener(type, handler, { signal: controller.signal });
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      io.disconnect();
      boot();
    }
  });
  io.observe(stage);
  function dispose() {
    stopped = true;
    controller.abort();
    io.disconnect();
    resizeObserver?.disconnect();
    visibleObserver?.disconnect();
    if (renderer) {
      renderer.setAnimationLoop(null);
      const disposed = new Set();
      scene?.traverse((o) => {
        if (o.geometry && !disposed.has(o.geometry)) {
          o.geometry.dispose();
          disposed.add(o.geometry);
        }
        for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
          if (!m || disposed.has(m)) continue;
          for (const v of Object.values(m))
            if (v?.isTexture && !disposed.has(v)) {
              v.dispose();
              disposed.add(v);
            }
          m.dispose();
          disposed.add(m);
        }
      });
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    }
    stage.querySelector('[data-island-pins]')?.replaceChildren();
  }
  async function boot() {
    let T;
    try {
      T = await import('../../../vendor/three.module.min.js');
    } catch {
      if (!stopped) onFailure();
      return;
    }
    if (stopped) return;
    try {
      renderer = new T.WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
    } catch {
      onFailure();
      return;
    }
    const R = renderer;
    R.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    R.setClearColor(0x0b0b0f);
    stage.prepend(R.domElement);
    scene = new T.Scene();
    const S = scene;
    const ctx = {
      T,
      S,
      R,
      st: stage,
      listen,
      openDet: onOpen,
      showCard: (i) => {
        stage
          .querySelectorAll('.island-pin')
          .forEach((p, j) => p.classList.toggle('current', i === j));
        onSelect(i);
      },
    };
    const ray = new T.Raycaster(),
      point = new T.Vector2();
    ctx.pick = (e, objs) => {
      const b = R.domElement.getBoundingClientRect();
      point.set(
        ((e.clientX - b.left) / b.width) * 2 - 1,
        (-(e.clientY - b.top) / b.height) * 2 + 1,
      );
      ray.setFromCamera(point, ctx.cam);
      return ray.intersectObjects(objs, true)[0];
    };
    const pins = [];
    ctx.pin = (text, obj, off) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'island-pin';
      el.textContent = text;
      el.title = text;
      el.setAttribute('aria-label', 'Walk to ' + text);
      stage.querySelector('[data-island-pins]').append(el);
      pins.push({ el, obj, off: off || new T.Vector3() });
      return el;
    };
    try {
      buildIslandWorld(ctx, projects);
    } catch {
      dispose();
      onFailure();
      return;
    }
    const v = new T.Vector3();
    const size = () => {
      if (stopped) return;
      const W = stage.clientWidth,
        H = stage.clientHeight;
      R.setSize(W, H, false);
      ctx.W = W;
      ctx.H = H;
      ctx.resize(W, H);
    };
    resizeObserver = new ResizeObserver(size);
    resizeObserver.observe(stage);
    size();
    let last = performance.now(),
      visible = true;
    const loop = (t) => {
      if (stopped) return;
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      ctx.tick(dt, t / 1000);
      for (const p of pins) {
        p.obj.getWorldPosition(v).add(p.off).project(ctx.cam);
        const half = Math.min(ctx.W / 2, p.el.offsetWidth / 2 + 12);
        p.el.style.transform = `translate(${Math.min(ctx.W - half, Math.max(half, ((v.x + 1) / 2) * ctx.W))}px,${Math.max(64, ((1 - v.y) / 2) * ctx.H)}px) translate(-50%,-100%)`;
      }
      R.render(S, ctx.cam);
    };
    const toggle = () => {
      last = performance.now();
      R.setAnimationLoop(visible && !document.hidden ? loop : null);
    };
    visibleObserver = new IntersectionObserver((es) => {
      visible = es.some((e) => e.isIntersecting);
      toggle();
    });
    visibleObserver.observe(stage);
    listen(document, 'visibilitychange', toggle);
    toggle();
    stage.dataset.sceneReady = 'true';
  }

  return dispose;
}

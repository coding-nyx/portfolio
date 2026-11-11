// Analytics stays optional: the page renders before the Google tag is requested.
import { analyticsOptedOut } from './analyticsPreference.js';
import { scheduleFootfallVisit } from './footfallAnalytics.js';
import { googleAnalyticsMeasurementId } from '../data/googleAnalytics.js';
import { isProductionAnalyticsOrigin } from './analyticsEnvironment.js';

const referringOrigin = (referrer) => {
  try {
    const url = new URL(referrer);
    return ['http:', 'https:'].includes(url.protocol) ? url.origin : '';
  } catch {
    return '';
  }
};

// Lifecycle dependencies are injectable to verify consent and deferred work without live requests.
export function createGoogleAnalyticsTracker({
  win,
  doc,
  navigator,
  measurementId,
  development = (import.meta.env || {}).DEV === true,
  optedOut = () => analyticsOptedOut(navigator),
}) {
  let running = false,
    generation = 0,
    idleHandle,
    loadTimeout,
    script,
    loaded = false,
    configured = false,
    visitLogged = false;
  const idle = typeof win.requestIdleCallback === 'function';
  const disabledKey = `ga-disable-${measurementId}`;
  const cancelIdle = () => {
    if (idleHandle === undefined) return;
    if (idle) win.cancelIdleCallback(idleHandle);
    else win.clearTimeout(idleHandle);
    idleHandle = undefined;
  };
  const clearLoader = (remove = false) => {
    if (loadTimeout !== undefined) win.clearTimeout(loadTimeout);
    loadTimeout = undefined;
    if (!script) return;
    script.onload = null;
    script.onerror = null;
    if (remove) {
      script.remove();
      script = undefined;
    }
  };
  const logVisit = (currentGeneration) => {
    if (!running || currentGeneration !== generation || optedOut()) return;
    win[disabledKey] = false;
    const page = {
      page_location: win.location.origin + win.location.pathname,
      page_referrer: referringOrigin(doc.referrer),
    };
    try {
      if (!configured) {
        configured = true;
        win.gtag('js', new Date());
        win.gtag('config', measurementId, {
          ...page,
          send_page_view: true,
          allow_google_signals: false,
          allow_ad_personalization_signals: false,
        });
      }
      if (!visitLogged) {
        visitLogged = true;
        win.gtag('event', 'portfolio_visit', {
          ...page,
          send_to: measurementId,
          device_type: /iPad|Tablet/i.test(navigator.userAgent)
            ? 'Tablet'
            : /Mobi|Android/i.test(navigator.userAgent)
              ? 'Mobile'
              : 'Desktop',
        });
      }
    } catch {
      // An optional integration must never interrupt the portfolio.
    }
  };
  const load = (currentGeneration) => {
    idleHandle = undefined;
    if (!running || currentGeneration !== generation || optedOut()) return;
    if (loaded) {
      logVisit(currentGeneration);
      return;
    }
    try {
      if (win.dataLayer === undefined) win.dataLayer = [];
      if (!Array.isArray(win.dataLayer)) return;
      if (win.gtag === undefined)
        win.gtag = function () {
          win.dataLayer.push(arguments);
        };
      if (typeof win.gtag !== 'function') return;
      script = doc.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      script.referrerPolicy = 'no-referrer';
      script.onload = () => {
        if (!running || currentGeneration !== generation || optedOut()) return;
        clearLoader();
        loaded = true;
        logVisit(currentGeneration);
      };
      const failed = () => {
        if (currentGeneration === generation) clearLoader(true);
      };
      script.onerror = failed;
      loadTimeout = win.setTimeout(failed, 8000);
      doc.head.append(script);
    } catch {
      clearLoader(true);
    }
  };
  const stop = () => {
    running = false;
    generation++;
    if (measurementId) win[disabledKey] = true;
    cancelIdle();
    clearLoader(!loaded);
  };
  return {
    start() {
      if (
        running ||
        !measurementId ||
        development ||
        !isProductionAnalyticsOrigin(win.location) ||
        optedOut()
      )
        return stop;
      running = true;
      win[disabledKey] = false;
      const currentGeneration = ++generation;
      if (!visitLogged)
        idleHandle = idle
          ? win.requestIdleCallback(() => load(currentGeneration), { timeout: 3000 })
          : win.setTimeout(() => load(currentGeneration), 1000);
      return stop;
    },
    stop,
  };
}

let googleTracker;
function scheduleGoogleAnalytics() {
  googleTracker ||= createGoogleAnalyticsTracker({
    win: window,
    doc: document,
    navigator,
    measurementId: googleAnalyticsMeasurementId(),
  });
  return googleTracker.start();
}

export function scheduleVisitAnalytics() {
  let stopGoogle, stopFootfall;
  const restart = () => {
    stopGoogle?.();
    stopFootfall?.();
    if (analyticsOptedOut()) return;
    stopGoogle = scheduleGoogleAnalytics();
    stopFootfall = scheduleFootfallVisit();
  };
  restart();
  window.addEventListener('footfall-preference-change', restart);
  return () => {
    window.removeEventListener('footfall-preference-change', restart);
    stopGoogle?.();
    stopFootfall?.();
  };
}

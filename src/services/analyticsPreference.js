import { googleAnalyticsMeasurementId } from '../data/googleAnalytics.js';

let memoryOptOut = false;
export function analyticsOptedOut(navigator = globalThis.navigator, storage) {
  if (memoryOptOut || navigator?.globalPrivacyControl === true || navigator?.doNotTrack === '1')
    return true;
  try {
    return (storage || globalThis.window?.localStorage)?.getItem('footfall.optOut.v1') === '1';
  } catch {
    return false;
  }
}
export function setAnalyticsOptOut(value) {
  memoryOptOut = value;
  try {
    window.localStorage.setItem('footfall.optOut.v1', value ? '1' : '0');
    if (value) {
      window.localStorage.removeItem('footfall.visitor.v1');
      window.sessionStorage.removeItem('footfall.session.v1');
    }
  } catch {
    /* The current tab still honors the in-memory choice. */
  }
  const measurement = googleAnalyticsMeasurementId();
  if (measurement) window[`ga-disable-${measurement}`] = analyticsOptedOut();
  window.dispatchEvent(new Event('footfall-preference-change'));
}

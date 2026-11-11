// Public GA4 collection destination. This is not an API key or reporting credential.
export const googleAnalytics = { measurementId: 'G-W96P80S798' };

export function resolveGoogleAnalyticsMeasurementId(configured, fallback) {
  return (
    [configured, fallback].find(
      (value) => typeof value === 'string' && /^G-[A-Z0-9]{4,20}$/.test(value),
    ) || null
  );
}

export function googleAnalyticsMeasurementId(environment = import.meta.env || {}) {
  return resolveGoogleAnalyticsMeasurementId(
    googleAnalytics.measurementId,
    environment.VITE_FIREBASE_MEASUREMENT_ID,
  );
}

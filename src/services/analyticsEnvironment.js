const productionOrigins = new Set([
  'https://iamnyx.dev',
  'https://www.iamnyx.dev',
  'https://iamnyx.web.app',
  'https://iamnyx.firebaseapp.com',
]);

export function isLoopbackHostname(hostname = '') {
  return (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    /^127(?:\.\d{1,3}){3}$/.test(hostname) ||
    ['::1', '[::1]'].includes(hostname)
  );
}

export function isProductionAnalyticsOrigin(location) {
  return productionOrigins.has(location?.origin);
}

export function resolveFootfallDestination({ development, enabled, location }) {
  if (development === true) return isLoopbackHostname(location?.hostname) ? 'emulator' : null;
  return enabled === true && isProductionAnalyticsOrigin(location) ? 'production' : null;
}

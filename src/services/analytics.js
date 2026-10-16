// Analytics is optional. Neither its SDK nor a network request is needed to render the portfolio.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};
let initialization;
let visitLogged = false;

async function getAnalyticsClient() {
  initialization ??= Promise.all([import('firebase/app'), import('firebase/analytics')])
    .then(async ([appModule, analyticsModule]) => {
      if (!(await analyticsModule.isSupported())) return null;
      const app = appModule.getApps().length
        ? appModule.getApp()
        : appModule.initializeApp(firebaseConfig);
      return { instance: analyticsModule.getAnalytics(app), logEvent: analyticsModule.logEvent };
    })
    .catch(() => null);
  return initialization;
}

export function scheduleVisitAnalytics() {
  const local = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
  const configured =
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.appId &&
    firebaseConfig.measurementId;
  if (local || !configured || visitLogged) return undefined;
  let cancelled = false;
  const logVisit = async () => {
    const client = await getAnalyticsClient();
    if (cancelled || visitLogged || !client) return;
    visitLogged = true;
    const deviceType = /Mobi|Android/i.test(navigator.userAgent)
      ? 'Mobile'
      : /Tablet|iPad/i.test(navigator.userAgent)
        ? 'Tablet'
        : 'Desktop';
    try {
      client.logEvent(client.instance, 'login', { device_type: deviceType });
    } catch {
      /* Analytics failure must never interrupt the page. */
    }
  };
  const idle = typeof window.requestIdleCallback === 'function';
  const handle = idle
    ? window.requestIdleCallback(logVisit, { timeout: 3000 })
    : window.setTimeout(logVisit, 1000);
  return () => {
    cancelled = true;
    if (idle) window.cancelIdleCallback(handle);
    else window.clearTimeout(handle);
  };
}

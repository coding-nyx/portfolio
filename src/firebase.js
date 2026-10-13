// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported, logEvent } from "firebase/analytics";

// Firebase web config is supplied at build time via VITE_-prefixed env vars.
// These are public Firebase *web* identifiers (not secrets), but they were
// previously hardcoded here and are still present in git history — rotate them.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined
};

// Fail soft: without a configured project the app still builds and renders,
// it simply skips Firebase init and analytics.
const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);

const app = isConfigured ? initializeApp(firebaseConfig) : null;

if (!isConfigured) {
  console.warn(
    "[firebase] VITE_FIREBASE_* env vars are not set — skipping Firebase init and analytics."
  );
}

let analytics = null;
// Only attempt to initialize analytics if the app initialised and a measurement ID is configured
if (isConfigured && firebaseConfig.measurementId) {
  isSupported().then((supported) => {
    if (supported) {
      try {
        analytics = getAnalytics(app);
      } catch (e) {
        console.warn("Firebase Analytics failed to initialize:", e);
      }
    }
  }).catch(() => {});
}

export const logSystemLogin = () => {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  // Simple device detection
  const ua = navigator.userAgent;
  let deviceType = 'Desktop';
  if (/Mobi|Android/i.test(ua)) {
    deviceType = 'Mobile';
  } else if (/Tablet|iPad/i.test(ua)) {
    deviceType = 'Tablet';
  }

  if (!isLocalhost) {
    if (analytics) {
      try {
        logEvent(analytics, 'login', {
          device_type: deviceType
        });
      } catch (e) {
        console.warn("Firebase Analytics logging blocked:", e);
      }
    }
  } else {
    console.log(`[Analytics] Localhost detected. Event 'login' suppressed. Device: ${deviceType}`);
  }
};

/**
 * Log agent chat interactions to Firebase Analytics (free Google Analytics 4 events).
 * @param {string} eventName - e.g. 'rook_chat_open', 'rook_message_sent', 'rook_contact_dispatched'
 * @param {Object} params - custom parameters (strings/numbers)
 */
export const logAgentInteraction = (eventName, params = {}) => {
  const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (isLocalhost) {
    console.log(`[Analytics:Rook] '${eventName}'`, params);
  }

  if (analytics) {
    try {
      logEvent(analytics, eventName, {
        ...params,
        environment: isLocalhost ? 'development' : 'production',
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.warn(`[Firebase Analytics] Failed to log '${eventName}':`, e);
    }
  }
};

export default app;

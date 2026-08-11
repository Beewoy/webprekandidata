import type { Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCYwArDP0cfOdD3jN0EUMWoKNVfvS2gYmQ",
  authDomain: "web-pre-kandidatov.firebaseapp.com",
  projectId: "web-pre-kandidatov",
  storageBucket: "web-pre-kandidatov.firebasestorage.app",
  messagingSenderId: "967579575978",
  appId: "1:967579575978:web:a527f72532bf87b6d9d2d3",
  measurementId: "G-0LPPHZCVXB",
};

let analyticsInstance: Analytics | null = null;
let analyticsPromise: Promise<Analytics | null> | null = null;

export async function enableFirebaseAnalytics() {
  if (analyticsInstance) {
    const { setAnalyticsCollectionEnabled } = await import("firebase/analytics");
    setAnalyticsCollectionEnabled(analyticsInstance, true);
    return;
  }

  analyticsPromise ??= initializeAnalytics();
  analyticsInstance = await analyticsPromise;
}

export async function disableFirebaseAnalytics() {
  if (!analyticsInstance) return;

  const { setAnalyticsCollectionEnabled } = await import("firebase/analytics");
  setAnalyticsCollectionEnabled(analyticsInstance, false);
}

async function initializeAnalytics() {
  const [{ getApp, getApps, initializeApp }, { getAnalytics, isSupported, setAnalyticsCollectionEnabled }] =
    await Promise.all([import("firebase/app"), import("firebase/analytics")]);

  if (!(await isSupported())) return null;

  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  setAnalyticsCollectionEnabled(analytics, true);
  return analytics;
}

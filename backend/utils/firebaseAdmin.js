const { initializeApp, getApps, cert } = require('firebase-admin/app');

if (!getApps().length) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!serviceAccountJson) {
    if (process.env.NODE_ENV === 'production') {
      // Don't let this fail silently in prod — a missing key here means
      // every push notification just vanishes with no visible error.
      throw new Error('FIREBASE_SERVICE_ACCOUNT is missing in production. Notifications cannot work.');
    }
    console.warn('FIREBASE_SERVICE_ACCOUNT is missing; Firebase notifications are disabled (local dev only).');
  } else {
    const serviceAccount = JSON.parse(serviceAccountJson);
    initializeApp({
      credential: cert(serviceAccount)
    });
  }
}
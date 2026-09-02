import { initializeApp } from 'firebase/app';
import { getMessaging,getToken, onMessage, isSupported } from 'firebase/messaging';


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

export async function getFcmToken() {
  const supported = await isSupported().catch(() => false);
  if (!supported) return null;

  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  const messaging = getMessaging(app);

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    return await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration
    });
  } catch (err) {
    console.error('FCM token error:', err);
    return null;
  }
}

// ... keep everything above the same, just add onMessage to the import line above ...

export async function listenForForegroundMessages() {
  const supported = await isSupported().catch(() => false);
  if (!supported) return;

  const messaging = getMessaging(app);
  onMessage(messaging, (payload) => {
    const { title, body } = payload.notification || {};
    if (Notification.permission === 'granted') {
      new Notification(title || 'Bodyworks Gym', { body: body || '' });
    }
  });
}
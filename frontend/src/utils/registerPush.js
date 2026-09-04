import api from '../api/axiosConfig';
import { getFcmToken } from '../firebase';

export async function registerPushNotifications() {
  try {
    const token = await getFcmToken();
    if (!token) return;

    const previousToken = localStorage.getItem('fcmToken');
    if (previousToken && previousToken !== token) {
      // This device's token changed since last time (cache clear, SW update,
      // etc.) — clean up the stale one so the array doesn't grow forever.
      await api.post('/auth/fcm-token/remove', { token: previousToken }).catch(() => {});
    }

    await api.post('/auth/fcm-token', { token });
    localStorage.setItem('fcmToken', token);
  } catch (err) {
    console.error('Push registration failed:', err);
  }
}
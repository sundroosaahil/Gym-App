import api from '../api/axiosConfig';
import { getFcmToken } from '../firebase';

export async function registerPushNotifications() {
  try {
    const token = await getFcmToken();
    if (!token) return;
    await api.post('/auth/fcm-token', { token });
  } catch (err) {
    console.error('Push registration failed:', err);
  }
}
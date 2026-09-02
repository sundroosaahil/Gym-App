importScripts('https://www.gstatic.com/firebasejs/10.13.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAHHxB3sgcufEYjXIrLiDPvAzPbRlayjDc",
  authDomain: "bodyworksgym.firebaseapp.com",
  projectId: "bodyworksgym",
  storageBucket: "bodyworksgym.firebasestorage.app",
  messagingSenderId: "742528578211",
  appId: "1:742528578211:web:eb0f90cdedce645f9b4516"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || 'Bodyworks Gym', {
    body: body || '',
    icon: '/images/icon-192.png'
  });
});
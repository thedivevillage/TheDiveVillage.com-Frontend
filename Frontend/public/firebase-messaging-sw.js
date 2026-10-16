/* eslint-disable no-undef */
// Firebase Cloud Messaging Service Worker for thedivevillage.com
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

// Parse configuration if provided via query params or use active .com project credentials
const params = new URL(self.location).searchParams;
const firebaseConfig = {
  apiKey: params.get('apiKey') || 'AIzaSyDVj-lZlrZP7ccmP0YdfkBhddei2pj6UMU',
  authDomain: params.get('authDomain') || 'the-dive-village-ffed3.firebaseapp.com',
  projectId: params.get('projectId') || 'the-dive-village-ffed3',
  storageBucket: params.get('storageBucket') || 'the-dive-village-ffed3.firebasestorage.app',
  messagingSenderId: params.get('messagingSenderId') || '298649884006',
  appId: params.get('appId') || '1:298649884006:web:b2f393b8b8fdebdf19a4a7',
};

if (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'placeholder' && firebaseConfig.projectId) {
  try {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
      console.log('[firebase-messaging-sw] Received background message:', payload);
      const notificationTitle = payload.notification?.title || payload.data?.title || 'The Dive Village';
      const notificationOptions = {
        body: payload.notification?.body || payload.data?.body || '',
        icon: payload.notification?.icon || payload.data?.icon || '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        data: payload.data || {},
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  } catch (err) {
    console.warn('[firebase-messaging-sw] Initialization error:', err);
  }
}

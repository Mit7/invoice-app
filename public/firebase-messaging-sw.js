/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDQAkdA4jzBY3qzfkT4xKD-TRa_4K4rnGs",
  authDomain: "invoice-management-12b56.firebaseapp.com",
  projectId: "invoice-management-12b56",
  storageBucket: "invoice-management-12b56.firebasestorage.app",
  messagingSenderId: "922119757577",
  appId: "1:922119757577:web:15cff3b8636bf8c19fbdd8",
  measurementId: "G-XPMCMPEV45"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png',
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

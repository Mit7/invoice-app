// firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDQAkdA4jzBY3qzfkT4xKD-TRa_4K4rnGs",
  authDomain: "invoice-management-12b56.firebaseapp.com",
  projectId: "invoice-management-12b56",
  storageBucket: "invoice-management-12b56.firebasestorage.app",
  messagingSenderId: "922119757577",
  appId: "1:922119757577:web:15cff3b8636bf8c19fbdd8",
  measurementId: "G-XPMCMPEV45"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Get FCM token
export const requestForToken = async () => {
  try {
    const token = await getToken(messaging, {
      vapidKey: "BMbHYkFe5ChqzaPhQTt7OB8EP6S9bNXGz4vxSHMdS9SKasF3kASYGGdKJ_FVt59pf-TaGdltBx_0N7RvY-uYOeE",
    });
    if (token) {
      console.log("FCM Token:", token);
      // Send this token to your Laravel backend
    }
  } catch (err) {
    console.log("An error occurred while retrieving token. ", err);
  }
};

// Listen for foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

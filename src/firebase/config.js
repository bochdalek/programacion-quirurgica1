// src/firebase/config.js
export const firebaseConfig = {
    apiKey: process.env.VUE_APP_API_KEY || "AIzaSyD43OZRnqSJ_7K_l6g0W-aaow5-QnNPG1k",
    authDomain: process.env.VUE_APP_AUTH_DOMAIN || "programacion-quirurgica-73603.firebaseapp.com",
    projectId: process.env.VUE_APP_PROJECT_ID || "programacion-quirurgica-73603",
    storageBucket: process.env.VUE_APP_STORAGE_BUCKET || "programacion-quirurgica-73603.appspot.com",
    messagingSenderId: process.env.VUE_APP_MESSAGING_SENDER_ID || "1075570634482",
    appId: process.env.VUE_APP_APP_ID || "1:1075570634482:web:3f070dd86dc7b6e921ea6b"
};
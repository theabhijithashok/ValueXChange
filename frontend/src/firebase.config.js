import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Use long polling to avoid "offline" errors in restricted networks
export const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
});

// Persistence can cause "offline" errors during development if multiple tabs are open or config changes.
// Disabling it temporarily to ensure stable connection.
// import { enableIndexedDbPersistence } from "firebase/firestore";
// enableIndexedDbPersistence(db).catch((err) => {
//     if (err.code == 'failed-precondition') {
//         console.warn("Multiple tabs open, persistence can only be enabled in one tab at a a time.");
//     } else if (err.code == 'unimplemented') {
//         console.warn("The current browser does not support all of the features required to enable persistence");
//     }
// });

export default app;

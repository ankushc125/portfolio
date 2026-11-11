// firebase-config.js - Shared Firebase Configuration
// Replace the config values below with your actual project credentials from the Firebase Console.

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com", // e.g. https://ankush-portfolio-default-rtdb.firebaseio.com
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const isFirebaseConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY";

// Initialize Firebase only when real project credentials are configured
if (isFirebaseConfigured && typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = (isFirebaseConfigured && typeof firebase !== 'undefined' && firebase.apps.length)
    ? firebase.database()
    : null;

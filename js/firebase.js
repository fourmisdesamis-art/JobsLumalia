// ============================================================
// FIREBASE - CONFIGURATION LUMALIA JOBS
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";


// ============================================================
// CONFIGURATION FIREBASE
// ============================================================

const firebaseConfig = {
    apiKey: "AIzaSyBSCqSsBTXk9Q8sBX88NgrdDHUAHT0Cq6I",
    authDomain: "lumalia.firebaseapp.com",
    projectId: "lumalia",
    storageBucket: "lumalia.firebasestorage.app",
    messagingSenderId: "189011821397",
    appId: "1:189011821397:web:03c8609d35d488dce2a5dc",
    measurementId: "G-4G4KMZCWFH"
};


// ============================================================
// INITIALISATION
// ============================================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


// ============================================================
// EXPORTS
// ============================================================

export {
    app,
    auth,
    db
};

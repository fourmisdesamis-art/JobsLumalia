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
//
// Va dans :
// Firebase Console
// → Paramètres du projet
// → Général
// → Tes applications
// → Configuration du SDK Firebase
//
// Puis remplace les valeurs ci-dessous par les tiennes.
// ============================================================

const firebaseConfig = {
    apiKey: "TON_API_KEY",
    authDomain: "TON_PROJET.firebaseapp.com",
    projectId: "TON_PROJECT_ID",
    storageBucket: "TON_PROJET.firebasestorage.app",
    messagingSenderId: "TON_MESSAGING_SENDER_ID",
    appId: "TON_APP_ID"
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

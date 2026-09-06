// ============================================================
// LUMALIA JOBS - AUTHENTIFICATION FIREBASE
// ============================================================

import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    signOut
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase.js";


// ============================================================
// SESSION
// ============================================================

let currentSession = null;

let authReadyResolve;

window.firebaseReady = new Promise(resolve => {
    authReadyResolve = resolve;
});


// ============================================================
// RÉCUPÉRER LA SESSION ACTUELLE
// ============================================================

function getSession() {
    return currentSession;
}

window.getSession = getSession;


// ============================================================
// MISE À JOUR NAVBAR
// ============================================================

function refreshNavbar() {
    if (window.updateNavbar) {
        window.updateNavbar(currentSession);
    }
}


// ============================================================
// CHARGEMENT DE LA SESSION FIREBASE
// ============================================================

onAuthStateChanged(auth, async user => {

    if (!user) {

        currentSession = null;

        refreshNavbar();

        authReadyResolve(null);

        return;
    }


    try {

        const userRef = doc(db, "users", user.uid);

        const userSnap = await getDoc(userRef);


        if (userSnap.exists()) {

            const data = userSnap.data();

            currentSession = {
                id: user.uid,
                uid: user.uid,
                username: data.username || user.displayName || "Utilisateur",
                email: user.email || data.email || "",
                role: data.role || "player",
                grade: data.grade || "Joueur",
                avatar: data.avatar || "",
                bio: data.bio || "",
                emailVerified: user.emailVerified
            };

        } else {

            currentSession = {
                id: user.uid,
                uid: user.uid,
                username: user.displayName || "Utilisateur",
                email: user.email || "",
                role: "player",
                grade: "Joueur",
                avatar: "",
                bio: "",
                emailVerified: user.emailVerified
            };
        }


    } catch (error) {

        console.error(
            "Erreur lors du chargement du profil Firebase :",
            error
        );

        currentSession = {
            id: user.uid,
            uid: user.uid,
            username: user.displayName || "Utilisateur",
            email: user.email || "",
            role: "player",
            grade: "Joueur",
            avatar: "",
            bio: "",
            emailVerified: user.emailVerified
        };
    }


    refreshNavbar();

    authReadyResolve(currentSession);
});


// ============================================================
// CONNEXION
// ============================================================

async function login(email, password) {

    try {

        const credential = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        return {
            success: true,
            user: credential.user
        };

    } catch (error) {

        console.error("Erreur connexion Firebase :", error);

        let message = "Impossible de se connecter.";

        switch (error.code) {

            case "auth/invalid-credential":
            case "auth/wrong-password":
            case "auth/user-not-found":
                message = "E-mail ou mot de passe incorrect.";
                break;

            case "auth/invalid-email":
                message = "L'adresse e-mail est invalide.";
                break;

            case "auth/user-disabled":
                message = "Ce compte a été désactivé.";
                break;

            case "auth/too-many-requests":
                message = "Trop de tentatives. Réessayez plus tard.";
                break;
        }

        return {
            success: false,
            message
        };
    }
}


// ============================================================
// INSCRIPTION
// ============================================================

async function register(username, email, password) {

    try {

        // Création du compte Firebase Authentication
        const credential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        const user = credential.user;


        // Nom d'affichage Firebase
        await updateProfile(user, {
            displayName: username
        });


        // Création du profil Firestore
        await setDoc(
            doc(db, "users", user.uid),
            {
                uid: user.uid,
                username: username,
                email: email,

                avatar: "",
                bio: "",

                grade: "Joueur",
                role: "player",

                emailVerified: user.emailVerified,

                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            }
        );


        return {
            success: true,
            user
        };


    } catch (error) {

        console.error("Erreur inscription Firebase :", error);

        let message = "Impossible de créer le compte.";

        switch (error.code) {

            case "auth/email-already-in-use":
                message = "Un compte utilise déjà cette adresse e-mail.";
                break;

            case "auth/invalid-email":
                message = "L'adresse e-mail est invalide.";
                break;

            case "auth/weak-password":
                message = "Le mot de passe est trop faible.";
                break;

            case "auth/operation-not-allowed":
                message = "L'inscription par e-mail n'est pas activée dans Firebase.";
                break;
        }

        return {
            success: false,
            message
        };
    }
}


// ============================================================
// DÉCONNEXION
// ============================================================

async function logout() {

    try {

        await signOut(auth);

        location.href = "index.html";

    } catch (error) {

        console.error(
            "Erreur lors de la déconnexion :",
            error
        );
    }
}

window.logout = logout;


// ============================================================
// FORMULAIRE CONNEXION
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {

        loginForm.addEventListener("submit", async event => {

            event.preventDefault();


            const emailInput =
                document.getElementById("loginEmail");

            const passwordInput =
                document.getElementById("loginPassword");

            const rememberInput =
                document.getElementById("rememberMe");

            const message =
                document.getElementById("authMessage");


            const email =
                emailInput.value.trim().toLowerCase();

            const password =
                passwordInput.value;


            message.textContent = "Connexion en cours…";
            message.className = "form-message";


            /*
             * Firebase gère lui-même la persistance de connexion.
             *
             * Le checkbox "Rester connecté" est conservé visuellement
             * pour ne pas modifier ton interface.
             */


            const result =
                await login(email, password);


            if (!result.success) {

                message.textContent = result.message;
                message.className = "form-message error";

                return;
            }


            message.textContent =
                "Connexion réussie…";

            message.className =
                "form-message success";


            setTimeout(() => {

                const params =
                    new URLSearchParams(location.search);

                const redirect =
                    params.get("redirect");


                if (redirect === "candidature") {

                    history.back();

                } else {

                    location.href = "recrutements.html";
                }

            }, 500);
        });
    }


    // ========================================================
    // FORMULAIRE INSCRIPTION
    // ========================================================

    const registerForm =
        document.getElementById("registerForm");


    if (registerForm) {

        registerForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                const username =
                    document
                        .getElementById("registerUsername")
                        .value
                        .trim();

                const email =
                    document
                        .getElementById("registerEmail")
                        .value
                        .trim()
                        .toLowerCase();

                const password =
                    document
                        .getElementById("registerPassword")
                        .value;

                const password2 =
                    document
                        .getElementById("registerPassword2")
                        .value;

                const message =
                    document.getElementById("authMessage");


                // Vérification pseudo
                if (
                    username.length < 3 ||
                    username.length > 16
                ) {

                    message.textContent =
                        "Le pseudo doit contenir entre 3 et 16 caractères.";

                    message.className =
                        "form-message error";

                    return;
                }


                // Vérification mot de passe
                if (password !== password2) {

                    message.textContent =
                        "Les mots de passe ne correspondent pas.";

                    message.className =
                        "form-message error";

                    return;
                }


                message.textContent =
                    "Création du compte…";

                message.className =
                    "form-message";


                const result =
                    await register(
                        username,
                        email,
                        password
                    );


                if (!result.success) {

                    message.textContent =
                        result.message;

                    message.className =
                        "form-message error";

                    return;
                }


                message.textContent =
                    "Compte créé !";

                message.className =
                    "form-message success";


                setTimeout(() => {

                    location.href =
                        "recrutements.html";

                }, 600);
            }
        );
    }
});

// ============================================================
// LUMALIA JOBS - PROFIL
// ============================================================

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase.js";


// ============================================================
// INITIALISATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await window.firebaseReady;


        const user =
            auth.currentUser;


        if (!user) {

            location.href =
                "connexion.html";

            return;
        }


        try {

            const userRef =
                doc(
                    db,
                    "users",
                    user.uid
                );


            const userSnap =
                await getDoc(userRef);


            const profile =
                userSnap.exists()
                    ? userSnap.data()
                    : {};


            const username =
                profile.username ||
                user.displayName ||
                "Utilisateur";


            const email =
                user.email ||
                profile.email ||
                "";


            const role =
                profile.role ||
                "player";


            const grade =
                profile.grade ||
                "Joueur";


            const avatar =
                profile.avatar ||
                "";


            // ==================================================
            // NOM
            // ==================================================

            const profileName =
                document.getElementById(
                    "profileName"
                );


            if (profileName) {

                profileName.textContent =
                    username;
            }


            // ==================================================
            // EMAIL
            // ==================================================

            const profileEmail =
                document.getElementById(
                    "profileEmail"
                );


            if (profileEmail) {

                profileEmail.textContent =
                    email;
            }


            // ==================================================
            // AVATAR
            // ==================================================

            const profileAvatar =
                document.getElementById(
                    "profileAvatar"
                );


            if (profileAvatar) {

                if (avatar) {

                    profileAvatar.innerHTML =
                        `
                            <img
                                src="${avatar}"
                                alt="Avatar"
                            >
                        `;

                } else {

                    profileAvatar.textContent =
                        username[0]
                            ? username[0]
                                .toUpperCase()
                            : "?";
                }
            }


            // ==================================================
            // GRADE / RÔLE
            // ==================================================

            const profileRole =
                document.getElementById(
                    "profileRole"
                );


            if (profileRole) {

                if (
                    role === "administrateur" ||
                    grade === "Administrateur"
                ) {

                    profileRole.textContent =
                        "Administrateur";

                } else if (
                    role === "super-moderateur" ||
                    grade === "Super-modérateur"
                ) {

                    profileRole.textContent =
                        "Super-modérateur";

                } else {

                    profileRole.textContent =
                        grade;
                }
            }


            // ==================================================
            // BOUTON DÉCONNEXION
            // ==================================================

            const logoutButton =
                document.getElementById(
                    "logoutButton"
                );


            if (logoutButton) {

                logoutButton.onclick =
                    window.logout;
            }


        } catch (error) {

            console.error(
                "Erreur chargement profil :",
                error
            );
        }
    }
);

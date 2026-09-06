// ============================================================
// LUMALIA JOBS - CANDIDATURES
// ============================================================

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase.js";


// ============================================================
// FORMULAIRES
// ============================================================

const FORMS = {

    "Guide": [
        ["Présentation", "textarea", "Présentez-vous et expliquez votre parcours."],
        ["Pourquoi Guide ?", "textarea", "Pourquoi souhaitez-vous devenir Guide sur Lumalia ?"],
        ["Connaissance de Lumalia", "textarea", "Que connaissez-vous de Lumalia et de Crystal ?"],
        ["Disponibilités", "text", "Ex. mercredi après-midi, week-end…"]
    ],

    "Modérateur": [
        ["Présentation", "textarea", "Présentez-vous et votre expérience en modération."],
        ["Gestion d’un conflit", "textarea", "Comment réagiriez-vous face à un conflit entre deux joueurs ?"],
        ["Sanctions", "textarea", "Comment détermineriez-vous une sanction adaptée ?"],
        ["Disponibilités", "text", "Indiquez vos disponibilités."]
    ],

    "Builder": [
        ["Présentation", "textarea", "Présentez votre expérience en construction."],
        ["Style et spécialités", "textarea", "Quels styles maîtrisez-vous ? Quels sont vos points forts ?"],
        ["Portfolio", "text", "Lien vers vos constructions / portfolio."],
        ["Disponibilités", "text", "Indiquez vos disponibilités."]
    ],

    "Voix Off": [
        ["Présentation", "textarea", "Présentez votre expérience en voix off."],
        ["Matériel", "textarea", "Quel matériel utilisez-vous ?"],
        ["Portfolio audio", "text", "Lien vers des exemples audio."],
        ["Motivation", "textarea", "Pourquoi rejoindre la COM Lumalia Crystal ?"]
    ],

    "Monteur": [
        ["Présentation", "textarea", "Présentez votre expérience en montage vidéo."],
        ["Logiciels", "text", "Premiere Pro, DaVinci Resolve, After Effects…"],
        ["Portfolio", "text", "Lien vers votre portfolio."],
        ["Motivation", "textarea", "Pourquoi rejoindre la COM Lumalia Crystal ?"]
    ],

    "Développeur Java": [
        ["Présentation", "textarea", "Présentez votre expérience en développement Java."],
        ["Compétences", "textarea", "Java, Paper, Spigot, Fabric, Forge, APIs, bases de données…"],
        ["Projets / GitHub", "text", "Lien GitHub ou portfolio."],
        ["Expérience Minecraft", "textarea", "Décrivez vos projets Minecraft et plugins/mods."],
        ["Motivation", "textarea", "Pourquoi développer pour Lumalia ?"]
    ],

    "Développeur Bedrock": [
        ["Présentation", "textarea", "Présentez votre expérience en développement Bedrock."],
        ["Technologies", "textarea", "Décrivez les langages, APIs, moteurs ou outils que vous maîtrisez."],
        ["Projets / GitHub", "text", "Lien GitHub ou portfolio."],
        ["Expérience Bedrock", "textarea", "Décrivez vos projets Bedrock."],
        ["Motivation", "textarea", "Pourquoi Lumalia Bedrock ?"]
    ],

    "Graphiste / UI Designer": [
        ["Présentation", "textarea", "Présentez votre expérience en graphisme / UI."],
        ["Logiciels", "text", "Photoshop, Illustrator, Figma, Blender…"],
        ["Portfolio", "text", "Lien vers votre portfolio."],
        ["Expérience UI/UX", "textarea", "Décrivez votre expérience en interface et expérience utilisateur."],
        ["Motivation", "textarea", "Pourquoi Lumalia ?"]
    ]
};


// ============================================================
// ÉCHAPPEMENT HTML
// ============================================================

function esc(value) {

    return String(value).replace(
        /[&<>"']/g,
        char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[char])
    );
}


// ============================================================
// INITIALISATION
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {

    await window.firebaseReady;


    const user = auth.currentUser;


    if (!user) {

        location.href =
            "connexion.html?redirect=candidature";

        return;
    }


    const params =
        new URLSearchParams(location.search);


    const server =
        params.get("server") || "";

    const job =
        params.get("job") || "";


    const appServer =
        document.getElementById("appServer");

    const appTitle =
        document.getElementById("appTitle");

    const appIntro =
        document.getElementById("appIntro");


    if (appServer) {

        appServer.textContent =
            server || "CANDIDATURE";
    }


    if (appTitle) {

        appTitle.textContent =
            "Candidature — " + job;
    }


    if (appIntro) {

        appIntro.textContent =
            "Prenez le temps de répondre avec précision. Les réponses sont transmises à l’équipe de recrutement.";
    }


    const fields =
        FORMS[job] || [
            [
                "Présentation",
                "textarea",
                "Présentez-vous."
            ],
            [
                "Motivation",
                "textarea",
                "Pourquoi souhaitez-vous rejoindre Lumalia ?"
            ]
        ];


    const dynamicFields =
        document.getElementById("dynamicFields");


    dynamicFields.innerHTML =
        '<div class="field-grid">' +

        fields.map((field, index) => {

            return `
                <label class="${field[1] === "textarea" ? "field-full" : ""}">
                    ${esc(field[0])}
                    <span class="required">*</span>

                    ${
                        field[1] === "textarea"

                        ? `
                            <textarea
                                name="q${index}"
                                placeholder="${esc(field[2])}"
                                required
                            ></textarea>
                        `

                        : `
                            <input
                                name="q${index}"
                                placeholder="${esc(field[2])}"
                                required
                            >
                        `
                    }
                </label>
            `;

        }).join("") +

        "</div>";


    // ========================================================
    // ENVOI CANDIDATURE
    // ========================================================

    const applicationForm =
        document.getElementById("applicationForm");


    applicationForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const submitButton =
                applicationForm.querySelector(
                    'button[type="submit"]'
                );

            const message =
                document.getElementById(
                    "submitMessage"
                );


            if (!auth.currentUser) {

                message.textContent =
                    "Votre session a expiré. Veuillez vous reconnecter.";

                message.className =
                    "form-message error";

                return;
            }


            submitButton.disabled = true;

            submitButton.textContent =
                "Envoi…";


            try {

                // Récupération du profil Firestore
                const userRef =
                    doc(
                        db,
                        "users",
                        auth.currentUser.uid
                    );


                const userSnap =
                    await getDoc(userRef);


                const profile =
                    userSnap.exists()
                        ? userSnap.data()
                        : {};


                // Construction des réponses
                const formData =
                    new FormData(applicationForm);

                const answers = {};


                fields.forEach((field, index) => {

                    answers[field[0]] =
                        String(
                            formData.get(
                                "q" + index
                            ) || ""
                        ).trim();
                });


                // Création de la candidature
                await addDoc(
                    collection(db, "applications"),
                    {
                        userId: auth.currentUser.uid,

                        username:
                            profile.username ||
                            auth.currentUser.displayName ||
                            "Utilisateur",

                        email:
                            auth.currentUser.email ||
                            "",

                        grade:
                            profile.grade ||
                            "Joueur",

                        server,
                        job,
                        answers,

                        status: "pending",

                        createdAt:
                            serverTimestamp()
                    }
                );


                message.textContent =
                    "✓ Candidature envoyée ! Elle est maintenant en attente de traitement.";

                message.className =
                    "form-message success";


                applicationForm
                    .querySelectorAll(
                        "input, textarea"
                    )
                    .forEach(input => {
                        input.disabled = true;
                    });


                submitButton.textContent =
                    "Candidature envoyée";


            } catch (error) {

                console.error(
                    "Erreur envoi candidature :",
                    error
                );


                message.textContent =
                    "Une erreur est survenue lors de l’envoi de votre candidature.";

                message.className =
                    "form-message error";


                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "Envoyer ma candidature";
            }
        }
    );
});

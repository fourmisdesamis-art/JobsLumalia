// ============================================================
// LUMALIA JOBS - DASHBOARD RECRUTEMENT
// ============================================================

import {
    collection,
    query,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

import {
    db
} from "./firebase.js";


// ============================================================
// FILTRE
// ============================================================

let currentFilter = "all";

let allApplications = [];


// ============================================================
// UTILITAIRES
// ============================================================

function escapeHTML(value) {

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


function formatDate(timestamp) {

    if (!timestamp) {
        return "Date inconnue";
    }


    const date =
        timestamp.toDate
            ? timestamp.toDate()
            : new Date(timestamp);


    return date.toLocaleString(
        "fr-FR"
    );
}


// ============================================================
// RENDU
// ============================================================

function renderDashboard() {

    const list =
        document.getElementById(
            "applicationsList"
        );


    if (!list) {
        return;
    }


    const apps =
        allApplications.filter(
            application =>
                currentFilter === "all" ||
                application.status === currentFilter
        );


    // Statistiques
    document.getElementById(
        "statTotal"
    ).textContent =
        allApplications.length;


    document.getElementById(
        "statPending"
    ).textContent =
        allApplications.filter(
            a => a.status === "pending"
        ).length;


    document.getElementById(
        "statAccepted"
    ).textContent =
        allApplications.filter(
            a => a.status === "accepted"
        ).length;


    document.getElementById(
        "statRejected"
    ).textContent =
        allApplications.filter(
            a => a.status === "rejected"
        ).length;


    if (!apps.length) {

        list.innerHTML =
            '<div class="empty">Aucune candidature dans cette catégorie.</div>';

        return;
    }


    list.innerHTML =
        apps.map(application => {

            const status =
                application.status;


            const statusText =
                status === "pending"
                    ? "EN ATTENTE"
                    : status === "accepted"
                        ? "ACCEPTÉE"
                        : "REFUSÉE";


            const answers =
                application.answers || {};


            return `
                <article
                    class="application-card"
                    data-id="${escapeHTML(application.id)}"
                >

                    <div class="top">

                        <div>

                            <h3>
                                ${escapeHTML(application.username || "Utilisateur")}
                                —
                                ${escapeHTML(application.job || "Candidature")}
                            </h3>

                            <p>
                                ${escapeHTML(application.server || "Serveur inconnu")}
                                •
                                ${formatDate(application.createdAt)}
                            </p>

                        </div>

                        <span class="status ${escapeHTML(status)}">
                            ${statusText}
                        </span>

                    </div>


                    <div class="detail hidden">

                        ${Object.entries(answers)
                            .map(([question, answer]) => {

                                return `
                                    <div class="answer">

                                        <b>
                                            ${escapeHTML(question)}
                                        </b>

                                        <p>
                                            ${escapeHTML(answer)}
                                        </p>

                                    </div>
                                `;

                            })
                            .join("")}


                        ${
                            status === "pending"

                            ? `
                                <div class="actions">

                                    <button
                                        class="accept"
                                        data-action="accepted"
                                    >
                                        ✓ Accepter
                                    </button>

                                    <button
                                        class="reject"
                                        data-action="rejected"
                                    >
                                        ✕ Refuser
                                    </button>

                                </div>
                            `

                            : ""
                        }

                    </div>

                </article>
            `;

        }).join("");


    // ========================================================
    // OUVERTURE DES CANDIDATURES
    // ========================================================

    list
        .querySelectorAll(
            ".application-card"
        )
        .forEach(card => {

            card.addEventListener(
                "click",
                event => {

                    if (
                        event.target.dataset.action
                    ) {
                        return;
                    }


                    const detail =
                        card.querySelector(
                            ".detail"
                        );


                    detail.classList.toggle(
                        "hidden"
                    );
                }
            );
        });


    // ========================================================
    // BOUTONS ACCEPTATION / REFUS
    // ========================================================

    list
        .querySelectorAll(
            "[data-action]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.stopPropagation();


                    const card =
                        button.closest(
                            ".application-card"
                        );


                    const id =
                        card.dataset.id;


                    const status =
                        button.dataset.action;


                    updateStatus(
                        id,
                        status
                    );
                }
            );
        });
}


// ============================================================
// MODIFICATION DU STATUT
// ============================================================

async function updateStatus(
    id,
    status
) {

    try {

        const application =
            allApplications.find(
                item => item.id === id
            );


        if (!application) {
            return;
        }


        // Mise à jour Firestore
        await updateDoc(
            doc(
                db,
                "applications",
                id
            ),
            {
                status
            }
        );


        // Notification utilisateur
        await addDoc(
            collection(
                db,
                "notifications"
            ),
            {
                userId:
                    application.userId,

                title:
                    status === "accepted"
                        ? "Candidature acceptée"
                        : "Candidature refusée",

                message:
                    `Votre candidature « ${application.job} — ${application.server} » a été ${
                        status === "accepted"
                            ? "acceptée"
                            : "refusée"
                    } par l’équipe de recrutement Lumalia.`,

                createdAt:
                    serverTimestamp()
            }
        );


    } catch (error) {

        console.error(
            "Erreur modification candidature :",
            error
        );


        alert(
            "Impossible de modifier cette candidature."
        );
    }
}


// ============================================================
// INITIALISATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await window.firebaseReady;


        const session =
            window.getSession();


        // ====================================================
        // VÉRIFICATION STAFF
        // ====================================================

        const allowed =
            session &&
            (
                session.role === "administrateur" ||
                session.role === "super-moderateur" ||
                session.grade === "Administrateur" ||
                session.grade === "Super-modérateur"
            );


        if (!allowed) {

            const message =
                document.getElementById(
                    "accessMessage"
                );


            if (message) {

                message.classList.remove(
                    "hidden"
                );


                message.innerHTML =
                    `
                        <strong>Accès refusé</strong>
                        <p>
                            Le dashboard est réservé aux administrateurs et super-modérateurs.
                        </p>
                    `;
            }


            return;
        }


        // ====================================================
        // AFFICHAGE DASHBOARD
        // ====================================================

        const content =
            document.getElementById(
                "dashboardContent"
            );


        if (content) {

            content.classList.remove(
                "hidden"
            );
        }


        // ====================================================
        // FILTRES
        // ====================================================

        document
            .querySelectorAll(
                ".filter"
            )
            .forEach(button => {

                button.onclick = () => {

                    document
                        .querySelectorAll(
                            ".filter"
                        )
                        .forEach(
                            item =>
                                item.classList.remove(
                                    "active"
                                )
                        );


                    button.classList.add(
                        "active"
                    );


                    currentFilter =
                        button.dataset.filter;


                    renderDashboard();
                };
            });


        // ====================================================
        // FIRESTORE EN TEMPS RÉEL
        // ====================================================

        const applicationsQuery =
            query(
                collection(
                    db,
                    "applications"
                ),
                orderBy(
                    "createdAt",
                    "desc"
                )
            );


        onSnapshot(
            applicationsQuery,
            snapshot => {

                allApplications =
                    snapshot.docs.map(
                        document => ({
                            id: document.id,
                            ...document.data()
                        })
                    );


                renderDashboard();

            },
            error => {

                console.error(
                    "Erreur chargement candidatures :",
                    error
                );


                const list =
                    document.getElementById(
                        "applicationsList"
                    );


                if (list) {

                    list.innerHTML =
                        `
                            <div class="empty">
                                Impossible de charger les candidatures.
                            </div>
                        `;
                }
            }
        );
    }
);

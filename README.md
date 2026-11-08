# AllVote — Front-end (React + Vite)

Plateforme de vote en ligne multi-événements / multi-organisateurs, branchée sur l'API **AllVote (Spring Boot)**.
Design : noir · or · touche de bleu. Logo AllVote dans `src/assets/brand/`.

## Démarrer
1. Lancer d'abord le backend `allvote-backend` (`docker compose up -d` puis `./mvnw spring-boot:run`, port 8081).
2. Puis le front :

```bash
npm install
cp .env.example .env     # VITE_API_URL=http://localhost:8081/api
npm run dev              # http://localhost:5173
```

> Le port 5173 est l'origine autorisée par défaut côté backend (`ALLVOTE_CORS_ORIGINS`).

## Pages (étape 5a)
| URL | Contenu |
|---|---|
| `/` | Accueil : recherche d'événements, comment voter, « organiser un vote », contact |
| `/e/:slug` | Événement et ses concours (compte à rebours) |
| `/o/:slug` | Page publique d'un organisateur |
| `/concours/:id` | Vote : catégories, candidats, scores en direct (ou masqués) |
| `/concours/:id/candidat/:idCandidat` | Page candidat — `?vote=1` ouvre directement la fenêtre de vote |
| `/inscription` | Inscription d'une organisation (en attente de validation) |
| `/connexion` | Connexion (organisateurs et super-admin) |
| `/espace/…` | Back-office : espace organisateur (5b) ou super-admin (5c) selon le compte connecté |
| `/cgu`, `/confidentialite` | Pages légales |

## Espace organisateur (étape 5b)
| URL | Contenu | Permission |
|---|---|---|
| `/espace` | Tableau de bord (statut, chiffres, derniers événements) | — |
| `/espace/evenements` | Mes événements | EVENEMENT_GERER |
| `/espace/evenements/nouveau` · `/:id` | Créer / modifier, publier (organisation validée), concours | EVENEMENT_GERER (+ EVENEMENT_PUBLIER) |
| `/espace/concours/:id` | Éditeur : infos, statut forcé, catégories, candidats (photo, lien de vote) | EVENEMENT_GERER / CANDIDAT_GERER |
| `/espace/transactions` | Paiements (numéro masqué) | TRANSACTION_VOIR |
| `/espace/finances` | Encaissé, commission, reversements | FINANCE_VOIR |
| `/espace/membres` | Équipe (mot de passe provisoire) | MEMBRE_GERER |
| `/espace/profil` | Organisation, numéro de reversement, mon mot de passe | PROFIL_GERER pour l'organisation |

Le menu n'affiche que ce que le compte a le droit de faire ; le serveur revérifie chaque action.
Les dates sont saisies à l'heure locale du navigateur et envoyées en UTC à l'API.

## Espace super-admin (étape 5c)
Même back-office `/espace`, menu propre au rôle SUPER_ADMIN.
| URL | Contenu |
|---|---|
| `/espace` | Tableau de bord plateforme (alertes : organisations en attente, paiements à vérifier) |
| `/espace/organisateurs` · `/:id` | Liste filtrable, fiche, valider / refuser / suspendre (motif) / réactiver, commission propre |
| `/espace/moderation` | Tous les événements : retirer du public, archiver |
| `/espace/paiements` | Toutes les transactions ; détail, interroger le prestataire, confirmer / rejeter (motif, tracé) |
| `/espace/reversements` | Soldes → créer le reversement → marquer payé (référence) ; historique |
| `/espace/utilisateurs` | Recherche, activer / désactiver, déverrouiller |
| `/espace/parametres` | Commission par défaut, mon mot de passe |

Chaque page vérifie le rôle (`Reserve`) ; le serveur revérifie toujours.

## Vote
1. Formulaire → `POST /api/public/votes` (le prix est recalculé par le serveur).
2. « Validez sur votre téléphone » : le front interroge `GET /api/public/votes/{reference}` toutes les 3 s.
3. Confirmé → voix ajoutées et scores rafraîchis. Échoué / expiré → « Réessayer ».

## Structure
```
src/
 ├─ api/          client.js (fetch + erreurs), endpoints.js (publicApi, authApi), useApi.js
 ├─ assets/brand  logo AllVote (fond transparent)
 ├─ components/   Navbar, Footer, EvenementCard, ConcoursCard, CandidateCard, VoteModal, Countdown, …
 ├─ context/      AuthContext (session JWT en sessionStorage), UiContext (thème, langue, cookies), Toast
 ├─ pages/        Home, EvenementPage, OrganisateurPage, ConcoursDetail, CandidatPage, Inscription, Connexion, …
 ├─ pages/espace/ espace connecté
 └─ config.js     URL du site, contact (lus dans .env)
```

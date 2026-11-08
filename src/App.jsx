import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import PublicLayout from './components/PublicLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import EvenementPage from './pages/EvenementPage'
import OrganisateurPage from './pages/OrganisateurPage'
import ConcoursDetail from './pages/ConcoursDetail'
import CandidatPage from './pages/CandidatPage'
import Inscription from './pages/Inscription'
import Connexion from './pages/Connexion'
import Confidentialite from './pages/Confidentialite'
import Cgu from './pages/Cgu'
import NotFound from './pages/NotFound'
import { Chargement } from './components/Etat'

// Espace connecté : chargé à la demande (le public ne télécharge pas ce code)
const EspaceRacine = lazy(() => import('./pages/espace/EspaceRacine'))
const Evenements = lazy(() => import('./pages/espace/Evenements'))
const EvenementEdition = lazy(() => import('./pages/espace/EvenementEdition'))
const ConcoursEditeur = lazy(() => import('./pages/espace/ConcoursEditeur'))
const Transactions = lazy(() => import('./pages/espace/Transactions'))
const Finances = lazy(() => import('./pages/espace/Finances'))
const Membres = lazy(() => import('./pages/espace/Membres'))
const Profil = lazy(() => import('./pages/espace/Profil'))
const Reserve = lazy(() => import('./components/espace/Reserve'))
const Accueil = lazy(() => import('./pages/espace/Accueil'))
const Organisateurs = lazy(() => import('./pages/espace/admin/Organisateurs'))
const OrganisateurFiche = lazy(() => import('./pages/espace/admin/OrganisateurFiche'))
const Moderation = lazy(() => import('./pages/espace/admin/Moderation'))
const Paiements = lazy(() => import('./pages/espace/admin/Paiements'))
const Reversements = lazy(() => import('./pages/espace/admin/Reversements'))
const Utilisateurs = lazy(() => import('./pages/espace/admin/Utilisateurs'))
const Parametres = lazy(() => import('./pages/espace/admin/Parametres'))

export default function App() {
  return (
    <Suspense fallback={<Chargement />}>
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="/e/:slug" element={<EvenementPage />} />
        <Route path="/o/:slug" element={<OrganisateurPage />} />
        <Route path="/concours/:id" element={<ConcoursDetail />} />
        <Route path="/concours/:id/candidat/:candId" element={<CandidatPage />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/confidentialite" element={<Confidentialite />} />
        <Route path="/cgu" element={<Cgu />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Back-office unique : organisateurs et super-admin (le menu et chaque page vérifient le rôle) */}
      <Route path="/espace" element={<ProtectedRoute><EspaceRacine /></ProtectedRoute>}>
        <Route index element={<Accueil />} />
        {/* organisateur */}
        <Route path="evenements" element={<Reserve><Evenements /></Reserve>} />
        <Route path="evenements/:id" element={<Reserve><EvenementEdition /></Reserve>} />
        <Route path="concours/:id" element={<Reserve><ConcoursEditeur /></Reserve>} />
        <Route path="transactions" element={<Reserve><Transactions /></Reserve>} />
        <Route path="finances" element={<Reserve><Finances /></Reserve>} />
        <Route path="membres" element={<Reserve><Membres /></Reserve>} />
        <Route path="profil" element={<Reserve><Profil /></Reserve>} />
        {/* super-admin */}
        <Route path="organisateurs" element={<Reserve admin><Organisateurs /></Reserve>} />
        <Route path="organisateurs/:id" element={<Reserve admin><OrganisateurFiche /></Reserve>} />
        <Route path="moderation" element={<Reserve admin><Moderation /></Reserve>} />
        <Route path="paiements" element={<Reserve admin><Paiements /></Reserve>} />
        <Route path="reversements" element={<Reserve admin><Reversements /></Reserve>} />
        <Route path="utilisateurs" element={<Reserve admin><Utilisateurs /></Reserve>} />
        <Route path="parametres" element={<Reserve admin><Parametres /></Reserve>} />
        <Route path="*" element={<Accueil />} />
      </Route>
    </Routes>
    </Suspense>
  )
}

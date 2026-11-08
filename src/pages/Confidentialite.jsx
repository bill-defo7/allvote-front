import Seo from '../components/Seo'
import { CONTACT } from '../config'

export default function Confidentialite() {
  return (
    <section>
      <Seo path="/confidentialite" title="Politique de confidentialité" description="Comment AllVote collecte, utilise et protège vos données personnelles." />
      <div className="container legal">
        <h1 className="gold-text">Politique de confidentialité</h1>
        <p>Dernière mise à jour : 6 novembre 2026</p>

        <h2>1. Données collectées</h2>
        <ul>
          <li><b>Votants</b> : numéro Mobile Money et opérateur, nombre de voix, montant, date — uniquement pour traiter
            le paiement. Aucun compte n'est créé.</li>
          <li><b>Organisateurs</b> : nom de l'organisation, nom, prénom, email et téléphone du responsable et des membres,
            numéro de reversement. Les mots de passe sont stockés sous forme chiffrée (hachage), jamais en clair.</li>
          <li><b>Mesure d'audience</b> (Google Analytics) : uniquement si vous l'acceptez dans le bandeau cookies.</li>
        </ul>

        <h2>2. Finalités</h2>
        <p>Traiter les votes et les paiements, prévenir la fraude, reverser leur part aux organisateurs, assurer le
          support et, avec votre accord, mesurer l'audience pour améliorer la plateforme.</p>

        <h2>3. Destinataires</h2>
        <p>Le prestataire de paiement (Aangaraa Pay) et les opérateurs MTN / Orange pour exécuter le paiement.
          L'organisateur voit les paiements de ses concours avec un numéro de téléphone masqué. Aucune donnée n'est vendue.</p>

        <h2>4. Durée de conservation</h2>
        <p>Les données de paiement sont conservées le temps nécessaire aux obligations comptables et au traitement des
          réclamations. Les comptes organisateurs sont conservés tant qu'ils sont actifs.</p>

        <h2>5. Sécurité</h2>
        <p>Échanges chiffrés (HTTPS), accès à l'espace organisateur protégé par mot de passe et verrouillage après
          plusieurs essais, cloisonnement strict des données entre organisateurs.</p>

        <h2>6. Cookies</h2>
        <p>Seuls des réglages techniques (thème, langue, choix cookies) sont enregistrés sans votre accord. Les cookies
          de mesure d'audience ne sont déposés qu'après acceptation, et vous pouvez les refuser.</p>

        <h2>7. Vos droits</h2>
        <p>Vous pouvez demander l'accès, la rectification ou la suppression de vos données
          {CONTACT.email ? <> en écrivant à <b>{CONTACT.email}</b></> : ' en contactant l\'équipe AllVote'}.</p>
      </div>
    </section>
  )
}

import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import { CONTACT } from '../config'

export default function Cgu() {
  return (
    <section>
      <Seo path="/cgu" title="Conditions d'utilisation" description="Conditions générales d'utilisation de la plateforme de vote AllVote." />
      <div className="container legal">
        <h1 className="gold-text">Conditions d'utilisation</h1>
        <p>Dernière mise à jour : 6 novembre 2026</p>

        <h2>1. Objet</h2>
        <p>AllVote est une plateforme de vote en ligne qui permet à des organisateurs (départements, clubs,
          associations, entreprises…) de proposer des concours, et au public de voter pour des candidats.
          Les présentes conditions s'appliquent aux votants comme aux organisateurs.</p>

        <h2>2. Rôles</h2>
        <ul>
          <li><b>L'organisateur</b> crée ses événements, concours et candidats. Il est seul responsable de leur contenu,
            du règlement de son concours et de l'exactitude des informations publiées.</li>
          <li><b>AllVote</b> fournit l'outil, encaisse les paiements de vote et reverse à l'organisateur sa part,
            déduction faite de la commission de la plateforme.</li>
          <li><b>Le votant</b> soutient le candidat de son choix en payant ses voix.</li>
        </ul>

        <h2>3. Principe du vote</h2>
        <p>Le vote est payant : le prix d'une voix est fixé par l'organisateur pour chaque concours et affiché avant
          le paiement. Des frais de service (pourcentage du prix des voix, arrondi au franc supérieur) s'ajoutent au
          montant et sont indiqués dans le récapitulatif avant validation. Le règlement se fait par MTN Mobile Money ou Orange Money. Une voix n'est comptée qu'après
          confirmation effective du paiement par l'opérateur.</p>

        <h2>4. Périodes de vote</h2>
        <p>Chaque concours a une date d'ouverture et de clôture (compte à rebours). Aucun vote n'est accepté hors
          de cette période ou lorsqu'un concours est suspendu.</p>

        <h2>5. Absence de remboursement</h2>
        <p>Les votes payés et confirmés ne sont ni annulables ni remboursables, sauf dysfonctionnement technique
          avéré imputable à la plateforme. Un paiement non confirmé n'entraîne aucun prélèvement.</p>

        <h2>6. Fair-play et fraude</h2>
        <p>Toute tentative de fraude, de manipulation des résultats ou d'utilisation automatisée (robots) entraîne
          l'annulation des votes concernés. AllVote peut suspendre un organisateur ou retirer un événement qui ne
          respecte pas ces conditions ou la loi.</p>

        <h2>7. Organisateurs</h2>
        <p>L'inscription est gratuite et soumise à validation par AllVote. L'organisateur fournit un numéro Mobile
          Money pour recevoir ses reversements et garantit disposer des droits sur les images et informations des
          candidats qu'il publie.</p>

        <h2>8. Responsabilité</h2>
        <p>AllVote s'efforce d'assurer la disponibilité du service et l'exactitude des résultats, sans garantie
          d'absence d'interruption. Les données personnelles sont traitées selon notre{' '}
          <Link to="/confidentialite" className="lien">politique de confidentialité</Link>.</p>

        {(CONTACT.email || CONTACT.tel) && (
          <>
            <h2>9. Contact</h2>
            <p>{CONTACT.email && <>Email : {CONTACT.email}</>}{CONTACT.email && CONTACT.tel && ' · '}{CONTACT.tel && <>Téléphone : {CONTACT.tel}</>}</p>
          </>
        )}
      </div>
    </section>
  )
}

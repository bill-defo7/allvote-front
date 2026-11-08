import { Link } from 'react-router-dom'
import { logo } from '../assets/brand'
import { CONTACT } from '../config'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="foot-grid">
          <div className="foot-brand">
            <img src={logo} alt="AllVote — Élevez votre candidat vers la victoire" className="foot-logo" width="260" height="82" loading="lazy" />
            <p>La plateforme de vote en ligne pour tous vos concours : Miss &amp; Master, meilleur projet,
              meilleurs joueurs… Paiement sécurisé par MTN Mobile Money et Orange Money.</p>
          </div>
          <div className="foot-col">
            <h4>Navigation</h4>
            <Link to="/">Accueil</Link>
            <a href="/#evenements">Événements</a>
            <a href="/#how">Comment voter</a>
            <Link to="/inscription">Organiser un vote</Link>
            <Link to="/connexion">Espace organisateur</Link>
          </div>
          <div className="foot-col">
            <h4>Informations</h4>
            <Link to="/confidentialite">Confidentialité (RGPD)</Link>
            <Link to="/cgu">Conditions d'utilisation</Link>
            {CONTACT.tel && <span>📞 {CONTACT.tel}</span>}
            {CONTACT.email && <a href={`mailto:${CONTACT.email}`}>✉️ {CONTACT.email}</a>}
          </div>
        </div>
        <div className="copyright">© {new Date().getFullYear()} AllVote. Tous droits réservés.</div>
      </div>
    </footer>
  )
}

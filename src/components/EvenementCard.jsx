import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { logo } from '../assets/brand'
import { mediaUrl, fmtJour } from '../utils/helpers'

/** Carte d'un événement (accueil, page organisateur). e = EvenementResumeDto */
export default function EvenementCard({ e, index = 0 }) {
  const affiche = mediaUrl(e.afficheUrl)
  return (
    <motion.div className="cc ev-card"
      initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}>
      <Link to={`/e/${e.slug}`} className="cover" aria-label={`Voir ${e.titre}`}>
        {affiche
          ? <img src={affiche} alt={`Affiche ${e.titre}`} loading="lazy" />
          : <img src={logo} alt="" className="cover-logo" loading="lazy" />}
        {e.voteEnCours
          ? <span className="state state-open">● Vote en cours</span>
          : <span className="state state-soon">{e.nbConcours} concours</span>}
      </Link>
      <div className="body">
        <p className="ev-org">
          <Link to={`/o/${e.organisateur.slug}`}>{e.organisateur.nom}</Link>
        </p>
        <h3><Link to={`/e/${e.slug}`}>{e.titre}</Link></h3>
        <p className="meta">
          {e.dateDebut && <>📅 {fmtJour(e.dateDebut)}<br /></>}
          {e.lieu && <>📍 {e.lieu}</>}
        </p>
        <Link to={`/e/${e.slug}`} className="btn btn-gold">{e.voteEnCours ? '✦ Voter' : 'Voir l\'événement'}</Link>
      </div>
    </motion.div>
  )
}

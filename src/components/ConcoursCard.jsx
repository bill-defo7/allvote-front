import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Countdown from './Countdown'
import { logo } from '../assets/brand'
import { fmt, mediaUrl, STATUT_LABEL, STATE_CLASS } from '../utils/helpers'

/** Carte d'un concours sur la page d'un événement. c = ConcoursResumeDto */
export default function ConcoursCard({ c, index = 0, onDone }) {
  const st = c.statut
  const target = st === 'PLANIFIE' ? c.dateOuverture : c.dateFermeture
  const affiche = mediaUrl(c.afficheUrl)
  return (
    <motion.div className="cc"
      initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}>
      <div className="cover">
        {affiche
          ? <img src={affiche} alt={`Affiche ${c.titre}`} loading="lazy" />
          : <img src={logo} alt="" className="cover-logo" loading="lazy" />}
        <span className={`state ${STATE_CLASS[st]}`}>{STATUT_LABEL[st]}</span>
      </div>
      <div className="body">
        <h3>{c.titre}</h3>
        <p className="meta">{c.nbCandidats} candidat(s) · {fmt(c.prixVoix)} FCFA / voix</p>
        {(st === 'OUVERT' || st === 'PLANIFIE') && (
          <>
            <p className="meta">{st === 'PLANIFIE' ? 'Ouvre dans :' : 'Clôture dans :'}</p>
            <Countdown target={target} small onDone={onDone} />
          </>
        )}
        {st === 'FERME' && <p className="meta">Vote clôturé — résultats disponibles.</p>}
        {st === 'SUSPENDU' && <p className="meta">Vote temporairement suspendu.</p>}
        <Link to={`/concours/${c.idConcours}`} className="btn btn-gold">
          {st === 'OUVERT' ? '✦ Voter' : 'Voir le concours'}
        </Link>
      </div>
    </motion.div>
  )
}

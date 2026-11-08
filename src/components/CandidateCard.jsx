import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import { initials, gradientFor, fmt, mediaUrl, candidatShareUrl } from '../utils/helpers'

/**
 * Carte candidat. candidat = { idCandidat, numero, nom, sousTitre, description, photoUrl, votes, rang }
 * votes/rang valent null quand l'organisateur a masqué les scores.
 */
export default function CandidateCard({ idConcours, candidat, pct, index, canVote, onVote }) {
  const { show } = useToast()
  const page = `/concours/${idConcours}/candidat/${candidat.idCandidat}`
  const scoresVisibles = candidat.votes !== null && candidat.votes !== undefined
  const photo = mediaUrl(candidat.photoUrl)

  // Partage du lien de vote (aperçu avec photo + nom grâce à /share côté API)
  const share = async () => {
    const url = candidatShareUrl(idConcours, candidat.idCandidat)
    const text = `Vote pour ${candidat.nom} sur AllVote ! 👑`
    try {
      if (navigator.share) { await navigator.share({ title: text, text, url }); return }
      await navigator.clipboard.writeText(url)
      show('✅ Lien de vote copié — partage-le !')
    } catch { /* partage annulé */ }
  }

  return (
    <motion.div
      className="nom"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
    >
      <Link to={page} className="ph" style={{ background: gradientFor(index) }} aria-label={`Voir le profil de ${candidat.nom}`}>
        <span className="rk">N° {candidat.numero}</span>
        {scoresVisibles && <span className="vt">{fmt(candidat.votes)} voix</span>}
        {scoresVisibles && candidat.rang === 1 && candidat.votes > 0 && <span className="crown" title="En tête">👑</span>}
        {photo ? <img src={photo} alt={`Photo de ${candidat.nom}`} loading="lazy" /> : initials(candidat.nom)}
      </Link>
      <div className="info">
        <h4><Link to={page}>{candidat.nom}</Link></h4>
        <div className="fil">{candidat.sousTitre}</div>
        {candidat.description && <p className="desc">{candidat.description}</p>}
        {scoresVisibles && (
          <div className="bar" aria-hidden="true"><i style={{ width: `${pct}%` }} /></div>
        )}
        <div className="nom-acts">
          <button className="btn btn-gold" onClick={() => onVote(candidat)} disabled={!canVote}>
            {canVote ? '✦ Voter' : 'Vote fermé'}
          </button>
          <button className="icon-btn share-btn" onClick={share} aria-label={`Partager le lien de vote de ${candidat.nom}`} title="Partager ce candidat">🔗</button>
        </div>
      </div>
    </motion.div>
  )
}

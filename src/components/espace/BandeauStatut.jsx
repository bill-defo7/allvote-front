import { useAuth } from '../../context/AuthContext'

const TEXTES = {
  EN_ATTENTE: ['banner-warn', '⏳ Organisation en attente de validation par l\'équipe AllVote. Vous pouvez déjà préparer vos événements ; la publication sera possible après validation.'],
  REFUSE: ['banner-err', '✕ Inscription refusée.'],
  SUSPENDU: ['banner-err', '⛔ Organisation suspendue. Contactez le support AllVote.'],
}

/** Bandeau d'alerte tant que l'organisation n'est pas validée (rien si VALIDE). */
export default function BandeauStatut() {
  const { organisateur } = useAuth()
  const t = organisateur && TEXTES[organisateur.statut]
  if (!t) return null
  return (
    <div className={`banner ${t[0]}`} style={{ marginTop: 0, marginBottom: 22 }}>
      {t[1]}{organisateur.statut === 'REFUSE' && organisateur.motifRefus ? ` Motif : ${organisateur.motifRefus}` : ''}
    </div>
  )
}

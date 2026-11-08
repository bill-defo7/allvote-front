import { useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Seo from '../components/Seo'
import ShareButtons from '../components/ShareButtons'
import VoteModal from '../components/VoteModal'
import Countdown from '../components/Countdown'
import { Chargement, Erreur } from '../components/Etat'
import { publicApi } from '../api/endpoints'
import { useApi } from '../api/useApi'
import {
  initials, gradientFor, fmt, mediaUrl, candidatShareUrl, syncServerTime, STATUT_LABEL, STATE_CLASS,
} from '../utils/helpers'

export default function CandidatPage() {
  const { id, candId } = useParams()
  const [params] = useSearchParams()
  const { data, error, loading, reload, recharger } = useApi(async () => {
    const d = await publicApi.candidat(id, candId)
    syncServerTime(d?.serverTime)
    return d
  }, [id, candId], { refreshMs: 15000 })

  const [voting, setVoting] = useState(false)
  const ouvertAuto = useRef(false)

  // Lien partagé avec ?vote=1 → la fenêtre de vote s'ouvre directement (une seule fois)
  useEffect(() => {
    if (!ouvertAuto.current && data && params.get('vote') === '1' && data.concours.statut === 'OUVERT') {
      ouvertAuto.current = true
      setVoting(true)
    }
  }, [data, params])

  if (loading) return <section className="hero"><div className="container"><Chargement /></div></section>
  if (error || !data?.candidat) {
    return (
      <section className="hero"><div className="container" style={{ textAlign: 'center' }}>
        {!error || error.status === 404
          ? <>
              <h1 className="gold-text">Candidat introuvable</h1>
              <p className="intro">Ce candidat n'existe pas ou a été retiré du concours.</p>
              <Link to="/" className="btn btn-gold" style={{ marginTop: 20 }}>Retour à l'accueil</Link>
            </>
          : <Erreur error={error} onRetry={recharger} />}
      </div></section>
    )
  }

  const { concours, categorieNom, candidat, evenement } = data
  const st = concours.statut
  const canVote = st === 'OUVERT'
  const scoresVisibles = candidat.votes !== null && candidat.votes !== undefined
  const photo = mediaUrl(candidat.photoUrl)

  return (
    <>
      <Seo
        path={`/concours/${concours.idConcours}/candidat/${candidat.idCandidat}`}
        title={`Vote pour ${candidat.nom} — ${categorieNom}`}
        description={candidat.description || `Soutiens ${candidat.nom} au concours ${concours.titre}.`}
        image={photo || undefined}
      />

      <section className="hero" style={{ minHeight: 'auto', paddingTop: 130 }}>
        <div className="container">
          <p className="crumbs" style={{ marginBottom: 18 }}>
            <Link to={`/o/${evenement.organisateurSlug}`}>{evenement.organisateurNom}</Link> <span>›</span>{' '}
            <Link to={`/e/${evenement.slug}`}>{evenement.titre}</Link> <span>›</span>{' '}
            <Link to={`/concours/${concours.idConcours}`}>{concours.titre}</Link>
          </p>
          <motion.div className="cand-page" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <div className="cand-photo" style={{ background: gradientFor(candidat.numero) }}>
              {photo ? <img src={photo} alt={`Photo de ${candidat.nom}`} /> : initials(candidat.nom)}
              {scoresVisibles && candidat.rang === 1 && candidat.votes > 0 && <span className="crown">👑</span>}
            </div>

            <div className="cand-info">
              <span className={`state ${STATE_CLASS[st]}`} style={{ position: 'static', display: 'inline-block' }}>{STATUT_LABEL[st]}</span>
              <p className="sec-kicker" style={{ textAlign: 'left', margin: '14px 0 4px' }}>{concours.titre} · {categorieNom}</p>
              <h1>{candidat.nom}</h1>
              <p className="fil">N° {candidat.numero}{candidat.sousTitre ? ` · ${candidat.sousTitre}` : ''}</p>

              {candidat.description && <p className="cand-desc">« {candidat.description} »</p>}

              {scoresVisibles && (
                <div className="cand-stats">
                  <div><b>{fmt(candidat.votes)}</b><span>voix</span></div>
                  {candidat.rang && <div><b>{candidat.rang}<sup>{candidat.rang === 1 ? 'er' : 'e'}</sup></b><span>au classement</span></div>}
                </div>
              )}

              {canVote && (
                <>
                  <p className="fil" style={{ marginTop: 6 }}>Clôture dans :</p>
                  <Countdown target={concours.dateFermeture} small onDone={reload} />
                </>
              )}

              <button className="btn btn-gold" style={{ marginTop: 20 }} disabled={!canVote} onClick={() => setVoting(true)}>
                {canVote ? `✦ Voter pour ${candidat.nom.split(' ')[0]}` : 'Le vote n\'est pas ouvert'}
              </button>
              <p className="fil" style={{ marginTop: 8 }}>{fmt(concours.prixVoix)} FCFA par voix · MTN Mobile Money ou Orange Money</p>

              <p className="fil" style={{ marginTop: 22 }}>Partage son lien de vote :</p>
              <div style={{ display: 'flex' }}>
                <ShareButtons title={`Vote pour ${candidat.nom} (${categorieNom})`} url={candidatShareUrl(concours.idConcours, candidat.idCandidat)} />
              </div>

              <Link to={`/concours/${concours.idConcours}`} className="btn btn-ghost btn-sm" style={{ marginTop: 22 }}>← Tous les candidats</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {voting && <VoteModal concours={concours} candidat={candidat} onClose={() => setVoting(false)} onConfirmed={reload} />}
    </>
  )
}

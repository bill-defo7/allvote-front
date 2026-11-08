import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Seo from '../components/Seo'
import Countdown from '../components/Countdown'
import ShareButtons from '../components/ShareButtons'
import CandidateCard from '../components/CandidateCard'
import VoteModal from '../components/VoteModal'
import { Chargement, Erreur } from '../components/Etat'
import { publicApi } from '../api/endpoints'
import { useApi } from '../api/useApi'
import { STATUT_LABEL, STATE_CLASS, fmt, mediaUrl, syncServerTime } from '../utils/helpers'

export default function ConcoursDetail() {
  const { id } = useParams()
  // Scores rafraîchis toutes les 15 s tant que la page est ouverte
  const { data: concours, error, loading, reload, recharger } = useApi(async () => {
    const d = await publicApi.concours(id)
    syncServerTime(d?.serverTime)
    return d
  }, [id], { refreshMs: 15000 })

  const [tab, setTab] = useState(0)
  const [q, setQ] = useState('')
  const [voting, setVoting] = useState(null)

  const categories = concours?.categories || []
  const cat = categories[Math.min(tab, Math.max(0, categories.length - 1))]
  const visibles = !!concours?.votesVisibles

  const liste = useMemo(() => {
    if (!cat) return []
    const arr = [...cat.candidats].sort((a, b) => (visibles ? (b.votes - a.votes) || (a.numero - b.numero) : a.numero - b.numero))
    const max = Math.max(1, ...arr.map((c) => c.votes || 0))
    return arr
      .filter((c) => c.nom.toLowerCase().includes(q.toLowerCase()))
      .map((c) => ({ ...c, pct: Math.round(((c.votes || 0) / max) * 100) }))
  }, [cat, q, visibles])

  if (loading) return <section className="hero"><div className="container"><Chargement /></div></section>
  if (error) {
    return (
      <section className="hero"><div className="container" style={{ textAlign: 'center' }}>
        {error.status === 404
          ? <>
              <h1 className="gold-text">Concours introuvable</h1>
              <p className="intro">Ce concours n'existe pas ou a été retiré.</p>
              <Link to="/" className="btn btn-gold" style={{ marginTop: 20 }}>Retour à l'accueil</Link>
            </>
          : <Erreur error={error} onRetry={recharger} />}
      </div></section>
    )
  }

  const st = concours.statut
  const canVote = st === 'OUVERT'
  const target = st === 'PLANIFIE' ? concours.dateOuverture : concours.dateFermeture
  const ev = concours.evenement

  return (
    <>
      <Seo path={`/concours/${concours.idConcours}`} title={`${concours.titre} — ${ev.titre}`}
        description={concours.description || `Votez pour vos candidats : ${concours.titre} (${ev.organisateurNom}).`}
        image={mediaUrl(concours.afficheUrl) || undefined} />

      <section className="hero" style={{ minHeight: 'auto', paddingTop: 140, paddingBottom: 40 }}>
        <div className="container hero-grid">
          <p className="crumbs">
            <Link to={`/o/${ev.organisateurSlug}`}>{ev.organisateurNom}</Link> <span>›</span> <Link to={`/e/${ev.slug}`}>{ev.titre}</Link>
          </p>
          <span className={`state ${STATE_CLASS[st]}`} style={{ position: 'static', padding: '6px 16px' }}>{STATUT_LABEL[st]}</span>
          <h1 style={{ fontSize: 'clamp(2rem,5vw,3.4rem)' }}>{concours.titre}</h1>
          {concours.description && <p className="intro pre">{concours.description}</p>}
          <div className="price-pill">✦ {fmt(concours.prixVoix)} FCFA par voix{visibles && concours.totalVotes != null ? ` · ${fmt(concours.totalVotes)} voix exprimées` : ''}</div>
          {(st === 'OUVERT' || st === 'PLANIFIE') && (
            <>
              <p className="meta" style={{ color: 'var(--muted)', fontSize: '.82rem' }}>
                {st === 'PLANIFIE' ? 'Ouverture dans :' : 'Clôture dans :'}
              </p>
              <Countdown target={target} onDone={reload} />
            </>
          )}
          <ShareButtons title={concours.titre} />
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="container">
          {categories.length > 1 && (
            <div className="vote-tabs" role="tablist">
              {categories.map((c, i) => (
                <button key={c.idCategorie} role="tab" aria-selected={i === tab} className={i === tab ? 'active' : ''}
                  onClick={() => { setTab(i); setQ('') }}>{c.nom}</button>
              ))}
            </div>
          )}

          <div className="searchbar">
            <input type="text" placeholder="Rechercher un candidat…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Rechercher un candidat" />
          </div>
          <div className="cat-count">{cat?.nom ? `${cat.nom} · ` : ''}{cat?.candidats.length || 0} candidats</div>

          {!canVote && (
            <p className="sec-sub" style={{ marginTop: -10 }}>
              {st === 'FERME' ? 'Le vote est clôturé — voici les résultats finaux.'
                : st === 'PLANIFIE' ? 'Le vote n\'est pas encore ouvert.'
                  : 'Le vote est momentanément suspendu.'}
            </p>
          )}
          {canVote && !visibles && <p className="sec-sub" style={{ marginTop: -10 }}>Les scores sont masqués jusqu'à la clôture.</p>}

          <div className="nom-grid">
            {liste.map((c, i) => (
              <CandidateCard key={c.idCandidat} idConcours={concours.idConcours} candidat={c} pct={c.pct} index={i}
                canVote={canVote} onVote={(cand) => setVoting(cand)} />
            ))}
          </div>
          {cat && liste.length === 0 && <p className="sec-sub">Aucun candidat trouvé.</p>}
          {categories.length === 0 && <p className="sec-sub">Les candidats seront bientôt annoncés.</p>}

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to={`/e/${ev.slug}`} className="btn btn-ghost">← {ev.titre}</Link>
          </div>
        </div>
      </section>

      {voting && <VoteModal concours={concours} candidat={voting} onClose={() => setVoting(null)} onConfirmed={reload} />}
    </>
  )
}

import { Link, useParams } from 'react-router-dom'
import Seo from '../components/Seo'
import EvenementCard from '../components/EvenementCard'
import { Chargement, Erreur } from '../components/Etat'
import { publicApi } from '../api/endpoints'
import { useApi } from '../api/useApi'
import { initials, mediaUrl } from '../utils/helpers'

export default function OrganisateurPage() {
  const { slug } = useParams()
  const { data: o, error, loading, recharger } = useApi(() => publicApi.organisateur(slug), [slug])

  if (loading) return <section className="hero"><div className="container"><Chargement /></div></section>
  if (error) {
    return (
      <section className="hero"><div className="container" style={{ textAlign: 'center' }}>
        {error.status === 404
          ? <>
              <h1 className="gold-text">Organisateur introuvable</h1>
              <p className="intro">Cette page n'existe pas ou n'est plus disponible.</p>
              <Link to="/" className="btn btn-gold" style={{ marginTop: 20 }}>Retour à l'accueil</Link>
            </>
          : <Erreur error={error} onRetry={recharger} />}
      </div></section>
    )
  }

  const logoOrga = mediaUrl(o.logoUrl)
  return (
    <>
      <Seo path={`/o/${o.slug}`} title={o.nom} description={o.description || `Les votes organisés par ${o.nom} sur AllVote.`}
        image={logoOrga || undefined} />

      <section className="hero" style={{ minHeight: 'auto', paddingTop: 140, paddingBottom: 30 }}>
        <div className="container hero-grid">
          <div className="org-logo">{logoOrga ? <img src={logoOrga} alt={`Logo ${o.nom}`} /> : initials(o.nom)}</div>
          <span className="sec-kicker" style={{ marginBottom: 0 }}>Organisateur</span>
          <h1 style={{ fontSize: 'clamp(1.9rem,5vw,3.2rem)' }}>{o.nom}</h1>
          {o.ville && <p className="meta-line"><span>📍 {o.ville}</span></p>}
          {o.description && <p className="intro pre">{o.description}</p>}
        </div>
      </section>

      <section style={{ paddingTop: 10 }}>
        <div className="container">
          <h2 className="sec-title">Ses <span className="gold-text">événements</span></h2>
          {o.evenements.length === 0 && <p className="sec-sub">Aucun événement publié pour le moment.</p>}
          <div className="concours-grid" style={{ marginTop: 30 }}>
            {o.evenements.map((e, i) => <EvenementCard key={e.idEvenement} e={e} index={i} />)}
          </div>
        </div>
      </section>
    </>
  )
}

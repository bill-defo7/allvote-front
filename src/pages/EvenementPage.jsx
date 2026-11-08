import { Link, useParams } from 'react-router-dom'
import Seo from '../components/Seo'
import ShareButtons from '../components/ShareButtons'
import ConcoursCard from '../components/ConcoursCard'
import { Chargement, Erreur } from '../components/Etat'
import { publicApi } from '../api/endpoints'
import { useApi } from '../api/useApi'
import { evenementShareUrl, fmtJour, mediaUrl, syncServerTime } from '../utils/helpers'

export default function EvenementPage() {
  const { slug } = useParams()
  const { data: e, error, loading, reload, recharger } = useApi(async () => {
    const d = await publicApi.evenement(slug)
    syncServerTime(d?.serverTime)
    return d
  }, [slug], { refreshMs: 30000 })

  if (loading) return <section className="hero"><div className="container"><Chargement /></div></section>
  if (error) {
    return (
      <section className="hero"><div className="container" style={{ textAlign: 'center' }}>
        {error.status === 404
          ? <>
              <h1 className="gold-text">Événement introuvable</h1>
              <p className="intro">Cet événement n'existe pas, n'est pas encore publié ou a été retiré.</p>
              <Link to="/" className="btn btn-gold" style={{ marginTop: 20 }}>Retour à l'accueil</Link>
            </>
          : <Erreur error={error} onRetry={recharger} />}
      </div></section>
    )
  }

  const affiche = mediaUrl(e.afficheUrl)
  return (
    <>
      <Seo path={`/e/${e.slug}`} title={e.titre} description={e.description || `Votez sur AllVote — ${e.organisateur.nom}`}
        image={affiche || undefined} />

      <section className="hero" style={{ minHeight: 'auto', paddingTop: 140, paddingBottom: 40 }}>
        <div className="container hero-grid">
          <p className="crumbs"><Link to={`/o/${e.organisateur.slug}`}>{e.organisateur.nom}</Link></p>
          {affiche && <img className="ev-affiche" src={affiche} alt={`Affiche ${e.titre}`} />}
          <h1 style={{ fontSize: 'clamp(2rem,5vw,3.4rem)' }}>{e.titre}</h1>
          <p className="meta-line">
            {e.dateDebut && <span>📅 {fmtJour(e.dateDebut)}</span>}
            {e.lieu && <span>📍 {e.lieu}</span>}
          </p>
          {e.description && <p className="intro pre">{e.description}</p>}
          <ShareButtons title={e.titre} url={evenementShareUrl(e.slug)} />
        </div>
      </section>

      <section style={{ paddingTop: 20 }}>
        <div className="container">
          <span className="sec-kicker">Concours</span>
          <h2 className="sec-title">Choisissez un <span className="gold-text">concours</span></h2>
          <p className="sec-sub">Chaque concours a sa propre période de vote et son prix par voix.</p>
          {e.concours.length === 0 && <p className="sec-sub">Les concours seront bientôt annoncés.</p>}
          <div className="concours-grid">
            {e.concours.map((c, i) => <ConcoursCard key={c.idConcours} c={c} index={i} onDone={reload} />)}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to="/#evenements" className="btn btn-ghost">← Tous les événements</Link>
          </div>
        </div>
      </section>
    </>
  )
}

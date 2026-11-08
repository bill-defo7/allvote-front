import { Link } from 'react-router-dom'
import Seo from '../../components/Seo'
import BandeauStatut from '../../components/espace/BandeauStatut'
import { Chargement, Erreur } from '../../components/Etat'
import { orgaApi } from '../../api/endpoints'
import { useApi } from '../../api/useApi'
import { fmtJour, mediaUrl, EV_LABEL, EV_BADGE } from '../../utils/helpers'
import { logo } from '../../assets/brand'

export default function Evenements() {
  const { data, error, loading, recharger } = useApi(() => orgaApi.evenements(), [])
  return (
    <>
      <Seo path="/espace/evenements" title="Mes événements" noindex />
      <div className="admin-top">
        <h1>Mes <span className="gold-text">événements</span></h1>
        <Link to="/espace/evenements/nouveau" className="btn btn-gold btn-sm">＋ Nouvel événement</Link>
      </div>
      <BandeauStatut />
      {loading && <Chargement />}
      {error && <Erreur error={error} onRetry={recharger} />}
      {data && data.length === 0 && (
        <div className="panel vide">
          <p>Un événement (soirée, tournoi, salon…) regroupe un ou plusieurs concours.</p>
          <Link to="/espace/evenements/nouveau" className="btn btn-gold btn-sm">Créer mon premier événement</Link>
        </div>
      )}
      <div className="admin-grid">
        {(data || []).map((e) => (
          <div className="admin-card" key={e.idEvenement}>
            <div className="ev-mini">
              <img src={mediaUrl(e.afficheUrl) || logo} alt="" className={e.afficheUrl ? '' : 'sans'} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
              <h3>{e.titre}</h3>
              <span className={`badge ${EV_BADGE[e.statut]}`}>{EV_LABEL[e.statut]}</span>
            </div>
            <p className="hint">
              {e.dateDebut ? `📅 ${fmtJour(e.dateDebut)}` : 'Date à définir'}{e.lieu ? ` · 📍 ${e.lieu}` : ''}<br />
              {e.nbConcours} concours
            </p>
            <div className="row-acts">
              <Link to={`/espace/evenements/${e.idEvenement}`} className="btn btn-sm btn-gold">Gérer</Link>
              {e.statut === 'PUBLIE' && <a href={`/e/${e.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-ghost">↗ Voir</a>}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

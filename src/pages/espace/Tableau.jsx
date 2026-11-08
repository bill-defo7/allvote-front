import { Link } from 'react-router-dom'
import Seo from '../../components/Seo'
import BandeauStatut from '../../components/espace/BandeauStatut'
import { Chargement, Erreur } from '../../components/Etat'
import { useAuth } from '../../context/AuthContext'
import { orgaApi } from '../../api/endpoints'
import { useApi } from '../../api/useApi'
import { fmt, fmtJour, EV_LABEL, EV_BADGE } from '../../utils/helpers'

export default function Tableau() {
  const { utilisateur, peut } = useAuth()
  const evs = useApi(() => orgaApi.evenements(), [])
  const fin = useApi(() => (peut('FINANCE_VOIR') ? orgaApi.finances() : Promise.resolve(null)), [])

  const liste = evs.data || []
  const publies = liste.filter((e) => e.statut === 'PUBLIE').length
  const f = fin.data

  return (
    <>
      <Seo path="/espace" title="Tableau de bord" noindex />
      <div className="admin-top">
        <h1>Bonjour <span className="gold-text">{utilisateur?.prenom}</span></h1>
        <Link to="/espace/evenements/nouveau" className="btn btn-gold btn-sm">＋ Nouvel événement</Link>
      </div>
      <BandeauStatut />

      <div className="stat-row">
        <div className="stat"><div className="v">{evs.data ? liste.length : '—'}</div><div className="l">Événements</div></div>
        <div className="stat"><div className="v">{evs.data ? publies : '—'}</div><div className="l">Publiés</div></div>
        {f && <>
          <div className="stat"><div className="v">{fmt(f.voix)}</div><div className="l">Voix payées</div></div>
          <div className="stat"><div className="v">{fmt(f.encaisse)}</div><div className="l">Valeur des voix (FCFA)</div></div>
          <div className="stat"><div className="v">{fmt(f.partOrganisateur)}</div><div className="l">Votre part (FCFA)</div></div>
          <div className="stat"><div className="v">{fmt(f.resteAReverser)}</div><div className="l">Reste à reverser</div></div>
        </>}
      </div>

      <div className="panel">
        <h2>Derniers événements</h2>
        {evs.loading && <Chargement />}
        {evs.error && <Erreur error={evs.error} onRetry={evs.recharger} />}
        {evs.data && liste.length === 0 && (
          <div className="vide">
            <p>Vous n'avez pas encore d'événement.</p>
            <Link to="/espace/evenements/nouveau" className="btn btn-gold btn-sm">Créer mon premier événement</Link>
          </div>
        )}
        {liste.length > 0 && (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Événement</th><th>Date</th><th>Concours</th><th>Statut</th><th /></tr></thead>
              <tbody>
                {liste.slice(0, 5).map((e) => (
                  <tr key={e.idEvenement}>
                    <td><b>{e.titre}</b></td>
                    <td>{e.dateDebut ? fmtJour(e.dateDebut) : '—'}</td>
                    <td>{e.nbConcours}</td>
                    <td><span className={`badge ${EV_BADGE[e.statut]}`}>{EV_LABEL[e.statut]}</span></td>
                    <td style={{ textAlign: 'right' }}><Link to={`/espace/evenements/${e.idEvenement}`} className="btn btn-sm btn-ghost">Gérer</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {f && f.transactionsAVerifier > 0 && (
        <div className="banner banner-warn">{f.transactionsAVerifier} paiement(s) en cours de vérification par AllVote.</div>
      )}
    </>
  )
}

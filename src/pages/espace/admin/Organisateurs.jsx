import { Link, useSearchParams } from 'react-router-dom'
import Seo from '../../../components/Seo'
import { Chargement, Erreur } from '../../../components/Etat'
import { adminApi } from '../../../api/endpoints'
import { useApi } from '../../../api/useApi'
import { fmtDate, fmtTaux, ORGA_LABEL, ORGA_BADGE } from '../../../utils/helpers'

const FILTRES = [['', 'Tous'], ['EN_ATTENTE', 'En attente'], ['VALIDE', 'Validés'], ['SUSPENDU', 'Suspendus'], ['REFUSE', 'Refusés']]

export default function Organisateurs() {
  const [params, setParams] = useSearchParams()
  const statut = params.get('statut') || ''
  const page = Number(params.get('page') || 0)
  const { data, error, loading, recharger } = useApi(() => adminApi.organisateurs({ statut: statut || undefined, page }), [statut, page])
  const aller = (o) => setParams(Object.fromEntries(Object.entries({ statut, page: 0, ...o }).filter(([, v]) => v !== '' && v !== 0)))

  return (
    <>
      <Seo path="/espace/organisateurs" title="Organisateurs" noindex />
      <div className="admin-top"><h1><span className="gold-text">Organisateurs</span></h1></div>
      <div className="vote-tabs onglets-g" role="tablist">
        {FILTRES.map(([v, l]) => (
          <button key={v} role="tab" aria-selected={statut === v} className={statut === v ? 'active' : ''} onClick={() => aller({ statut: v })}>{l}</button>
        ))}
      </div>
      <div className="panel">
        {loading && <Chargement />}
        {error && <Erreur error={error} onRetry={recharger} />}
        {data && data.contenu.length === 0 && <p className="hint">Aucune organisation{statut ? ' avec ce statut' : ''}.</p>}
        {data && data.contenu.length > 0 && (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Organisation</th><th>Responsable</th><th>Ville</th><th>Inscription</th><th>Commission</th><th>Statut</th><th /></tr></thead>
              <tbody>
                {data.contenu.map((o) => (
                  <tr key={o.idOrganisateur}>
                    <td><b>{o.nom}</b><div className="hint">{o.nbEvenements} événement(s)</div></td>
                    <td>{o.responsable ? <>{o.responsable.prenom} {o.responsable.nom}<div className="hint">{o.responsable.email}</div></> : '—'}</td>
                    <td>{o.ville || '—'}</td>
                    <td>{fmtDate(o.dateCreation)}</td>
                    <td>{fmtTaux(o.tauxApplique)}{o.tauxCommission != null && <span className="hint"> (propre)</span>}</td>
                    <td><span className={`badge ${ORGA_BADGE[o.statut]}`}>{ORGA_LABEL[o.statut]}</span></td>
                    <td style={{ textAlign: 'right' }}><Link className="btn btn-sm btn-gold" to={`/espace/organisateurs/${o.idOrganisateur}`}>{o.statut === 'EN_ATTENTE' ? 'Examiner' : 'Ouvrir'}</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data && data.totalPages > 1 && (
          <div className="pager">
            <button className="btn btn-sm btn-ghost" disabled={page === 0} onClick={() => aller({ page: page - 1 })}>←</button>
            <span className="hint">Page {page + 1} / {data.totalPages}</span>
            <button className="btn btn-sm btn-ghost" disabled={page + 1 >= data.totalPages} onClick={() => aller({ page: page + 1 })}>→</button>
          </div>
        )}
      </div>
    </>
  )
}

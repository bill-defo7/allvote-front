import { useSearchParams } from 'react-router-dom'
import Seo from '../../../components/Seo'
import FiltreOrganisateur from './FiltreOrganisateur'
import { Chargement, Erreur } from '../../../components/Etat'
import { useToast } from '../../../context/ToastContext'
import { adminApi } from '../../../api/endpoints'
import { useApi } from '../../../api/useApi'
import { fmtJour, EV_LABEL, EV_BADGE } from '../../../utils/helpers'

export default function Moderation() {
  const { show } = useToast()
  const [params, setParams] = useSearchParams()
  const statut = params.get('statut') || ''
  const idOrganisateur = params.get('idOrganisateur') || ''
  const page = Number(params.get('page') || 0)
  const { data, error, loading, recharger, reload } = useApi(
    () => adminApi.evenements({ statut: statut || undefined, idOrganisateur: idOrganisateur || undefined, page }), [statut, idOrganisateur, page])
  const aller = (o) => setParams(Object.fromEntries(Object.entries({ statut, idOrganisateur, page: 0, ...o }).filter(([, v]) => v !== '' && v !== 0)))

  const changer = async (e, s) => {
    const texte = s === 'ARCHIVE' ? 'archiver' : 'retirer du public'
    if (!confirm(`Voulez-vous ${texte} « ${e.titre} » ?`)) return
    try { await adminApi.statutEvenement(e.idEvenement, s); show(`✅ Événement ${s === 'ARCHIVE' ? 'archivé' : 'retiré du public'}`); reload() }
    catch (ex) { show(`⚠️ ${ex.message}`) }
  }

  return (
    <>
      <Seo path="/espace/moderation" title="Événements" noindex />
      <div className="admin-top">
        <h1>Tous les <span className="gold-text">événements</span></h1>
        <div className="filtres">
          <FiltreOrganisateur value={idOrganisateur} onChange={(v) => aller({ idOrganisateur: v })} />
          <select className="filtre" value={statut} onChange={(e) => aller({ statut: e.target.value })} aria-label="Statut">
            <option value="">Tous les statuts</option>
            {Object.entries(EV_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>
      <p className="hint" style={{ marginBottom: 16 }}>La publication appartient à l'organisateur ; vous pouvez retirer du public ou archiver un événement abusif.</p>
      <div className="panel">
        {loading && <Chargement />}
        {error && <Erreur error={error} onRetry={recharger} />}
        {data && data.contenu.length === 0 && <p className="hint">Aucun événement.</p>}
        {data && data.contenu.length > 0 && (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Événement</th><th>Organisateur</th><th>Date</th><th>Concours</th><th>Statut</th><th /></tr></thead>
              <tbody>
                {data.contenu.map((e) => (
                  <tr key={e.idEvenement}>
                    <td><b>{e.titre}</b>{e.statut === 'PUBLIE' && <> · <a className="lien" href={`/e/${e.slug}`} target="_blank" rel="noopener noreferrer">voir</a></>}</td>
                    <td>{e.organisateurNom}</td>
                    <td>{e.dateDebut ? fmtJour(e.dateDebut) : '—'}</td>
                    <td>{e.nbConcours}</td>
                    <td><span className={`badge ${EV_BADGE[e.statut]}`}>{EV_LABEL[e.statut]}</span></td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {e.statut === 'PUBLIE' && <button className="btn btn-sm btn-ghost" onClick={() => changer(e, 'BROUILLON')}>Retirer</button>}{' '}
                      {e.statut !== 'ARCHIVE' && <button className="btn btn-sm btn-danger" onClick={() => changer(e, 'ARCHIVE')}>Archiver</button>}
                    </td>
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

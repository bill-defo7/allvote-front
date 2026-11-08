import { useState } from 'react'
import Seo from '../../components/Seo'
import Permis from '../../components/espace/Permis'
import { Chargement, Erreur } from '../../components/Etat'
import { orgaApi } from '../../api/endpoints'
import { useApi } from '../../api/useApi'
import { fmt, fmtDate, TX_LABEL, TX_BADGE } from '../../utils/helpers'

export default function Transactions() {
  return <Permis p="TRANSACTION_VOIR"><Liste /></Permis>
}

function Liste() {
  const [statut, setStatut] = useState('')
  const [page, setPage] = useState(0)
  const { data, error, loading, recharger } = useApi(
    () => orgaApi.transactions({ statut: statut || undefined, page, taille: 20 }), [statut, page], { refreshMs: 30000 })

  return (
    <>
      <Seo path="/espace/transactions" title="Transactions" noindex />
      <div className="admin-top">
        <h1><span className="gold-text">Transactions</span></h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select className="filtre" value={statut} onChange={(e) => { setStatut(e.target.value); setPage(0) }} aria-label="Filtrer par statut">
            <option value="">Tous les statuts</option>
            {Object.entries(TX_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <button className="btn btn-sm btn-ghost" onClick={recharger}>↻</button>
        </div>
      </div>
      <p className="hint" style={{ marginBottom: 16 }}>Seuls les paiements <b>confirmés</b> comptent dans vos finances. Montants hors frais de service payés par le votant. Le numéro du votant est masqué.</p>

      <div className="panel">
        {loading && <Chargement />}
        {error && <Erreur error={error} onRetry={recharger} />}
        {data && data.contenu.length === 0 && <p className="hint">Aucune transaction{statut ? ' pour ce statut' : ''} pour le moment.</p>}
        {data && data.contenu.length > 0 && (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Date</th><th>Concours</th><th>Candidat</th><th>Voix</th><th>Valeur des voix</th><th>Votre part</th><th>Opérateur</th><th>Statut</th></tr></thead>
              <tbody>
                {data.contenu.map((t) => (
                  <tr key={t.reference}>
                    <td>{fmtDate(t.dateCreation)}</td>
                    <td>{t.concoursTitre}</td>
                    <td><b>{t.candidatNom}</b></td>
                    <td>{fmt(t.nbVoix)}</td>
                    <td>{fmt(t.montant)} F</td>
                    <td>{t.statut === 'CONFIRME' ? `${fmt(t.montantOrganisateur)} F` : '—'}</td>
                    <td>{t.operateur} <span className="hint">{t.telephone}</span></td>
                    <td><span className={`badge ${TX_BADGE[t.statut]}`}>{TX_LABEL[t.statut]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data && data.totalPages > 1 && (
          <div className="pager">
            <button className="btn btn-sm btn-ghost" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>←</button>
            <span className="hint">Page {page + 1} / {data.totalPages} · {fmt(data.total)} transactions</span>
            <button className="btn btn-sm btn-ghost" disabled={page + 1 >= data.totalPages} onClick={() => setPage((p) => p + 1)}>→</button>
          </div>
        )}
      </div>
    </>
  )
}

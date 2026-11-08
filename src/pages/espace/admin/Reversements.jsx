import { useState } from 'react'
import Seo from '../../../components/Seo'
import { Chargement, Erreur } from '../../../components/Etat'
import { useToast } from '../../../context/ToastContext'
import { adminApi } from '../../../api/endpoints'
import { useApi } from '../../../api/useApi'
import { fmt, fmtDate, REV_LABEL, REV_BADGE } from '../../../utils/helpers'

/**
 * 1. Soldes : ce que AllVote doit à chaque organisateur → « Créer le reversement » (regroupe ses paiements).
 * 2. À payer : après l'envoi Mobile Money, saisir la référence → PAYÉ.
 * 3. Historique.
 */
export default function Reversements() {
  const { show } = useToast()
  const soldes = useApi(() => adminApi.soldes(), [])
  const aPayer = useApi(() => adminApi.reversements({ statut: 'A_PAYER', taille: 100 }), [])
  const [page, setPage] = useState(0)
  const histo = useApi(() => adminApi.reversements({ page, taille: 15 }), [page])
  const toutRecharger = () => { soldes.reload(); aPayer.reload(); histo.reload() }

  const creer = async (s) => {
    if (!s.numeroReversement) { show('⚠️ Cet organisateur n\'a pas renseigné son numéro de reversement.'); return }
    if (!confirm(`Créer un reversement de ${fmt(s.montant)} FCFA pour « ${s.nom} » (${s.nbTransactions} paiement(s)) ?`)) return
    try { await adminApi.creerReversement(s.idOrganisateur, null); show('✅ Reversement créé — envoyez le paiement puis notez sa référence'); toutRecharger() }
    catch (ex) { show(`⚠️ ${ex.message}`) }
  }

  return (
    <>
      <Seo path="/espace/reversements" title="Reversements" noindex />
      <div className="admin-top">
        <h1><span className="gold-text">Reversements</span></h1>
        <button className="btn btn-sm btn-ghost" onClick={toutRecharger}>↻ Actualiser</button>
      </div>

      <div className="panel">
        <h2>1. Soldes à reverser</h2>
        {soldes.loading && <Chargement />}
        {soldes.error && <Erreur error={soldes.error} onRetry={soldes.recharger} />}
        {soldes.data && soldes.data.length === 0 && <p className="hint">Rien à reverser pour le moment.</p>}
        {soldes.data && soldes.data.length > 0 && (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Organisateur</th><th>Numéro de reversement</th><th>Paiements</th><th>Montant dû</th><th /></tr></thead>
              <tbody>
                {soldes.data.map((s) => (
                  <tr key={s.idOrganisateur}>
                    <td><b>{s.nom}</b></td>
                    <td>{s.numeroReversement ? `${s.operateurReversement || ''} ${s.numeroReversement}` : <span className="hint">non renseigné</span>}</td>
                    <td>{fmt(s.nbTransactions)}</td>
                    <td><b>{fmt(s.montant)} F</b></td>
                    <td style={{ textAlign: 'right' }}><button className="btn btn-sm btn-gold" onClick={() => creer(s)}>Créer le reversement</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="panel">
        <h2>2. À payer</h2>
        {aPayer.loading && <Chargement />}
        {aPayer.error && <Erreur error={aPayer.error} onRetry={aPayer.recharger} />}
        {aPayer.data && aPayer.data.contenu.length === 0 && <p className="hint">Aucun reversement en attente de paiement.</p>}
        {(aPayer.data?.contenu || []).map((r) => <APayer key={r.idReversement} r={r} onFait={toutRecharger} />)}
      </div>

      <div className="panel">
        <h2>3. Historique</h2>
        {histo.loading && <Chargement />}
        {histo.data && histo.data.contenu.length === 0 && <p className="hint">Aucun reversement.</p>}
        {histo.data && histo.data.contenu.length > 0 && (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>N°</th><th>Organisateur</th><th>Montant</th><th>Paiements</th><th>Période</th><th>Référence</th><th>Par</th><th>Statut</th></tr></thead>
              <tbody>
                {histo.data.contenu.map((r) => (
                  <tr key={r.idReversement}>
                    <td>{r.idReversement}</td>
                    <td>{r.organisateurNom}</td>
                    <td><b>{fmt(r.montant)} F</b></td>
                    <td>{r.nbTransactions}</td>
                    <td className="hint">{r.periodeDebut ? `${fmtDate(r.periodeDebut)} → ${fmtDate(r.periodeFin)}` : '—'}</td>
                    <td>{r.referencePaiement || '—'}{r.datePaiement && <div className="hint">{fmtDate(r.datePaiement)}</div>}</td>
                    <td className="hint">{r.effectuePar || '—'}</td>
                    <td><span className={`badge ${REV_BADGE[r.statut]}`}>{REV_LABEL[r.statut]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {histo.data && histo.data.totalPages > 1 && (
          <div className="pager">
            <button className="btn btn-sm btn-ghost" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>←</button>
            <span className="hint">Page {page + 1} / {histo.data.totalPages}</span>
            <button className="btn btn-sm btn-ghost" disabled={page + 1 >= histo.data.totalPages} onClick={() => setPage((p) => p + 1)}>→</button>
          </div>
        )}
      </div>
    </>
  )
}

function APayer({ r, onFait }) {
  const { show } = useToast()
  const [ref, setRef] = useState('')
  const [envoi, setEnvoi] = useState(false)

  const payer = async () => {
    if (ref.trim().length < 3) { show('⚠️ Saisissez la référence de la transaction Mobile Money.'); return }
    setEnvoi(true)
    try { await adminApi.payerReversement(r.idReversement, ref.trim(), null); show('✅ Reversement marqué payé'); onFait() }
    catch (ex) { show(`⚠️ ${ex.message}`) } finally { setEnvoi(false) }
  }
  const annuler = async () => {
    if (!confirm('Annuler ce reversement ? Les paiements redeviennent « à reverser ».')) return
    try { await adminApi.annulerReversement(r.idReversement); show('✅ Reversement annulé'); onFait() }
    catch (ex) { show(`⚠️ ${ex.message}`) }
  }

  return (
    <div className="rev-carte">
      <div>
        <b>{r.organisateurNom}</b> · reversement n° {r.idReversement}
        <div className="rev-montant">{fmt(r.montant)} FCFA</div>
        <div className="hint">{r.nbTransactions} paiement(s) · à envoyer au <b>{r.operateurReversement || ''} {r.numeroReversement || 'numéro non renseigné'}</b></div>
      </div>
      <div className="ajout-ligne" style={{ flex: '1 1 320px', margin: 0 }}>
        <input value={ref} maxLength={120} onChange={(e) => setRef(e.target.value)} placeholder="Référence Mobile Money (ex. MP2611…)" aria-label="Référence du paiement" />
        <button className="btn btn-sm btn-gold" disabled={envoi} onClick={payer}>Marquer payé</button>
        <button className="btn btn-sm btn-ghost" disabled={envoi} onClick={annuler}>Annuler</button>
      </div>
    </div>
  )
}

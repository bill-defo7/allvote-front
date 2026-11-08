import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Seo from '../../../components/Seo'
import FiltreOrganisateur from './FiltreOrganisateur'
import { Chargement, Erreur } from '../../../components/Etat'
import { useToast } from '../../../context/ToastContext'
import { adminApi } from '../../../api/endpoints'
import { useApi } from '../../../api/useApi'
import { fmt, fmtDate, fmtTaux, TX_LABEL, TX_BADGE } from '../../../utils/helpers'

export default function Paiements() {
  const [params, setParams] = useSearchParams()
  const statut = params.get('statut') || ''
  const idOrganisateur = params.get('idOrganisateur') || ''
  const page = Number(params.get('page') || 0)
  const [ouverte, setOuverte] = useState(null)
  const { data, error, loading, recharger, reload } = useApi(
    () => adminApi.transactions({ statut: statut || undefined, idOrganisateur: idOrganisateur || undefined, page }),
    [statut, idOrganisateur, page], { refreshMs: 30000 })
  const aller = (o) => setParams(Object.fromEntries(Object.entries({ statut, idOrganisateur, page: 0, ...o }).filter(([, v]) => v !== '' && v !== 0)))

  return (
    <>
      <Seo path="/espace/paiements" title="Transactions" noindex />
      <div className="admin-top">
        <h1><span className="gold-text">Transactions</span></h1>
        <div className="filtres">
          <FiltreOrganisateur value={idOrganisateur} onChange={(v) => aller({ idOrganisateur: v })} />
          <select className="filtre" value={statut} onChange={(e) => aller({ statut: e.target.value })} aria-label="Statut">
            <option value="">Tous les statuts</option>
            {Object.entries(TX_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>
      <p className="hint" style={{ marginBottom: 16 }}>Cliquez sur une ligne pour le détail. Les paiements <b>À vérifier</b> ou <b>Expirés</b> peuvent être tranchés manuellement.</p>

      <div className="panel">
        {loading && <Chargement />}
        {error && <Erreur error={error} onRetry={recharger} />}
        {data && data.contenu.length === 0 && <p className="hint">Aucune transaction.</p>}
        {data && data.contenu.length > 0 && (
          <div className="tbl-wrap">
            <table className="tbl tbl-clic">
              <thead><tr><th>Date</th><th>Organisateur</th><th>Concours · candidat</th><th>Voix</th><th>Payé</th><th>Frais</th><th>Commission</th><th>Téléphone</th><th>Statut</th></tr></thead>
              <tbody>
                {data.contenu.map((t) => (
                  <tr key={t.idTransaction} onClick={() => setOuverte(t)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setOuverte(t)}>
                    <td>{fmtDate(t.dateCreation)}</td>
                    <td>{t.organisateurNom}</td>
                    <td>{t.concoursTitre}<div className="hint">{t.candidatNom}</div></td>
                    <td>{fmt(t.nbVoix)}</td>
                    <td>{fmt(t.montant)} F</td>
                    <td>{t.fraisService ? `${fmt(t.fraisService)} F` : '—'}</td>
                    <td>{t.statut === 'CONFIRME' ? `${fmt(t.montantCommission)} F` : '—'}</td>
                    <td>{t.operateur} {t.telephone}</td>
                    <td><span className={`badge ${TX_BADGE[t.statut]}`}>{TX_LABEL[t.statut]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data && data.totalPages > 1 && (
          <div className="pager">
            <button className="btn btn-sm btn-ghost" disabled={page === 0} onClick={() => aller({ page: page - 1 })}>←</button>
            <span className="hint">Page {page + 1} / {data.totalPages} · {fmt(data.total)} transactions</span>
            <button className="btn btn-sm btn-ghost" disabled={page + 1 >= data.totalPages} onClick={() => aller({ page: page + 1 })}>→</button>
          </div>
        )}
      </div>

      {ouverte && <Detail t={ouverte} onClose={() => setOuverte(null)} onChange={(n) => { setOuverte(n); reload() }} />}
    </>
  )
}

function Detail({ t, onClose, onChange }) {
  const { show } = useToast()
  const [verif, setVerif] = useState(null)
  const [motif, setMotif] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const tranchable = t.statut === 'A_VERIFIER' || t.statut === 'EXPIRE'

  const interroger = async () => {
    setEnvoi(true)
    try { setVerif(await adminApi.prestataire(t.idTransaction)) } catch (ex) { show(`⚠️ ${ex.message}`) } finally { setEnvoi(false) }
  }
  const decider = async (confirmer) => {
    if (motif.trim().length < 3) { show('⚠️ Indiquez le motif de votre décision.'); return }
    const txt = confirmer ? `Confirmer ce paiement et créditer ${t.nbVoix} voix à ${t.candidatNom} ?` : 'Rejeter ce paiement ? Aucune voix ne sera créditée.'
    if (!confirm(txt)) return
    setEnvoi(true)
    try {
      const n = confirmer ? await adminApi.confirmer(t.idTransaction, motif.trim()) : await adminApi.rejeter(t.idTransaction, motif.trim())
      show(confirmer ? '✅ Paiement confirmé, voix créditées' : '✅ Paiement rejeté'); onChange(n)
    } catch (ex) { show(`⚠️ ${ex.message}`) } finally { setEnvoi(false) }
  }

  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div className="modal-box modal-large" role="dialog" aria-modal="true" aria-labelledby="tx-titre"
        initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <button className="mclose" onClick={onClose} aria-label="Fermer">×</button>
        <h3 id="tx-titre">Transaction n° {t.idTransaction} <span className={`badge ${TX_BADGE[t.statut]}`}>{TX_LABEL[t.statut]}</span></h3>
        <dl className="fiche" style={{ marginTop: 14 }}>
          <dt>Référence</dt><dd><code>{t.reference}</code></dd>
          <dt>Créée</dt><dd>{fmtDate(t.dateCreation)}</dd>
          {t.dateConfirmation && <><dt>Confirmée</dt><dd>{fmtDate(t.dateConfirmation)}</dd></>}
          <dt>Organisateur</dt><dd>{t.organisateurNom}</dd>
          <dt>Concours</dt><dd>{t.concoursTitre}</dd>
          <dt>Candidat</dt><dd>{t.candidatNom} · {fmt(t.nbVoix)} voix</dd>
          <dt>Payé</dt><dd><b>{fmt(t.montant)} FCFA</b>{t.fraisService > 0 && <> dont frais de service {fmtTaux(t.tauxFrais)} = {fmt(t.fraisService)} F</>}</dd>
          <dt>Partage</dt><dd>voix {fmt(t.montant - t.fraisService)} F · commission {fmtTaux(t.tauxCommission)} = {fmt(t.montantCommission)} F · organisateur {fmt(t.montantOrganisateur)} F</dd>
          <dt>Payeur</dt><dd>{t.operateur} · {t.telephone}</dd>
          {t.providerTxnId && <><dt>Réf. prestataire</dt><dd>{t.providerTxnId}</dd></>}
          {t.message && <><dt>Message</dt><dd>{t.message}</dd></>}
          {t.resoluPar && <><dt>Tranché par</dt><dd>{t.resoluPar} · {fmtDate(t.dateResolution)}</dd></>}
          {t.idReversement && <><dt>Reversement</dt><dd>n° {t.idReversement}</dd></>}
        </dl>

        {tranchable && (
          <div className="sous-form">
            <h3>Traitement manuel</h3>
            <button className="btn btn-sm btn-ghost" onClick={interroger} disabled={envoi}>🔎 Interroger le prestataire</button>
            {verif && (
              <div className={`banner ${verif.etat === 'REUSSI' && verif.montantPaye === verif.montantAttendu ? 'banner-ok' : 'banner-warn'}`}>
                Prestataire : <b>{verif.etat}</b> · payé {verif.montantPaye != null ? `${fmt(verif.montantPaye)} F` : '—'} / attendu {fmt(verif.montantAttendu)} F
                {verif.message ? ` · ${verif.message}` : ''}
              </div>
            )}
            <div className="field" style={{ marginTop: 14 }}><label htmlFor="tx-motif">Motif de la décision (tracé)</label>
              <input id="tx-motif" maxLength={250} value={motif} onChange={(e) => setMotif(e.target.value)} placeholder="Ex. paiement vérifié sur le relevé Aangaraa" />
            </div>
            <div className="row-acts">
              <button className="btn btn-gold btn-sm" disabled={envoi} onClick={() => decider(true)}>✓ Confirmer et créditer</button>
              <button className="btn btn-danger btn-sm" disabled={envoi} onClick={() => decider(false)}>✕ Rejeter</button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

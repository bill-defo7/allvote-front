import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Seo from '../../../components/Seo'
import { Chargement, Erreur } from '../../../components/Etat'
import { useToast } from '../../../context/ToastContext'
import { adminApi } from '../../../api/endpoints'
import { useApi } from '../../../api/useApi'
import { fmtDate, fmtTaux, ORGA_LABEL, ORGA_BADGE } from '../../../utils/helpers'

export default function OrganisateurFiche() {
  const { id } = useParams()
  const charge = useApi(() => adminApi.organisateur(id), [id])
  if (charge.loading) return <Chargement />
  if (charge.error) return <Erreur error={charge.error} onRetry={charge.recharger} />
  return <Fiche key={id} initial={charge.data} />
}

function Fiche({ initial }) {
  const { show } = useToast()
  const [o, setO] = useState(initial)
  const [motif, setMotif] = useState('')
  const [taux, setTaux] = useState(initial.tauxCommission ?? '')
  const [envoi, setEnvoi] = useState(false)

  const action = async (fn, msg) => {
    setEnvoi(true)
    try { setO(await fn()); show(`✅ ${msg}`); setMotif(''); return true }
    catch (ex) { show(`⚠️ ${ex.message}`); return false }
    finally { setEnvoi(false) }
  }
  const avecMotif = (fn, msg) => {
    if (motif.trim().length < 3) { show('⚠️ Indiquez un motif (il sera communiqué à l\'organisateur).'); return }
    action(() => fn(o.idOrganisateur, motif.trim()), msg)
  }
  const enregistrerTaux = (valeur) => {
    if (valeur !== null && (valeur === '' || Number(valeur) < 0 || Number(valeur) > 100)) { show('⚠️ Taux entre 0 et 100 %.'); return }
    action(() => adminApi.commission(o.idOrganisateur, valeur === null ? null : Number(valeur)),
      valeur === null ? 'Taux par défaut rétabli' : 'Commission enregistrée').then((ok) => { if (ok && valeur === null) setTaux('') })
  }

  const r = o.responsable
  return (
    <>
      <Seo path="/espace/organisateurs" title={o.nom} noindex />
      <div className="admin-top">
        <h1>{o.nom}</h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span className={`badge ${ORGA_BADGE[o.statut]}`}>{ORGA_LABEL[o.statut]}</span>
          <Link to="/espace/organisateurs" className="btn btn-sm btn-ghost">← Organisateurs</Link>
        </div>
      </div>

      <div className="grid-2 grille-fiche">
        <div className="panel">
          <h2>Organisation</h2>
          <dl className="fiche">
            <dt>Email</dt><dd>{o.email}</dd>
            <dt>Téléphone</dt><dd>{o.telephone || '—'}</dd>
            <dt>Ville</dt><dd>{o.ville || '—'}</dd>
            <dt>Adresse publique</dt><dd>{o.statut === 'VALIDE' ? <a className="lien" href={`/o/${o.slug}`} target="_blank" rel="noopener noreferrer">/o/{o.slug}</a> : `/o/${o.slug}`}</dd>
            <dt>Inscription</dt><dd>{fmtDate(o.dateCreation)}</dd>
            <dt>Validation</dt><dd>{o.dateValidation ? fmtDate(o.dateValidation) : '—'}</dd>
            <dt>Événements</dt><dd>{o.nbEvenements} · <Link className="lien" to={`/espace/moderation?idOrganisateur=${o.idOrganisateur}`}>voir</Link> · <Link className="lien" to={`/espace/paiements?idOrganisateur=${o.idOrganisateur}`}>paiements</Link></dd>
            {o.motif && <><dt>Dernier motif</dt><dd>{o.motif}</dd></>}
          </dl>
          {o.description && <p className="hint pre" style={{ marginTop: 12 }}>{o.description}</p>}
        </div>
        <div className="panel">
          <h2>Responsable</h2>
          {r ? (
            <dl className="fiche">
              <dt>Nom</dt><dd>{r.prenom} {r.nom}</dd>
              <dt>Email</dt><dd><a className="lien" href={`mailto:${r.email}`}>{r.email}</a></dd>
              <dt>Téléphone</dt><dd>{r.telephone || '—'}</dd>
            </dl>
          ) : <p className="hint">Aucun responsable.</p>}
          <h2 style={{ marginTop: 20 }}>Reversements</h2>
          <dl className="fiche">
            <dt>Numéro</dt><dd>{o.numeroReversement || <span className="hint">non renseigné</span>}</dd>
            <dt>Opérateur</dt><dd>{o.operateurReversement || '—'}</dd>
          </dl>
        </div>
      </div>

      <div className="panel">
        <h2>Décision</h2>
        {(o.statut === 'EN_ATTENTE' || o.statut === 'VALIDE') && (
          <div className="field"><label htmlFor="motif">Motif (obligatoire pour refuser ou suspendre — visible par l'organisateur)</label>
            <input id="motif" maxLength={250} value={motif} onChange={(e) => setMotif(e.target.value)} placeholder="Ex. informations incomplètes" />
          </div>
        )}
        <div className="row-acts">
          {(o.statut === 'EN_ATTENTE' || o.statut === 'REFUSE') && (
            <button className="btn btn-gold btn-sm" disabled={envoi} onClick={() => action(() => adminApi.valider(o.idOrganisateur), 'Organisation validée 🎉')}>✓ Valider</button>
          )}
          {o.statut === 'EN_ATTENTE' && (
            <button className="btn btn-danger btn-sm" disabled={envoi} onClick={() => avecMotif(adminApi.refuser, 'Inscription refusée')}>✕ Refuser</button>
          )}
          {o.statut === 'VALIDE' && (
            <button className="btn btn-danger btn-sm" disabled={envoi} onClick={() => {
              if (confirm(`Suspendre « ${o.nom} » ? Ses membres seront déconnectés et ses votes bloqués immédiatement.`)) avecMotif(adminApi.suspendre, 'Organisation suspendue')
            }}>⛔ Suspendre</button>
          )}
          {o.statut === 'SUSPENDU' && (
            <button className="btn btn-gold btn-sm" disabled={envoi} onClick={() => action(() => adminApi.reactiver(o.idOrganisateur), 'Organisation réactivée')}>↺ Réactiver</button>
          )}
        </div>
      </div>

      <div className="panel">
        <h2>Commission</h2>
        <p className="hint" style={{ marginBottom: 12 }}>
          Taux appliqué : <b>{fmtTaux(o.tauxApplique)}</b>{o.tauxCommission == null ? ' (taux par défaut de la plateforme)' : ' (taux propre à cette organisation)'}.
          Un changement ne s'applique qu'aux nouveaux votes.
        </p>
        <div className="ajout-ligne">
          <input type="number" min="0" max="100" step="0.5" value={taux} onChange={(e) => setTaux(e.target.value)} placeholder="Taux en %" aria-label="Taux de commission en %" style={{ maxWidth: 180 }} />
          <button className="btn btn-sm btn-gold" disabled={envoi} onClick={() => enregistrerTaux(taux)}>Appliquer</button>
          {o.tauxCommission != null && <button className="btn btn-sm btn-ghost" disabled={envoi} onClick={() => enregistrerTaux(null)}>Revenir au taux par défaut</button>}
        </div>
      </div>
    </>
  )
}

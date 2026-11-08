import { Link } from 'react-router-dom'
import Seo from '../../../components/Seo'
import { Chargement, Erreur } from '../../../components/Etat'
import { adminApi } from '../../../api/endpoints'
import { useApi } from '../../../api/useApi'
import { fmt, fmtTaux } from '../../../utils/helpers'

export default function AdminTableau() {
  const { data: d, error, loading, recharger } = useApi(() => adminApi.tableauBord(), [], { refreshMs: 60000 })
  if (loading) return <Chargement />
  if (error) return <Erreur error={error} onRetry={recharger} />
  return (
    <>
      <Seo path="/espace" title="Administration" noindex />
      <div className="admin-top">
        <h1>Tableau de bord <span className="gold-text">AllVote</span></h1>
        <button className="btn btn-sm btn-ghost" onClick={recharger}>↻ Actualiser</button>
      </div>

      {d.organisateursEnAttente > 0 && (
        <div className="banner banner-warn bandeau-action">
          <span>⏳ <b>{d.organisateursEnAttente}</b> organisation(s) attendent votre validation.</span>
          <Link to="/espace/organisateurs?statut=EN_ATTENTE" className="btn btn-sm btn-gold">Traiter</Link>
        </div>
      )}
      {d.transactionsAVerifier > 0 && (
        <div className="banner banner-err bandeau-action">
          <span>⚠️ <b>{d.transactionsAVerifier}</b> paiement(s) à vérifier.</span>
          <Link to="/espace/paiements?statut=A_VERIFIER" className="btn btn-sm btn-gold">Vérifier</Link>
        </div>
      )}

      <h2 className="form-sec">Organisateurs</h2>
      <div className="stat-row">
        <div className="stat"><div className="v">{fmt(d.organisateursEnAttente)}</div><div className="l">En attente</div></div>
        <div className="stat"><div className="v">{fmt(d.organisateursValides)}</div><div className="l">Validés</div></div>
        <div className="stat"><div className="v">{fmt(d.organisateursSuspendus)}</div><div className="l">Suspendus</div></div>
        <div className="stat"><div className="v">{fmt(d.evenementsPublies)}</div><div className="l">Événements publiés</div></div>
      </div>

      <h2 className="form-sec">Argent (paiements confirmés, FCFA)</h2>
      <div className="stat-row">
        <div className="stat"><div className="v">{fmt(d.encaisse)}</div><div className="l">Encaissé · {fmt(d.transactionsConfirmees)} paiements</div></div>
        <div className="stat"><div className="v">{fmt(d.partOrganisateurs)}</div><div className="l">Part des organisateurs</div></div>
        <div className="stat"><div className="v">{fmt(d.commissionAllVote)}</div><div className="l">Commission AllVote</div></div>
        <div className="stat"><div className="v">{fmt(d.fraisService)}</div><div className="l">Frais de service</div></div>
        <div className="stat stat-or"><div className="v">{fmt(d.revenuAllVote)}</div><div className="l">Revenu AllVote (commission + frais)</div></div>
      </div>
      <div className="stat-row">
        <div className="stat"><div className="v">{fmt(d.resteAReverser)}</div><div className="l">Reste à reverser</div></div>
        <div className="stat"><div className="v">{fmt(d.reversementsAPayer)}</div><div className="l">Reversements à payer</div></div>
        <div className="stat"><div className="v">{fmt(d.dejaReverse)}</div><div className="l">Déjà reversé</div></div>
      </div>

      <h2 className="form-sec">Paiements</h2>
      <div className="stat-row">
        <div className="stat"><div className="v">{fmt(d.transactionsEnAttente)}</div><div className="l">En attente de validation</div></div>
        <div className="stat"><div className="v">{fmt(d.transactionsAVerifier)}</div><div className="l">À vérifier</div></div>
        <div className="stat"><div className="v">{fmtTaux(d.tauxCommissionDefaut)}</div><div className="l">Commission par défaut</div></div>
        <div className="stat"><div className="v">{fmtTaux(d.fraisVotantPourcentage)}</div><div className="l">Frais de service votant</div></div>
      </div>
    </>
  )
}

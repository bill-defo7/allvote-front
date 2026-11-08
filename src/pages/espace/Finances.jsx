import Seo from '../../components/Seo'
import Permis from '../../components/espace/Permis'
import { Chargement, Erreur } from '../../components/Etat'
import { orgaApi } from '../../api/endpoints'
import { useApi } from '../../api/useApi'
import { fmt } from '../../utils/helpers'

export default function Finances() {
  return <Permis p="FINANCE_VOIR"><Tableau /></Permis>
}

function Tableau() {
  const { data: f, error, loading, recharger } = useApi(() => orgaApi.finances(), [])
  if (loading) return <Chargement />
  if (error) return <Erreur error={error} onRetry={recharger} />
  const taux = Number(f.tauxCommissionActuel).toLocaleString('fr-FR')

  return (
    <>
      <Seo path="/espace/finances" title="Finances" noindex />
      <div className="admin-top">
        <h1><span className="gold-text">Finances</span></h1>
        <button className="btn btn-sm btn-ghost" onClick={recharger}>↻ Actualiser</button>
      </div>

      <div className="stat-row">
        <div className="stat"><div className="v">{fmt(f.encaisse)}</div><div className="l">Valeur des voix (FCFA)</div></div>
        <div className="stat"><div className="v">{fmt(f.commission)}</div><div className="l">Commission AllVote</div></div>
        <div className="stat"><div className="v">{fmt(f.partOrganisateur)}</div><div className="l">Votre part</div></div>
      </div>
      <div className="stat-row">
        <div className="stat"><div className="v">{fmt(f.dejaReverse)}</div><div className="l">Déjà reversé</div></div>
        <div className="stat"><div className="v">{fmt(f.reversementEnCours)}</div><div className="l">Reversement en cours</div></div>
        <div className="stat stat-or"><div className="v">{fmt(f.resteAReverser)}</div><div className="l">Reste à reverser</div></div>
      </div>

      <div className="panel">
        <h2>Comment ça marche ?</h2>
        <p className="hint">
          Chaque vote est payé sur le compte AllVote. Sur chaque paiement confirmé, AllVote garde sa commission
          (actuellement <b>{taux} %</b> pour votre organisation, figée au moment du vote) et vous reverse le reste
          par Mobile Money, sur le numéro indiqué dans votre profil. Les frais de service payés en plus par le votant
          couvrent le prestataire de paiement et ne sont pas déduits de votre part.
          {f.transactionsAVerifier > 0 && <> <b>{f.transactionsAVerifier}</b> paiement(s) sont en cours de vérification et ne sont pas encore comptés.</>}
        </p>
      </div>

      <div className="panel">
        <h2>Par concours</h2>
        {f.parConcours.length === 0 && <p className="hint">Aucun paiement confirmé pour le moment.</p>}
        {f.parConcours.length > 0 && (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Concours</th><th>Paiements</th><th>Voix</th><th>Valeur</th><th>Commission</th><th>Votre part</th></tr></thead>
              <tbody>
                {f.parConcours.map((c) => (
                  <tr key={c.idConcours}>
                    <td><b>{c.titre}</b></td>
                    <td>{fmt(c.nbTransactions)}</td>
                    <td>{fmt(c.voix)}</td>
                    <td>{fmt(c.encaisse)} F</td>
                    <td>{fmt(c.commission)} F</td>
                    <td><b>{fmt(c.partOrganisateur)} F</b></td>
                  </tr>
                ))}
                <tr className="total-ligne">
                  <td>Total</td><td>{fmt(f.nbTransactions)}</td><td>{fmt(f.voix)}</td>
                  <td>{fmt(f.encaisse)} F</td><td>{fmt(f.commission)} F</td><td>{fmt(f.partOrganisateur)} F</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

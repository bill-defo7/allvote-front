import { useState } from 'react'
import Seo from '../../../components/Seo'
import { MotDePasse } from '../Profil'
import { Chargement, Erreur } from '../../../components/Etat'
import { useToast } from '../../../context/ToastContext'
import { adminApi } from '../../../api/endpoints'
import { useApi } from '../../../api/useApi'
import { fmtTaux } from '../../../utils/helpers'

const CLE_TAUX = 'taux_commission_defaut'
const CLE_FRAIS = 'frais_votant_pourcentage'

export default function Parametres() {
  const { data, error, loading, recharger, reload } = useApi(() => adminApi.parametres(), [])
  return (
    <>
      <Seo path="/espace/parametres" title="Paramètres" noindex />
      <div className="admin-top"><h1><span className="gold-text">Paramètres</span></h1></div>
      {loading && <Chargement />}
      {error && <Erreur error={error} onRetry={recharger} />}
      {data && <Commission actuel={data.find((p) => p.cle === CLE_TAUX)?.valeur} onSaved={reload} />}
      {data && <FraisVotant actuel={data.find((p) => p.cle === CLE_FRAIS)?.valeur} onSaved={reload} />}
      <MotDePasse />
    </>
  )
}

function Commission({ actuel, onSaved }) {
  const { show } = useToast()
  const [taux, setTaux] = useState(actuel ?? '20')
  const [envoi, setEnvoi] = useState(false)

  const enregistrer = async (e) => {
    e.preventDefault()
    const v = Number(taux)
    if (taux === '' || Number.isNaN(v) || v < 0 || v > 100) { show('⚠️ Taux entre 0 et 100 %.'); return }
    if (!confirm(`Passer la commission par défaut de ${fmtTaux(actuel)} à ${fmtTaux(v)} ? Seuls les NOUVEAUX votes seront concernés.`)) return
    setEnvoi(true)
    try { await adminApi.commissionDefaut(v); show('✅ Commission par défaut modifiée'); onSaved() }
    catch (ex) { show(`⚠️ ${ex.message}`) } finally { setEnvoi(false) }
  }

  return (
    <form className="panel" onSubmit={enregistrer} noValidate>
      <h2>Commission par défaut</h2>
      <p className="hint" style={{ marginBottom: 12 }}>
        Actuellement <b>{fmtTaux(actuel)}</b>. S'applique aux organisateurs sans taux propre, et uniquement aux nouveaux votes :
        chaque transaction garde le taux en vigueur au moment du vote.
      </p>
      <div className="ajout-ligne">
        <input type="number" min="0" max="100" step="0.5" value={taux} onChange={(e) => setTaux(e.target.value)} aria-label="Taux en %" style={{ maxWidth: 180 }} />
        <button className="btn btn-sm btn-gold" type="submit" disabled={envoi}>Enregistrer</button>
      </div>
    </form>
  )
}

function FraisVotant({ actuel, onSaved }) {
  const { show } = useToast()
  const [taux, setTaux] = useState(actuel ?? '5')
  const [envoi, setEnvoi] = useState(false)

  const enregistrer = async (e) => {
    e.preventDefault()
    const v = Number(taux)
    if (taux === '' || Number.isNaN(v) || v < 0 || v > 100) { show('⚠️ Taux entre 0 et 100 %.'); return }
    if (!confirm(`Passer les frais de service votant de ${fmtTaux(actuel)} à ${fmtTaux(v)} ? Seuls les NOUVEAUX votes seront concernés.`)) return
    setEnvoi(true)
    try { await adminApi.fraisVotant(v); show('✅ Frais de service modifiés'); onSaved() }
    catch (ex) { show(`⚠️ ${ex.message}`) } finally { setEnvoi(false) }
  }

  return (
    <form className="panel" onSubmit={enregistrer} noValidate>
      <h2>Frais de service (payés par le votant)</h2>
      <p className="hint" style={{ marginBottom: 12 }}>
        Actuellement <b>{fmtTaux(actuel)}</b>, ajoutés au prix des voix et arrondis au franc supérieur
        (ex. 1 voix à 100 F → le votant paie {100 + Math.ceil(100 * Number(actuel ?? 5) / 100)} F).
        Ils reviennent à AllVote pour couvrir les frais du prestataire de paiement et n'entrent pas dans la part de l'organisateur.
      </p>
      <div className="ajout-ligne">
        <input type="number" min="0" max="100" step="0.5" value={taux} onChange={(e) => setTaux(e.target.value)} aria-label="Frais de service en %" style={{ maxWidth: 180 }} />
        <button className="btn btn-sm btn-gold" type="submit" disabled={envoi}>Enregistrer</button>
      </div>
    </form>
  )
}

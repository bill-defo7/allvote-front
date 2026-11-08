import { useState } from 'react'
import Seo from '../../components/Seo'
import Permis from '../../components/espace/Permis'
import { Chargement, Erreur } from '../../components/Etat'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { orgaApi } from '../../api/endpoints'
import { useApi } from '../../api/useApi'
import { fmtDate } from '../../utils/helpers'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MDP_RE = /^(?=.*[A-Za-z])(?=.*\d).{10,128}$/
const VIDE = { prenom: '', nom: '', email: '', telephone: '', motDePasseProvisoire: '' }

export default function Membres() {
  return <Permis p="MEMBRE_GERER"><Gestion /></Permis>
}

function Gestion() {
  const { utilisateur } = useAuth()
  const { show } = useToast()
  const { data, error, loading, recharger, reload } = useApi(() => orgaApi.membres(), [])
  const [f, setF] = useState(VIDE)
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))

  const ajouter = async (e) => {
    e.preventDefault()
    if (!f.prenom.trim() || !f.nom.trim()) { setErreur('Nom et prénom obligatoires.'); return }
    if (!EMAIL_RE.test(f.email.trim())) { setErreur('Email invalide.'); return }
    if (!MDP_RE.test(f.motDePasseProvisoire)) { setErreur('Mot de passe : 10 caractères minimum, avec une lettre et un chiffre.'); return }
    setEnvoi(true); setErreur('')
    try {
      await orgaApi.ajouterMembre({ ...f, email: f.email.trim(), telephone: f.telephone.trim() || null })
      show(`✅ Membre ajouté — transmettez-lui son mot de passe provisoire`)
      setF(VIDE); reload()
    } catch (ex) { setErreur(ex.message) } finally { setEnvoi(false) }
  }

  const action = async (fn, msg) => {
    try { await fn(); show(`✅ ${msg}`); reload() } catch (ex) { show(`⚠️ ${ex.message}`) }
  }

  return (
    <>
      <Seo path="/espace/membres" title="Membres" noindex />
      <div className="admin-top"><h1><span className="gold-text">Membres</span> de l'organisation</h1></div>
      <p className="hint" style={{ marginBottom: 16 }}>
        Un membre peut créer et modifier les événements, concours et candidats. Il n'a accès ni à l'argent, ni à la publication, ni aux membres.
      </p>

      <div className="panel">
        <h2>Équipe</h2>
        {loading && <Chargement />}
        {error && <Erreur error={error} onRetry={recharger} />}
        {data && (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Dernière connexion</th><th>État</th><th /></tr></thead>
              <tbody>
                {data.map((m) => {
                  const responsable = m.roles.includes('ORGA_ADMIN')
                  const moi = m.idUtilisateur === utilisateur?.idUtilisateur
                  return (
                    <tr key={m.idUtilisateur}>
                      <td><b>{m.prenom} {m.nom}</b>{moi && <span className="hint"> (vous)</span>}</td>
                      <td>{m.email}</td>
                      <td>{responsable ? 'Responsable' : 'Membre'}</td>
                      <td>{m.derniereConnexion ? fmtDate(m.derniereConnexion) : '—'}</td>
                      <td><span className={`badge ${m.actif ? 'b-open' : 'b-closed'}`}>{m.actif ? 'Actif' : 'Désactivé'}</span></td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {!responsable && !moi && <>
                          <button className="btn btn-sm btn-ghost" onClick={() => action(() => orgaApi.activerMembre(m.idUtilisateur, !m.actif), m.actif ? 'Membre désactivé' : 'Membre réactivé')}>
                            {m.actif ? 'Désactiver' : 'Réactiver'}
                          </button>{' '}
                          <button className="btn btn-sm btn-danger" onClick={() => {
                            if (confirm(`Supprimer le compte de ${m.prenom} ${m.nom} ?`)) action(() => orgaApi.supprimerMembre(m.idUtilisateur), 'Membre supprimé')
                          }}>✕</button>
                        </>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <form className="panel" onSubmit={ajouter} noValidate>
        <h2>Ajouter un membre</h2>
        <div className="grid-2">
          <div className="field"><label htmlFor="m-prenom">Prénom *</label><input id="m-prenom" maxLength={80} value={f.prenom} onChange={set('prenom')} /></div>
          <div className="field"><label htmlFor="m-nom">Nom *</label><input id="m-nom" maxLength={80} value={f.nom} onChange={set('nom')} /></div>
        </div>
        <div className="grid-2">
          <div className="field"><label htmlFor="m-email">Email (identifiant) *</label><input id="m-email" type="email" maxLength={120} value={f.email} onChange={set('email')} /></div>
          <div className="field"><label htmlFor="m-tel">Téléphone</label><input id="m-tel" type="tel" placeholder="6 XX XX XX XX" value={f.telephone} onChange={set('telephone')} /></div>
        </div>
        <div className="field"><label htmlFor="m-mdp">Mot de passe provisoire *</label>
          <input id="m-mdp" type="text" autoComplete="off" value={f.motDePasseProvisoire} onChange={set('motDePasseProvisoire')} placeholder="10 caractères, une lettre et un chiffre" />
          <div className="hint" style={{ marginTop: 4 }}>Communiquez-le au membre : il pourra le changer dans son profil.</div>
        </div>
        {erreur && <div className="err" style={{ marginBottom: 12 }}>⚠️ {erreur}</div>}
        <button className="btn btn-gold" type="submit" disabled={envoi}>{envoi ? 'Ajout…' : 'Ajouter le membre'}</button>
      </form>
    </>
  )
}

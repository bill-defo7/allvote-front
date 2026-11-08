import { useState } from 'react'
import Seo from '../../components/Seo'
import ImageUpload from '../../components/espace/ImageUpload'
import { Chargement, Erreur } from '../../components/Etat'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { authApi, orgaApi } from '../../api/endpoints'
import { useApi } from '../../api/useApi'
import { ORGA_LABEL } from '../../utils/helpers'

const PHONE_RE = /^(\+?237)?\s*6(\s*\d){8}$/
const MDP_RE = /^(?=.*[A-Za-z])(?=.*\d).{10,128}$/

export default function Profil() {
  const { peut } = useAuth()
  const charge = useApi(() => orgaApi.profil(), [])
  return (
    <>
      <Seo path="/espace/profil" title="Profil" noindex />
      <div className="admin-top"><h1><span className="gold-text">Profil</span></h1></div>
      {charge.loading && <Chargement />}
      {charge.error && <Erreur error={charge.error} onRetry={charge.recharger} />}
      {charge.data && <ProfilOrga initial={charge.data} modifiable={peut('PROFIL_GERER')} />}
      <MotDePasse />
    </>
  )
}

function ProfilOrga({ initial, modifiable }) {
  const { show } = useToast()
  const { rafraichir } = useAuth()
  const [p, setP] = useState(initial)
  const [f, setF] = useState({
    nom: initial.nom, description: initial.description || '', logoUrl: initial.logoUrl, email: initial.email,
    telephone: initial.telephone || '', ville: initial.ville || '',
    numeroReversement: initial.numeroReversement || '', operateurReversement: initial.operateurReversement || '',
  })
  const [errors, setErrors] = useState({})
  const [envoi, setEnvoi] = useState(false)
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }))

  const enregistrer = async (e) => {
    e.preventDefault()
    const er = {}
    if (f.nom.trim().length < 3) er.nom = '3 caractères minimum.'
    if (f.telephone && !PHONE_RE.test(f.telephone.trim())) er.telephone = 'Numéro invalide (6XXXXXXXX).'
    if (f.numeroReversement && !PHONE_RE.test(f.numeroReversement.trim())) er.numeroReversement = 'Numéro invalide (6XXXXXXXX).'
    if (f.numeroReversement && !f.operateurReversement) er.operateurReversement = 'Choisissez l\'opérateur.'
    setErrors(er)
    if (Object.keys(er).length) return
    setEnvoi(true)
    try {
      const r = await orgaApi.modifierProfil({
        nom: f.nom.trim(), description: f.description.trim() || null, logoUrl: f.logoUrl, email: f.email.trim(),
        telephone: f.telephone.trim() || null, ville: f.ville.trim() || null,
        numeroReversement: f.numeroReversement.trim() || null, operateurReversement: f.operateurReversement || null,
      })
      setP(r); show('✅ Profil enregistré'); rafraichir().catch(() => {})
    } catch (ex) {
      if (ex.champs) setErrors(ex.champs)
      show(`⚠️ ${ex.message}`)
    } finally { setEnvoi(false) }
  }

  const taux = Number(p.tauxCommission).toLocaleString('fr-FR')
  return (
    <form className="panel" onSubmit={enregistrer} noValidate>
      <h2>Organisation</h2>
      <p className="hint" style={{ marginBottom: 16 }}>
        Statut : <b>{ORGA_LABEL[p.statut]}</b> · Adresse publique : <b>/o/{p.slug}</b> · Commission AllVote : <b>{taux} %</b>
      </p>
      <fieldset disabled={!modifiable} className="fs">
        <div className="grid-2">
          <div className="field"><label htmlFor="p-nom">Nom *</label>
            <input id="p-nom" maxLength={120} value={f.nom} className={errors.nom ? 'invalid' : ''} onChange={(e) => set('nom', e.target.value)} />
            {errors.nom && <div className="err">{errors.nom}</div>}
          </div>
          <div className="field"><label htmlFor="p-ville">Ville</label>
            <input id="p-ville" maxLength={80} value={f.ville} onChange={(e) => set('ville', e.target.value)} />
          </div>
        </div>
        <div className="grid-2">
          <div className="field"><label htmlFor="p-email">Email de contact *</label>
            <input id="p-email" type="email" maxLength={120} value={f.email} onChange={(e) => set('email', e.target.value)} />
          </div>
          <div className="field"><label htmlFor="p-tel">Téléphone</label>
            <input id="p-tel" type="tel" value={f.telephone} className={errors.telephone ? 'invalid' : ''} onChange={(e) => set('telephone', e.target.value)} />
            {errors.telephone && <div className="err">{errors.telephone}</div>}
          </div>
        </div>
        <div className="field"><label htmlFor="p-desc">Présentation</label>
          <textarea id="p-desc" rows={3} maxLength={2000} value={f.description} onChange={(e) => set('description', e.target.value)} />
        </div>
        <ImageUpload id="p-logo" label="Logo" rond value={f.logoUrl} onChange={(u) => set('logoUrl', u)} />

        <h3 className="form-sec">Reversements</h3>
        <p className="hint" style={{ marginBottom: 12 }}>AllVote vous reverse votre part sur ce numéro Mobile Money.</p>
        <div className="grid-2">
          <div className="field"><label htmlFor="p-num">Numéro Mobile Money</label>
            <input id="p-num" type="tel" placeholder="6 XX XX XX XX" value={f.numeroReversement} className={errors.numeroReversement ? 'invalid' : ''}
              onChange={(e) => set('numeroReversement', e.target.value)} />
            {errors.numeroReversement && <div className="err">{errors.numeroReversement}</div>}
          </div>
          <div className="field"><label htmlFor="p-op">Opérateur</label>
            <select id="p-op" value={f.operateurReversement} className={errors.operateurReversement ? 'invalid' : ''} onChange={(e) => set('operateurReversement', e.target.value)}>
              <option value="">— Choisir —</option><option value="MTN">MTN Mobile Money</option><option value="ORANGE">Orange Money</option>
            </select>
            {errors.operateurReversement && <div className="err">{errors.operateurReversement}</div>}
          </div>
        </div>
        {modifiable && <button className="btn btn-gold" type="submit" disabled={envoi}>{envoi ? 'Enregistrement…' : 'Enregistrer le profil'}</button>}
      </fieldset>
      {!modifiable && <p className="hint">Seul le responsable de l'organisation peut modifier ces informations.</p>}
    </form>
  )
}

export function MotDePasse() {
  const { show } = useToast()
  const [f, setF] = useState({ ancien: '', nouveau: '', confirmation: '' })
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))

  const changer = async (e) => {
    e.preventDefault()
    if (!f.ancien) { setErreur('Saisissez votre mot de passe actuel.'); return }
    if (!MDP_RE.test(f.nouveau)) { setErreur('Nouveau mot de passe : 10 caractères minimum, avec une lettre et un chiffre.'); return }
    if (f.nouveau !== f.confirmation) { setErreur('Les deux mots de passe ne correspondent pas.'); return }
    setEnvoi(true); setErreur('')
    try { await authApi.changerMotDePasse(f.ancien, f.nouveau); show('✅ Mot de passe modifié'); setF({ ancien: '', nouveau: '', confirmation: '' }) }
    catch (ex) { setErreur(ex.message) } finally { setEnvoi(false) }
  }

  return (
    <form className="panel" onSubmit={changer} noValidate>
      <h2>Mon mot de passe</h2>
      <div className="grid-3">
        <div className="field"><label htmlFor="pw-a">Actuel</label><input id="pw-a" type="password" autoComplete="current-password" value={f.ancien} onChange={set('ancien')} /></div>
        <div className="field"><label htmlFor="pw-n">Nouveau</label><input id="pw-n" type="password" autoComplete="new-password" value={f.nouveau} onChange={set('nouveau')} /></div>
        <div className="field"><label htmlFor="pw-c">Confirmation</label><input id="pw-c" type="password" autoComplete="new-password" value={f.confirmation} onChange={set('confirmation')} /></div>
      </div>
      {erreur && <div className="err" style={{ marginBottom: 12 }}>⚠️ {erreur}</div>}
      <button className="btn btn-gold btn-sm" type="submit" disabled={envoi}>{envoi ? 'Modification…' : 'Changer le mot de passe'}</button>
    </form>
  )
}

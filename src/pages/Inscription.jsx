import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Seo from '../components/Seo'
import { publicApi } from '../api/endpoints'
import { mark } from '../assets/brand'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^(\+?237)?\s*6(\s*\d){8}$/
const MDP_RE = /^(?=.*[A-Za-z])(?=.*\d).{10,128}$/

const VIDE = {
  nomOrganisation: '', ville: '', description: '', emailOrganisation: '',
  nom: '', prenom: '', email: '', telephone: '', motDePasse: '', confirmation: '', accepteCgu: false, website: '',
}

/** Inscription d'une organisation + de son responsable. Statut EN_ATTENTE jusqu'à validation AllVote. */
export default function Inscription() {
  const [f, setF] = useState(VIDE)
  const [errors, setErrors] = useState({})
  const [envoi, setEnvoi] = useState(false)
  const [ok, setOk] = useState(null)

  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const valider = () => {
    const e = {}
    if (f.nomOrganisation.trim().length < 3) e.nomOrganisation = '3 caractères minimum.'
    if (f.emailOrganisation && !EMAIL_RE.test(f.emailOrganisation.trim())) e.emailOrganisation = 'Email invalide.'
    if (!f.nom.trim()) e.nom = 'Obligatoire.'
    if (!f.prenom.trim()) e.prenom = 'Obligatoire.'
    if (!EMAIL_RE.test(f.email.trim())) e.email = 'Email invalide.'
    if (!PHONE_RE.test(f.telephone.trim())) e.telephone = 'Numéro camerounais invalide (6XXXXXXXX).'
    if (!MDP_RE.test(f.motDePasse)) e.motDePasse = '10 caractères minimum, avec au moins une lettre et un chiffre.'
    if (f.confirmation !== f.motDePasse) e.confirmation = 'Les deux mots de passe ne correspondent pas.'
    if (!f.accepteCgu) e.accepteCgu = 'Vous devez accepter les conditions d\'utilisation.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (ev) => {
    ev.preventDefault()
    if (!valider()) return
    setEnvoi(true)
    try {
      const r = await publicApi.inscription({
        nomOrganisation: f.nomOrganisation.trim(), ville: f.ville, description: f.description,
        emailOrganisation: f.emailOrganisation.trim(), nom: f.nom, prenom: f.prenom,
        email: f.email.trim(), telephone: f.telephone.trim(), motDePasse: f.motDePasse,
        accepteCgu: f.accepteCgu, website: f.website,
      })
      setOk(r)
      window.scrollTo({ top: 0 })
    } catch (e) {
      setErrors({ ...(e.champs || {}), global: e.message })
    } finally {
      setEnvoi(false)
    }
  }

  const champ = (k, label, props = {}) => (
    <div className="field">
      <label htmlFor={k}>{label}</label>
      <input id={k} value={f[k]} onChange={set(k)} className={errors[k] ? 'invalid' : ''} {...props} />
      {errors[k] && <div className="err">{errors[k]}</div>}
    </div>
  )

  return (
    <section className="auth-page">
      <Seo path="/inscription" title="Organiser un vote" description="Créez gratuitement votre espace organisateur AllVote et lancez vos votes en ligne payés par Mobile Money." />
      <div className="container">
        <motion.div className="auth-box auth-wide" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <img src={mark} alt="AllVote" className="auth-logo" width="170" height="50" />

          {ok ? (
            <div className="vote-etat">
              <div className="vote-ico ok">✓</div>
              <h1 className="auth-title">Inscription envoyée</h1>
              <p>{ok.message}</p>
              <p className="hint">Votre espace est déjà accessible : vous pouvez préparer vos événements.
                La publication sera possible dès que l'équipe AllVote aura validé votre organisation.</p>
              <Link to="/connexion" className="btn btn-gold">Me connecter</Link>
            </div>
          ) : (
            <>
              <h1 className="auth-title">Organisez votre <span className="gold-text">vote</span></h1>
              <p className="mc-sub" style={{ textAlign: 'center' }}>Inscription gratuite · validation par l'équipe AllVote sous 48 h</p>

              <form onSubmit={submit} noValidate>
                <input type="text" className="hp" name="website" tabIndex={-1} autoComplete="off" value={f.website}
                  onChange={set('website')} aria-hidden="true" />

                <h2 className="form-sec">Votre organisation</h2>
                {champ('nomOrganisation', 'Nom de l\'organisation *', { placeholder: 'Ex. Département GI — ESTLC', maxLength: 120 })}
                <div className="grid-2">
                  {champ('ville', 'Ville', { placeholder: 'Ex. Ambam', maxLength: 80 })}
                  {champ('emailOrganisation', 'Email de l\'organisation', { type: 'email', placeholder: 'facultatif', maxLength: 120 })}
                </div>
                <div className="field">
                  <label htmlFor="description">Présentation</label>
                  <textarea id="description" rows={3} maxLength={2000} value={f.description} onChange={set('description')}
                    placeholder="Qui êtes-vous ? Quels votes souhaitez-vous organiser ?" />
                </div>

                <h2 className="form-sec">Responsable du compte</h2>
                <div className="grid-2">
                  {champ('prenom', 'Prénom *', { autoComplete: 'given-name', maxLength: 80 })}
                  {champ('nom', 'Nom *', { autoComplete: 'family-name', maxLength: 80 })}
                </div>
                <div className="grid-2">
                  {champ('email', 'Email (identifiant de connexion) *', { type: 'email', autoComplete: 'email', maxLength: 120 })}
                  {champ('telephone', 'Téléphone *', { type: 'tel', inputMode: 'tel', placeholder: '6 XX XX XX XX', autoComplete: 'tel' })}
                </div>
                <div className="grid-2">
                  {champ('motDePasse', 'Mot de passe *', { type: 'password', autoComplete: 'new-password' })}
                  {champ('confirmation', 'Confirmer le mot de passe *', { type: 'password', autoComplete: 'new-password' })}
                </div>
                <p className="hint" style={{ marginTop: -6, marginBottom: 14 }}>10 caractères minimum, avec au moins une lettre et un chiffre.</p>

                <label className="chk">
                  <input type="checkbox" checked={f.accepteCgu} onChange={set('accepteCgu')} />
                  <span>J'accepte les <Link to="/cgu" target="_blank" className="lien">conditions d'utilisation</Link> et
                    la <Link to="/confidentialite" target="_blank" className="lien">politique de confidentialité</Link>.</span>
                </label>
                {errors.accepteCgu && <div className="err" style={{ marginTop: 4 }}>{errors.accepteCgu}</div>}

                {errors.global && <div className="err" role="alert" style={{ margin: '14px 0' }}>⚠️ {errors.global}</div>}
                <button className="btn btn-gold btn-block" type="submit" disabled={envoi} style={{ marginTop: 18 }}>
                  {envoi ? 'Envoi…' : 'Créer mon espace organisateur'}
                </button>
              </form>
              <p className="hint" style={{ textAlign: 'center', marginTop: 18 }}>
                Déjà inscrit ? <Link to="/connexion" className="lien">Se connecter</Link>
              </p>
            </>
          )}
        </motion.div>
      </div>
    </section>
  )
}

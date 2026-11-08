import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Seo from '../components/Seo'
import { useAuth } from '../context/AuthContext'
import { mark } from '../assets/brand'

/** Connexion unique : responsables, membres d'organisation et super-admin. */
export default function Connexion() {
  const { isAuth, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(false)

  const cible = location.state?.from || '/espace'
  if (isAuth) return <Navigate to={cible} replace />

  const submit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password) { setErreur('Saisissez votre email et votre mot de passe.'); return }
    setEnvoi(true); setErreur('')
    try {
      await login(email.trim(), password)
      navigate(cible, { replace: true })
    } catch (err) {
      setErreur(err.message)
      setPassword('')
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <section className="auth-page">
      <Seo path="/connexion" title="Connexion" noindex />
      <div className="container">
        <motion.div className="auth-box" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <img src={mark} alt="AllVote" className="auth-logo" width="170" height="50" />
          <h1 className="auth-title">Espace <span className="gold-text">organisateur</span></h1>
          <p className="mc-sub" style={{ textAlign: 'center' }}>Connectez-vous pour gérer vos événements et vos votes.</p>
          <form onSubmit={submit} noValidate>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="password">Mot de passe</label>
              <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {erreur && <div className="err" role="alert" style={{ marginBottom: 12 }}>⚠️ {erreur}</div>}
            <button className="btn btn-gold btn-block" type="submit" disabled={envoi}>{envoi ? 'Connexion…' : 'Se connecter'}</button>
          </form>
          <p className="hint" style={{ textAlign: 'center', marginTop: 18 }}>
            Pas encore de compte ? <Link to="/inscription" className="lien">Inscrire mon organisation</Link>
          </p>
        </motion.div>
      </div>
    </section>
  )
}

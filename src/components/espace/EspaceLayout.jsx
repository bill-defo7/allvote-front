import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useUi } from '../../context/UiContext'
import { mark } from '../../assets/brand'
import { ORGA_LABEL } from '../../utils/helpers'

/** Menu organisateur : chaque entrée n'apparaît que si le compte a la permission correspondante. */
const MENU_ORGA = [
  { to: '/espace', end: true, ico: '▦', txt: 'Tableau de bord' },
  { to: '/espace/evenements', ico: '🎉', txt: 'Événements', p: 'EVENEMENT_GERER' },
  { to: '/espace/transactions', ico: '🧾', txt: 'Transactions', p: 'TRANSACTION_VOIR' },
  { to: '/espace/finances', ico: '💰', txt: 'Finances', p: 'FINANCE_VOIR' },
  { to: '/espace/membres', ico: '👥', txt: 'Membres', p: 'MEMBRE_GERER' },
  { to: '/espace/profil', ico: '⚙️', txt: 'Profil' },
]

/** Menu super-admin. */
const MENU_ADMIN = [
  { to: '/espace', end: true, ico: '▦', txt: 'Tableau de bord' },
  { to: '/espace/organisateurs', ico: '🏢', txt: 'Organisateurs', p: 'ORGANISATEUR_VALIDER' },
  { to: '/espace/moderation', ico: '🎉', txt: 'Événements', p: 'ORGANISATEUR_VALIDER' },
  { to: '/espace/paiements', ico: '🧾', txt: 'Transactions', p: 'TRANSACTION_VOIR' },
  { to: '/espace/reversements', ico: '💸', txt: 'Reversements', p: 'REVERSEMENT_GERER' },
  { to: '/espace/utilisateurs', ico: '👥', txt: 'Utilisateurs', p: 'UTILISATEUR_GERER' },
  { to: '/espace/parametres', ico: '⚙️', txt: 'Paramètres' },
]

export default function EspaceLayout() {
  const { logout, utilisateur, organisateur, peut, rafraichir, estSuperAdmin } = useAuth()
  const { theme, toggleTheme } = useUi()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  // Statut de l'organisation à jour (ex. validée par AllVote depuis la connexion)
  useEffect(() => { rafraichir().catch(() => {}) }, [rafraichir])

  const doLogout = () => { logout(); navigate('/connexion') }
  const link = ({ isActive }) => (isActive ? 'active' : '')
  const close = () => setOpen(false)

  return (
    <div className="admin-shell">
      <aside className={`admin-side${open ? ' open' : ''}`}>
        <div className="logo espace-logo">
          <img src={mark} alt="AllVote" width="130" height="38" />
        </div>
        {estSuperAdmin && (
          <div className="espace-orga">
            <b>Administration</b>
            <span className="badge b-soon">Super-admin</span>
          </div>
        )}
        {organisateur && (
          <div className="espace-orga">
            <b>{organisateur.nom}</b>
            <span className={`badge ${organisateur.statut === 'VALIDE' ? 'b-open' : organisateur.statut === 'EN_ATTENTE' ? 'b-paused' : 'b-echoue'}`}>
              {ORGA_LABEL[organisateur.statut]}
            </span>
          </div>
        )}
        {(estSuperAdmin ? MENU_ADMIN : MENU_ORGA).filter((m) => !m.p || peut(m.p)).map((m) => (
          <NavLink key={m.to} to={m.to} end={m.end} className={link} onClick={close}>{m.ico} {m.txt}</NavLink>
        ))}
        <div className="spacer" />
        {utilisateur && <span className="hint" style={{ padding: '0 14px' }}>{utilisateur.prenom} {utilisateur.nom}</span>}
        {organisateur?.statut === 'VALIDE' && (
          <a href={`/o/${organisateur.slug}`} target="_blank" rel="noopener noreferrer">↗ Ma page publique</a>
        )}
        <a href="/" target="_blank" rel="noopener noreferrer">↗ Voir le site</a>
        <button className="icon-btn side-btn" onClick={toggleTheme}>{theme === 'dark' ? '🌙 Thème sombre' : '☀️ Thème clair'}</button>
        <button className="icon-btn side-btn" onClick={doLogout} style={{ color: '#e07a6a' }}>⎋ Déconnexion</button>
      </aside>
      {open && <div className="side-voile" onClick={close} aria-hidden="true" />}

      <main className="admin-main">
        <button className="icon-btn admin-burger" onClick={() => setOpen((o) => !o)} style={{ marginBottom: 16 }} aria-label="Menu">☰</button>
        <Outlet />
      </main>
    </div>
  )
}

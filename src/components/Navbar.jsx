import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useUi } from '../context/UiContext'
import { useAuth } from '../context/AuthContext'
import { mark } from '../assets/brand'

export default function Navbar() {
  const { theme, toggleTheme, lang, setLang, t } = useUi()
  const { isAuth } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40)
    on(); window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  const close = () => setOpen(false)

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="container nav-in">
        <Link to="/" className="brand brand-logo" onClick={close} aria-label="AllVote — accueil">
          <img src={mark} alt="AllVote" width="150" height="44" />
        </Link>

        <div className={`nav-links${open ? ' open' : ''}`}>
          <Link to="/" onClick={close}>{t('accueil')}</Link>
          <a href="/#evenements" onClick={close}>{t('evenements')}</a>
          <a href="/#how" onClick={close}>{t('howto')}</a>
          <a href="/#organiser" onClick={close}>{t('organiser')}</a>
          {isAuth
            ? <Link to="/espace" onClick={close}>{t('espace')}</Link>
            : <Link to="/connexion" onClick={close}>{t('connexion')}</Link>}
          <a href="/#evenements" className="btn btn-gold" onClick={close}>{t('voter')}</a>
        </div>

        <div className="nav-tools">
          <div className="toggle" role="group" aria-label="Langue">
            <button className={lang === 'fr' ? 'active' : ''} onClick={() => setLang('fr')} aria-pressed={lang === 'fr'}>FR</button>
            <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')} aria-pressed={lang === 'en'}>EN</button>
          </div>
          <button className="icon-btn" onClick={toggleTheme} aria-label="Changer le thème">
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
          <button className="hamb" onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>☰</button>
        </div>
      </div>
    </nav>
  )
}

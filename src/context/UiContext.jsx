import { createContext, useContext, useEffect, useState } from 'react'

const UiContext = createContext(null)
// eslint-disable-next-line react-refresh/only-export-components
export const useUi = () => useContext(UiContext)

const DICT = {
  fr: {
    accueil: 'Accueil', howto: 'Comment voter', candidats: 'Candidats', contact: 'Contact',
    voter: 'Voter', voter_maintenant: 'Voter maintenant', partager: 'Partager',
    evenements: 'Événements', organiser: 'Organiser un vote', connexion: 'Connexion', espace: 'Mon espace',
  },
  en: {
    accueil: 'Home', howto: 'How to vote', candidats: 'Candidates', contact: 'Contact',
    voter: 'Vote', voter_maintenant: 'Vote now', partager: 'Share',
    evenements: 'Events', organiser: 'Host a vote', connexion: 'Sign in', espace: 'My space',
  },
}

const read = (k, d) => { try { return localStorage.getItem(k) ?? d } catch { return d } }
const write = (k, v) => { try { localStorage.setItem(k, v) } catch { /* ignore */ } }

export function UiProvider({ children }) {
  const [theme, setTheme] = useState(() => read('ui-theme', 'dark'))
  const [lang, setLang] = useState(() => read('ui-lang', 'fr'))
  const [consent, setConsent] = useState(() => read('cookie-consent', null)) // 'accepted' | 'refused' | null

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.style.colorScheme = theme
    write('ui-theme', theme)
  }, [theme])

  useEffect(() => { document.documentElement.lang = lang; write('ui-lang', lang) }, [lang])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  const t = (key) => DICT[lang][key] ?? DICT.fr[key] ?? key
  const decideCookies = (choice) => { setConsent(choice); write('cookie-consent', choice) }

  return (
    <UiContext.Provider value={{ theme, toggleTheme, lang, setLang, t, consent, decideCookies }}>
      {children}
    </UiContext.Provider>
  )
}

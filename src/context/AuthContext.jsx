import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { setAuthToken, setUnauthorizedHandler } from '../api/client'
import { authApi } from '../api/endpoints'

const AuthContext = createContext(null)
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)

// Le jeton est gardé en sessionStorage : il disparaît à la fermeture de l'onglet
// (moins exposé qu'en localStorage) et expire de toute façon côté serveur.
const CLE = 'allvote-session'

function lireSession() {
  try {
    const s = JSON.parse(sessionStorage.getItem(CLE) || 'null')
    if (s?.token && new Date(s.expiresAt).getTime() > Date.now()) return s
  } catch { /* ignore */ }
  return null
}

function ecrire(s) {
  try { sessionStorage.setItem(CLE, JSON.stringify(s)) } catch { /* ignore */ }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const s = lireSession()
    setAuthToken(s?.token || null)
    return s
  })

  const logout = useCallback(() => {
    setAuthToken(null)
    setSession(null)
    try { sessionStorage.removeItem(CLE) } catch { /* ignore */ }
  }, [])

  // 401 renvoyé par l'API → session terminée (jeton expiré, compte désactivé, organisation suspendue…)
  useEffect(() => { setUnauthorizedHandler(logout) }, [logout])

  // Déconnexion automatique à l'expiration du jeton
  useEffect(() => {
    if (!session) return
    const ms = new Date(session.expiresAt).getTime() - Date.now()
    const t = setTimeout(logout, Math.max(0, ms))
    return () => clearTimeout(t)
  }, [session, logout])

  const login = useCallback(async (email, password) => {
    const r = await authApi.login(email, password) // lève ApiError avec le message du serveur
    const s = { token: r.token, expiresAt: r.expiresAt, utilisateur: r.utilisateur }
    setAuthToken(s.token)
    setSession(s)
    ecrire(s)
    return s
  }, [])

  /** Recharge le profil (ex. après validation de l'organisation par AllVote). */
  const rafraichir = useCallback(async () => {
    const u = await authApi.moi()
    setSession((s) => {
      if (!s) return s
      const n = { ...s, utilisateur: u }
      ecrire(n)
      return n
    })
    return u
  }, [])

  const u = session?.utilisateur || null
  const roles = u?.roles || []
  const permissions = u?.permissions || []

  return (
    <AuthContext.Provider value={{
      isAuth: !!session,
      utilisateur: u,
      organisateur: u?.organisateur || null,
      estSuperAdmin: roles.includes('SUPER_ADMIN'),
      aRole: (r) => roles.includes(r),
      peut: (p) => permissions.includes(p),
      login, logout, rafraichir,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

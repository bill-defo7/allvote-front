// Client HTTP unique vers l'API Spring Boot.
// URL configurable dans .env : VITE_API_URL=http://localhost:8081/api

export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8081/api').replace(/\/+$/, '')
/** Origine du backend (sans /api) : sert pour les images /uploads et les liens /share. */
export const API_ORIGIN = API_URL.replace(/\/api$/, '')

let jeton = null
let surNonAutorise = null

/** Appelé par AuthContext : jeton admin courant. */
export const setAuthToken = (t) => { jeton = t }
/** Appelé par AuthContext : action en cas de 401 (session expirée). */
export const setUnauthorizedHandler = (fn) => { surNonAutorise = fn }

export class ApiError extends Error {
  constructor(status, message, champs = null) {
    super(message)
    this.status = status
    this.champs = champs
  }
}

const MESSAGES = {
  0: 'Serveur injoignable. Vérifiez votre connexion puis réessayez.',
  401: 'Session expirée. Reconnectez-vous.',
  403: 'Accès refusé.',
  404: 'Introuvable.',
  429: 'Trop de requêtes. Patientez une minute puis réessayez.',
  500: 'Erreur du serveur. Réessayez dans un instant.',
}

/**
 * @param {string} path  ex. "/concours"
 * @param {{method?:string, body?:object, form?:FormData, auth?:boolean, raw?:boolean, signal?:AbortSignal}} opts
 */
export async function apiFetch(path, { method = 'GET', body, form, auth = false, raw = false, signal } = {}) {
  const headers = { Accept: 'application/json' }
  let payload
  if (form) {
    payload = form // le navigateur fixe lui-même le Content-Type multipart
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }
  if (auth && jeton) headers.Authorization = `Bearer ${jeton}`

  let res
  try {
    res = await fetch(`${API_URL}${path}`, { method, headers, body: payload, signal })
  } catch (e) {
    if (e.name === 'AbortError') throw e
    throw new ApiError(0, MESSAGES[0])
  }

  if (res.status === 401 && auth) surNonAutorise?.()

  if (!res.ok) {
    let data = null
    try { data = await res.json() } catch { /* corps non JSON */ }
    const message = data?.message || MESSAGES[res.status] || (res.status >= 500 ? MESSAGES[500] : 'Requête refusée.')
    throw new ApiError(res.status, message, data?.champs || null)
  }
  if (raw) return res
  if (res.status === 204) return null
  const texte = await res.text()
  return texte ? JSON.parse(texte) : null
}

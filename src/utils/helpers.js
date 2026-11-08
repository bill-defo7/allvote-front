import { API_ORIGIN } from '../api/client'

// ---------------- Heure du serveur ----------------
// Le compte à rebours se base sur l'heure du SERVEUR (serverTime renvoyé par l'API),
// pas sur l'horloge du téléphone qui peut être fausse.
let decalage = 0
export const syncServerTime = (iso) => {
  if (!iso) return
  const t = new Date(iso).getTime()
  if (!Number.isNaN(t)) decalage = t - Date.now()
}
export const serverNow = () => Date.now() + decalage

// ---------------- Affichage ----------------
export const initials = (s = '') =>
  s.trim().split(/\s+/).slice(0, 2).map((w) => w[0] || '').join('').toUpperCase()

export const GRADIENTS = [
  'linear-gradient(135deg,#d4af37,#f3d888)',
  'linear-gradient(135deg,#0e3a7a,#2b86ff)',
  'linear-gradient(135deg,#b8902b,#d4af37)',
  'linear-gradient(135deg,#1a1407,#5ea8ff)',
]
export const gradientFor = (i) => GRADIENTS[Math.abs(i) % GRADIENTS.length]

export const fmt = (n) => Number(n || 0).toLocaleString('fr-FR')

/**
 * Frais de service payés en plus par le votant : taux % de la valeur des voix, arrondi au franc supérieur.
 * Même règle que le serveur (qui recalcule toujours le montant réel).
 */
export const calculerFrais = (valeur, taux) => {
  const t = Math.round(Number(taux || 0) * 100)          // taux en centièmes de % (évite les erreurs d'arrondi)
  if (t <= 0) return 0
  return Math.ceil((valeur * t) / 10000 - 1e-9)
}

export const fmtJour = (iso) =>
  iso ? new Date(iso).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' }) : ''

export const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

export function remaining(targetIso, now = serverNow()) {
  const diff = new Date(targetIso).getTime() - now
  if (diff <= 0) return { done: true, days: 0, hours: 0, mins: 0, secs: 0 }
  return {
    done: false,
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    mins: Math.floor((diff / 60000) % 60),
    secs: Math.floor((diff / 1000) % 60),
  }
}

// ---------------- URLs ----------------
/** Image servie par l'API ("/uploads/x.jpg" → "http://api/uploads/x.jpg"). */
export const mediaUrl = (path) => (path ? (path.startsWith('http') ? path : `${API_ORIGIN}${path}`) : null)

/** Lien de PARTAGE d'un candidat : passe par l'API pour que WhatsApp/Facebook affichent photo + nom. */
export const candidatShareUrl = (idConcours, idCandidat) => `${API_ORIGIN}/share/concours/${idConcours}/candidat/${idCandidat}`

/** Lien de PARTAGE d'un événement (aperçu avec l'affiche). */
export const evenementShareUrl = (slug) => `${API_ORIGIN}/share/evenements/${slug}`

// ---------------- Statuts ----------------
export const STATUT_LABEL = {
  BROUILLON: 'Brouillon', PLANIFIE: 'Bientôt', OUVERT: 'Ouvert', FERME: 'Clôturé', SUSPENDU: 'Suspendu',
}
export const STATE_CLASS = {
  OUVERT: 'state-open', PLANIFIE: 'state-soon', FERME: 'state-closed', SUSPENDU: 'state-paused', BROUILLON: 'state-closed',
}
export const BADGE_CLASS = {
  OUVERT: 'b-open', PLANIFIE: 'b-soon', FERME: 'b-closed', SUSPENDU: 'b-paused', BROUILLON: 'b-draft',
}
export const TYPE_CANDIDAT = { PERSONNE: 'Personne', EQUIPE: 'Équipe', PROJET: 'Projet' }

export const TX_LABEL = {
  EN_ATTENTE: 'En attente', CONFIRME: 'Confirmé', ECHOUE: 'Échoué', EXPIRE: 'Expiré', A_VERIFIER: 'À vérifier',
}
export const TX_BADGE = {
  EN_ATTENTE: 'b-attente', CONFIRME: 'b-confirme', ECHOUE: 'b-echoue', EXPIRE: 'b-closed', A_VERIFIER: 'b-paused',
}

// ---------------- Espace organisateur ----------------
export const EV_LABEL = { BROUILLON: 'Brouillon', PUBLIE: 'Publié', ARCHIVE: 'Archivé' }
export const EV_BADGE = { BROUILLON: 'b-draft', PUBLIE: 'b-open', ARCHIVE: 'b-closed' }
export const ORGA_LABEL = { EN_ATTENTE: 'En attente', VALIDE: 'Validée', REFUSE: 'Refusée', SUSPENDU: 'Suspendue' }

/** ISO → valeur d'un <input type="datetime-local"> (heure locale du navigateur, ex. Cameroun). */
export const versChampDate = (iso) => {
  if (!iso) return ''
  const d = new Date(iso); const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}
/** Valeur d'un <input type="datetime-local"> → ISO UTC pour l'API. */
export const depuisChampDate = (v) => (v ? new Date(v).toISOString() : null)
/** Dans n jours, heure ronde, au format du champ. */
export const dansJours = (n, heure = 18) => {
  const d = new Date(Date.now() + n * 86400000); d.setHours(heure, 0, 0, 0)
  return versChampDate(d.toISOString())
}
export const ORGA_BADGE = { EN_ATTENTE: 'b-paused', VALIDE: 'b-open', REFUSE: 'b-echoue', SUSPENDU: 'b-echoue' }
export const REV_LABEL = { A_PAYER: 'À payer', PAYE: 'Payé' }
export const REV_BADGE = { A_PAYER: 'b-attente', PAYE: 'b-confirme' }
export const fmtTaux = (t) => (t === null || t === undefined ? '—' : `${Number(t).toLocaleString('fr-FR')} %`)

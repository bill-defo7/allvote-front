// Réglages du site, lus dans .env (voir .env.example).
const env = import.meta.env

export const SITE_URL = (env.VITE_SITE_URL || 'https://allvote.cm').replace(/\/+$/, '')
export const SITE_NAME = 'AllVote'
export const SLOGAN = 'Élevez votre candidat vers la victoire.'

export const CONTACT = {
  tel: env.VITE_CONTACT_TEL || '',
  email: env.VITE_CONTACT_EMAIL || '',
  /** Numéro WhatsApp au format international sans "+" (ex. 2376XXXXXXXX) */
  whatsapp: env.VITE_CONTACT_WHATSAPP || '',
}

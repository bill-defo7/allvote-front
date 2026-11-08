import { apiFetch } from './client'

const qs = (o) => {
  const q = new URLSearchParams()
  Object.entries(o).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') q.set(k, String(v)) })
  const s = q.toString()
  return s ? `?${s}` : ''
}

/** API publique (aucune authentification). */
export const publicApi = {
  /** Page d'événements publiés : { contenu, page, taille, total, totalPages } */
  evenements: ({ q, ville, page = 0, taille = 12 } = {}) => apiFetch(`/public/evenements${qs({ q, ville, page, taille })}`),
  evenement: (slug) => apiFetch(`/public/evenements/${encodeURIComponent(slug)}`),
  organisateur: (slug) => apiFetch(`/public/organisateurs/${encodeURIComponent(slug)}`),
  concours: (id) => apiFetch(`/public/concours/${id}`),
  candidat: (idConcours, idCandidat) => apiFetch(`/public/concours/${idConcours}/candidats/${idCandidat}`),
  /** body : { idConcours, idCandidat, nbVoix, operateur: 'MTN'|'ORANGE', telephone, website } */
  voter: (body) => apiFetch('/public/votes', { method: 'POST', body }),
  statutVote: (reference) => apiFetch(`/public/votes/${reference}`),
  /** { fraisVotantPourcentage } : frais de service ajoutés au prix des voix */
  tarifs: () => apiFetch('/public/tarifs'),
  /** Inscription d'une organisation (statut EN_ATTENTE jusqu'à validation par AllVote). */
  inscription: (body) => apiFetch('/public/organisateurs/inscription', { method: 'POST', body }),
}

/** Compte connecté (organisateur ou super-admin). */
export const authApi = {
  login: (email, password) => apiFetch('/auth/login', { method: 'POST', body: { email, password } }),
  moi: () => apiFetch('/auth/moi', { auth: true }),
  changerMotDePasse: (ancienMotDePasse, nouveauMotDePasse) =>
    apiFetch('/auth/mot-de-passe', { method: 'PUT', body: { ancienMotDePasse, nouveauMotDePasse }, auth: true }),
}

/** Espace organisateur (jeton requis ; l'organisation vient du jeton côté serveur). */
export const orgaApi = {
  profil: () => apiFetch('/orga/profil', { auth: true }),
  modifierProfil: (body) => apiFetch('/orga/profil', { method: 'PUT', body, auth: true }),
  /** Image JPG/PNG ≤ 5 Mo → { url: "/uploads/xxx.jpg" } */
  upload: (file) => {
    const form = new FormData()
    form.append('fichier', file)
    return apiFetch('/orga/uploads', { method: 'POST', form, auth: true })
  },

  evenements: () => apiFetch('/orga/evenements', { auth: true }),
  evenement: (id) => apiFetch(`/orga/evenements/${id}`, { auth: true }),
  creerEvenement: (body) => apiFetch('/orga/evenements', { method: 'POST', body, auth: true }),
  modifierEvenement: (id, body) => apiFetch(`/orga/evenements/${id}`, { method: 'PUT', body, auth: true }),
  /** statut : PUBLIE | BROUILLON | ARCHIVE */
  statutEvenement: (id, statut) => apiFetch(`/orga/evenements/${id}/statut`, { method: 'PATCH', body: { statut }, auth: true }),
  supprimerEvenement: (id) => apiFetch(`/orga/evenements/${id}`, { method: 'DELETE', auth: true }),

  creerConcours: (idEvenement, body) => apiFetch(`/orga/evenements/${idEvenement}/concours`, { method: 'POST', body, auth: true }),
  concours: (id) => apiFetch(`/orga/concours/${id}`, { auth: true }),
  modifierConcours: (id, body) => apiFetch(`/orga/concours/${id}`, { method: 'PUT', body, auth: true }),
  /** statutForce : OUVERT | SUSPENDU | FERME | null (automatique) */
  statutConcours: (id, statutForce) => apiFetch(`/orga/concours/${id}/statut`, { method: 'PATCH', body: { statutForce }, auth: true }),
  supprimerConcours: (id) => apiFetch(`/orga/concours/${id}`, { method: 'DELETE', auth: true }),

  ajouterCategorie: (idConcours, nom) => apiFetch(`/orga/concours/${idConcours}/categories`, { method: 'POST', body: { nom }, auth: true }),
  modifierCategorie: (id, body) => apiFetch(`/orga/categories/${id}`, { method: 'PUT', body, auth: true }),
  ordonnerCategories: (idConcours, ids) => apiFetch(`/orga/concours/${idConcours}/categories/ordre`, { method: 'PUT', body: { ids }, auth: true }),
  supprimerCategorie: (id) => apiFetch(`/orga/categories/${id}`, { method: 'DELETE', auth: true }),

  ajouterCandidat: (idCategorie, body) => apiFetch(`/orga/categories/${idCategorie}/candidats`, { method: 'POST', body, auth: true }),
  modifierCandidat: (id, body) => apiFetch(`/orga/candidats/${id}`, { method: 'PUT', body, auth: true }),
  activerCandidat: (id, actif) => apiFetch(`/orga/candidats/${id}/actif`, { method: 'PATCH', body: { actif }, auth: true }),
  supprimerCandidat: (id) => apiFetch(`/orga/candidats/${id}`, { method: 'DELETE', auth: true }),

  transactions: ({ statut, idConcours, page = 0, taille = 20 } = {}) =>
    apiFetch(`/orga/transactions${qs({ statut, idConcours, page, taille })}`, { auth: true }),
  finances: () => apiFetch('/orga/finances', { auth: true }),

  membres: () => apiFetch('/orga/membres', { auth: true }),
  ajouterMembre: (body) => apiFetch('/orga/membres', { method: 'POST', body, auth: true }),
  activerMembre: (id, actif) => apiFetch(`/orga/membres/${id}/actif`, { method: 'PATCH', body: { actif }, auth: true }),
  supprimerMembre: (id) => apiFetch(`/orga/membres/${id}`, { method: 'DELETE', auth: true }),
}

/** Espace super-admin (rôle SUPER_ADMIN). */
export const adminApi = {
  tableauBord: () => apiFetch('/admin/tableau-de-bord', { auth: true }),

  organisateurs: ({ statut, page = 0, taille = 20 } = {}) => apiFetch(`/admin/organisateurs${qs({ statut, page, taille })}`, { auth: true }),
  organisateur: (id) => apiFetch(`/admin/organisateurs/${id}`, { auth: true }),
  valider: (id) => apiFetch(`/admin/organisateurs/${id}/valider`, { method: 'POST', auth: true }),
  refuser: (id, motif) => apiFetch(`/admin/organisateurs/${id}/refuser`, { method: 'POST', body: { motif }, auth: true }),
  suspendre: (id, motif) => apiFetch(`/admin/organisateurs/${id}/suspendre`, { method: 'POST', body: { motif }, auth: true }),
  reactiver: (id) => apiFetch(`/admin/organisateurs/${id}/reactiver`, { method: 'POST', auth: true }),
  /** tauxCommission en % ; null = taux par défaut */
  commission: (id, tauxCommission) => apiFetch(`/admin/organisateurs/${id}/commission`, { method: 'PUT', body: { tauxCommission }, auth: true }),

  evenements: ({ statut, idOrganisateur, page = 0, taille = 20 } = {}) => apiFetch(`/admin/evenements${qs({ statut, idOrganisateur, page, taille })}`, { auth: true }),
  statutEvenement: (id, statut) => apiFetch(`/admin/evenements/${id}/statut`, { method: 'PATCH', body: { statut }, auth: true }),

  transactions: ({ statut, idOrganisateur, idConcours, page = 0, taille = 20 } = {}) =>
    apiFetch(`/admin/transactions${qs({ statut, idOrganisateur, idConcours, page, taille })}`, { auth: true }),
  transaction: (id) => apiFetch(`/admin/transactions/${id}`, { auth: true }),
  prestataire: (id) => apiFetch(`/admin/transactions/${id}/prestataire`, { auth: true }),
  confirmer: (id, motif) => apiFetch(`/admin/transactions/${id}/confirmer`, { method: 'POST', body: { motif }, auth: true }),
  rejeter: (id, motif) => apiFetch(`/admin/transactions/${id}/rejeter`, { method: 'POST', body: { motif }, auth: true }),

  soldes: () => apiFetch('/admin/soldes', { auth: true }),
  creerReversement: (idOrganisateur, note) => apiFetch(`/admin/organisateurs/${idOrganisateur}/reversements`, { method: 'POST', body: { note }, auth: true }),
  reversements: ({ statut, idOrganisateur, page = 0, taille = 20 } = {}) => apiFetch(`/admin/reversements${qs({ statut, idOrganisateur, page, taille })}`, { auth: true }),
  payerReversement: (id, referencePaiement, note) => apiFetch(`/admin/reversements/${id}/payer`, { method: 'POST', body: { referencePaiement, note }, auth: true }),
  annulerReversement: (id) => apiFetch(`/admin/reversements/${id}`, { method: 'DELETE', auth: true }),

  utilisateurs: ({ q, page = 0, taille = 20 } = {}) => apiFetch(`/admin/utilisateurs${qs({ q, page, taille })}`, { auth: true }),
  activerUtilisateur: (id, actif) => apiFetch(`/admin/utilisateurs/${id}/actif`, { method: 'PATCH', body: { actif }, auth: true }),
  deverrouiller: (id) => apiFetch(`/admin/utilisateurs/${id}/deverrouiller`, { method: 'POST', auth: true }),

  parametres: () => apiFetch('/admin/parametres', { auth: true }),
  commissionDefaut: (taux) => apiFetch('/admin/parametres/commission', { method: 'PUT', body: { taux }, auth: true }),
  fraisVotant: (taux) => apiFetch('/admin/parametres/frais', { method: 'PUT', body: { taux }, auth: true }),
}

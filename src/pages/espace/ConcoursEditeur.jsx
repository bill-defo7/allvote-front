import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Seo from '../../components/Seo'
import ImageUpload from '../../components/espace/ImageUpload'
import { Chargement, Erreur } from '../../components/Etat'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { orgaApi } from '../../api/endpoints'
import { useApi } from '../../api/useApi'
import {
  fmt, initials, mediaUrl, candidatShareUrl, versChampDate, depuisChampDate, syncServerTime,
  STATUT_LABEL, BADGE_CLASS, TYPE_CANDIDAT,
} from '../../utils/helpers'

export default function ConcoursEditeur() {
  const { id } = useParams()
  const charge = useApi(async () => {
    const d = await orgaApi.concours(id)
    syncServerTime(d?.serverTime)
    return d
  }, [id])
  if (charge.loading) return <Chargement />
  if (charge.error) return <Erreur error={charge.error} onRetry={charge.recharger} />
  return <Editeur key={id} initial={charge.data} />
}

const formDe = (c) => ({
  titre: c.titre, description: c.description || '', afficheUrl: c.afficheUrl, prixVoix: c.prixVoix,
  scoresPublics: c.scoresPublics, brouillon: c.brouillon,
  dateOuverture: versChampDate(c.dateOuverture), dateFermeture: versChampDate(c.dateFermeture),
})

function Editeur({ initial }) {
  const navigate = useNavigate()
  const { show } = useToast()
  const { peut } = useAuth()
  const [c, setC] = useState(initial)
  const [f, setF] = useState(() => formDe(initial))
  const [errors, setErrors] = useState({})
  const [envoi, setEnvoi] = useState(false)
  const [candidatEdite, setCandidatEdite] = useState(null) // { idCategorie, candidat|null }
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }))

  const gererEv = peut('EVENEMENT_GERER')
  const gererCand = peut('CANDIDAT_GERER')

  /** Exécute une opération ; si elle ne renvoie pas le concours, on le recharge. */
  const op = async (fn, msg) => {
    try {
      const r = await fn()
      setC(r?.categories ? r : await orgaApi.concours(c.idConcours))
      if (msg) show(`✅ ${msg}`)
      return true
    } catch (ex) { show(`⚠️ ${ex.message}`); return false }
  }

  const corps = (patch = {}) => {
    const v = { ...f, ...patch }
    return {
      titre: v.titre.trim(), description: v.description.trim() || null, afficheUrl: v.afficheUrl,
      prixVoix: Number(v.prixVoix), scoresPublics: v.scoresPublics, brouillon: v.brouillon,
      dateOuverture: depuisChampDate(v.dateOuverture), dateFermeture: depuisChampDate(v.dateFermeture),
    }
  }

  const enregistrer = async (e) => {
    e.preventDefault()
    const er = {}
    if (f.titre.trim().length < 3) er.titre = '3 caractères minimum.'
    if (!f.prixVoix || Number(f.prixVoix) < 50 || Number(f.prixVoix) > 100000) er.prixVoix = 'Entre 50 et 100 000 FCFA.'
    if (!f.dateOuverture || !f.dateFermeture) er.dates = 'Dates obligatoires.'
    else if (new Date(f.dateFermeture) <= new Date(f.dateOuverture)) er.dates = 'La fermeture doit être après l\'ouverture.'
    setErrors(er)
    if (Object.keys(er).length) return
    setEnvoi(true)
    if (await op(() => orgaApi.modifierConcours(c.idConcours, corps()), 'Concours enregistré')) setErrors({})
    setEnvoi(false)
  }

  const rendreVisible = async () => {
    if (await op(() => orgaApi.modifierConcours(c.idConcours, corps({ brouillon: false })), 'Concours visible sur la page de l\'événement')) {
      set('brouillon', false)
    }
  }

  const supprimer = async () => {
    if (!confirm(`Supprimer définitivement le concours « ${c.titre} », ses catégories et ses candidats ?`)) return
    try { await orgaApi.supprimerConcours(c.idConcours); show('✅ Concours supprimé'); navigate(`/espace/evenements/${c.idEvenement}`) }
    catch (ex) { show(`⚠️ ${ex.message}`) }
  }

  const deplacer = (i, sens) => {
    const ids = c.categories.map((k) => k.idCategorie)
    const j = i + sens
    if (j < 0 || j >= ids.length) return
    ;[ids[i], ids[j]] = [ids[j], ids[i]]
    op(() => orgaApi.ordonnerCategories(c.idConcours, ids))
  }

  return (
    <>
      <Seo path="/espace/concours" title={c.titre} noindex />
      <div className="admin-top">
        <div>
          <p className="crumbs" style={{ textAlign: 'left' }}><Link to={`/espace/evenements/${c.idEvenement}`}>{c.evenementTitre}</Link></p>
          <h1>{c.titre}</h1>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className={`badge ${BADGE_CLASS[c.statut]}`}>{STATUT_LABEL[c.statut]}</span>
          <span className="hint">{fmt(c.totalVotes)} voix</span>
          <Link to={`/espace/evenements/${c.idEvenement}`} className="btn btn-sm btn-ghost">← Événement</Link>
        </div>
      </div>

      {c.brouillon && (
        <div className="banner banner-warn" style={{ marginTop: 0, marginBottom: 22, display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <span>📝 Ce concours est en brouillon : il n'apparaît pas encore sur la page de l'événement.</span>
          {gererEv && <button className="btn btn-sm btn-gold" onClick={rendreVisible}>Rendre visible</button>}
        </div>
      )}

      {/* ---------------- Statut du vote ---------------- */}
      {peut('EVENEMENT_PUBLIER') && !c.brouillon && (
        <div className="panel">
          <h2>Vote</h2>
          <p className="hint" style={{ marginBottom: 12 }}>
            {c.statutForce
              ? <>Statut forcé : <b>{STATUT_LABEL[c.statutForce]}</b>. Le compte à rebours est ignoré tant que vous ne revenez pas en automatique.</>
              : <>Mode automatique : le vote s'ouvre et se ferme selon les dates ci-dessous.</>}
          </p>
          <div className="row-acts">
            {[['OUVERT', '▶ Ouvrir maintenant'], ['SUSPENDU', '⏸ Suspendre'], ['FERME', '■ Fermer']].map(([s, t]) => (
              <button key={s} className={`btn btn-sm ${c.statutForce === s ? 'btn-gold' : 'btn-ghost'}`}
                onClick={() => op(() => orgaApi.statutConcours(c.idConcours, s), `Statut : ${STATUT_LABEL[s]}`)}>{t}</button>
            ))}
            {c.statutForce && (
              <button className="btn btn-sm btn-ghost" onClick={() => op(() => orgaApi.statutConcours(c.idConcours, null), 'Retour au mode automatique')}>↺ Automatique</button>
            )}
          </div>
        </div>
      )}

      {/* ---------------- Informations ---------------- */}
      {gererEv && (
        <form className="panel" onSubmit={enregistrer} noValidate>
          <h2>Informations</h2>
          <div className="grid-2">
            <div className="field"><label htmlFor="c-titre">Titre *</label>
              <input id="c-titre" maxLength={150} value={f.titre} className={errors.titre ? 'invalid' : ''} onChange={(e) => set('titre', e.target.value)} />
              {errors.titre && <div className="err">{errors.titre}</div>}
            </div>
            <div className="field"><label htmlFor="c-prix">Prix d'une voix (FCFA) *</label>
              <input id="c-prix" type="number" min="50" max="100000" value={f.prixVoix} className={errors.prixVoix ? 'invalid' : ''} onChange={(e) => set('prixVoix', e.target.value)} />
              {errors.prixVoix && <div className="err">{errors.prixVoix}</div>}
            </div>
          </div>
          <div className="grid-2">
            <div className="field"><label htmlFor="c-ouv">Ouverture du vote (heure locale)</label>
              <input id="c-ouv" type="datetime-local" value={f.dateOuverture} onChange={(e) => set('dateOuverture', e.target.value)} />
            </div>
            <div className="field"><label htmlFor="c-fer">Fermeture (compte à rebours)</label>
              <input id="c-fer" type="datetime-local" value={f.dateFermeture} onChange={(e) => set('dateFermeture', e.target.value)} />
            </div>
          </div>
          {errors.dates && <div className="err" style={{ marginTop: -8, marginBottom: 12 }}>{errors.dates}</div>}
          <div className="grid-2">
            <div className="field"><label htmlFor="c-scores">Scores visibles par le public</label>
              <select id="c-scores" value={f.scoresPublics ? '1' : '0'} onChange={(e) => set('scoresPublics', e.target.value === '1')}>
                <option value="1">Oui, en direct</option><option value="0">Non, seulement à la clôture</option>
              </select>
            </div>
            <div className="field"><label>&nbsp;</label>
              <label className="chk"><input type="checkbox" checked={f.brouillon} onChange={(e) => set('brouillon', e.target.checked)} />
                Brouillon (invisible du public)</label>
            </div>
          </div>
          <div className="field"><label htmlFor="c-desc">Description</label>
            <textarea id="c-desc" rows={3} maxLength={2000} value={f.description} onChange={(e) => set('description', e.target.value)} />
          </div>
          <ImageUpload id="c-affiche" label="Affiche du concours" value={f.afficheUrl} onChange={(u) => set('afficheUrl', u)} />
          <div className="row-acts">
            <button className="btn btn-gold" type="submit" disabled={envoi}>{envoi ? 'Enregistrement…' : 'Enregistrer'}</button>
            <button type="button" className="btn btn-danger btn-sm" onClick={supprimer}>Supprimer le concours</button>
          </div>
        </form>
      )}

      {/* ---------------- Catégories & candidats ---------------- */}
      <div className="panel">
        <h2>Catégories &amp; candidats</h2>
        {gererEv && <AjoutCategorie onAdd={(nom) => op(() => orgaApi.ajouterCategorie(c.idConcours, nom), 'Catégorie ajoutée')} />}
        {c.categories.length === 0 && <p className="hint">Ajoutez une catégorie (ex. Miss, Master, Meilleur joueur…), puis ses candidats.</p>}

        {c.categories.map((k, i) => (
          <div className="cat-bloc" key={k.idCategorie}>
            <div className="cat-tete">
              <NomCategorie k={k} modifiable={gererEv}
                onSave={(nom) => op(() => orgaApi.modifierCategorie(k.idCategorie, { nom, ordre: k.ordre }), 'Catégorie renommée')} />
              <span className="hint">{k.candidats.length} candidat(s)</span>
              {gererEv && (
                <div className="row-acts" style={{ marginLeft: 'auto' }}>
                  <button className="icon-btn" title="Monter" aria-label="Monter" disabled={i === 0} onClick={() => deplacer(i, -1)}>↑</button>
                  <button className="icon-btn" title="Descendre" aria-label="Descendre" disabled={i === c.categories.length - 1} onClick={() => deplacer(i, 1)}>↓</button>
                  <button className="btn btn-sm btn-danger" onClick={() => {
                    if (confirm(`Supprimer la catégorie « ${k.nom} » et ses candidats ?`)) op(() => orgaApi.supprimerCategorie(k.idCategorie), 'Catégorie supprimée')
                  }}>Supprimer</button>
                </div>
              )}
            </div>

            <div className="cand-liste">
              {k.candidats.map((x) => (
                <div className={`cand-ligne${x.actif ? '' : ' inactif'}`} key={x.idCandidat}>
                  <span className="photo-chip">{x.photoUrl ? <img src={mediaUrl(x.photoUrl)} alt="" /> : initials(x.nom)}</span>
                  <div className="cand-txt">
                    <b>N° {x.numero} · {x.nom}</b>
                    <span className="hint">{[x.sousTitre, TYPE_CANDIDAT[x.typeCandidat], `${fmt(x.votes)} voix`].filter(Boolean).join(' · ')}{x.actif ? '' : ' · désactivé'}</span>
                  </div>
                  <div className="row-acts">
                    <button className="btn btn-sm btn-ghost" title="Copier le lien de vote" onClick={async () => {
                      try { await navigator.clipboard.writeText(candidatShareUrl(c.idConcours, x.idCandidat)); show('✅ Lien de vote copié') }
                      catch { show(candidatShareUrl(c.idConcours, x.idCandidat)) }
                    }}>🔗 Lien</button>
                    {!c.brouillon && <a className="btn btn-sm btn-ghost" href={`/concours/${c.idConcours}/candidat/${x.idCandidat}`} target="_blank" rel="noopener noreferrer">↗</a>}
                    {gererCand && <>
                      <button className="btn btn-sm btn-ghost" onClick={() => setCandidatEdite({ idCategorie: k.idCategorie, candidat: x })}>Modifier</button>
                      <button className="btn btn-sm btn-ghost" onClick={() => op(() => orgaApi.activerCandidat(x.idCandidat, !x.actif), x.actif ? 'Candidat désactivé' : 'Candidat réactivé')}>
                        {x.actif ? 'Désactiver' : 'Réactiver'}
                      </button>
                      <button className="btn btn-sm btn-danger" aria-label={`Supprimer ${x.nom}`} onClick={() => {
                        if (confirm(`Supprimer « ${x.nom} » ?`)) op(() => orgaApi.supprimerCandidat(x.idCandidat), 'Candidat supprimé')
                      }}>✕</button>
                    </>}
                  </div>
                </div>
              ))}
            </div>
            {gererCand && (
              <button className="btn btn-sm btn-ghost" style={{ marginTop: 10 }} onClick={() => setCandidatEdite({ idCategorie: k.idCategorie, candidat: null })}>
                ＋ Ajouter un candidat
              </button>
            )}
          </div>
        ))}
      </div>

      {candidatEdite && (
        <CandidatModal edition={candidatEdite} onClose={() => setCandidatEdite(null)}
          onSave={async (body) => {
            const { idCategorie, candidat } = candidatEdite
            const ok = await op(() => (candidat
              ? orgaApi.modifierCandidat(candidat.idCandidat, body)
              : orgaApi.ajouterCandidat(idCategorie, body)), candidat ? 'Candidat modifié' : 'Candidat ajouté')
            if (ok) setCandidatEdite(null)
          }} />
      )}
    </>
  )
}

function AjoutCategorie({ onAdd }) {
  const [nom, setNom] = useState('')
  const ajouter = async (e) => {
    e.preventDefault()
    if (!nom.trim()) return
    if (await onAdd(nom.trim())) setNom('')
  }
  return (
    <form className="ajout-ligne" onSubmit={ajouter}>
      <input value={nom} maxLength={80} onChange={(e) => setNom(e.target.value)} placeholder="Nouvelle catégorie (ex. Miss)" aria-label="Nom de la nouvelle catégorie" />
      <button className="btn btn-sm btn-gold" type="submit" disabled={!nom.trim()}>＋ Ajouter</button>
    </form>
  )
}

function NomCategorie({ k, modifiable, onSave }) {
  const [edit, setEdit] = useState(false)
  const [nom, setNom] = useState(k.nom)
  if (!edit) {
    return (
      <h3 className="cat-nom">{k.nom}
        {modifiable && <button className="lien-btn" onClick={() => { setNom(k.nom); setEdit(true) }} aria-label={`Renommer ${k.nom}`}>✎</button>}
      </h3>
    )
  }
  return (
    <form className="ajout-ligne" style={{ margin: 0 }} onSubmit={async (e) => { e.preventDefault(); if (nom.trim() && await onSave(nom.trim())) setEdit(false) }}>
      <input value={nom} maxLength={80} onChange={(e) => setNom(e.target.value)} autoFocus aria-label="Nouveau nom" />
      <button className="btn btn-sm btn-gold" type="submit">OK</button>
      <button className="btn btn-sm btn-ghost" type="button" onClick={() => setEdit(false)}>Annuler</button>
    </form>
  )
}

function CandidatModal({ edition, onClose, onSave }) {
  const x = edition.candidat
  const [f, setF] = useState({
    nom: x?.nom || '', sousTitre: x?.sousTitre || '', description: x?.description || '',
    photoUrl: x?.photoUrl || null, typeCandidat: x?.typeCandidat || 'PERSONNE', numero: x?.numero || '',
  })
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const set = (k, v) => setF((a) => ({ ...a, [k]: v }))

  const valider = async (e) => {
    e.preventDefault()
    if (!f.nom.trim()) { setErreur('Le nom est obligatoire.'); return }
    if (f.numero !== '' && (Number(f.numero) < 1 || Number(f.numero) > 999)) { setErreur('Numéro entre 1 et 999.'); return }
    setEnvoi(true); setErreur('')
    await onSave({
      nom: f.nom.trim(), sousTitre: f.sousTitre.trim() || null, description: f.description.trim() || null,
      photoUrl: f.photoUrl, typeCandidat: f.typeCandidat, numero: f.numero === '' ? null : Number(f.numero),
    })
    setEnvoi(false)
  }

  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div className="modal-box modal-large" role="dialog" aria-modal="true" aria-labelledby="cand-titre"
        initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <button className="mclose" onClick={onClose} aria-label="Fermer">×</button>
        <h3 id="cand-titre">{x ? 'Modifier le candidat' : 'Nouveau candidat'}</h3>
        <form onSubmit={valider} noValidate style={{ marginTop: 16 }}>
          <div className="grid-2">
            <div className="field"><label htmlFor="cd-nom">Nom *</label>
              <input id="cd-nom" maxLength={120} value={f.nom} onChange={(e) => set('nom', e.target.value)} autoFocus />
            </div>
            <div className="field"><label htmlFor="cd-sous">Sous-titre</label>
              <input id="cd-sous" maxLength={80} value={f.sousTitre} onChange={(e) => set('sousTitre', e.target.value)} placeholder="Filière, équipe, club…" />
            </div>
          </div>
          <div className="grid-2">
            <div className="field"><label htmlFor="cd-type">Type</label>
              <select id="cd-type" value={f.typeCandidat} onChange={(e) => set('typeCandidat', e.target.value)}>
                {Object.entries(TYPE_CANDIDAT).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="field"><label htmlFor="cd-num">Numéro</label>
              <input id="cd-num" type="number" min="1" max="999" value={f.numero} onChange={(e) => set('numero', e.target.value)} placeholder="Automatique" />
            </div>
          </div>
          <div className="field"><label htmlFor="cd-desc">Description ({f.description.length}/280)</label>
            <textarea id="cd-desc" rows={3} maxLength={280} value={f.description} onChange={(e) => set('description', e.target.value)}
              placeholder="Quelques mots affichés sur la carte et la page du candidat" />
          </div>
          <ImageUpload id="cd-photo" label="Photo" value={f.photoUrl} onChange={(u) => set('photoUrl', u)} />
          {erreur && <div className="err" style={{ marginBottom: 12 }}>⚠️ {erreur}</div>}
          <button className="btn btn-gold btn-block" type="submit" disabled={envoi}>{envoi ? 'Enregistrement…' : x ? 'Enregistrer' : 'Ajouter le candidat'}</button>
        </form>
      </motion.div>
    </div>
  )
}

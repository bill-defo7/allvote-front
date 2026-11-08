import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Seo from '../../components/Seo'
import BandeauStatut from '../../components/espace/BandeauStatut'
import ImageUpload from '../../components/espace/ImageUpload'
import { Chargement, Erreur } from '../../components/Etat'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { orgaApi } from '../../api/endpoints'
import { useApi } from '../../api/useApi'
import {
  fmt, versChampDate, depuisChampDate, dansJours, evenementShareUrl, syncServerTime,
  EV_LABEL, EV_BADGE, STATUT_LABEL, BADGE_CLASS,
} from '../../utils/helpers'

export default function EvenementEdition() {
  const { id } = useParams()
  const nouveau = id === 'nouveau'
  const charge = useApi(async () => {
    if (nouveau) return null
    const d = await orgaApi.evenement(id)
    syncServerTime(d?.serverTime)
    return d
  }, [id])

  if (!nouveau && charge.loading) return <Chargement />
  if (!nouveau && charge.error) return <Erreur error={charge.error} onRetry={charge.recharger} />
  // key : le formulaire repart de zéro quand on change d'événement
  return <Editeur key={id} nouveau={nouveau} initial={charge.data} />
}

const formDe = (e) => ({
  titre: e?.titre || '', lieu: e?.lieu || '', description: e?.description || '', afficheUrl: e?.afficheUrl || null,
  dateDebut: e ? versChampDate(e.dateDebut) : dansJours(14), dateFin: e ? versChampDate(e.dateFin) : '',
})

function Editeur({ nouveau, initial }) {
  const navigate = useNavigate()
  const { show } = useToast()
  const { peut, organisateur } = useAuth()
  const [ev, setEv] = useState(initial)
  const [f, setF] = useState(() => formDe(initial))
  const [errors, setErrors] = useState({})
  const [envoi, setEnvoi] = useState(false)
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }))

  const enregistrer = async (e) => {
    e.preventDefault()
    const er = {}
    if (f.titre.trim().length < 3) er.titre = '3 caractères minimum.'
    if (f.dateDebut && f.dateFin && new Date(f.dateFin) <= new Date(f.dateDebut)) er.dateFin = 'La fin doit être après le début.'
    setErrors(er)
    if (Object.keys(er).length) return
    const body = {
      titre: f.titre.trim(), lieu: f.lieu.trim() || null, description: f.description.trim() || null,
      afficheUrl: f.afficheUrl, dateDebut: depuisChampDate(f.dateDebut), dateFin: depuisChampDate(f.dateFin),
    }
    setEnvoi(true)
    try {
      if (nouveau) {
        const r = await orgaApi.creerEvenement(body)
        show('✅ Événement créé — ajoutez maintenant un concours')
        navigate(`/espace/evenements/${r.idEvenement}`, { replace: true })
      } else {
        setEv(await orgaApi.modifierEvenement(ev.idEvenement, body))
        show('✅ Événement enregistré')
      }
    } catch (ex) {
      if (ex.champs) setErrors(ex.champs)
      show(`⚠️ ${ex.message}`)
    } finally { setEnvoi(false) }
  }

  const statut = async (s, msg) => {
    try { setEv(await orgaApi.statutEvenement(ev.idEvenement, s)); show(`✅ ${msg}`) }
    catch (ex) { show(`⚠️ ${ex.message}`) }
  }

  const supprimer = async () => {
    if (!confirm(`Supprimer définitivement « ${ev.titre} » et tous ses concours ?`)) return
    try { await orgaApi.supprimerEvenement(ev.idEvenement); show('✅ Événement supprimé'); navigate('/espace/evenements') }
    catch (ex) { show(`⚠️ ${ex.message}`) }
  }

  const copier = async (url) => {
    try { await navigator.clipboard.writeText(url); show('✅ Lien copié') } catch { show(url) }
  }

  const peutPublier = peut('EVENEMENT_PUBLIER')
  const valide = organisateur?.statut === 'VALIDE'

  return (
    <>
      <Seo path="/espace/evenements" title={nouveau ? 'Nouvel événement' : ev.titre} noindex />
      <div className="admin-top">
        <h1>{nouveau ? <>Nouvel <span className="gold-text">événement</span></> : ev.titre}</h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {ev && <span className={`badge ${EV_BADGE[ev.statut]}`}>{EV_LABEL[ev.statut]}</span>}
          <Link to="/espace/evenements" className="btn btn-sm btn-ghost">← Mes événements</Link>
        </div>
      </div>
      <BandeauStatut />

      {/* ---------------- Publication ---------------- */}
      {ev && peutPublier && (
        <div className="panel">
          <h2>Publication</h2>
          {ev.statut === 'PUBLIE' ? (
            <>
              <p className="hint">L'événement est visible du public. Partagez son lien :</p>
              <div className="lien-box">
                <code>{evenementShareUrl(ev.slug)}</code>
                <button className="btn btn-sm btn-ghost" onClick={() => copier(evenementShareUrl(ev.slug))}>Copier</button>
                <a href={`/e/${ev.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-ghost">↗ Voir</a>
              </div>
              <div className="row-acts" style={{ marginTop: 14 }}>
                <button className="btn btn-sm btn-ghost" onClick={() => statut('BROUILLON', 'Événement retiré du public')}>Dépublier</button>
                <button className="btn btn-sm btn-ghost" onClick={() => statut('ARCHIVE', 'Événement archivé')}>Archiver</button>
              </div>
            </>
          ) : (
            <>
              <p className="hint">
                {ev.statut === 'ARCHIVE' ? 'Événement archivé : invisible du public.' : 'Brouillon : invisible du public.'}
                {!valide && ' La publication sera possible dès que votre organisation sera validée.'}
              </p>
              <div className="row-acts" style={{ marginTop: 12 }}>
                <button className="btn btn-sm btn-gold" disabled={!valide} onClick={() => statut('PUBLIE', 'Événement publié 🎉')}>
                  Publier l'événement
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ---------------- Informations ---------------- */}
      <form className="panel" onSubmit={enregistrer} noValidate>
        <h2>Informations</h2>
        <div className="field"><label htmlFor="e-titre">Titre *</label>
          <input id="e-titre" maxLength={150} value={f.titre} className={errors.titre ? 'invalid' : ''}
            onChange={(e) => set('titre', e.target.value)} placeholder="Ex. Soirée de Parrainage GI 2026" />
          {errors.titre && <div className="err">{errors.titre}</div>}
        </div>
        <div className="grid-2">
          <div className="field"><label htmlFor="e-lieu">Lieu</label>
            <input id="e-lieu" maxLength={150} value={f.lieu} onChange={(e) => set('lieu', e.target.value)} placeholder="Ex. Salle Horizon, Ambam" />
          </div>
          <div />
        </div>
        <div className="grid-2">
          <div className="field"><label htmlFor="e-debut">Début (heure locale)</label>
            <input id="e-debut" type="datetime-local" value={f.dateDebut} onChange={(e) => set('dateDebut', e.target.value)} />
          </div>
          <div className="field"><label htmlFor="e-fin">Fin</label>
            <input id="e-fin" type="datetime-local" value={f.dateFin} className={errors.dateFin ? 'invalid' : ''} onChange={(e) => set('dateFin', e.target.value)} />
            {errors.dateFin && <div className="err">{errors.dateFin}</div>}
          </div>
        </div>
        <div className="field"><label htmlFor="e-desc">Description</label>
          <textarea id="e-desc" rows={4} maxLength={2000} value={f.description} onChange={(e) => set('description', e.target.value)} />
        </div>
        <ImageUpload id="e-affiche" label="Affiche" value={f.afficheUrl} onChange={(u) => set('afficheUrl', u)} />
        <div className="row-acts">
          <button className="btn btn-gold" type="submit" disabled={envoi}>{envoi ? 'Enregistrement…' : nouveau ? 'Créer l\'événement' : 'Enregistrer'}</button>
          {ev && <button type="button" className="btn btn-danger btn-sm" onClick={supprimer}>Supprimer</button>}
        </div>
      </form>

      {/* ---------------- Concours ---------------- */}
      {ev && <ListeConcours ev={ev} />}
    </>
  )
}

function ListeConcours({ ev }) {
  const navigate = useNavigate()
  const { show } = useToast()
  const [ouvert, setOuvert] = useState(ev.concours.length === 0)
  const [f, setF] = useState({ titre: '', prixVoix: 100, dateOuverture: dansJours(1, 8), dateFermeture: dansJours(15, 20) })
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }))

  const creer = async (e) => {
    e.preventDefault()
    if (f.titre.trim().length < 3) { setErreur('Titre : 3 caractères minimum.'); return }
    if (!f.prixVoix || Number(f.prixVoix) < 50) { setErreur('Prix : 50 FCFA minimum par voix.'); return }
    if (new Date(f.dateFermeture) <= new Date(f.dateOuverture)) { setErreur('La fermeture doit être après l\'ouverture.'); return }
    setEnvoi(true); setErreur('')
    try {
      const c = await orgaApi.creerConcours(ev.idEvenement, {
        titre: f.titre.trim(), prixVoix: Number(f.prixVoix), scoresPublics: true, brouillon: true,
        dateOuverture: depuisChampDate(f.dateOuverture), dateFermeture: depuisChampDate(f.dateFermeture),
      })
      show('✅ Concours créé (en brouillon) — ajoutez les catégories et candidats')
      navigate(`/espace/concours/${c.idConcours}`)
    } catch (ex) { setErreur(ex.message) } finally { setEnvoi(false) }
  }

  return (
    <div className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <h2 style={{ margin: 0 }}>Concours</h2>
        {!ouvert && <button className="btn btn-sm btn-gold" onClick={() => setOuvert(true)}>＋ Nouveau concours</button>}
      </div>

      {ev.concours.length > 0 && (
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Concours</th><th>Statut</th><th>Prix</th><th>Candidats</th><th>Voix</th><th /></tr></thead>
            <tbody>
              {ev.concours.map((c) => (
                <tr key={c.idConcours}>
                  <td><b>{c.titre}</b>{c.brouillon && <span className="hint"> · brouillon</span>}</td>
                  <td><span className={`badge ${BADGE_CLASS[c.statut]}`}>{STATUT_LABEL[c.statut]}</span></td>
                  <td>{fmt(c.prixVoix)} F</td>
                  <td>{c.nbCandidats}</td>
                  <td>{fmt(c.totalVotes)}</td>
                  <td style={{ textAlign: 'right' }}><Link to={`/espace/concours/${c.idConcours}`} className="btn btn-sm btn-ghost">Éditer</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {ouvert && (
        <form onSubmit={creer} noValidate className="sous-form">
          <h3>Nouveau concours</h3>
          <div className="grid-2">
            <div className="field"><label htmlFor="nc-titre">Titre *</label>
              <input id="nc-titre" maxLength={150} value={f.titre} onChange={(e) => set('titre', e.target.value)} placeholder="Ex. Miss & Master GI 2026" />
            </div>
            <div className="field"><label htmlFor="nc-prix">Prix d'une voix (FCFA) *</label>
              <input id="nc-prix" type="number" min="50" max="100000" value={f.prixVoix} onChange={(e) => set('prixVoix', e.target.value)} />
            </div>
          </div>
          <div className="grid-2">
            <div className="field"><label htmlFor="nc-ouv">Ouverture du vote</label>
              <input id="nc-ouv" type="datetime-local" value={f.dateOuverture} onChange={(e) => set('dateOuverture', e.target.value)} />
            </div>
            <div className="field"><label htmlFor="nc-fer">Fermeture (compte à rebours)</label>
              <input id="nc-fer" type="datetime-local" value={f.dateFermeture} onChange={(e) => set('dateFermeture', e.target.value)} />
            </div>
          </div>
          {erreur && <div className="err" style={{ marginBottom: 10 }}>⚠️ {erreur}</div>}
          <div className="row-acts">
            <button className="btn btn-gold btn-sm" type="submit" disabled={envoi}>{envoi ? 'Création…' : 'Créer le concours'}</button>
            {ev.concours.length > 0 && <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOuvert(false)}>Annuler</button>}
          </div>
        </form>
      )}
    </div>
  )
}

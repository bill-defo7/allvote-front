import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { publicApi } from '../api/endpoints'
import { useApi } from '../api/useApi'
import { fmt, calculerFrais } from '../utils/helpers'
import { ORANGE_INDISPONIBLE } from '../config'

const PHONE_RE = /^(\+?237)?\s*6(\s*\d){8}$/   // 6XXXXXXXX, avec ou sans 237 / espaces
const POLL_MS = 3000
const POLL_MAX_MS = 3 * 60 * 1000              // au-delà, on arrête d'attendre à l'écran
const MAX_VOIX = 1000                          // limite par paiement (identique au serveur)

/**
 * Fenêtre de vote en 3 temps :
 *  1. formulaire → POST /public/votes
 *  2. attente : « validez sur votre téléphone » + interrogation GET /public/votes/{ref} toutes les 3 s
 *  3. résultat : confirmé / échoué / expiré / à vérifier
 */
export default function VoteModal({ concours, candidat, onClose, onConfirmed }) {
  const [etape, setEtape] = useState('form') // form | attente | ok | echec | long
  const [nbVoix, setNbVoix] = useState(1)
  const [numero, setNumero] = useState('')
  const [operateur, setOperateur] = useState('')
  const [hp, setHp] = useState('') // honeypot anti-robot
  const [errors, setErrors] = useState({})
  const [envoi, setEnvoi] = useState(false)
  const [vote, setVote] = useState(null)      // réponse du POST
  const [resultat, setResultat] = useState(null)
  const timer = useRef(null)
  const debut = useRef(0)
  const cleRef = useRef(null)   // clé d'idempotence : stable à travers les relances, réinitialisée sur « Réessayer »

  const nb = Math.min(MAX_VOIX, Math.max(1, parseInt(nbVoix, 10) || 1))
  // Frais de service (ex. 5 %) payés en plus par le votant ; le serveur recalcule et fait foi.
  const tarifs = useApi(() => publicApi.tarifs(), [])
  const taux = tarifs.data?.fraisVotantPourcentage
  const valeur = nb * concours.prixVoix
  const frais = taux != null ? calculerFrais(valeur, taux) : 0
  const total = valeur + frais
  const tarifInconnu = !!tarifs.error   // réseau : on n'affiche pas un total faux, le montant exact sera donné à l'étape suivante

  useEffect(() => () => clearTimeout(timer.current), [])

  const validate = () => {
    const e = {}
    if (!nbVoix || Number(nbVoix) < 1) e.nbVoix = 'Entrez au moins 1 voix.'
    else if (Number(nbVoix) > MAX_VOIX) e.nbVoix = `Maximum ${fmt(MAX_VOIX)} voix par paiement.`
    if (!PHONE_RE.test(numero.trim())) e.telephone = 'Numéro camerounais invalide (6XXXXXXXX).'
    if (!operateur) e.operateur = 'Choisissez un opérateur.'
    else if (ORANGE_INDISPONIBLE && operateur === 'ORANGE') e.operateur = 'Orange Money est indisponible pour le moment. Choisissez MTN.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const suivre = (reference) => {
    timer.current = setTimeout(async () => {
      try {
        const s = await publicApi.statutVote(reference)
        if (s.statut === 'CONFIRME') { setResultat(s); setEtape('ok'); onConfirmed?.(); return }
        if (s.statut === 'ECHOUE' || s.statut === 'EXPIRE' || s.statut === 'A_VERIFIER') { setResultat(s); setEtape('echec'); return }
      } catch { /* erreur réseau passagère : on réessaie */ }
      if (Date.now() - debut.current > POLL_MAX_MS) { setEtape('long'); return }
      suivre(reference)
    }, POLL_MS)
  }

  const submit = async (ev) => {
    ev.preventDefault()
    if (hp) return
    if (!validate()) return
    if (!cleRef.current) cleRef.current = crypto.randomUUID()   // une seule clé par action de vote
    setEnvoi(true)
    try {
      const r = await publicApi.voter({
        idConcours: concours.idConcours, idCandidat: candidat.idCandidat, nbVoix: nb,
        operateur, telephone: numero.trim(), website: hp, cleIdempotence: cleRef.current,
      })
      setVote(r)
      // Une relance idempotente peut renvoyer une transaction déjà résolue → on va directement au résultat.
      if (r.statut === 'CONFIRME') {
        setResultat({ statut: 'CONFIRME', nbVoix: r.nbVoix })
        setEtape('ok')
        onConfirmed?.()
      } else if (r.statut === 'ECHOUE' || r.statut === 'EXPIRE' || r.statut === 'A_VERIFIER') {
        setResultat({ statut: r.statut, nbVoix: r.nbVoix })
        setEtape('echec')
      } else {
        setEtape('attente')
        debut.current = Date.now()
        suivre(r.reference)
      }
    } catch (e) {
      if (e.champs) setErrors(e.champs)
      setErrors((x) => ({ ...x, global: e.message }))
    } finally {
      setEnvoi(false)
    }
  }

  const fermer = () => { clearTimeout(timer.current); onClose() }

  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && fermer()}>
      <motion.div className="modal-box" role="dialog" aria-modal="true" aria-labelledby="vote-titre"
        initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <button className="mclose" onClick={fermer} aria-label="Fermer">×</button>

        {etape === 'form' && (
          <>
            <h3 id="vote-titre">Voter pour <span className="gold-text">{candidat.nom}</span></h3>
            <p className="mc-sub">Paiement Mobile Money · {fmt(concours.prixVoix)} FCFA par voix</p>
            <form onSubmit={submit} noValidate>
              <input type="text" className="hp" tabIndex={-1} autoComplete="off" value={hp}
                onChange={(e) => setHp(e.target.value)} aria-hidden="true" />
              <div className="field">
                <label htmlFor="nbVoix">Nombre de voix</label>
                <input id="nbVoix" type="number" min="1" max={MAX_VOIX} inputMode="numeric" value={nbVoix}
                  className={errors.nbVoix ? 'invalid' : ''} onChange={(e) => setNbVoix(e.target.value)} />
                {errors.nbVoix && <div className="err">{errors.nbVoix}</div>}
                <div className="quick-voix" role="group" aria-label="Choix rapide du nombre de voix">
                  {[1, 5, 10, 20, 50].map((n) => (
                    <button type="button" key={n} className={nb === n ? 'active' : ''} onClick={() => setNbVoix(n)}>{n}</button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label htmlFor="num">Numéro Mobile Money</label>
                <input id="num" type="tel" inputMode="tel" placeholder="6 XX XX XX XX" value={numero}
                  className={errors.telephone ? 'invalid' : ''} onChange={(e) => setNumero(e.target.value)} />
                {errors.telephone && <div className="err">{errors.telephone}</div>}
              </div>
              {ORANGE_INDISPONIBLE && (
                <div className="alerte-paiement" role="status">
                  ⚠️ Les paiements <strong>Orange Money</strong> sont momentanément indisponibles.
                  Merci de payer avec <strong>MTN Mobile Money</strong>.
                </div>
              )}
              <div className="field">
                <label htmlFor="op">Opérateur</label>
                <select id="op" value={operateur} className={errors.operateur ? 'invalid' : ''}
                  onChange={(e) => setOperateur(e.target.value)}>
                  <option value="">— Choisir —</option>
                  <option value="MTN">MTN Mobile Money</option>
                  <option value="ORANGE" disabled={ORANGE_INDISPONIBLE}>
                    Orange Money{ORANGE_INDISPONIBLE ? ' (indisponible)' : ''}
                  </option>
                </select>
                {errors.operateur && <div className="err">{errors.operateur}</div>}
              </div>
              <div className="summary">
                <div className="row"><span>Prix unitaire</span><span>{fmt(concours.prixVoix)} FCFA</span></div>
                <div className="row"><span>Nombre de voix</span><span>{nb}</span></div>
                {frais > 0 && <>
                  <div className="row"><span>Voix</span><span>{fmt(valeur)} FCFA</span></div>
                  <div className="row"><span>Frais de service ({Number(taux).toLocaleString('fr-FR')} %)</span><span>{fmt(frais)} FCFA</span></div>
                </>}
                {tarifInconnu
                  ? <div className="row total"><span>Total à payer</span><span>{fmt(valeur)} F + frais</span></div>
                  : <div className="row total"><span>Total à payer</span><span>{fmt(total)} FCFA</span></div>}
              </div>
              {errors.global && <div className="err" role="alert" style={{ marginBottom: 12 }}>⚠️ {errors.global}</div>}
              <button className="btn btn-gold" type="submit" style={{ width: '100%', justifyContent: 'center' }} disabled={envoi || tarifs.loading}>
                {envoi ? 'Envoi…' : tarifs.loading ? 'Calcul du montant…' : tarifInconnu ? 'Payer et voter' : `Payer ${fmt(total)} FCFA et voter`}
              </button>
            </form>
          </>
        )}

        {etape === 'attente' && vote && (
          <div className="vote-etat">
            <span className="spinner spinner-lg" aria-hidden="true" />
            <h3 id="vote-titre">Validez sur votre téléphone</h3>
            <p>Une demande de paiement de <b>{fmt(vote.montant)} FCFA</b> a été envoyée au <b>{numero}</b>.</p>
            <p className="hint">Composez votre code secret {operateur === 'MTN' ? 'MTN MoMo' : 'Orange Money'} dans la fenêtre qui s'affiche
              (ou via le menu USSD). Ne fermez pas cette page.</p>
            <p className="hint" aria-live="polite">En attente de confirmation…</p>
          </div>
        )}

        {etape === 'ok' && (
          <div className="vote-etat">
            <div className="vote-ico ok">✓</div>
            <h3 id="vote-titre">Merci pour votre vote !</h3>
            <p><b>+{resultat?.nbVoix ?? nb} voix</b> pour <b>{candidat.nom}</b>.</p>
            <button className="btn btn-gold" onClick={fermer}>Fermer</button>
          </div>
        )}

        {etape === 'echec' && (
          <div className="vote-etat">
            <div className="vote-ico ko">{resultat?.statut === 'A_VERIFIER' ? '!' : '✕'}</div>
            <h3 id="vote-titre">
              {resultat?.statut === 'EXPIRE' ? 'Délai dépassé'
                : resultat?.statut === 'A_VERIFIER' ? 'Paiement en vérification' : 'Paiement non abouti'}
            </h3>
            <p>{resultat?.statut === 'A_VERIFIER'
              ? 'Votre paiement doit être vérifié par l\'organisation. Vos voix seront ajoutées après contrôle.'
              : 'Aucune somme n\'a été prélevée et aucune voix n\'a été comptée.'}</p>
            {resultat?.statut !== 'A_VERIFIER' && (
              <button className="btn btn-gold" onClick={() => { setEtape('form'); setResultat(null); setVote(null); cleRef.current = null }}>Réessayer</button>
            )}
          </div>
        )}

        {etape === 'long' && (
          <div className="vote-etat">
            <div className="vote-ico">⏳</div>
            <h3 id="vote-titre">Toujours en attente</h3>
            <p>Nous n'avons pas encore reçu la confirmation de l'opérateur. Si vous avez validé le paiement,
              vos voix seront ajoutées automatiquement dans quelques minutes.</p>
            <button className="btn btn-ghost" onClick={fermer}>Fermer</button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

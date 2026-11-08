import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Seo from '../components/Seo'
import EvenementCard from '../components/EvenementCard'
import Contact from '../components/Contact'
import { Chargement, Erreur } from '../components/Etat'
import { useUi } from '../context/UiContext'
import { publicApi } from '../api/endpoints'
import { useApi } from '../api/useApi'
import { logo } from '../assets/brand'
import { SLOGAN } from '../config'
import { fmt } from '../utils/helpers'

function Counter({ target }) {
  const [n, setN] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    let iv
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.isIntersecting) {
          let v = 0; const step = Math.max(1, target / 40)
          iv = setInterval(() => { v += step; if (v >= target) { v = target; clearInterval(iv) } setN(Math.floor(v)) }, 28)
          io.disconnect()
        }
      })
    }, { threshold: 0.5 })
    if (ref.current) io.observe(ref.current)
    return () => { io.disconnect(); clearInterval(iv) }
  }, [target])
  return <div className="n" ref={ref}>{fmt(n)}</div>
}

/** Petite temporisation : on ne lance la recherche qu'après la frappe. */
function useDiffere(valeur, ms = 400) {
  const [v, setV] = useState(valeur)
  useEffect(() => { const t = setTimeout(() => setV(valeur), ms); return () => clearTimeout(t) }, [valeur, ms])
  return v
}

export default function Home() {
  const { t } = useUi()
  const [q, setQ] = useState('')
  const [ville, setVille] = useState('')
  const [page, setPage] = useState(0)
  const qD = useDiffere(q.trim())
  const villeD = useDiffere(ville.trim())

  // Chiffres du bandeau (une seule fois)
  const stats = useApi(() => publicApi.evenements({ taille: 50 }), [])
  // Liste filtrée / paginée, rafraîchie toutes les 60 s
  const { data, error, loading, recharger } = useApi(
    () => publicApi.evenements({ q: qD, ville: villeD, page, taille: 12 }),
    [qD, villeD, page], { refreshMs: 60000 })

  const s = stats.data
  const enCours = s ? s.contenu.filter((e) => e.voteEnCours).length : 0
  const nbOrgas = s ? new Set(s.contenu.map((e) => e.organisateur.slug)).size : 0
  const liste = data?.contenu || []
  const filtre = qD || villeD

  return (
    <>
      <Seo path="/" />

      {/* HERO */}
      <section className="hero" id="home">
        <div className="container hero-grid">
          <motion.img className="hero-logo" src={logo} alt="AllVote — Élevez votre candidat vers la victoire"
            width="620" height="195"
            initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} />
          <h1 className="sr-only">AllVote — plateforme de vote en ligne</h1>
          <p className="slogan">{SLOGAN}</p>
          <p className="intro">Miss &amp; Master, meilleur projet, meilleurs joueurs… Soutenez vos candidats
            préférés en quelques secondes, depuis votre téléphone.</p>
          <div className="price-pill">✦ Paiement MTN Mobile Money · Orange Money</div>
          <div className="hero-cta">
            <a href="#evenements" className="btn btn-gold">✦ {t('voter_maintenant')}</a>
            <a href="#organiser" className="btn btn-ghost">{t('organiser')}</a>
          </div>
          {s && (
            <div className="counters">
              <div className="counter"><Counter target={s.total} /><div className="l">Événements</div></div>
              <div className="counter"><Counter target={enCours} /><div className="l">Votes en cours</div></div>
              <div className="counter"><Counter target={nbOrgas} /><div className="l">Organisateurs</div></div>
            </div>
          )}
        </div>
      </section>

      {/* ÉVÉNEMENTS */}
      <section id="evenements">
        <div className="container">
          <span className="sec-kicker">Événements</span>
          <h2 className="sec-title">Trouvez votre <span className="gold-text">vote</span></h2>
          <p className="sec-sub">Choisissez un événement, puis votez pour votre candidat dans le concours de votre choix.</p>

          <div className="search-row">
            <input type="search" placeholder="Événement, organisateur…" value={q} aria-label="Rechercher un événement"
              onChange={(e) => { setQ(e.target.value); setPage(0) }} />
            <input type="search" placeholder="Ville" value={ville} aria-label="Filtrer par ville"
              onChange={(e) => { setVille(e.target.value); setPage(0) }} />
          </div>

          {loading && <Chargement texte="Chargement des événements…" />}
          {error && <Erreur error={error} onRetry={recharger} />}
          {data && liste.length === 0 && (
            <p className="sec-sub">{filtre ? 'Aucun événement ne correspond à votre recherche.' : 'Aucun événement pour le moment. Revenez bientôt !'}</p>
          )}

          <div className="concours-grid">
            {liste.map((e, i) => <EvenementCard key={e.idEvenement} e={e} index={i} />)}
          </div>

          {data && data.totalPages > 1 && (
            <div className="pager pager-center">
              <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>← Précédent</button>
              <span className="hint">Page {page + 1} / {data.totalPages}</span>
              <button className="btn btn-ghost btn-sm" disabled={page + 1 >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Suivant →</button>
            </div>
          )}
        </div>
      </section>

      {/* COMMENT VOTER */}
      <section id="how" style={{ background: 'var(--bg-2)' }}>
        <div className="container">
          <span className="sec-kicker">3 étapes simples</span>
          <h2 className="sec-title">Comment <span className="gold-text">voter</span> ?</h2>
          <p className="sec-sub">Pas de compte à créer. Votez en moins d'une minute depuis votre téléphone.</p>
          <div className="steps">
            <div className="step"><div className="ic">1</div><h3>Choisissez</h3><p>Ouvrez l'événement et sélectionnez votre candidat dans le concours.</p></div>
            <div className="step"><div className="ic">2</div><h3>Payez</h3><p>Entrez le nombre de voix et votre numéro Mobile Money (MTN / Orange).</p></div>
            <div className="step"><div className="ic">3</div><h3>Confirmez</h3><p>Validez avec votre code secret sur votre téléphone. Vos voix sont comptées aussitôt.</p></div>
          </div>
        </div>
      </section>

      {/* ORGANISATEURS */}
      <section id="organiser">
        <div className="container">
          <span className="sec-kicker">Organisateurs</span>
          <h2 className="sec-title">Organisez votre <span className="gold-text">vote</span> sur AllVote</h2>
          <p className="sec-sub">Département, club, association, entreprise : créez votre événement et laissez votre public voter.
            AllVote encaisse les paiements et vous reverse votre part.</p>
          <div className="steps">
            <div className="step"><div className="ic">🏆</div><h3>Tous les concours</h3><p>Miss &amp; Master, meilleur projet, meilleurs joueurs… plusieurs catégories et un compte à rebours par concours.</p></div>
            <div className="step"><div className="ic">📲</div><h3>Mobile Money</h3><p>Votes payés par MTN et Orange, confirmés automatiquement. Suivi de chaque paiement en temps réel.</p></div>
            <div className="step"><div className="ic">📊</div><h3>Résultats en direct</h3><p>Classement mis à jour en continu (ou masqué jusqu'à la clôture, à vous de choisir).</p></div>
            <div className="step"><div className="ic">🔗</div><h3>Partage facile</h3><p>Chaque candidat a son lien de vote, avec photo, à partager sur WhatsApp et Facebook.</p></div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 34 }}>
            <Link to="/inscription" className="btn btn-gold">✦ Créer mon espace organisateur</Link>
            <p className="hint" style={{ marginTop: 12 }}>Inscription gratuite · validation par l'équipe AllVote</p>
          </div>
        </div>
      </section>

      <Contact />
    </>
  )
}

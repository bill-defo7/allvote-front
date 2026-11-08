import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useUi } from '../context/UiContext'

export default function CookieBanner() {
  const { consent, decideCookies } = useUi()
  return (
    <AnimatePresence>
      {!consent && (
        <motion.div className="cookie" initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} role="dialog" aria-label="Consentement aux cookies">
          <p>
            Nous utilisons des cookies de mesure d'audience pour améliorer la plateforme.
            Les cookies non essentiels ne sont déposés qu'avec votre accord.{' '}
            <Link to="/confidentialite" style={{ color: 'var(--gold)' }}>En savoir plus</Link>.
          </p>
          <div className="acts">
            <button className="btn btn-sm btn-ghost" onClick={() => decideCookies('refused')}>Refuser</button>
            <button className="btn btn-sm btn-gold" onClick={() => decideCookies('accepted')}>Accepter</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

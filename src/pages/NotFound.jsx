import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import { mark } from '../assets/brand'

export default function NotFound() {
  return (
    <div className="nf">
      <Seo path="/404" title="Page introuvable" noindex />
      <img src={mark} alt="AllVote" width="200" height="58" style={{ width: 200, height: 'auto' }} />
      <div className="code gold-text">404</div>
      <h2 style={{ fontSize: '1.8rem' }}>Page introuvable</h2>
      <p style={{ color: 'var(--muted)', maxWidth: 420 }}>
        La page que vous cherchez n'existe pas ou a été déplacée.
      </p>
      <Link to="/" className="btn btn-gold">← Retour à l'accueil</Link>
    </div>
  )
}

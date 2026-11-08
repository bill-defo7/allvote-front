import { useAuth } from '../../context/AuthContext'

/** Affiche children seulement si l'utilisateur a la permission (sinon un message, ou rien). */
export default function Permis({ p, children, silencieux = false }) {
  const { peut } = useAuth()
  if (peut(p)) return children
  if (silencieux) return null
  return (
    <div className="panel" style={{ textAlign: 'center' }}>
      <h2>Accès réservé</h2>
      <p className="hint">Cette rubrique est réservée au responsable de l'organisation.</p>
    </div>
  )
}

import { useAuth } from '../../context/AuthContext'

/** Page réservée au super-admin (admin) ou aux organisateurs (orga). */
export default function Reserve({ admin = false, children }) {
  const { estSuperAdmin } = useAuth()
  if (admin === estSuperAdmin) return children
  return (
    <div className="panel" style={{ textAlign: 'center' }}>
      <h2>Page indisponible</h2>
      <p className="hint">{admin ? 'Cette page est réservée à l\'administration AllVote.' : 'Cette page est réservée aux organisateurs.'}</p>
    </div>
  )
}

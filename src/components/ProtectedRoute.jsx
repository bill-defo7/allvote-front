import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/** Redirige vers /connexion si personne n'est connecté (puis revient à la page demandée). */
export default function ProtectedRoute({ children }) {
  const { isAuth } = useAuth()
  const location = useLocation()
  if (!isAuth) return <Navigate to="/connexion" replace state={{ from: location.pathname }} />
  return children
}
